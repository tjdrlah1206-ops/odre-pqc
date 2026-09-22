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
const tracked=execFileSync('git',['-c','safe.directory=*','ls-files'],{cwd:root,encoding:'utf8'}).trim().split(/\r?\n/);
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
  const baseRoute=route.replace(/^\/(ko|ja|de|es)(?=\/)/,'');
  const alternates={
    en:'https://pqc.odreai.com'+baseRoute,
    ko:'https://pqc.odreai.com/ko'+baseRoute,
    ja:'https://pqc.odreai.com/ja'+baseRoute,
    de:'https://pqc.odreai.com/de'+baseRoute,
    es:'https://pqc.odreai.com/es'+baseRoute,
    'x-default':'https://pqc.odreai.com'+baseRoute
  };
  assert.equal((h.match(/rel="alternate" hreflang=/g)||[]).length,6,`${route}: complete hreflang cluster`);
  for(const [lang,href] of Object.entries(alternates))assert(h.includes(`rel="alternate" hreflang="${lang}" href="${href}"`),`${route}: missing ${lang} alternate`);
}
let languageCases=0;
function node(attrs,textContent=''){return {attrs,textContent,getAttribute:k=>attrs[k],setAttribute:(k,v)=>{attrs[k]=String(v);}};}
for(const file of htmlFiles){
  const html=read(file);const page=html.match(/data-page="([^"]+)"/)?.[1];if(!page)continue;
  const nodes=[...html.matchAll(/<([a-z0-9]+)\b[^>]*data-i18n="([^"]+)"[^>]*>([^<]*)<\/\1>/g)].map(m=>node({'data-i18n':m[2]},m[3]));
  const window={}; vm.runInNewContext(read('assets/js/page-i18n.js'),{window,document:{body:{dataset:{page}},querySelectorAll:()=>nodes}},{timeout:1000});
  for(const lang of ['en','ko','ja','de','es']){
    const c=window.ODRE_PAGE_I18N[lang];languageCases++;
    for(const n of nodes){const value=c[n.attrs['data-i18n']];assert.equal(typeof value,'string');assert(!retired.test(value));}
    if(page==='home'||page==='product'){
      const seo=c.seoTitle+' '+c.seoDescription;
      for(const keyword of ['FastAPI','ML-KEM-768','ML-DSA-65','Fail-Closed'])assert(seo.includes(keyword));
      const postQuantum={en:/Post-Quantum/,ko:/포스트양자/,ja:/ポスト量子/,de:/Post-Quantum/,es:/poscuántic/i}[lang];
      assert(postQuantum.test(seo),`${page}/${lang}: localized post-quantum intent missing`);
    }
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
// Exercise actual site.js static-locale routing while retaining the current page.
let metadataCases=0;
for(const page of ['home','product']) {
  const html=read(page==='home'?'index.html':page+'/index.html');
  const meta={};
  for(const m of html.matchAll(/<meta (name|property)="([^"]+)" content="([^"]*)"/g))meta[`meta[${m[1]}="${m[2]}"]`]=node({content:m[3]});
  const nodes=[...html.matchAll(/<([a-z0-9]+)\b[^>]*data-i18n="([^"]+)"[^>]*>([^<]*)<\/\1>/g)].map(m=>node({'data-i18n':m[2]},m[3]));
  const bodyAttrs={};
  const document={title:html.match(/<title>([^<]*)<\/title>/)[1],body:{dataset:{page},getAttribute:k=>bodyAttrs[k]||null},documentElement:{lang:'en'},
    querySelector:s=>meta[s]||(s==='script[data-odre-analytics]'?{}:null),querySelectorAll:s=>s==='[data-i18n]'?nodes:[],getElementById:()=>null,addEventListener(){},dispatchEvent(){}};
  const pathname=page==='home'?'/':'/'+page+'/';let assigned='';
  const context={document,location:{search:'',pathname,hash:'',href:'https://pqc.odreai.com'+pathname,replace(){},assign(value){assigned=value;}},navigator:{language:'en-US'},localStorage:{getItem:()=>null,setItem(){}},URL,URLSearchParams,CustomEvent:class{constructor(t,o){this.detail=o.detail;}},addEventListener(){}};context.window=context;
  vm.createContext(context);vm.runInContext(read('assets/js/page-i18n.js'),context);vm.runInContext(read('assets/js/site.js'),context);
  for(const lang of ['ko','ja','es','de']){
    assigned='';context.ODRE_SITE.setLanguage(lang);
    assert.equal(assigned,'/'+lang+(pathname==='/'?'/':pathname));metadataCases++;
  }
}
// Pin the approved regular checkout configuration and the post-E2E $1 test checkout closure.
for(const [file,expected] of Object.entries({
  'assets/js/checkout.js':'4ece94ee47a6f37b04dd6103a0945f55390c8d05181033d59e74957f615cc069',
  'payment/live-check-4a753f1fe8c8431f/checkout.js':'f05f1acd104b131b675273c64bb6d411b1c065f6337f3b310ed78e1186fdd704'
}))assert.equal(createHash('sha256').update(read(file).replace(/\r\n/g,'\n')).digest('hex'),expected,'Checkout modified (Git LF canonical bytes)');
console.log(JSON.stringify({result:'PASS',html_pages:htmlFiles.length,source_files_scanned:sourceFiles.length,language_cases:languageCases,metadata_switch_cases:metadataCases,sitemap_urls:sitemap.length,obsolete_prices_paypal_unit_range:0,core_only_integration_copy:0,checkout_code:'REGULAR_OPEN_TEST_CHECKOUT_CLOSED_HASH_PINNED',network_requests:0},null,2));
