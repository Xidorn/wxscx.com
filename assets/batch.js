const API='https://api.mrwang.com/whois.php?domain=';
const SUFFIX_CATALOG='/assets/domain-suffixes.json?v=59';
const LANGS={en:{name:'English'},zh:{name:'简体中文'},'zh-Hant':{name:'繁體中文'},de:{name:'Deutsch'},fr:{name:'Français'},ja:{name:'日本語'},es:{name:'Español'},pt:{name:'Português'},it:{name:'Italiano'},ko:{name:'한국어'},ru:{name:'Русский'},ar:{name:'العربية'},hi:{name:'हिन्दी'},id:{name:'Bahasa Indonesia'}};
const COPY={
 en:['BATCH LOOKUP','Batch domain lookup','Enter complete domains, or enter names and combine them with selected suffixes.','Domains or names','Up to 50 queries · duplicates are removed automatically','Clear','Start lookup','Results','Registered','Available','Unknown','Invalid domain','Failed','Suffix catalog','Loading suffix catalog…','suffixes ready','Common','Clear','Search suffix, e.g. com / ai / de','For lines without a dot, selected suffixes are appended automatically. Complete domains are queried as entered.','Select at least one suffix for names without a dot.','Using built-in suffix catalog','Reserved'],
 zh:['批量查询','批量域名查询','可输入完整域名，也可以只输入名称并与选中的后缀自动组合查询。','域名或名称','最多 50 个查询 · 自动去重','清空','开始查询','查询结果','已注册','可注册','未知','域名格式无效','查询失败','后缀目录','正在加载后缀目录…','个后缀可用','常用','清除','搜索后缀，例如 com / ai / de','没有“.”的名称会自动拼接已选后缀；完整域名则按原样查询。','请输入完整域名，或至少选择一个后缀。','已启用内置后缀目录','保留'],
 'zh-Hant':['批次查詢','批次網域查詢','可輸入完整網域，也可以只輸入名稱並與選取的後綴自動組合查詢。','網域或名稱','最多 50 個查詢 · 自動去重','清空','開始查詢','查詢結果','已註冊','可註冊','未知','網域格式無效','查詢失敗','後綴目錄','正在載入後綴目錄…','個後綴可用','常用','清除','搜尋後綴，例如 com / ai / de','沒有「.」的名稱會自動拼接已選後綴；完整網域則按原樣查詢。','請輸入完整網域，或至少選取一個後綴。','已啟用內建後綴目錄','保留']
};
for(const code of Object.keys(LANGS))if(!COPY[code])COPY[code]=COPY.en;
function detectLang(){let saved='';try{saved=localStorage.getItem('whoisLang')||''}catch{}if(LANGS[saved])return saved;const n=(navigator.language||'en').toLowerCase(),c=n.split('-')[0];if(c==='zh'&&/tw|hk|mo|hant/.test(n))return'zh-Hant';return LANGS[c]?c:'en'}
let lang=detectLang(),allTlds=[],selectedTlds=new Set(),suffixSource='';
const sel=document.getElementById('langSelect');populateLanguageSelect(sel,LANGS);
const $=id=>document.getElementById(id);
function translateThemeOptions(){const names=THEME_NAMES[lang]||THEME_NAMES.en,select=$('themeSelect');if(!select)return;const ids=['graphite','paper','sand','forest','ocean','plum','mono','slate','mint','rose'];ids.forEach((id,i)=>{const o=select.querySelector('option[value="'+id+'"]');if(o)o.textContent=names[i+1]||o.textContent});select.setAttribute('aria-label',names[0]||'Theme')}
function applyLang(){const c=COPY[lang]||COPY.en;document.documentElement.lang=lang==='zh'?'zh-CN':lang==='zh-Hant'?'zh-TW':lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';sel.value=lang;translateLanguageGroups(sel,lang);translateThemeOptions();renderBrand(lang);[['batchKicker',0],['batchTitle',1],['batchDesc',2],['batchInputLabel',3],['batchHint',4],['batchClear',5],['batchSubmit',6],['batchResultsTitle',7],['suffixLabel',13],['suffixCommon',16],['suffixClear',17],['suffixHelp',19]].forEach(([id,i])=>{const e=$(id);if(e)e.textContent=c[i]});$('suffixSearch').placeholder=c[18];$('suffixSearch').setAttribute('aria-label',c[18]);updateSuffixStatus();renderHistory();renderFavorites()}
sel.onchange=()=>{lang=sel.value;try{localStorage.setItem('whoisLang',lang)}catch{}applyLang()};initThemePicker();applyLang();$('year').textContent=new Date().getFullYear();
function renderHistory(){const arr=readHistory(),title=$('historySummary'),list=$('historyList');if(!title||!list)return;title.textContent=htxt('history')+' ('+arr.length+')';list.replaceChildren();if(!arr.length){const e=document.createElement('div');e.className='history-empty';e.textContent=htxt('empty');list.append(e)}else arr.forEach(d=>{const row=document.createElement('div');row.className='history-row',a=document.createElement('a'),del=document.createElement('button');a.className='history-link';a.textContent=d;a.href=searchUrl(d);del.type='button';del.className='history-remove';del.textContent='×';del.setAttribute('aria-label',htxt('remove')+' '+d);del.onclick=()=>writeHistory(readHistory().filter(x=>x!==d));row.append(a,del);list.append(row)});const note=$('historyNote');if(note)note.textContent=htxt('saved');const b=$('historyClear');if(b){b.textContent=htxt('clear');b.hidden=!arr.length;b.onclick=()=>writeHistory([])}}
const textarea=$('batchDomains'),submit=$('batchSubmit'),clear=$('batchClear'),results=$('batchResults'),list=$('batchResultList'),progress=$('batchProgress'),suffixList=$('suffixList'),suffixSearch=$('suffixSearch');
clear.onclick=()=>{textarea.value='';list.replaceChildren();results.hidden=true;textarea.focus()};
function normalizeTlds(values){return [...new Set(values.map(v=>String(v).trim().toLowerCase().replace(/^\./,'')).filter(v=>/^(?:xn--)?[a-z0-9-]{2,63}$/.test(v)))].sort()}
async function loadSuffixes(){const c=COPY[lang]||COPY.en;$('suffixStatus').textContent=c[14];let tlds=[];
 try{const r=await fetch(SUFFIX_CATALOG,{cache:'force-cache'});if(!r.ok)throw new Error('HTTP '+r.status);const data=await r.json();const values=Array.isArray(data)?data:Array.isArray(data?.suffixes)?data.suffixes:[];tlds=normalizeTlds(values);if(tlds.length>1000)suffixSource='lookup-package'}catch{}
 if(tlds.length<100){tlds=normalizeTlds(['com','net','org','cn','io','ai','co','me','app','dev','info','biz','us','uk','de','fr','jp','kr','au','ca','xyz','online','site','shop','store','tech']);suffixSource='emergency'}
 allTlds=tlds;selectedTlds=new Set([...selectedTlds].filter(t=>allTlds.includes(t)));renderSuffixes();updateSuffixStatus()}
function updateSuffixStatus(){const e=$('suffixStatus'),c=COPY[lang]||COPY.en;if(!e)return;if(!allTlds.length){e.textContent=c[14];return}e.textContent=(suffixSource==='lookup-package'?c[21]+' · ':suffixSource==='emergency'?c[21]+' · ':'')+allTlds.length+' '+c[15]+' · '+selectedTlds.size+' selected'}
const COMMON_TLDS=['com','net','org','cn','io','ai','co','me','app','dev','info','biz','us','uk','de','fr','jp','kr','au','ca','xyz','online','site','shop','store','tech'];
let suffixRenderFrame=0;
function renderSuffixes(){
 const q=suffixSearch.value.trim().toLowerCase().replace(/^\./,'');
 let view;if(q)view=allTlds.filter(t=>t.startsWith(q)||t.includes(q)).slice(0,80);else{const common=new Set([...selectedTlds,...COMMON_TLDS]);view=allTlds.filter(t=>common.has(t)).slice(0,40)}
 suffixList.replaceChildren();const frag=document.createDocumentFragment();view.forEach(t=>{const b=document.createElement('button');b.type='button';b.className='suffix-chip'+(selectedTlds.has(t)?' is-selected':'');b.textContent='.'+t;b.setAttribute('aria-pressed',String(selectedTlds.has(t)));b.onclick=()=>{selectedTlds.has(t)?selectedTlds.delete(t):selectedTlds.add(t);b.classList.toggle('is-selected',selectedTlds.has(t));b.setAttribute('aria-pressed',String(selectedTlds.has(t)));updateSuffixStatus()};frag.append(b)});suffixList.append(frag)
}
function scheduleSuffixRender(){cancelAnimationFrame(suffixRenderFrame);suffixRenderFrame=requestAnimationFrame(renderSuffixes)}
suffixSearch.addEventListener('input',scheduleSuffixRender);$('suffixCommon').onclick=()=>{selectedTlds=new Set(['com','net','org','cn','io','ai','co','me','app','dev']);renderSuffixes();updateSuffixStatus()};$('suffixClear').onclick=()=>{selectedTlds.clear();renderSuffixes();updateSuffixStatus()};
function stateOf(d){
 if(!d||typeof d!=='object')return'unknown';
 // Match the backend Parser JSON exactly: reserved wins, then unknown, then registered.
 if(d.reserved===true)return'reserved';
 if(d.unknown===true)return'unknown';
 if(d.registered===true)return'registered';
 if(d.registered===false)return'available';
 return'unknown';
}
function rowFor(domain,kind='loading'){const row=document.createElement('div');row.className='batch-row';const name=document.createElement('span');name.className='batch-domain';name.textContent=domain;const state=document.createElement('span');state.className='batch-state';if(kind==='loading')state.innerHTML='<span class="batch-spinner" aria-label="Loading"></span>';const open=document.createElement('a');open.className='batch-open';open.href=searchUrl(domain);open.title=domain;open.setAttribute('aria-label','Open '+domain);open.textContent='→';row.append(name,state,open);list.append(row);return state}
function apiPayload(json){
 if(json&&json.code===0&&json.data&&typeof json.data==='object')return json.data;
 if(json&&json.code===undefined&&typeof json==='object'&&(json.registered!==undefined||json.unknown!==undefined||json.reserved!==undefined))return json;
 throw new Error((json&&json.msg)||'API');
}
async function queryDomain(domain){
 const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),18000);
 try{
  // Do not split WHOIS/RDAP here. The backend Lookup::merge() is the source of truth across TLDs.
  const url=API+encodeURIComponent(domain)+'&json=1';
  const r=await fetch(url,{headers:{Accept:'application/json'},signal:ctl.signal,cache:'no-store'});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const text=await r.text();let json;try{json=JSON.parse(text)}catch{throw new Error('JSON')}
  return apiPayload(json);
 }finally{clearTimeout(timer)}
}
function paintState(state,s,c){state.className='batch-state '+s;state.textContent=s==='registered'?c[8]:s==='available'?c[9]:s==='reserved'?(c[22]||'Reserved'):c[10]}
async function query(domain,state){const c=COPY[lang]||COPY.en;try{const payload=await queryDomain(domain);paintState(state,stateOf(payload),c)}catch(e){state.className='batch-state failed';state.textContent=c[12]}}
function buildDomains(){const tokens=textarea.value.split(/[\n,;\s]+/).map(v=>v.trim()).filter(Boolean),out=[],invalid=[];for(const token of tokens){if(token.includes('.')){const d=cleanDomain(token);d?out.push(d):invalid.push(token);continue}const label=token.toLowerCase().replace(/^https?:\/\//,'').replace(/\.$/,'');if(!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)){invalid.push(token);continue}for(const tld of selectedTlds)out.push(label+'.'+tld)}return {domains:[...new Set(out)].slice(0,50),invalid}}
submit.onclick=async()=>{const c=COPY[lang]||COPY.en,{domains,invalid}=buildDomains();list.replaceChildren();results.hidden=false;invalid.slice(0,10).forEach(v=>{const state=rowFor(v,'invalid');state.className='batch-state failed';state.textContent=c[11]});if(!domains.length){if(!invalid.length){const e=document.createElement('div');e.className='batch-error';e.textContent=c[20];list.append(e)}progress.textContent='0 / 0';return}submit.disabled=true;clear.disabled=true;let done=0,progressFrame=0;const paintProgress=()=>{if(progressFrame)return;progressFrame=requestAnimationFrame(()=>{progressFrame=0;progress.textContent=done+' / '+domains.length})};progress.textContent='0 / '+domains.length;const frag=document.createDocumentFragment(),jobs=domains.map(d=>{const row=document.createElement('div');row.className='batch-row';const name=document.createElement('span');name.className='batch-domain';name.textContent=d;const state=document.createElement('span');state.className='batch-state';state.innerHTML='<span class="batch-spinner" aria-label="Loading"></span>';const open=document.createElement('a');open.className='batch-open';open.href=searchUrl(d);open.title=d;open.setAttribute('aria-label','Open '+d);open.textContent='→';row.append(name,state,open);frag.append(row);return{d,state}});list.append(frag);let cursor=0;async function worker(){while(cursor<jobs.length){const job=jobs[cursor++];await query(job.d,job.state);done++;paintProgress()}}try{await Promise.all(Array.from({length:Math.min(4,jobs.length)},worker));done=domains.length;paintProgress();writeHistory([...domains.slice().reverse(),...readHistory()])}finally{submit.disabled=false;clear.disabled=false}};
renderHistory();renderFavorites();$('batchNav')?.setAttribute('aria-current','page');loadSuffixes();
