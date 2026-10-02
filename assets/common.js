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
function validHistoryDomain(d){return typeof d==='string'&&validDomain(d)}
function persistHistory(entries){
 const clean=entries;
 try{localStorage.setItem(HISTORY_KEY,JSON.stringify({version:2,entries:clean}));return true}catch(e){console.warn('History storage unavailable',e);return false}
}
function normalizeHistoryPayload(parsed,now=Date.now()){
 let source=[];
 if(Array.isArray(parsed))source=parsed;
 else if(Array.isArray(parsed?.entries))source=parsed.entries;
 else if(Array.isArray(parsed?.history))source=parsed.history;
 const seen=new Set(),out=[];
 for(const item of source){
  const raw=typeof item==='string'?item:item?.domain;
  const domain=cleanDomain(raw||'');
  let savedAt=typeof item==='object'&&Number.isFinite(Number(item?.savedAt))?Number(item.savedAt):now;
  if(savedAt>now)savedAt=now;
  if(!validHistoryDomain(domain)||now-savedAt>=HISTORY_TTL||seen.has(domain))continue;
  seen.add(domain);out.push({domain,savedAt});
 }
 return out;
}
function readHistoryEntries(){
 const now=Date.now();let raw=null;
 try{raw=localStorage.getItem(HISTORY_KEY)}catch(e){}
 if(raw!==null){
  try{const parsed=JSON.parse(raw),entries=normalizeHistoryPayload(parsed,now);const canonical=JSON.stringify({version:2,entries});if(raw!==canonical)persistHistory(entries);return entries}
  catch(e){console.warn('Invalid history data, rebuilding it',e)}
 }
 // Migrate legacy cookie / localStorage shapes without discarding a user's existing history.
 let legacy=[];
 try{for(const key of ['mrwang_whois_history','mrwang_whois_history_v1']){const v=localStorage.getItem(key);if(v){const parsed=JSON.parse(v);legacy.push(...(Array.isArray(parsed)?parsed:(parsed?.entries||[])))}}}catch(e){}
 try{const part=document.cookie.split('; ').find(c=>c.startsWith(HISTORY_COOKIE+'='));if(part){const parsed=JSON.parse(decodeURIComponent(part.slice(HISTORY_COOKIE.length+1)));legacy.push(...(Array.isArray(parsed)?parsed:(parsed?.entries||[])))}}catch(e){}
 const entries=normalizeHistoryPayload(legacy,now);persistHistory(entries);
 try{document.cookie=HISTORY_COOKIE+'=; Max-Age=0; Path=/; SameSite=Lax'+(location.protocol==='https:'?'; Secure':'')}catch(e){}
 return entries;
}
function readHistory(){return readHistoryEntries().map(item=>item.domain)}
function writeHistory(items){
 const previous=new Map(readHistoryEntries().map(x=>[x.domain,x.savedAt]));
 const now=Date.now(),entries=[];
 for(const raw of items){const domain=cleanDomain(raw);if(!validHistoryDomain(domain)||entries.some(x=>x.domain===domain))continue;entries.push({domain,savedAt:previous.get(domain)||now})}
 persistHistory(entries);emitLibraryChange('history');return entries.map(x=>x.domain);
}
function rememberDomain(v){
 const d=cleanDomain(v);if(!validHistoryDomain(d))return false;
 const now=Date.now(),entries=[{domain:d,savedAt:now},...readHistoryEntries().filter(x=>x.domain!==d)];
 persistHistory(entries);emitLibraryChange('history');return true;
}
const WHOIS_THEMES=['graphite','paper','sand','forest','ocean','plum','mono','slate','mint','rose'];
const WHOIS_THEME_COLORS={graphite:'#101318',paper:'#f5f6f4',sand:'#f5f1e9',forest:'#111a18',ocean:'#edf3f6',plum:'#f8f5f9',mono:'#ffffff',slate:'#171d26',mint:'#f0f7f5',rose:'#faf5f4'};
function applyWhoisTheme(theme,{persist=true,notify=true}={}){
 if(!WHOIS_THEMES.includes(theme))theme='paper';
 if(document.documentElement.dataset.theme!==theme)document.documentElement.dataset.theme=theme;
 const element=document.getElementById('themeSelect');if(element&&element.value!==theme)element.value=theme;
 if(persist){try{localStorage.setItem('whoisTheme',theme)}catch(e){}}
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=WHOIS_THEME_COLORS[theme];
 if(notify){try{window.dispatchEvent(new CustomEvent('whois:themechange',{detail:{theme}}))}catch{}}
 return theme;
}
window.applyWhoisTheme=applyWhoisTheme;
function initThemePicker(){
 const element=document.getElementById('themeSelect');if(!element)return;
 if(!element.dataset.themeBound){element.dataset.themeBound='1';element.addEventListener('change',()=>applyWhoisTheme(element.value));}
 applyWhoisTheme(document.documentElement.dataset.theme||'paper',{persist:false,notify:false});
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


THEME_NAMES['zh-Hant']=['外觀','石墨深色','雲白','亞麻暖色','苔綠','海洋藍','鳶尾紫','極簡黑白'];
HISTORY_TEXT['zh-Hant']={history:'查詢紀錄',clear:'清除全部',remove:'刪除',empty:'暫無查詢紀錄',saved:'本機儲存，有效期一年',clearInput:'清除輸入',searchIcon:'搜尋網域'};
/* Single domain normalization shared by homepage and results. URL API converts IDN to Punycode. */
function cleanDomain(value){
 let raw=String(value??'').trim();if(!raw||raw.includes('@')||/[\\\s]/u.test(raw))return '';
 try{
  const url=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:('https://'+raw.replace(/^\/\//,'')));
  if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.port)return '';
  let host=url.hostname.toLowerCase().replace(/\.$/,'').replace(/^www\./,'');
  if(!host||host.length>253||host.includes('..')||host.includes(':')||!host.includes('.'))return '';
  const labels=host.split('.');
  if(labels.length<2||labels.some(x=>!x||x.length>63||!(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(x))))return '';
  if(!/[a-z]/i.test(labels.at(-1))||/^\d+$/.test(labels.at(-1)))return '';
  return host;
 }catch{return ''}
}
function validDomain(input){return !!cleanDomain(input)&&cleanDomain(input)===input}
function searchUrl(domain){return '/'+encodeURIComponent(domain)}


/* V29: explicit, durable local bookmarks; no automatic expiration. */
const FAVORITES_KEY='mrwang_whois_favorites_v1';
function getFavorites(){try{const a=JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]');return Array.isArray(a)?[...new Set(a.filter(validHistoryDomain))].slice(0,30):[]}catch{return []}}
function setFavorites(a){const domains=[...new Set(a.map(cleanDomain).filter(validHistoryDomain))].slice(0,30);try{localStorage.setItem(FAVORITES_KEY,JSON.stringify(domains))}catch{}emitLibraryChange('favorites');return domains}
function toggleFavorite(domain){const d=cleanDomain(domain),a=getFavorites();if(!validHistoryDomain(d))return false;const exists=a.includes(d);setFavorites(exists?a.filter(v=>v!==d):[d,...a]);return !exists}

const EXTRA_TEXT={"en":["Save domain","Remove from saved","Export TXT","Export JSON","Query time","Data source","Saved domains","No saved domains","Remove","Local to this browser","Saved","Removed"],"zh":["收藏域名","取消收藏","导出 TXT","导出 JSON","查询时间","数据来源","我的收藏","暂无收藏域名","删除","仅保存在当前浏览器","已收藏","已取消收藏"],"zh-Hant":["收藏網域","取消收藏","匯出 TXT","匯出 JSON","查詢時間","資料來源","我的收藏","暫無收藏網域","刪除","僅儲存在目前瀏覽器","已收藏","已取消收藏"],"de":["Domain speichern","Aus Favoriten entfernen","TXT exportieren","JSON exportieren","Abfragezeit","Datenquelle","Gespeicherte Domains","Keine gespeicherten Domains","Entfernen","Nur in diesem Browser","Gespeichert","Entfernt"],"fr":["Enregistrer le domaine","Retirer des favoris","Exporter TXT","Exporter JSON","Heure de recherche","Source des données","Domaines favoris","Aucun domaine favori","Supprimer","Stocké dans ce navigateur","Enregistré","Supprimé"],"ja":["ドメインを保存","お気に入りから削除","TXTを書き出す","JSONを書き出す","照会時刻","データ取得元","保存したドメイン","保存したドメインはありません","削除","このブラウザー内のみ","保存しました","削除しました"],"es":["Guardar dominio","Quitar favorito","Exportar TXT","Exportar JSON","Hora de consulta","Fuente de datos","Dominios guardados","Sin dominios guardados","Eliminar","Solo en este navegador","Guardado","Eliminado"],"pt":["Salvar domínio","Remover favorito","Exportar TXT","Exportar JSON","Hora da consulta","Fonte dos dados","Domínios salvos","Nenhum domínio salvo","Remover","Somente neste navegador","Salvo","Removido"],"it":["Salva dominio","Rimuovi dai preferiti","Esporta TXT","Esporta JSON","Ora della ricerca","Fonte dei dati","Domini salvati","Nessun dominio salvato","Rimuovi","Solo in questo browser","Salvato","Rimosso"],"ko":["도메인 저장","즐겨찾기 해제","TXT 내보내기","JSON 내보내기","조회 시각","데이터 출처","저장한 도메인","저장한 도메인 없음","삭제","이 브라우저에만 저장","저장됨","삭제됨"],"ru":["Сохранить домен","Удалить из избранного","Экспорт TXT","Экспорт JSON","Время запроса","Источник данных","Избранные домены","Нет избранных доменов","Удалить","Только в этом браузере","Сохранено","Удалено"],"ar":["حفظ النطاق","إزالة من المحفوظات","تصدير TXT","تصدير JSON","وقت الاستعلام","مصدر البيانات","النطاقات المحفوظة","لا توجد نطاقات محفوظة","إزالة","محفوظ في هذا المتصفح فقط","تم الحفظ","تمت الإزالة"],"hi":["डोमेन सहेजें","सहेजा हुआ हटाएँ","TXT निर्यात","JSON निर्यात","खोज का समय","डेटा स्रोत","सहेजे गए डोमेन","कोई सहेजा डोमेन नहीं","हटाएँ","सिर्फ इस ब्राउज़र में","सहेजा गया","हटाया गया"],"id":["Simpan domain","Hapus dari favorit","Ekspor TXT","Ekspor JSON","Waktu pencarian","Sumber data","Domain tersimpan","Belum ada domain tersimpan","Hapus","Hanya di peramban ini","Tersimpan","Dihapus"]};
function xt(n){return (EXTRA_TEXT[lang]||EXTRA_TEXT.en)[n]}

function renderFavorites(){const panel=document.getElementById('favoritesPanel');if(!panel)return;
 const domains=getFavorites(),title=document.getElementById('favoritesSummary'),list=document.getElementById('favoritesList');
 title.textContent=xt(6)+' ('+domains.length+')';list.replaceChildren();const clearBtn=document.getElementById('favoritesClear');if(clearBtn){clearBtn.textContent=FAVORITES_CLEAR[lang]||FAVORITES_CLEAR.en;clearBtn.hidden=!domains.length;clearBtn.onclick=()=>{setFavorites([]);renderFavorites();if(typeof updateResultTools==='function'&&typeof currentData!=='undefined'&&currentData)updateResultTools()};}
 if(!domains.length){const empty=document.createElement('div');empty.className='history-empty';empty.textContent=xt(7);list.append(empty);return}
 domains.forEach(d=>{const row=document.createElement('div');row.className='history-row';const a=document.createElement('a');a.className='history-link';a.href=searchUrl(d);a.textContent=d;
 const remove=document.createElement('button');remove.type='button';remove.className='history-remove';remove.textContent='×';remove.setAttribute('aria-label',xt(8)+' '+d);remove.addEventListener('click',()=>{setFavorites(getFavorites().filter(x=>x!==d));renderFavorites();if(typeof updateResultTools==='function'&&typeof currentData!=='undefined'&&currentData)updateResultTools()});row.append(a,remove);list.append(row)});
}

/* Three additional themes, translated consistently. */
THEME_NAMES["en"].push(...["Slate", "Mint", "Rose"]);
THEME_NAMES["zh"].push(...["岩灰蓝", "薄荷绿", "玫瑰雾"]);
THEME_NAMES["zh-Hant"].push(...["岩灰藍", "薄荷綠", "玫瑰霧"]);
THEME_NAMES["de"].push(...["Schiefer", "Minze", "Rosé"]);
THEME_NAMES["fr"].push(...["Ardoise", "Menthe", "Rosé"]);
THEME_NAMES["ja"].push(...["スレート", "ミント", "ローズ"]);
THEME_NAMES["es"].push(...["Pizarra", "Menta", "Rosa"]);
THEME_NAMES["pt"].push(...["Ardósia", "Menta", "Rosa"]);
THEME_NAMES["it"].push(...["Ardesia", "Menta", "Rosa"]);
THEME_NAMES["ko"].push(...["슬레이트", "민트", "로즈"]);
THEME_NAMES["ru"].push(...["Сланец", "Мята", "Роза"]);
THEME_NAMES["ar"].push(...["أردوازي", "نعناعي", "وردي"]);
THEME_NAMES["hi"].push(...["स्लेट", "मिंट", "रोज़"]);
THEME_NAMES["id"].push(...["Batu tulis", "Mint", "Mawar"]);

const FAVORITES_CLEAR={"en": "Clear saved", "zh": "清空收藏", "zh-Hant": "清空收藏", "de": "Favoriten löschen", "fr": "Effacer les favoris", "ja": "保存をすべて削除", "es": "Borrar favoritos", "pt": "Limpar salvos", "it": "Cancella preferiti", "ko": "즐겨찾기 모두 삭제", "ru": "Очистить избранное", "ar": "مسح المحفوظات", "hi": "सहेजे गए सभी हटाएँ", "id": "Hapus semua favorit"};

/* Ordered, translated native language list shared by both pages. */
const LANGUAGE_GROUPS = {"en":["Language","International","East Asia","Europe","Other regions"],"zh":["语言","国际","东亚语言","欧洲语言","其他地区"],"zh-Hant":["語言","國際","東亞語言","歐洲語言","其他地區"],"ja":["言語","国際","東アジア","ヨーロッパ","その他の地域"],"ko":["언어","국제","동아시아","유럽","기타 지역"],"de":["Sprache","International","Ostasien","Europa","Weitere Regionen"],"fr":["Langue","International","Asie de l’Est","Europe","Autres régions"],"es":["Idioma","Internacional","Asia oriental","Europa","Otras regiones"],"pt":["Idioma","Internacional","Leste Asiático","Europa","Outras regiões"],"it":["Lingua","Internazionale","Asia orientale","Europa","Altre regioni"],"ru":["Язык","Международный","Восточная Азия","Европа","Другие регионы"],"id":["Bahasa","Internasional","Asia Timur","Eropa","Wilayah lain"],"hi":["भाषा","अंतरराष्ट्रीय","पूर्वी एशिया","यूरोप","अन्य क्षेत्र"],"ar":["اللغة","دولي","شرق آسيا","أوروبا","مناطق أخرى"]};
const LANGUAGE_ORDER=[['en'],['zh','zh-Hant','ja','ko'],['de','fr','es','pt','it','ru'],['id','hi','ar']];
function populateLanguageSelect(select, dictionary){
 if(!select)return;const chosen=select.value;select.replaceChildren();
 LANGUAGE_ORDER.forEach((codes,idx)=>{const group=document.createElement('optgroup');group.dataset.group=String(idx);for(const code of codes){if(!dictionary[code])continue;group.append(new Option(dictionary[code].name,code))}if(group.children.length)select.append(group)});
 if(chosen&&dictionary[chosen])select.value=chosen;
}
function translateLanguageGroups(select,code){
 const names=LANGUAGE_GROUPS[code]||LANGUAGE_GROUPS.en;if(!select)return;select.setAttribute('aria-label',names[0]);select.title=names[0];select.querySelectorAll('optgroup[data-group]').forEach(g=>g.label=names[Number(g.dataset.group)+1]||'');
 const box=select.closest('.picker');if(box){box.title=names[0]}
}

/* Brand follows the selected interface language. */
const BRAND_TITLES={"en": "Domain Lookup", "zh": "域名查询", "zh-Hant": "網域查詢", "ja": "ドメイン検索", "ko": "도메인 조회", "de": "Domain-Abfrage", "fr": "Recherche de domaine", "es": "Consulta de dominios", "pt": "Consulta de domínios", "it": "Ricerca domini", "ru": "Поиск доменов", "ar": "البحث عن النطاقات", "hi": "डोमेन खोज", "id": "Pencarian Domain"};
function renderBrand(code){document.querySelectorAll("[data-brand-title]").forEach(el=>{el.textContent=BRAND_TITLES[code]||BRAND_TITLES.en});}

/* V57: shared lightweight feedback and clipboard fallback. */
const TOAST_TEXT={
 en:{copied:'Copied',copyFailed:'Copy failed. Please copy manually.'},zh:{copied:'已复制',copyFailed:'复制失败，请手动复制。'},'zh-Hant':{copied:'已複製',copyFailed:'複製失敗，請手動複製。'},
 de:{copied:'Kopiert',copyFailed:'Kopieren fehlgeschlagen. Bitte manuell kopieren.'},fr:{copied:'Copié',copyFailed:'Échec de la copie. Copiez manuellement.'},ja:{copied:'コピーしました',copyFailed:'コピーできませんでした。手動でコピーしてください。'},
 es:{copied:'Copiado',copyFailed:'No se pudo copiar. Copia manualmente.'},pt:{copied:'Copiado',copyFailed:'Falha ao copiar. Copie manualmente.'},it:{copied:'Copiato',copyFailed:'Copia non riuscita. Copia manualmente.'},ko:{copied:'복사됨',copyFailed:'복사하지 못했습니다. 직접 복사해 주세요.'},ru:{copied:'Скопировано',copyFailed:'Не удалось скопировать. Скопируйте вручную.'},ar:{copied:'تم النسخ',copyFailed:'تعذر النسخ. انسخ يدويًا.'},hi:{copied:'कॉपी किया गया',copyFailed:'कॉपी नहीं हो सका। कृपया मैन्युअल रूप से कॉपी करें।'},id:{copied:'Tersalin',copyFailed:'Gagal menyalin. Silakan salin secara manual.'}
};
function currentUiLang(){const v=document.getElementById('langSelect')?.value||document.documentElement.lang||'en';return v==='zh-CN'?'zh':v==='zh-TW'?'zh-Hant':String(v).split('-')[0]}
function toastText(key){const code=currentUiLang();return (TOAST_TEXT[code]||TOAST_TEXT.en)[key]||TOAST_TEXT.en[key]}
let toastTimer=0;
function showToast(message,type='success'){
 let el=document.getElementById('siteToast');
 if(!el){el=document.createElement('div');el.id='siteToast';el.className='site-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');el.setAttribute('aria-atomic','true');document.body.append(el)}
 el.textContent=message;el.dataset.type=type;el.classList.add('is-visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('is-visible'),1800);
}
async function copyToClipboard(text){
 const value=String(text??'');if(!value)throw new Error('Nothing to copy');
 if(navigator.clipboard?.writeText&&window.isSecureContext){await navigator.clipboard.writeText(value);return true}
 const el=document.createElement('textarea');el.value=value;el.setAttribute('readonly','');el.style.cssText='position:fixed;inset:auto auto 0 -9999px;opacity:0';document.body.append(el);el.select();el.setSelectionRange(0,value.length);let ok=false;try{ok=document.execCommand('copy')}finally{el.remove()}if(!ok)throw new Error('Clipboard unavailable');return true;
}
window.showToast=showToast;window.copyToClipboard=copyToClipboard;window.toastText=toastText;

/* V49: independent History and Saved counters. */
function updateLibraryCounts(){
 const history=readHistory().length,favorites=getFavorites().length;
 const hb=document.getElementById('historyCount'),fb=document.getElementById('favoritesCount');
 if(hb){hb.hidden=!history;hb.textContent=history>99?'99+':String(history)}
 if(fb){fb.hidden=!favorites;fb.textContent=favorites>99?'99+':String(favorites)}
}
function refreshLocalLibraryUI(){
 try{if(typeof renderHistory==='function')renderHistory()}catch(e){console.warn('History UI refresh failed',e)}
 try{if(typeof renderFavorites==='function')renderFavorites()}catch(e){console.warn('Favorites UI refresh failed',e)}
 try{updateLibraryCounts()}catch(e){console.warn('Library counter refresh failed',e)}
 try{if(typeof updateResultTools==='function'&&typeof currentData!=='undefined'&&currentData)updateResultTools()}catch(e){console.warn('Result tool refresh failed',e)}
}
function emitLibraryChange(kind){
 // Same-tab localStorage changes do not fire the browser storage event. Refresh synchronously first.
 refreshLocalLibraryUI();
 try{window.dispatchEvent(new CustomEvent('whois:librarychange',{detail:{kind}}))}catch{}
}
function notifyLocalLibraryChange(){emitLibraryChange('all')}
window.updateLibraryCounts=updateLibraryCounts;
window.refreshLocalLibraryUI=refreshLocalLibraryUI;
window.addEventListener('storage',event=>{if(event.key===HISTORY_KEY||event.key===FAVORITES_KEY||event.key===null)refreshLocalLibraryUI()});
document.addEventListener('DOMContentLoaded',updateLibraryCounts);
