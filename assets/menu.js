/* V49 navigation: Batch / History / Saved / Display / Language. */
(()=>{
 const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
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
 const lang=()=>$('#langSelect')?.value||'en';
 const text=()=>navText[lang()]||navText.en;
 const popItems=$$('.nav-popover-item'), choices=$$('.nav-choice');
 function closeAll(except=null,focus=false){
  popItems.forEach(n=>{if(n===except)return;const p=$('.nav-popover',n),b=$('.nav-button',n);if(p){p.hidden=true;b?.setAttribute('aria-expanded','false')}});
  choices.forEach(n=>{if(n===except)return;const p=$('.choice-panel',n),b=$('.choice-trigger',n);if(p){p.hidden=true;b?.setAttribute('aria-expanded','false')}});
  if(focus&&except) $('.nav-action',except)?.focus({preventScroll:true});
 }
 function toggle(node,panelSel,buttonSel){const p=$(panelSel,node),b=$(buttonSel,node);const open=p.hidden;closeAll(open?node:null);p.hidden=!open;b.setAttribute('aria-expanded',String(open));if(open)setTimeout(()=>$('.choice-option.is-current,button,a',p)?.focus({preventScroll:true}),0)}
 function buildThemes(){const select=$('#themeSelect'), box=$('#choice-theme-options');if(!select||!box)return;box.replaceChildren();[...select.options].forEach(o=>{const b=document.createElement('button');b.type='button';b.className='choice-option theme-option'+(o.value===select.value?' is-current':'');b.setAttribute('aria-checked',String(o.value===select.value));const sw=document.createElement('span');sw.className='theme-swatch';sw.style.setProperty('--swatch-bg',themeColors[o.value]?.[0]||'#fff');sw.style.setProperty('--swatch-ink',themeColors[o.value]?.[1]||'#333');const name=document.createElement('span');name.className='choice-option-name';name.textContent=o.textContent;const check=document.createElement('span');check.className='choice-check';check.textContent='✓';b.append(sw,name,check);b.onclick=()=>{select.value=o.value;select.dispatchEvent(new Event('change',{bubbles:true}));refresh()};box.append(b)})}
 function buildLanguages(){const select=$('#langSelect'),box=$('#choice-language-options');if(!select||!box)return;box.replaceChildren();[...select.children].forEach(group=>{if(group.tagName==='OPTGROUP'){const h=document.createElement('div');h.className='choice-group-heading';h.textContent=group.label;box.append(h);[...group.children].forEach(add)}else add(group)});function add(o){const b=document.createElement('button');b.type='button';b.className='choice-option'+(o.value===select.value?' is-current':'');b.setAttribute('aria-checked',String(o.value===select.value));const code=document.createElement('span');code.className='language-short';code.textContent=o.value==='zh-Hant'?'繁':o.value==='zh'?'简':o.value.toUpperCase();const name=document.createElement('span');name.className='choice-option-name';name.textContent=o.textContent;const check=document.createElement('span');check.className='choice-check';check.textContent='✓';b.append(code,name,check);b.onclick=()=>{if(select.value!==o.value){select.value=o.value;select.dispatchEvent(new Event('change',{bubbles:true}))}refresh();closeAll()};box.append(b)}}
 function initFont(){const current=document.documentElement.dataset.fontSize||'medium';$$('#fontSizeOptions button').forEach(b=>{const active=b.dataset.fontSize===current;b.classList.toggle('is-current',active);b.setAttribute('aria-pressed',String(active));b.onclick=()=>{const size=b.dataset.fontSize;document.documentElement.dataset.fontSize=size;try{localStorage.setItem('whoisFontSize',size)}catch{};window.dispatchEvent(new CustomEvent('whois:fontchange',{detail:{size}}));refresh()}})}
 function refresh(){const t=text();$$('[data-nav-label]').forEach(el=>{const k=el.dataset.navLabel;if(t[k])el.textContent=t[k]});$('#displayTitle')&&($('#displayTitle').textContent=t.display);$('#themeSettingLabel')&&($('#themeSettingLabel').textContent=t.theme);$('#fontSettingLabel')&&($('#fontSettingLabel').textContent=t.font);$$('.popover-close,.choice-close').forEach(b=>b.title=b.ariaLabel=t.close);const ls=$('#langSelect');if(ls){$('#choice-language-title').textContent=ls.getAttribute('aria-label')||'Language';$('#choice-language-current').textContent=ls.selectedOptions[0]?.textContent||'Language'}buildThemes();buildLanguages();initFont();window.updateLibraryCounts?.()}
 popItems.forEach(n=>{$('.nav-button',n)?.addEventListener('click',()=>toggle(n,'.nav-popover','.nav-button'));$('.popover-close',n)?.addEventListener('click',()=>{closeAll();$('.nav-button',n)?.focus()})});
 choices.forEach(n=>{$('.choice-trigger',n)?.addEventListener('click',()=>toggle(n,'.choice-panel','.choice-trigger'));$('.choice-close',n)?.addEventListener('click',()=>{closeAll();$('.choice-trigger',n)?.focus()})});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.nav-popover-item,.nav-choice'))closeAll()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAll()});
 $('#langSelect')?.addEventListener('change',()=>queueMicrotask(refresh));$('#themeSelect')?.addEventListener('change',()=>queueMicrotask(refresh));window.addEventListener('storage',()=>queueMicrotask(refresh));window.addEventListener('whois:librarychange',()=>queueMicrotask(refresh));window.addEventListener('whois:fontchange',()=>queueMicrotask(refresh));
 refresh();
})();
