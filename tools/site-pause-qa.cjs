'use strict';
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const { chromium } = require('playwright');
const root=path.resolve(__dirname,'..'), evidence=path.resolve(root,'../evidence');
const pages=[];
function scan(dir) { for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
  if(e.name.startsWith('.') || ['tools','node_modules'].includes(e.name)) continue;
  const p=path.join(dir,e.name);
  if(e.isDirectory())scan(p);else if(e.name.endsWith('.html'))pages.push('/'+path.relative(root,p).split(path.sep).join('/'));
}}
scan(root);
(async()=>{
 const server=http.createServer((req,res)=>{
   let p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));
   if(!p.startsWith(root+path.sep)&&p!==root){res.writeHead(403);res.end();return;}
   if(fs.existsSync(p)&&fs.statSync(p).isDirectory())p=path.join(p,'index.html');
   if(!fs.existsSync(p)){res.writeHead(404);res.end();return;}
   const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
   res.setHeader('Content-Type',types[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const results=[], issues=[], external=[], errors=[];
 try {
  const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
  await ctx.route('**/*',route=>{
    const url=route.request().url();
    if(url.startsWith(base)||url.startsWith('data:'))return route.continue();
    external.push(url.replace(/[?].*/,''));
    return route.abort();
  });
  await ctx.addInitScript(()=>{window.__checkoutCalls=0;window.Paddle={Initialize(){window.__checkoutCalls++;},Checkout:{open(){window.__checkoutCalls++;}}};});
  const page=await ctx.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  for(const url of pages) {
    await page.goto(base+url,{waitUntil:'domcontentloaded'});
    for(const lang of ['en','ko','ja','de','es']) {
      await page.evaluate(lang=>{if(window.ODRE_SITE)window.ODRE_SITE.setLanguage(lang);},lang);
      await page.waitForFunction(()=>[...document.querySelectorAll('[data-site-paused]')].every(e=>!e.hasAttribute('href')&&e.getAttribute('aria-disabled')==='true'));
      const check=await page.evaluate(()=>{
        const paused=[...document.querySelectorAll('[data-site-paused]')];
        const bad=paused.filter(e=>e.hasAttribute('href')||e.hasAttribute('download')||e.getAttribute('aria-disabled')!=='true'||e.tabIndex!==-1||e.tagName==='BUTTON'&&!e.disabled);
        const live=[...document.querySelectorAll('a[href]')].filter(e=>/\.(pdf|zip|whl|exe|sha256)([?#]|$)|\/downloads\/|\/license\/\?plan=|checkout\.paddle/i.test(e.getAttribute('href')));
        let cancelled=0;
        for(const el of paused)for(const type of ['click','auxclick','keydown']) {
          const event=type==='keydown'?new KeyboardEvent(type,{key:'Enter',bubbles:true,cancelable:true}):new MouseEvent(type,{bubbles:true,cancelable:true});
          if(!el.dispatchEvent(event))cancelled++;
        }
        return {paused:paused.length,bad:bad.length,live:live.map(e=>e.getAttribute('href')),cancelled,checkoutCalls:window.__checkoutCalls};
      });
      if(check.bad||check.live.length||check.cancelled!==check.paused*3||check.checkoutCalls)issues.push({url,lang,...check});
      results.push({url,lang,...check});
    }
  }
  await page.goto(base+'/license/?lang=ko');
  await page.screenshot({path:path.join(evidence,'site-pause-license-ko.png'),fullPage:true});
  await page.goto(base+'/?lang=ko');
  await page.screenshot({path:path.join(evidence,'site-pause-home-ko.png'),fullPage:true});
  await ctx.close();
  const nojs=await browser.newContext({javaScriptEnabled:false});
  await nojs.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
  const np=await nojs.newPage();
  for(const url of pages) {
   await np.goto(base+url,{waitUntil:'domcontentloaded'});
   const live=await np.locator('a[href]').evaluateAll(es=>es.filter(e=>/\.(pdf|zip|whl|exe|sha256)([?#]|$)|\/downloads\/|\/license\/\?plan=|checkout\.paddle/i.test(e.getAttribute('href'))).length);
   if(live)issues.push({url,noJs:true,live});
  }
  const result={verdict:issues.length||errors.length?'FAIL':'PASS',pages:pages.length,language_cases:results.length,no_js_pages:pages.length,issues,js_errors:errors,paddle_requests:external.filter(u=>/paddle/.test(u)).length,results};
  fs.writeFileSync(path.join(evidence,'site-pause-qa.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify({...result,results:undefined}));
  assert.equal(result.verdict,'PASS'); assert.equal(result.paddle_requests,0);
 } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});

