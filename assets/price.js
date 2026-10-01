/* V35: per-operation extension price comparisons, independent of WHOIS state. */
(()=>{'use strict';
const API='https://www.nazhumi.com';
const I={
 en:['Register','Renew','Transfer','Extension reference prices','Registrar','Standard reference price / year, not this domain’s sale price. Offers, eligibility and checkout amounts may differ.','Source: Nazhumi','Updated','No comparable price','View registrar pricing','Price data unavailable'],
 zh:['注册','续费','转入','域名后缀参考价格','注册商','以下为后缀标准参考价（通常为年度价格），并非当前域名的交易售价。优惠、购买限制及结算价格以注册商为准。','数据：哪煮米','更新','暂无可比报价','查看注册商报价','价格暂不可用'],
 'zh-Hant':['註冊','續費','轉入','網域後綴參考價格','註冊商','以下為後綴標準參考價格（通常為年度價格），並非此網域的交易售價。優惠和結算金額以註冊商為準。','資料：哪煮米','更新','暫無可比較報價','查看註冊商報價','價格暫不可用'],
 ja:['登録','更新','移管','ドメイン拡張子の参考料金','レジストラ','年間の標準参考料金であり、このドメイン自体の販売価格ではありません。キャンペーン・購入条件は事業者をご確認ください。','出典：Nazhumi','更新','料金なし','事業者別料金を見る','料金を取得できません'],
 ko:['등록','갱신','이전','도메인 확장자 참고 가격','등록기관','확장자별 표준 참고 요금이며 해당 도메인의 판매가는 아닙니다. 프로모션 및 결제 금액은 등록기관에서 확인하세요.','출처: Nazhumi','업데이트','가격 없음','등록기관별 가격','가격 정보 없음'],
 de:['Registrieren','Verlängern','Transfer','Richtpreise für Domainendungen','Registrar','Standard-Richtpreise (gewöhnlich pro Jahr), kein Verkaufspreis dieser Domain. Aktionen und Endpreise können abweichen.','Quelle: Nazhumi','Aktualisiert','Kein Vergleichspreis','Registrarpreise anzeigen','Preise nicht verfügbar'],
 fr:['Enregistrer','Renouveler','Transférer','Tarifs indicatifs de l’extension','Bureau','Tarifs standards indicatifs (généralement annuels) ; ils ne représentent pas le prix de vente de ce domaine. Les promotions peuvent varier.','Source : Nazhumi','Mise à jour','Aucun tarif','Voir les tarifs','Prix indisponibles'],
 es:['Registrar','Renovar','Transferir','Precios orientativos de la extensión','Registrador','Tarifas estándar de referencia (normalmente anuales), no el precio de venta de este dominio. Las promociones pueden variar.','Fuente: Nazhumi','Actualizado','Sin precio','Ver precios por registrador','Precios no disponibles'],
 pt:['Registrar','Renovar','Transferir','Preços de referência da extensão','Registrador','Preços padrão de referência (normalmente anuais), não o valor de venda deste domínio. As promoções podem variar.','Fonte: Nazhumi','Atualizado','Sem preço','Ver preços dos registradores','Preços indisponíveis'],
 it:['Registrazione','Rinnovo','Trasferimento','Prezzi indicativi dell’estensione','Registrar','Tariffe standard indicative (di norma annuali), non il prezzo di vendita del dominio. Le promozioni possono variare.','Fonte: Nazhumi','Aggiornato','Nessun prezzo','Prezzi dei registrar','Prezzi non disponibili'],
 ru:['Регистрация','Продление','Перенос','Справочные цены доменной зоны','Регистратор','Стандартные ориентировочные цены (обычно за год), не цена продажи этого домена. Акции и итоговая сумма могут отличаться.','Источник: Nazhumi','Обновлено','Нет цены','Цены регистраторов','Цены недоступны'],
 ar:['التسجيل','التجديد','النقل','الأسعار المرجعية لامتداد النطاق','المسجّل','أسعار قياسية مرجعية (غالباً سنوية)، وليست سعر بيع هذا النطاق. قد تختلف العروض والتكلفة النهائية.','المصدر: Nazhumi','التحديث','لا سعر متاح','أسعار المسجّلين','الأسعار غير متاحة'],
 hi:['पंजीकरण','नवीनीकरण','ट्रांसफ़र','एक्सटेंशन की संदर्भ कीमतें','रजिस्ट्रार','मानक संदर्भ शुल्क (आमतौर पर वार्षिक), इस विशेष डोमेन का बिक्री मूल्य नहीं। छूट और अंतिम कीमत अलग हो सकती है।','स्रोत: Nazhumi','अपडेट','कीमत नहीं','रजिस्ट्रार कीमतें','कीमत उपलब्ध नहीं'],
 id:['Pendaftaran','Perpanjangan','Transfer','Harga acuan ekstensi domain','Registrar','Harga standar acuan (umumnya per tahun), bukan harga jual domain ini. Promo dan total pembayaran dapat berbeda.','Sumber: Nazhumi','Diperbarui','Tidak ada harga','Lihat harga registrar','Harga tidak tersedia']
};
const LC={en:'USD',zh:'CNY','zh-Hant':'USD',ja:'JPY',ko:'USD',de:'EUR',fr:'EUR',es:'EUR',pt:'EUR',it:'EUR',ru:'RUB',ar:'USD',hi:'USD',id:'USD'};
const LO={en:'en-US',zh:'zh-CN','zh-Hant':'zh-TW',ja:'ja-JP',ko:'ko-KR',de:'de-DE',fr:'fr-FR',es:'es-ES',pt:'pt-PT',it:'it-IT',ru:'ru-RU',ar:'ar',hi:'hi-IN',id:'id-ID'};
const operations=['register','renew','transfer'];
const widget=document.getElementById('priceWidget'), detail=document.getElementById('priceDetails');
const mobileToggle=document.getElementById('mobilePriceToggle'),mobileLabel=document.getElementById('mobilePriceLabel'),mobileDialog=document.getElementById('mobilePriceDialog'),mobileClose=document.getElementById('mobilePriceClose'),mobileTitle=document.getElementById('mobilePriceTitle'),mobileRail=document.getElementById('mobilePriceRail'),mobileDetails=document.getElementById('mobilePriceDetails');
if(!widget||!detail)return;
const buttons=operations.map(op=>widget.querySelector(`[data-price-kind="${op}"]`));
let domain='',suffix='',records={register:[],renew:[],transfer:[]},rates={CNY:1},opened=null,requestId=0;
const tt=i=>(I[typeof lang==='string'?lang:'en']||I.en)[i];
const finite=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0?v:null;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validURL(x){try{const u=new URL(x);return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}}
async function fetchJSON(url,signal){const res=await fetch(url,{signal,headers:{Accept:'application/json'},cache:'no-store'});if(!res.ok)throw Error(String(res.status));return res.json()}
function extractRates(j){const d=j?.data??j;let items=[];if(Array.isArray(d))items=d;else if(Array.isArray(d?.currencies))items=d.currencies;else if(Array.isArray(d?.list))items=d.list;else if(d&&typeof d==='object')items=Object.entries(d).map(([k,v])=>v&&typeof v==='object'?{currency:k,...v}:{currency:k,rate_cny:v});const r={CNY:1};for(const v of items){const c=String(v?.currency||v?.code||v?.currency_code||'').toUpperCase(),n=Number(v?.rate_cny??v?.rateCny);if(/^[A-Z]{3}$/.test(c)&&n>0&&Number.isFinite(n))r[c]=n}return r}
function preferredCurrency(){const cur=LC[typeof lang==='string'?lang:'en']||'USD';return rates[cur]>0?cur:'USD'}
function convert(row,op,currency){const original=finite(row?.[op]),cny=finite(row?.[op+'_cny']),native=String(row?.currency||'').toUpperCase();if(original===null&&cny===null)return null;if(currency===native&&original!==null)return original;if(currency==='CNY'&&cny!==null)return cny;if(cny!==null&&rates[currency]>0)return cny/rates[currency];return null}
function format(v,cur){if(v===null)return '—';try{return new Intl.NumberFormat(LO[lang]||'en-US',{style:'currency',currency:cur,maximumFractionDigits:cur==='JPY'?0:2}).format(v)}catch{return cur+' '+v.toFixed(2)}}
function sorted(op,cur){return (records[op]||[]).map(row=>({row,value:convert(row,op,cur)})).filter(x=>x.value!==null).sort((a,b)=>a.value-b.value)}
function setCollapsed(){detail.hidden=true;opened=null;buttons.forEach(b=>{b.classList.remove('is-active');b.setAttribute('aria-expanded','false')})}
function paint(){const cur=preferredCurrency();let any=false;buttons.forEach((b,i)=>{const op=operations[i],list=sorted(op,cur),v=list.length?list[0].value:null;b.querySelector('.price-kind-label').textContent=tt(i);b.querySelector('.price-kind-value').textContent=format(v,cur);b.disabled=!list.length;b.title=tt(i)+' · '+format(v,cur);b.setAttribute('aria-label',tt(i)+' '+format(v,cur)+' · '+tt(9));b.classList.toggle('is-active',opened===op);b.setAttribute('aria-expanded',String(opened===op));if(list.length)any=true});widget.hidden=!any;if(mobileToggle)mobileToggle.hidden=!any;if(mobileLabel)mobileLabel.textContent=tt(9);if(mobileTitle)mobileTitle.textContent=tt(3)+(suffix?' · .'+suffix:'');if(!any){closeMobile();setCollapsed();return}if(!opened){detail.hidden=true;syncMobile();return}const list=sorted(opened,cur);if(!list.length){setCollapsed();return}detail.hidden=false;
 const show=list.slice(0,8),max=Math.max(...show.map(x=>x.value),1),min=Math.min(...show.map(x=>x.value));
 let table=show.map(({row,value})=>{const name=esc(row.registrarname||row.registrar||'—'),url=validURL(row.registrarweb),w=Math.max(5,100*min/Math.max(value,0.01));const price=format(value,cur);return `<div class="quote-row"><span class="quote-name">${url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer nofollow">${name}</a>`:name}</span><div class="quote-data"><span class="quote-bar" style="--quote-fill:${Math.max(8,w).toFixed(2)}%" aria-hidden="true"><i></i></span><strong dir="ltr">${esc(price)}</strong></div></div>`}).join('');
 const updated=show.map(v=>v.row.updatedtime).filter(Boolean).sort().at(-1)||'—';const source=API+'/api/v1?domain='+encodeURIComponent(suffix)+'&order='+opened;
 detail.innerHTML=`<div class="quote-header"><strong>${esc(tt(3))} <span dir="ltr">.${esc(suffix)}</span> · ${esc(tt(operations.indexOf(opened)))}</strong><small>${esc(cur)}</small></div><p class="quote-note">${esc(tt(5))}</p><div class="quote-column"><div class="quote-head"><span>${esc(tt(4))}</span><span>${esc(tt(operations.indexOf(opened)))}</span></div>${table}</div><div class="quote-footer"><span>${esc(tt(7))}: ${esc(updated)} (UTC+8)</span><a href="${esc(source)}" rel="noopener noreferrer nofollow" target="_blank">${esc(tt(6))}</a></div>`;
 syncMobile();
}
let previousFocus=null;
function closeMobile(){if(!mobileDialog||mobileDialog.hidden)return;mobileDialog.hidden=true;document.body.style.removeProperty('overflow');if(previousFocus?.isConnected)previousFocus.focus();previousFocus=null}
function syncMobile(){
 if(!mobileRail)return;
 const cur=preferredCurrency();
 mobileRail.replaceChildren();
 for(let i=0;i<operations.length;i++){
  const op=operations[i], list=sorted(op,cur),b=document.createElement('button');b.type='button';b.disabled=!list.length;b.className=opened===op?'is-active':'';
  const caption=document.createElement('small'),price=document.createElement('strong');caption.textContent=tt(i);price.textContent=format(list.length?list[0].value:null,cur);
  price.dir='ltr';b.append(caption,price);b.addEventListener('click',()=>{opened=op;paint()});mobileRail.append(b);
 }
 if(mobileDetails)mobileDetails.innerHTML=opened?detail.innerHTML:'';
}
if(mobileToggle&&mobileDialog){
 mobileToggle.addEventListener('click',()=>{
  if(mobileToggle.hidden)return;
  previousFocus=document.activeElement;mobileDialog.hidden=false;document.body.style.overflow='hidden';
  if(!opened||!sorted(opened,preferredCurrency()).length)opened=operations.find(op=>sorted(op,preferredCurrency()).length)||null;
  paint();mobileClose?.focus();
 });
 mobileClose?.addEventListener('click',closeMobile);
 mobileDialog.addEventListener('click',e=>{if(e.target===mobileDialog)closeMobile()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!mobileDialog.hidden){e.preventDefault();closeMobile()}});
}
async function update(name){const next=String(name||'').toLowerCase().replace(/\.$/,'');if(domain===next){paint();return}domain=next;const id=++requestId;suffix='';records={register:[],renew:[],transfer:[]};setCollapsed();closeMobile();widget.hidden=true;if(mobileToggle)mobileToggle.hidden=true;detail.replaceChildren();const parts=next.split('.');if(parts.length<2)return;
 const compound=new Set(['co.uk','org.uk','me.uk','ac.uk','gov.uk','com.cn','net.cn','org.cn','gov.cn','com.au','net.au','org.au','edu.au','co.jp','ne.jp','or.jp','com.br','com.mx','com.tr','co.kr','or.kr','co.in','com.sg','com.hk','com.tw','com.my','co.nz','com.ar','com.pl','co.za','com.ua','com.sa']);
 const last2=parts.slice(-2).join('.');const extensionName=parts.length>=3&&compound.has(last2)?last2:parts.at(-1);
 const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),9000);
 try{
  const [rateResult,...results]=await Promise.allSettled([
   fetchJSON(API+'/api/currencies',abort.signal),
   ...operations.map(op=>fetchJSON(API+'/api/v1?domain='+encodeURIComponent(extensionName)+'&order='+op,abort.signal))
  ]);
  if(id!==requestId)return;
  rates=rateResult.status==='fulfilled'?extractRates(rateResult.value):{CNY:1};
  const nextRows={register:[],renew:[],transfer:[]};
  results.forEach((r,i)=>{if(r.status==='fulfilled'&&r.value?.code===100&&Array.isArray(r.value?.data?.price)){
   const op=operations[i];nextRows[op]=r.value.data.price.filter(v=>v&&typeof v==='object'&&finite(v[op])!==null);
  }});
  if(Object.values(nextRows).some(a=>a.length)){suffix=extensionName;records=nextRows}
  paint();
 }catch{if(id===requestId){widget.hidden=true;setCollapsed()}}finally{clearTimeout(timer)}

}
buttons.forEach((b,i)=>b.addEventListener('click',()=>{if(b.disabled)return;opened=opened===operations[i]?null:operations[i];paint()}));
window.updateDomainPrice=update;window.renderPriceForLanguage=paint;
if(typeof currentData!=='undefined'&&currentData)update(currentData.domain||domain);
})();
