/* V52 navigation: build once, sync state without rebuilding the menu. */
(()=>{
 const root=r=>typeof r==='string'?document.querySelector(r):(r||document);
 const $=(s,r=document)=>root(r)?.querySelector(s)||null, $$=(s,r=document)=>{const x=root(r);return x?[...x.querySelectorAll(s)]:[]};
 const navText={
  en:{batch:'Batch',history:'History',favorites:'Saved',display:'Display',theme:'Theme',font:'Text size',close:'Close'},
  zh:{batch:'批量查询',history:'查询历史',favorites:'收藏域名',display:'显示设置',theme:'风格',font:'文字大小',close:'关闭'},
  'zh-Hant':{batch:'批次查詢',history:'查詢紀錄',favorites:'收藏網域',display:'顯示設定',theme:'風格',font:'文字大小',close:'關閉'},
  de:{batch:'Stapel',history:'Verlauf',favorites:'Gespeichert',display:'Anzeige',theme:'Design',font:'Textgröße',close:'Schließen'},
  fr:{batch:'Lot',history:'Historique',favorites:'Favoris',display:'Affichage',theme:'Thème',font:'Taille du texte',close:'Fermer'},
  ja:{batch:'一括検索',history:'履歴',favorites:'保存済み',display:'表示',theme:'テーマ',font:'文字サイズ',close:'閉じる'},
  es:{batch:'Lote',history:'Historial',favorites:'Guardados',display:'Pantalla',theme:'Tema',font:'Tamaño de texto',close:'Cerrar'},
  pt:{batch:'Lote',history:'Histórico',favorites:'Salvos',display:'Exibição',theme:'Tema',font:'Tamanho do texto',close:'Fechar'},
  it:{batch:'Batch',history:'Cronologia',favorites:'Salvati',display:'Aspetto',theme:'Tema',font:'Dimensione testo',close:'Chiudi'},
  ko:{batch:'일괄 조회',history:'기록',favorites:'저장됨',display:'화면',theme:'테마',font:'글자 크기',close:'닫기'},
  ru:{batch:'Пакетно',history:'История',favorites:'Избранное',display:'Вид',theme:'Тема',font:'Размер текста',close:'Закрыть'},
  ar:{batch:'بحث جماعي',history:'السجل',favorites:'المحفوظات',display:'العرض',theme:'المظهر',font:'حجم النص',close:'إغلاق'},
  hi:{batch:'बैच',history:'इतिहास',favorites:'सहेजे गए',display:'दिखावट',theme:'थीम',font:'पाठ आकार',close:'बंद करें'},
  id:{batch:'Massal',history:'Riwayat',favorites:'Tersimpan',display:'Tampilan',theme:'Tema',font:'Ukuran teks',close:'Tutup'}
 };
 const themeColors={graphite:['#101318','#a2c9ca'],paper:['#f5f6f4','#346b79'],sand:['#f6f2eb','#9c6748'],forest:['#15201c','#bbd8ad'],ocean:['#edf3f6','#3e7996'],plum:['#f8f5f9','#78619c'],mono:['#fff','#202020'],slate:['#171d26','#91b5d5'],mint:['#f0f7f5','#4e9d83'],rose:['#faf5f4','#b67c90']};
 const lang=()=>$('#langSelect')?.value||'en', text=()=>navText[lang()]||navText.en;
 const popItems=$$('.nav-popover-item'), choices=$$('.nav-choice');
 function closeAll(except=null){
  popItems.forEach(n=>{if(n===except)return;const p=$('.nav-popover',n),b=$('.nav-button',n);if(p){p.hidden=true;b?.setAttribute('aria-expanded','false')}});
  choices.forEach(n=>{if(n===except)return;const p=$('.choice-panel',n),b=$('.choice-trigger',n);if(p){p.hidden=true;b?.setAttribute('aria-expanded','false')}});
 }
 function toggle(node,panelSel,buttonSel){const p=$(panelSel,node),b=$(buttonSel,node);if(!p||!b)return;const open=p.hidden;closeAll(open?node:null);p.hidden=!open;b.setAttribute('aria-expanded',String(open));if(open)requestAnimationFrame(()=>$('.choice-option.is-current,button,a',p)?.focus({preventScroll:true}))}
 function buildThemesOnce(){
  const select=$('#themeSelect'),box=$('#choice-theme-options');if(!select||!box||box.dataset.built)return;box.dataset.built='1';
  [...select.options].forEach(o=>{const b=document.createElement('button');b.type='button';b.className='choice-option theme-option';b.dataset.theme=o.value;b.setAttribute('role','radio');const sw=document.createElement('span');sw.className='theme-swatch';sw.style.setProperty('--swatch-bg',themeColors[o.value]?.[0]||'#fff');sw.style.setProperty('--swatch-ink',themeColors[o.value]?.[1]||'#333');const name=document.createElement('span');name.className='choice-option-name';const check=document.createElement('span');check.className='choice-check';check.textContent='✓';b.append(sw,name,check);b.addEventListener('click',()=>{window.applyWhoisTheme?.(o.value);syncThemeState()});box.append(b)});
 }
 function buildLanguagesOnce(){
  const select=$('#langSelect'),box=$('#choice-language-options');if(!select||!box||box.dataset.built)return;box.dataset.built='1';
  [...select.children].forEach(group=>{if(group.tagName==='OPTGROUP'){const h=document.createElement('div');h.className='choice-group-heading';h.dataset.group=group.dataset.group||'';box.append(h);[...group.children].forEach(add)}else add(group)});
  function add(o){const b=document.createElement('button');b.type='button';b.className='choice-option';b.dataset.lang=o.value;b.setAttribute('role','radio');const code=document.createElement('span');code.className='language-short';code.textContent=o.value==='zh-Hant'?'繁':o.value==='zh'?'简':o.value.toUpperCase();const name=document.createElement('span');name.className='choice-option-name';name.textContent=o.textContent;const check=document.createElement('span');check.className='choice-check';check.textContent='✓';b.append(code,name,check);b.addEventListener('click',()=>{if(select.value!==o.value){select.value=o.value;select.dispatchEvent(new Event('change',{bubbles:true}))}syncAll();closeAll()});box.append(b)}
 }
 function syncThemeState(){const select=$('#themeSelect');if(!select)return;const current=document.documentElement.dataset.theme||select.value;select.value=current;$$('[data-theme]','#choice-theme-options').forEach(b=>{const active=b.dataset.theme===current;b.classList.toggle('is-current',active);b.setAttribute('aria-checked',String(active));const o=[...select.options].find(o=>o.value===b.dataset.theme);const n=$('.choice-option-name',b);if(n&&o)n.textContent=o.textContent})}
 function syncLanguageState(){const select=$('#langSelect');if(!select)return;const current=select.value;$$('[data-lang]','#choice-language-options').forEach(b=>{const active=b.dataset.lang===current;b.classList.toggle('is-current',active);b.setAttribute('aria-checked',String(active));const o=[...select.options].find(o=>o.value===b.dataset.lang);const n=$('.choice-option-name',b);if(n&&o)n.textContent=o.textContent});$$('.choice-group-heading','#choice-language-options').forEach((h,i)=>{const groups=[...select.querySelectorAll('optgroup')];h.textContent=groups[i]?.label||''});$('#choice-language-title')&&($('#choice-language-title').textContent=select.getAttribute('aria-label')||'Language');$('#choice-language-current')&&($('#choice-language-current').textContent=select.selectedOptions[0]?.textContent||'Language')}
 function syncFont(){const current=document.documentElement.dataset.fontSize||'medium';$$('#fontSizeOptions button').forEach(b=>{const active=b.dataset.fontSize===current;b.classList.toggle('is-current',active);b.setAttribute('aria-pressed',String(active))})}
 function bindFontOnce(){$$('#fontSizeOptions button').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{const size=b.dataset.fontSize;if(!['small','medium','large'].includes(size))return;document.documentElement.dataset.fontSize=size;try{localStorage.setItem('whoisFontSize',size)}catch{};syncFont()})})}
 function syncLabels(){const t=text();$$('[data-nav-label]').forEach(el=>{const k=el.dataset.navLabel;if(t[k])el.textContent=t[k]});$('#displayTitle')&&($('#displayTitle').textContent=t.display);$('#themeSettingLabel')&&($('#themeSettingLabel').textContent=t.theme);$('#fontSettingLabel')&&($('#fontSettingLabel').textContent=t.font);$$('.popover-close,.choice-close').forEach(b=>{b.title=t.close;b.setAttribute('aria-label',t.close)})}
 function syncAll(){syncLabels();syncThemeState();syncLanguageState();syncFont();window.updateLibraryCounts?.()}
 // Bind the four primary Menu controls first. A rendering error in one optional panel must never disable navigation.
 popItems.forEach(n=>{$('.nav-button',n)?.addEventListener('click',()=>{try{window.refreshLocalLibraryUI?.()}catch(e){console.warn('Library menu refresh failed',e)}toggle(n,'.nav-popover','.nav-button')});$('.popover-close',n)?.addEventListener('click',()=>{closeAll();$('.nav-button',n)?.focus()})});
 choices.forEach(n=>{$('.choice-trigger',n)?.addEventListener('click',()=>toggle(n,'.choice-panel','.choice-trigger'));$('.choice-close',n)?.addEventListener('click',()=>{closeAll();$('.choice-trigger',n)?.focus()})});
 try{buildThemesOnce()}catch(e){console.error('Theme menu init failed',e)}
 try{buildLanguagesOnce()}catch(e){console.error('Language menu init failed',e)}
 try{bindFontOnce()}catch(e){console.error('Font menu init failed',e)}
 try{syncAll()}catch(e){console.error('Menu state sync failed',e)}
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-popover-item,.nav-choice'))closeAll()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
 $('#langSelect')?.addEventListener('change',()=>queueMicrotask(syncAll));window.addEventListener('whois:themechange',syncThemeState);window.addEventListener('whois:librarychange',()=>queueMicrotask(()=>window.updateLibraryCounts?.()));
 window.addEventListener('storage',e=>{if(e.key==='whoisTheme'){window.applyWhoisTheme?.(e.newValue||'paper',{persist:false});syncThemeState()}else if(e.key==='whoisFontSize'){const s=e.newValue;if(['small','medium','large'].includes(s)){document.documentElement.dataset.fontSize=s;syncFont()}}else if(e.key==='whoisLang'||e.key===HISTORY_KEY||e.key===FAVORITES_KEY||e.key===null)queueMicrotask(syncAll)});
})();
