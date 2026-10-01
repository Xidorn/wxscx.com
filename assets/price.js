/* V33: optional TLD registration prices. Independent from WHOIS success/error state. */
(function(){
'use strict';
const API='https://www.nazhumi.com';
const ui={en:['.{tld} registration from','Registration price comparison','Reference prices for the .{tld} extension, not the sale price of this domain. Standard annual prices; promotions and restrictions may differ.','Registrar','Register','Renew','Transfer','Data: Nazhumi','Updated','View source','No comparable quote','Price unavailable','View prices'],zh:['.{tld} 注册价低至','后缀注册价格比较','以下为 .{tld} 后缀的年度标准参考价，并非当前域名售价；优惠及购买条件以注册商为准。','注册商','注册','续费','转入','数据：哪煮米','更新','查看来源','暂无可比报价','价格暂不可用','查看报价'],'zh-Hant':['.{tld} 註冊價低至','網域後綴價格比較','以下為 .{tld} 後綴每年的標準參考價格，並非此網域的售價；優惠及限制以註冊商為準。','註冊商','註冊','續費','轉入','資料：哪煮米','更新','查看來源','暫無可比較報價','價格暫不可用','查看報價'],ja:['.{tld} の登録料金：','ドメイン拡張子の料金比較','これは .{tld} の年間標準参考料金であり、このドメイン自体の販売価格ではありません。キャンペーン条件は各事業者をご確認ください。','レジストラ','登録','更新','移管','データ：Nazhumi','更新日','出典','比較可能な料金なし','料金を取得できません','料金を見る'],ko:['.{tld} 등록 시작가','도메인 확장자 가격 비교','.{tld} 확장자의 연간 표준 참고 가격이며 해당 도메인의 판매 가격이 아닙니다. 할인 조건은 등록기관에서 확인하세요.','등록기관','등록','갱신','이전','출처: Nazhumi','업데이트','출처 보기','비교 가능한 가격 없음','가격을 가져올 수 없음','가격 보기'],de:['.{tld}-Registrierung ab','Preisvergleich der Domain-Endung','Jährliche Standardpreise für .{tld}, kein Verkaufspreis dieser Domain. Aktionen und Bedingungen können abweichen.','Registrar','Registrierung','Verlängerung','Transfer','Quelle: Nazhumi','Aktualisiert','Quelle öffnen','Keine vergleichbaren Angebote','Preis nicht verfügbar','Preise anzeigen'],fr:['Enregistrement .{tld} dès','Comparatif des tarifs par extension','Tarifs annuels standards indicatifs pour .{tld}, et non prix de vente de ce domaine. Offres et conditions variables.','Bureau','Enregistrement','Renouvellement','Transfert','Source : Nazhumi','Mise à jour','Voir la source','Aucun tarif comparable','Prix indisponible','Voir les prix'],es:['Registro de .{tld} desde','Comparación de precios de la extensión','Precios anuales estándar orientativos de .{tld}; no son el precio de venta de este dominio. Las promociones pueden variar.','Registrador','Registro','Renovación','Traslado','Fuente: Nazhumi','Actualizado','Ver fuente','Sin ofertas comparables','Precio no disponible','Ver precios'],pt:['Registro .{tld} a partir de','Comparação de preços da extensão','Preços anuais padrão para .{tld}, não o preço de venda deste domínio. Promoções e condições podem variar.','Registrador','Registro','Renovação','Transferência','Fonte: Nazhumi','Atualizado','Ver fonte','Sem ofertas comparáveis','Preço indisponível','Ver preços'],it:['Registrazione .{tld} da','Confronto prezzi dell’estensione','Prezzi standard annuali indicativi per .{tld}; non sono il prezzo di vendita di questo dominio. Le promozioni possono variare.','Registrar','Registrazione','Rinnovo','Trasferimento','Fonte: Nazhumi','Aggiornato','Fonte','Nessuna offerta confrontabile','Prezzo non disponibile','Vedi prezzi'],ru:['Регистрация .{tld} от','Сравнение цен доменной зоны','Стандартные справочные цены за год для .{tld}, не стоимость продажи этого домена. Акции могут отличаться.','Регистратор','Регистрация','Продление','Перенос','Источник: Nazhumi','Обновлено','Источник','Нет сопоставимых цен','Цена недоступна','Цены'],ar:['تسجيل .{tld} ابتداءً من','مقارنة أسعار امتداد النطاق','أسعار مرجعية سنوية قياسية لامتداد .{tld}، وليست سعر بيع هذا النطاق. قد تختلف العروض والشروط.','المسجّل','التسجيل','التجديد','النقل','المصدر: Nazhumi','التحديث','عرض المصدر','لا تتوفر عروض للمقارنة','السعر غير متاح','عرض الأسعار'],hi:['.{tld} पंजीकरण मूल्य से','डोमेन एक्सटेंशन मूल्य तुलना','ये .{tld} के अनुमानित मानक वार्षिक पंजीकरण शुल्क हैं, इस विशेष डोमेन का बिक्री मूल्य नहीं। ऑफ़र अलग हो सकते हैं।','रजिस्ट्रार','पंजीकरण','नवीनीकरण','ट्रांसफ़र','स्रोत: Nazhumi','अपडेट','स्रोत देखें','तुलनीय शुल्क नहीं','मूल्य उपलब्ध नहीं','कीमतें देखें'],id:['Pendaftaran .{tld} mulai','Perbandingan harga ekstensi','Harga acuan standar tahunan untuk .{tld}, bukan harga jual domain ini. Promo dan ketentuan dapat berubah.','Registrar','Daftar','Perpanjang','Transfer','Sumber: Nazhumi','Diperbarui','Lihat sumber','Belum ada penawaran','Harga tidak tersedia','Lihat harga']};
// Selection is by selected interface language; missing supported currency -> USD.
// zh-Hant is not presumed to be TWD where the pricing API has no TWD quote.
const localeCurrency={en:'USD',zh:'CNY','zh-Hant':'USD',ja:'JPY',ko:'USD',de:'EUR',fr:'EUR',es:'EUR',pt:'EUR',it:'EUR',ru:'RUB',ar:'USD',hi:'USD',id:'USD'};
const localeTag={zh:'zh-CN','zh-Hant':'zh-TW',ja:'ja-JP',ko:'ko-KR',de:'de-DE',fr:'fr-FR',es:'es-ES',pt:'pt-PT',it:'it-IT',ru:'ru-RU',ar:'ar',hi:'hi-IN',id:'id-ID',en:'en-US'};
const els={chip:document.getElementById('priceWidget'),toggle:document.getElementById('priceToggle'),caption:document.getElementById('priceCaption'),value:document.getElementById('priceValue'),details:document.getElementById('priceDetails')};
if(Object.values(els).some(el=>!el))return;
let currentDomain='',extension='',rows=[],currencyRates=null,quoteRequest=0,opened=false;
const text=i=>(ui[typeof lang==='string'?lang:'en']||ui.en)[i];
function template(s,tld){return s.replaceAll('{tld}',tld)}
function finitePrice(value){return typeof value==='number'&&Number.isFinite(value)&&value>=0?value:null}
function extractRates(json){
 const body=json?.data??json;let list=[];
 if(Array.isArray(body))list=body;
 else if(Array.isArray(body?.currencies))list=body.currencies;
 else if(Array.isArray(body?.list))list=body.list;
 else if(body&&typeof body==='object')list=Object.entries(body).map(([key,v])=>typeof v==='object'?{currency:key,...v}:{currency:key,rate_cny:v});
 const rates={CNY:1};
 for(const record of list){const code=String(record?.currency||record?.code||record?.currency_code||'').toUpperCase();const rate=Number(record?.rate_cny??record?.rateCny);if(/^[A-Z]{3}$/.test(code)&&Number.isFinite(rate)&&rate>0)rates[code]=rate}
 return rates;
}
async function requestJSON(url,signal){const r=await fetch(url,{signal,headers:{Accept:'application/json'},cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json()}
async function rates(signal){if(currencyRates)return currencyRates;try{currencyRates=extractRates(await requestJSON(API+'/api/currencies',signal));}catch{currencyRates={CNY:1}}return currencyRates}
function targetCurrency(){const wanted=localeCurrency[lang]||'USD';return (currencyRates&&currencyRates[wanted]>0)?wanted:'USD'}
function currencyValue(row,field,target){
 const native=String(row.currency||'').toUpperCase();const original=finitePrice(row[field]);
 const cny=finitePrice(row[field+'_cny']);
 if(target===native&&original!==null)return original;
 if(target==='CNY'&&cny!==null)return cny;
 if(cny!==null&&currencyRates?.[target]>0)return cny/currencyRates[target];
 // No invented exchange rate: only use native-currency quotations when rate is unavailable.
 return null;
}
function fmt(amount,cur){if(amount===null)return '—';try{return new Intl.NumberFormat(localeTag[lang]||'en-US',{style:'currency',currency:cur,maximumFractionDigits:cur==='JPY'?0:2}).format(amount)}catch{return cur+' '+amount.toFixed(2)}}
function compareRows(cur){return rows.map(r=>({row:r,register:currencyValue(r,'register',cur),renew:currencyValue(r,'renew',cur),transfer:currencyValue(r,'transfer',cur)})).filter(r=>r.register!==null).sort((a,b)=>a.register-b.register)}
function escapeText(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function registrarURL(url){try{const u=new URL(url);return /^https?:$/.test(u.protocol)?u.href:null}catch{return null}}
function sourceUrl(){return API+'/api/v1?domain='+encodeURIComponent(extension)+'&order=register'}
function reset(){els.chip.hidden=true;els.details.hidden=true;opened=false;els.toggle.setAttribute('aria-expanded','false');els.details.replaceChildren()}
function paint(){if(!rows.length||!extension)return reset();const currency=targetCurrency();const usable=compareRows(currency);if(!usable.length)return reset();
 els.chip.hidden=false;els.caption.textContent=template(text(0),extension);els.value.textContent=fmt(usable[0].register,currency);els.toggle.title=text(12);els.toggle.setAttribute('aria-label',template(text(0),extension)+' '+els.value.textContent+' · '+text(12));
 els.details.hidden=!opened;els.toggle.setAttribute('aria-expanded',String(opened));if(!opened)return;
 const shown=usable.slice(0,6);
 const trs=shown.map(({row,register,renew,transfer})=>{
 const name=escapeText(row.registrarname||row.registrar||'—'),web=registrarURL(row.registrarweb);
 return '<tr><td>'+(web?'<a target="_blank" rel="noopener noreferrer nofollow" href="'+escapeText(web)+'">'+name+' ↗</a>':name)+'</td><td dir="ltr">'+escapeText(fmt(register,currency))+'</td><td dir="ltr">'+escapeText(fmt(renew,currency))+'</td><td dir="ltr">'+escapeText(fmt(transfer,currency))+'</td></tr>';}).join('');
 const updated=shown.map(x=>x.row.updatedtime).filter(Boolean).sort().at(-1)||'—';
 els.details.innerHTML='<div class="price-details-title"><strong>'+escapeText(text(1))+' · .'+escapeText(extension)+'</strong><span>'+escapeText(currency)+'</span></div><p class="price-details-desc">'+escapeText(template(text(2),extension))+'</p><div class="price-table-wrap"><table class="price-table"><thead><tr><th>'+escapeText(text(3))+'</th><th>'+escapeText(text(4))+'</th><th>'+escapeText(text(5))+'</th><th>'+escapeText(text(6))+'</th></tr></thead><tbody>'+trs+'</tbody></table></div><div class="price-details-foot"><span>'+escapeText(text(8))+': '+escapeText(updated)+' (UTC+8)</span><a target="_blank" rel="noopener noreferrer nofollow" href="'+escapeText(sourceUrl())+'">'+escapeText(text(7))+' ↗</a></div>';
}
async function update(domainName){
 const name=String(domainName||'').toLowerCase().replace(/\.$/,'');if(currentDomain===name)return paint();
 currentDomain=name;rows=[];extension='';reset();const id=++quoteRequest;
 // Try longest plausible multi-label public suffix first, then shorter candidates.
 const labels=name.split('.');if(labels.length<2)return;
 const suffixes=[];for(let n=Math.min(3,labels.length-1);n>=1;n--)suffixes.push(labels.slice(-n).join('.'));
 const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),6500);
 try{
 const r=await rates(controller.signal);
 for(const suffix of suffixes){let json;try{json=await requestJSON(API+'/api/v1?domain='+encodeURIComponent(suffix)+'&order=register',controller.signal)}catch{break}
 if(id!==quoteRequest)return;
 const list=Array.isArray(json?.data?.price)?json.data.price:[];
 if(json?.code===100&&list.length){extension=suffix;rows=list.filter(item=>item&&typeof item==='object'&&finitePrice(item.register)!==null);if(rows.length)break}
 }
 if(id===quoteRequest)paint();
 }catch(e){if(id===quoteRequest)reset()}finally{clearTimeout(timeout)}
}
els.toggle.addEventListener('click',()=>{opened=!opened;paint()});
window.updateDomainPrice=update;window.renderPriceForLanguage=paint;
// result.js may have already completed rendering in a very fast cache/fixture environment.
if(typeof currentData!=='undefined'&&currentData)update(currentData.domain||currentDomain);
})();
