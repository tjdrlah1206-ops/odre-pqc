// DOM-independent checks for the new tab routing, exact customer copy and
// preservation of the approved Native request/state implementation.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const cp = require('child_process');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'payment/register/index.html'), 'utf8');
const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('const registerTabsCopy'));
new vm.Script(script);
const copySource = script.match(/const registerTabsCopy=(.*?);\n/)[1];
const copy = JSON.parse(copySource);
const expectedKo = [
  'Native 0.3.0 설치·활성화 안내',
  '설치 가이드에 따라 새 서버에서 Device Code를 생성하세요. 이 페이지에 Device Code와 라이선스 정보를 입력하고 ‘라이선스 확인’을 눌러주세요.',
  '확인이 완료되면 다음 중 하나를 선택할 수 있습니다.',
  '새 Unit 사용: 보유한 여유 Unit으로 새 서버를 등록합니다.',
  '기존 Unit 이전: 기존 서버에서 사용하던 Unit을 새 서버로 옮깁니다.',
  '기존 서버를 사용할 수 있다면, 새 요청의 유입을 중지하고 설치 가이드에 따라 이전을 확인하세요. 이전 확인이 끝날 때까지 Native 프로그램은 실행 상태로 유지해 주세요.',
  '기존 서버에 접근할 수 없다면 지원 승인이 필요합니다. 기존 서버의 오프라인 사용권이 남아 있는 경우, 만료 후 새 서버에서 보호 기능을 사용할 수 있습니다.',
  '현재 체험판이 설치된 서버에서 설치 가이드의 유료 전환 절차를 진행하세요. 체험판은 다른 장치로 이전할 수 없습니다.',
  '웹에서 승인한 뒤에도 서버의 프로그램에서 등록 절차를 마쳐야 합니다. 설치 가이드에 따라 활성 상태와 정상 동작을 확인하세요.',
  '도중에 중단되었다면 새 요청을 만들지 말고 기존 요청을 이어서 진행하세요.'
];
expectedKo.forEach(text => assert(Object.values(copy.ko).includes(text), text));
assert.deepEqual([copy.ko.activationTab, copy.ko.nativeTab, copy.ko.paymentTab], ['라이선스 활성화', 'Native 활성화 · 휠 승인', '결제 확인 · 이메일 발송']);
const copyKeys = Object.keys(copy.en);
for (const language of ['en', 'ko', 'ja', 'de', 'es']) {
  copyKeys.forEach(key => assert(copy[language][key], `${language}/${key}`));
}
const native = fs.readFileSync(path.join(root, 'payment/register/native-portal.js'), 'utf8');
new vm.Script(native);
const baselineNative = cp.execFileSync('git', ['show', '88ec2e7:payment/register/native-portal.js'], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n');
const withoutNewCopy = native.replace(/  const customerHelperCopy=[\s\S]*?(?=  function message\()/, '');
assert.equal(withoutNewCopy, baselineNative, 'Native protocol changes outside localized helper copy');
const baselineRegister = cp.execFileSync('git', ['show', '88ec2e7:payment/register/index.html'], { cwd: root, encoding: 'utf8' });
const behavior = source => source.slice(source.indexOf('    function show(kind,'), source.indexOf('  </script>')).replace(/\r\n/g, '\n');
assert.equal(behavior(html), behavior(baselineRegister), 'Legacy activation or purchase request behavior changed');
const fakeElement = () => ({ attrs:{}, hidden:false, value:'test', type:'text', classList:{toggle(){}}, setAttribute(key,value){this.attrs[key]=value;} });
const context = { Object, URL, activeFlow:'activate', flowTabs:{activate:fakeElement(),native:fakeElement(),payment:fakeElement()}, flowViews:{activate:fakeElement(),native:fakeElement(),payment:fakeElement()}, portalStatusToken:'existing-status', statusPollGeneration:7, licenseKey:fakeElement(), licenseKeyToggle:fakeElement(), current:'ko', flowText:{ko:{showKey:'표시'}}, updateFlowHeading(){}, location:{href:'http://localhost/payment/register/?flow=activate&lang=ko&transaction_id=txn_test#nativePortal'}, history:{replaceState(_state,_title,url){this.url=url;}} };
vm.createContext(context);
vm.runInContext(script.slice(script.indexOf('    function setFlow('),script.indexOf('\n    Object.entries(flowTabs).forEach(([flow,tab])')),context);
for (const flow of ['activate','native','payment']) {
  context.setFlow(flow);
  assert.equal(context.activeFlow,flow);
  assert.equal(Object.values(context.flowViews).filter(p=>!p.hidden).length,1);
  assert.equal(context.flowViews[flow].hidden,false);
  assert.equal(context.flowTabs[flow].attrs['aria-selected'],'true');
  assert.equal(context.flowTabs[flow].tabIndex,0);
  assert(context.history.url.includes('flow='+flow));
  assert(!context.history.url.includes('transaction_id'));
}
context.setFlow('unrecognized');
assert.equal(context.activeFlow,'activate');
assert.equal(context.licenseKey.value,'');
assert.equal(context.portalStatusToken,'');
console.log(JSON.stringify({ exactKoreanCopy:'PASS',translations:5,tabRouting:'PASS',nativeProtocolUnchanged:'PASS',purchaseAndWheelBehaviorUnchanged:'PASS' },null,2));
