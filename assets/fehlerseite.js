'use strict';
/* Darstellung wie auf den anderen Seiten (casy-kopf.js): System, Hell oder Dunkel aus sessionStorage casy_theme
   (Datenschutzerklaerung Abschnitt 6). Ohne Wahl entscheidet das System. */
(function(){
  var choice='system', mq=matchMedia('(prefers-color-scheme: dark)'), root=document.documentElement;
  try{ choice=sessionStorage.getItem('casy_theme')||'system'; }catch(e){}
  function apply(){ root.setAttribute('data-theme', choice==='system' ? (mq.matches?'dark':'light') : choice); }
  apply();
  function systemWechsel(){ if(choice==='system') apply(); }
  if(mq.addEventListener) mq.addEventListener('change',systemWechsel); else mq.addListener(systemWechsel);
})();
/* Zweisprachig ohne Server: Sprache aus dem Browser, per Knopf umschaltbar. */
const TXT={
  de:{titel:'Diese Seite gibt es nicht.',
      text:'Vielleicht hat sich die Adresse geändert, oder im Link fehlt ein Zeichen. Die Apps und alle rechtlichen Seiten erreichst du hier:',
      w1:'Zur Startseite', w2:'Zu den Apps', w3:'Impressum', w4:'Datenschutz',
      hilfe:'Du bist über einen Link aus einer App hier gelandet? Dann schreib uns kurz, wir richten die Adresse ein: ',
      titelTag:'Seite nicht gefunden · Casy Studio'},
  en:{titel:'This page does not exist.',
      text:'The address may have changed, or a character is missing from the link. You can reach the apps and all legal pages here:',
      w1:'Go to the start page', w2:'Go to the apps', w3:'Legal notice', w4:'Privacy',
      hilfe:'Did a link inside an app bring you here? Write to us and we will set the address up: ',
      titelTag:'Page not found · Casy Studio'}
};
function setze(l){
  var t=TXT[l]||TXT.de;
  document.documentElement.lang=l;
  document.title=t.titelTag;
  document.querySelectorAll('[data-t]').forEach(function(el){
    var k=el.dataset.t;
    if(k==='hilfe'){ el.firstChild.nodeValue=t.hilfe; return; }   /* Mail-Link bleibt stehen */
    el.textContent=t[k];
  });
  document.querySelectorAll('.sprache button').forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.lang===l)); });
  document.querySelectorAll('a[data-de]').forEach(function(a){ if(!a.dataset.en) a.dataset.en=a.getAttribute('href'); a.setAttribute('href', l==='de'?a.dataset.de:a.dataset.en); });
}
var gespeichert=null; try{ gespeichert=localStorage.getItem('casy_lang'); }catch(e){}
setze(gespeichert==='en'||gespeichert==='de' ? gespeichert
      : ((navigator.language||'de').toLowerCase().indexOf('de')===0 ? 'de' : 'en'));
/* gespeichert wird nur, wenn jemand selbst umschaltet (Datenschutzerklaerung Abschnitt 6) */
document.querySelectorAll('.sprache button').forEach(function(b){ b.addEventListener('click',function(){ setze(b.dataset.lang); try{ localStorage.setItem('casy_lang', b.dataset.lang); }catch(e){} }); });
