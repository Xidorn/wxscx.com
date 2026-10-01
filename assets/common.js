/* Common UI preferences, theme descriptions and local search history. */
const THEME_NAMES={"en":["Theme","Graphite","Cloud","Linen","Moss","Ocean","Plum","Monochrome"],"zh":["外观","石墨深色","云白","亚麻暖色","苔绿","海洋蓝","鸢尾紫","极简黑白"],"de":["Design","Graphit","Wolkenweiß","Leinen","Moos","Ozean","Pflaume","Monochrom"],"fr":["Apparence","Graphite","Blanc nuage","Lin","Mousse","Océan","Prune","Monochrome"],"ja":["外観","グラファイト","クラウド","リネン","モス","オーシャン","プラム","モノクロ"],"es":["Apariencia","Grafito","Blanco nube","Lino","Musgo","Océano","Ciruela","Monocromo"]};
const HISTORY_TEXT={
 en:{history:'Recent searches',clear:'Clear all',remove:'Remove',empty:'No recent searches',saved:'Saved locally for one year',clearInput:'Clear input',searchIcon:'Search domain'},
 zh:{history:'查询历史',clear:'清空记录',remove:'删除',empty:'暂无查询记录',saved:'本地保存，有效期一年',clearInput:'清空输入',searchIcon:'搜索域名'},
 de:{history:'Letzte Suchen',clear:'Alle löschen',remove:'Entfernen',empty:'Noch keine Suchanfragen',saved:'Ein Jahr lokal gespeichert',clearInput:'Eingabe löschen',searchIcon:'Domain suchen'},
 fr:{history:'Recherches récentes',clear:'Tout effacer',remove:'Supprimer',empty:'Aucune recherche récente',saved:'Enregistré localement pendant un an',clearInput:'Effacer la saisie',searchIcon:'Rechercher un domaine'},
 ja:{history:'検索履歴',clear:'すべて削除',remove:'削除',empty:'検索履歴はありません',saved:'ローカルに1年間保存',clearInput:'入力を消去',searchIcon:'ドメインを検索'},
 es:{history:'Búsquedas recientes',clear:'Borrar todo',remove:'Eliminar',empty:'No hay búsquedas recientes',saved:'Guardado localmente durante un año',clearInput:'Borrar texto',searchIcon:'Buscar dominio'}
};
const HISTORY_COOKIE='mrwang_whois_history';
const HISTORY_KEY='mrwang_whois_history_v2';
const HISTORY_TTL=365*24*60*60*1000;
function htxt(k){return (HISTORY_TEXT[lang]||HISTORY_TEXT.en)[k]}
function validHistoryDomain(d){return typeof d==='string'&&d.length<=253&&/^[a-z0-9.-]+$/i.test(d)&&d.includes('.')&&!d.startsWith('.')&&!d.endsWith('.')}
function persistHistory(entries){try{localStorage.setItem(HISTORY_KEY,JSON.stringify({version:2,entries:entries.slice(0,10)}))}catch(e){}}
function readHistoryEntries(){
 const now=Date.now();let raw=null;
 try{raw=localStorage.getItem(HISTORY_KEY)}catch(e){}
 if(raw===null){
  let old=[];try{const part=document.cookie.split('; ').find(c=>c.startsWith(HISTORY_COOKIE+'='));if(part){const parsed=JSON.parse(decodeURIComponent(part.slice(HISTORY_COOKIE.length+1)));if(Array.isArray(parsed))old=parsed}}catch(e){}
  const entries=[...new Set(old.map(x=>String(x).toLowerCase()).filter(validHistoryDomain))].slice(0,10).map(domain=>({domain,savedAt:now}));
  persistHistory(entries);
  document.cookie=HISTORY_COOKIE+'=; Max-Age=0; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'');
  return entries;
 }
 try{
  const parsed=JSON.parse(raw),entries=Array.isArray(parsed?.entries)?parsed.entries:[];
  const seen=new Set();const valid=entries.filter(x=>{
   if(!x||!validHistoryDomain(x.domain)||!Number.isFinite(x.savedAt)||x.savedAt>now||now-x.savedAt>=HISTORY_TTL||seen.has(x.domain))return false;
   seen.add(x.domain);return true
  }).slice(0,10);
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
function rememberDomain(v){const d=cleanDomain(v);if(!validHistoryDomain(d))return;
 persistHistory([{domain:d,savedAt:Date.now()},...readHistoryEntries().filter(x=>x.domain!==d)].slice(0,10));renderHistory()
}
function initThemePicker(){
 const element=document.getElementById('themeSelect');if(!element)return;
 const allowed=['graphite','paper','sand','forest','ocean','plum','mono'];
 const colors={graphite:'#101318',paper:'#f5f6f4',sand:'#f5f1e9',forest:'#111a18',ocean:'#edf3f6',plum:'#f8f5f9',mono:'#ffffff'};
 const setTheme=(theme)=>{if(!allowed.includes(theme))theme='paper';document.documentElement.dataset.theme=theme;element.value=theme;try{localStorage.setItem('whoisTheme',theme)}catch(e){}const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=colors[theme]};
 element.addEventListener('change',()=>setTheme(element.value));setTheme(document.documentElement.dataset.theme||'paper');
}

THEME_NAMES["pt"]=["Tema", "Grafite", "Nuvem", "Linho", "Musgo", "Oceano", "Ameixa", "Monocromático"];
HISTORY_TEXT["pt"]={"history": "Pesquisas recentes", "clear": "Limpar tudo", "remove": "Remover", "empty": "Nenhuma pesquisa recente", "saved": "Salvo localmente por um ano", "clearInput": "Limpar entrada", "searchIcon": "Pesquisar domínio"};

THEME_NAMES["it"]=["Tema", "Grafite", "Nuvola", "Lino", "Muschio", "Oceano", "Prugna", "Monocromatico"];
HISTORY_TEXT["it"]={"history": "Ricerche recenti", "clear": "Cancella tutto", "remove": "Rimuovi", "empty": "Nessuna ricerca recente", "saved": "Salvato in locale per un anno", "clearInput": "Svuota il campo", "searchIcon": "Cerca dominio"};

THEME_NAMES["ko"]=["테마", "그래파이트", "클라우드", "리넨", "모스", "오션", "플럼", "모노크롬"];
HISTORY_TEXT["ko"]={"history": "최근 검색", "clear": "모두 삭제", "remove": "삭제", "empty": "검색 기록 없음", "saved": "로컬에 1년간 저장", "clearInput": "입력 지우기", "searchIcon": "도메인 검색"};

THEME_NAMES["ru"]=["Оформление", "Графит", "Облако", "Лён", "Мох", "Океан", "Слива", "Монохром"];
HISTORY_TEXT["ru"]={"history": "Недавние запросы", "clear": "Очистить всё", "remove": "Удалить", "empty": "История пуста", "saved": "Хранится локально один год", "clearInput": "Очистить поле", "searchIcon": "Найти домен"};

THEME_NAMES["ar"]=["المظهر", "غرافيت", "سحابي", "كتاني", "طحلبي", "محيطي", "برقوقي", "أحادي اللون"];
HISTORY_TEXT["ar"]={"history": "عمليات البحث الأخيرة", "clear": "مسح الكل", "remove": "حذف", "empty": "لا توجد عمليات بحث", "saved": "محفوظ محليًا لمدة سنة", "clearInput": "مسح الإدخال", "searchIcon": "البحث عن نطاق"};

THEME_NAMES["hi"]=["थीम", "ग्रेफ़ाइट", "क्लाउड", "लिनेन", "मॉस", "ओशन", "प्लम", "मोनोक्रोम"];
HISTORY_TEXT["hi"]={"history": "हाल की खोजें", "clear": "सभी मिटाएँ", "remove": "हटाएँ", "empty": "अभी कोई खोज नहीं", "saved": "एक वर्ष तक स्थानीय रूप से सहेजा जाता है", "clearInput": "इनपुट साफ़ करें", "searchIcon": "डोमेन खोजें"};

THEME_NAMES["id"]=["Tema", "Grafit", "Awan", "Linen", "Lumut", "Samudra", "Plum", "Monokrom"];
HISTORY_TEXT["id"]={"history": "Pencarian terbaru", "clear": "Hapus semua", "remove": "Hapus", "empty": "Belum ada riwayat", "saved": "Disimpan lokal selama satu tahun", "clearInput": "Kosongkan input", "searchIcon": "Cari domain"};
