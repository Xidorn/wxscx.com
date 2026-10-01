const LANGS={en:{name:'English',title:'Domain Lookup',desc:'Search WHOIS, RDAP, registrar, DNS and lifecycle information for domains worldwide.',search:'Search',worldwide:'Worldwide TLD support'},zh:{name:'简体中文',title:'域名 WHOIS 查询',desc:'查询全球域名的 WHOIS、RDAP、注册商、DNS 与生命周期信息。',search:'查询',worldwide:'支持全球域名后缀'},de:{name:'Deutsch',title:'Domain-Abfrage',desc:'WHOIS-, RDAP-, Registrar-, DNS- und Lifecycle-Daten weltweit durchsuchen.',search:'Suchen',worldwide:'Globale TLD-Unterstützung'},fr:{name:'Français',title:'Recherche de domaine',desc:'Recherchez les données WHOIS, RDAP, registrar, DNS et cycle de vie.',search:'Rechercher',worldwide:'Prise en charge mondiale des TLD'},ja:{name:'日本語',title:'ドメイン検索',desc:'世界中のドメインの WHOIS、RDAP、レジストラ、DNS、ライフサイクル情報を検索。',search:'検索',worldwide:'世界中のTLDに対応'},es:{name:'Español',title:'Consulta de dominios',desc:'Consulta WHOIS, RDAP, registrador, DNS y ciclo de vida de dominios.',search:'Buscar',worldwide:'Compatibilidad global con TLD'}};
const THEME_NAMES={"en":["Theme","Graphite","Cloud","Linen","Moss","Ocean","Plum","Monochrome"],"zh":["外观","石墨深色","云白","亚麻暖色","苔绿","海洋蓝","鸢尾紫","极简黑白"],"de":["Design","Graphit","Wolkenweiß","Leinen","Moos","Ozean","Pflaume","Monochrom"],"fr":["Apparence","Graphite","Blanc nuage","Lin","Mousse","Océan","Prune","Monochrome"],"ja":["外観","グラファイト","クラウド","リネン","モス","オーシャン","プラム","モノクロ"],"es":["Apariencia","Grafito","Blanco nube","Lino","Musgo","Océano","Ciruela","Monocromo"]};
function translateThemes(){const names=THEME_NAMES[lang]||THEME_NAMES.en;const s=document.getElementById("themeSelect");const selected=s.value;["graphite","paper","sand","forest","ocean","plum","mono"].forEach((id,i)=>{const o=s.querySelector(`option[value="${id}"]`);if(o)o.textContent=names[i+1]});s.setAttribute("aria-label",names[0]);s.value=selected;}
function detectLang(){const s=localStorage.getItem('whoisLang');if(s&&LANGS[s])return s;const n=(navigator.language||'en').toLowerCase();if(n.startsWith('zh'))return'zh';if(n.startsWith('de'))return'de';if(n.startsWith('fr'))return'fr';if(n.startsWith('ja'))return'ja';if(n.startsWith('es'))return'es';return'en'}let lang=detectLang();const sel=document.getElementById('langSelect');Object.entries(LANGS).forEach(([k,v])=>sel.add(new Option(v.name,k)));function applyLang(){document.documentElement.lang=lang==='zh'?'zh-CN':lang;sel.value=lang;translateThemes();document.getElementById('domainInput').setAttribute('aria-label',({en:'Domain name',zh:'域名',de:'Domainname',fr:'Nom de domaine',ja:'ドメイン名',es:'Nombre de dominio'}[lang]));document.querySelectorAll('[data-i18n]').forEach(el=>{const v=LANGS[lang][el.dataset.i18n];if(v)el.textContent=v})}sel.onchange=()=>{lang=sel.value;localStorage.setItem('whoisLang',lang);applyLang()};applyLang();function cleanDomain(v){v=(v||'').trim().toLowerCase();return v.replace(/^https?:\/\//i,'').replace(/^\/\//,'').split('/')[0].split('?')[0].split('#')[0].replace(/:\d+$/,'').replace(/\.$/,'')}document.getElementById('searchForm').onsubmit=e=>{e.preventDefault();const d=cleanDomain(document.getElementById('domainInput').value);if(d)location.href='/'+encodeURIComponent(d)};document.getElementById('year').textContent=new Date().getFullYear();

/* Theme selection persists across homepage and all domain paths */
(function(){const allowed=['graphite','paper','sand','forest','ocean','plum','mono'];let picked='paper';try{picked=localStorage.getItem('whoisTheme')||'paper'}catch(e){}if(!allowed.includes(picked))picked='paper';const element=document.getElementById('themeSelect');function setTheme(theme){document.documentElement.dataset.theme=theme;element.value=theme;try{localStorage.setItem('whoisTheme',theme)}catch(e){}const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content={graphite:'#101318',paper:'#f5f6f4',sand:'#f5f1e9',forest:'#111a18',ocean:'#edf3f6',plum:'#f8f5f9',mono:'#ffffff'}[theme]}element.addEventListener('change',()=>setTheme(element.value));setTheme(picked)})();

/* One-year localStorage query history; migrate the legacy cookie once. */
const HISTORY_COOKIE='mrwang_whois_history';
const HISTORY_KEY='mrwang_whois_history_v2';
const HISTORY_TTL=365*24*60*60*1000;
const HISTORY_TEXT={
 en:{history:'Recent searches',clear:'Clear all',remove:'Remove',empty:'No recent searches',saved:'Saved locally for one year',clearInput:'Clear input',searchIcon:'Search domain'},
 zh:{history:'查询历史',clear:'清空记录',remove:'删除',empty:'暂无查询记录',saved:'本地保存，有效期一年',clearInput:'清空输入',searchIcon:'搜索域名'},
 de:{history:'Letzte Suchen',clear:'Alle löschen',remove:'Entfernen',empty:'Noch keine Suchanfragen',saved:'Ein Jahr lokal gespeichert',clearInput:'Eingabe löschen',searchIcon:'Domain suchen'},
 fr:{history:'Recherches récentes',clear:'Tout effacer',remove:'Supprimer',empty:'Aucune recherche récente',saved:'Enregistré localement pendant un an',clearInput:'Effacer la saisie',searchIcon:'Rechercher un domaine'},
 ja:{history:'検索履歴',clear:'すべて削除',remove:'削除',empty:'検索履歴はありません',saved:'ローカルに1年間保存',clearInput:'入力を消去',searchIcon:'ドメインを検索'},
 es:{history:'Búsquedas recientes',clear:'Borrar todo',remove:'Eliminar',empty:'No hay búsquedas recientes',saved:'Guardado localmente durante un año',clearInput:'Borrar texto',searchIcon:'Buscar dominio'}
};
function htxt(k){return (HISTORY_TEXT[lang]||HISTORY_TEXT.en)[k]}
function validHistoryDomain(d){return typeof d==='string'&&d.length<=253&&d.includes('.')&&!/\s/.test(d)}
function persistHistory(entries){try{localStorage.setItem(HISTORY_KEY,JSON.stringify({version:2,entries:entries.slice(0,10)}))}catch(e){}}
function readHistoryEntries(){
 const now=Date.now();let raw=null;
 try{raw=localStorage.getItem(HISTORY_KEY)}catch(e){}
 if(raw===null){
  // One-time upgrade: preserve the older cookie records, then retire that cookie.
  let old=[];try{const part=document.cookie.split('; ').find(c=>c.startsWith(HISTORY_COOKIE+'='));if(part){const parsed=JSON.parse(decodeURIComponent(part.slice(HISTORY_COOKIE.length+1)));if(Array.isArray(parsed))old=parsed}}catch(e){}
  const entries=[...new Set(old.filter(validHistoryDomain))].slice(0,10).map(domain=>({domain,savedAt:now}));
  persistHistory(entries);
  document.cookie=HISTORY_COOKIE+'=; Max-Age=0; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
  return entries;
 }
 try{
  const parsed=JSON.parse(raw), entries=Array.isArray(parsed?.entries)?parsed.entries:[];
  const valid=entries.filter(x=>x&&validHistoryDomain(x.domain)&&Number.isFinite(x.savedAt)&&x.savedAt<=now&&now-x.savedAt<HISTORY_TTL).slice(0,10);
  if(valid.length!==entries.length)persistHistory(valid);
  return valid;
 }catch(e){persistHistory([]);return []}
}
function readHistory(){return readHistoryEntries().map(item=>item.domain)}
function writeHistory(items){
 const previous=new Map(readHistoryEntries().map(x=>[x.domain,x.savedAt]));
 const entries=[...new Set(items.filter(validHistoryDomain))].slice(0,10).map(domain=>({domain,savedAt:previous.get(domain)||Date.now()}));
 persistHistory(entries);renderHistory();
}
function rememberDomain(v){const d=cleanDomain(v);if(!d||d.length>253||!d.includes('.')||/\s/.test(d))return;persistHistory([{domain:d,savedAt:Date.now()},...readHistoryEntries().filter(x=>x.domain!==d)].slice(0,10));renderHistory()}
function renderHistory(){const panel=document.getElementById('historyPanel');if(!panel)return;const arr=readHistory();const title=document.getElementById('historySummary');title.textContent=htxt('history')+' ('+arr.length+')';const list=document.getElementById('historyList');list.replaceChildren();if(!arr.length){const empty=document.createElement('div');empty.className='history-empty';empty.textContent=htxt('empty');list.append(empty)}else arr.forEach(d=>{const row=document.createElement('div');row.className='history-row';const a=document.createElement('a');a.className='history-link';a.textContent=d;a.href='/'+encodeURIComponent(d);const del=document.createElement('button');del.type='button';del.className='history-remove';del.textContent='×';del.title=htxt('remove');del.setAttribute('aria-label',htxt('remove')+' '+d);del.addEventListener('click',()=>writeHistory(readHistory().filter(x=>x!==d)));row.append(a,del);list.append(row)});document.getElementById('historyNote').textContent=htxt('saved');const all=document.getElementById('historyClear');all.textContent=htxt('clear');all.hidden=!arr.length}
function updateSearchControls(){const input=document.getElementById('domainInput');const btn=document.getElementById('clearInput');btn.hidden=!input.value;btn.title=htxt('clearInput');btn.setAttribute('aria-label',htxt('clearInput'));const submit=document.getElementById('searchSubmit');submit.title=htxt('searchIcon');submit.setAttribute('aria-label',htxt('searchIcon'));renderHistory()}
(function setupQueryTools(){const input=document.getElementById('domainInput');const clr=document.getElementById('clearInput');clr.onclick=()=>{input.value='';input.focus();updateSearchControls()};input.addEventListener('input',updateSearchControls);document.getElementById('historyClear').onclick=()=>writeHistory([]);document.getElementById('searchForm').onsubmit=e=>{e.preventDefault();const d=cleanDomain(input.value);if(!d)return;rememberDomain(d);location.href='/'+encodeURIComponent(d)};sel.addEventListener('change',updateSearchControls);updateSearchControls()})();
