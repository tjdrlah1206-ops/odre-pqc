'use strict';
// Offline SEO/content and language-switch regression. No browser or network.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/);
const htmlFiles=tracked.filter(f=>f.endsWith('.html'));
const sourceFiles=tracked.filter(f=>/\.(html|js|xml|txt)$/.test(f)&&!f.startsWith('tools/'));
const retired=/PayPal|\$120\b|\$1,300\b|USD\s+120\b|USD\s+1[,.]300\b|"price":"(?:120|1300)"|1[–～〜~-]20\s*Units|21\+\s*Units|\/enterprise\//i;
for(const file of sourceFiles)assert(!retired.test(read(file)),file+': obsolete commercial copy');
const sitemap=[...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(new Set(sitemap).size,sitemap.length);
assert(!sitemap.some(u=>u.includes('/payment/')));
assert(read('robots.txt').includes('Sitemap: https://pqc.odreai.com/sitemap.xml'));
for(const url of sitemap){
  const route=new URL(url).pathname;
  const h=read(route==='/'?'index.html':route.slice(1)+'index.html');
  assert.equal((h.match(/rel="canonical"/g)||[]).length,1);
  assert(h.includes('rel="canonical" href="'+url+'"'));
  assert(/name="robots" content="index,follow/.test(h));
  assert.equal((h.match(/<h1\b/g)||[]).length,1);
  for(const lang of ['en','ko','ja','de','es'])assert(h.includes('hreflang="'+lang+'"'));
}
let languageCases=0;
function node(attrs,textContent=''){return {attrs,textContent,getAttribute:k=>attrs[k],setAttribute:(k,v)=>{attrs[k]=String(v);}};}
for(const file of htmlFiles){
  const html=read(file);const page=html.match(/data-page="([^"]+)"/)?.[1];if(!page)continue;
  const nodes=[...html.matchAll(/<([a-z0-9]+)\b[^>]*data-i18n="([^"]+)"[^>]*>([^<]*)<\/\1>/g)].map(m=>node({'data-i18n':m[2]},m[3]));
  const window={}; vm.runInNewContext(read('assets/js/page-i18n.js'),{window,document:{body:{dataset:{page}},querySelectorAll:()=>nodes}},{timeout:1000});
  for(const lang of ['en','ko','ja','de','es']){
    const c=window.ODRE_PAGE_I18N[lang];languageCases++;
    for(const n of nodes){const value=c[n.attrs['data-i18n']];assert.equal(typeof value,'string');assert(!retired.test(value));if(value.includes('install(app)'))assert(value.includes('Gateway'),`${page}/${lang}: incomplete Core-only integration`);}
    const boundaryKey={home:'productCopy',product:'integrateCopy',security:'lead',docs:'lead'}[page];
    if(boundaryKey)assert(c[boundaryKey].includes('HTTPS/TLS → FastAPI → Gateway → ODRE v3 → Core → Protected Handler'));
    if(page==='home'||page==='product')for(const keyword of ['Post-Quantum Application Security','FastAPI','ML-KEM-768','ML-DSA-65','Fail-Closed'])assert((c.seoTitle+' '+c.seoDescription).includes(keyword));
    if(page==='home'||page==='pricing')assert(!/^(14-Day Trial|14日間評価版|14일 평가판)$/.test(c.trial));
    if(page==='docs'){
      for(let i=1;i<=11;i++){assert(c['quickStep'+i]);if(lang!=='en')assert.notEqual(c['quickStep'+i],window.ODRE_PAGE_I18N.en['quickStep'+i]);}
      assert(c.quickStep2.includes('odre-pqc init'));
      assert(c.quickStep4.includes('odre-pqc verify'));
      assert(c.quickStep8.includes('Core'));
      assert(c.quickStep9.includes('odre-pqc status'));
      assert(c.quickStep10.includes('Gateway → Core → Protected Handler'));
      assert(c.hashNotice.includes('SHA-256')&&c.hashNotice.includes('Commercial + Gateway + Core'));
    }
  }
}
// Exercise actual site.js metadata application, including switching back to English.
let metadataCases=0;
for(const page of ['home','product']) {
  const html=read(page==='home'?'index.html':page+'/index.html');
  const meta={};
  for(const m of html.matchAll(/<meta (name|property)="([^"]+)" content="([^"]*)"/g))meta[`meta[${m[1]}="${m[2]}"]`]=node({content:m[3]});
  const nodes=[...html.matchAll(/<([a-z0-9]+)\b[^>]*data-i18n="([^"]+)"[^>]*>([^<]*)<\/\1>/g)].map(m=>node({'data-i18n':m[2]},m[3]));
  const document={title:html.match(/<title>([^<]*)<\/title>/)[1],body:{dataset:{page}},documentElement:{lang:'en'},
    querySelector:s=>meta[s]||(s==='script[data-odre-analytics]'?{}:null),querySelectorAll:s=>s==='[data-i18n]'?nodes:[],getElementById:()=>null,addEventListener(){},dispatchEvent(){}};
  const context={document,location:{search:''},navigator:{language:'en-US'},localStorage:{getItem:()=>null,setItem(){}},URLSearchParams,CustomEvent:class{constructor(t,o){this.detail=o.detail;}},addEventListener(){}};context.window=context;
  vm.createContext(context);vm.runInContext(read('assets/js/page-i18n.js'),context);vm.runInContext(read('assets/js/site.js'),context);
  for(const lang of ['en','ko','ja','es','de','en']){
    context.ODRE_SITE.setLanguage(lang);const c=context.ODRE_PAGE_I18N[lang];
    assert.equal(document.title,c.seoTitle);assert.equal(meta['meta[name="description"]'].attrs.content,c.seoDescription);
    assert.equal(meta['meta[property="og:title"]'].attrs.content,c.seoTitle);assert.equal(meta['meta[property="og:description"]'].attrs.content,c.seoDescription);metadataCases++;
  }
}
// Pin the regular checkout pause and the explicitly approved $1-only reopening.
for(const [file,expected] of Object.entries({
  'assets/js/checkout.js':'b7cbe3d1ba32fe33b9996ff1e8a865b00e30c8019d972217f9b7fa33bd6d6927',
  'payment/live-check-4a753f1fe8c8431f/checkout.js':'7ab3803be62f643f91c76a2550962015ef5f2b5b4737f3db8dd3c2ec0f37eaf7'
}))assert.equal(createHash('sha256').update(read(file).replace(/\r\n/g,'\n')).digest('hex'),expected,'Checkout modified (Git LF canonical bytes)');
console.log(JSON.stringify({result:'PASS',html_pages:htmlFiles.length,source_files_scanned:sourceFiles.length,language_cases:languageCases,metadata_switch_cases:metadataCases,sitemap_urls:sitemap.length,obsolete_prices_paypal_unit_range:0,core_only_integration_copy:0,checkout_code:'REGULAR_PAUSED_TEST_ONLY_REOPENED_HASH_PINNED',network_requests:0},null,2));
