/* Casy Studio: laeuft im <head>, bevor die Seite zeichnet.
   1. Sprache: Wer DE oder EN gewaehlt hat, landet auf derselben Seite in seiner Sprache
      (localStorage casy_lang, siehe Datenschutzerklaerung Abschnitt 6). Englisch ist index.html bzw. der Ordner, Deutsch de.html.
      Beim ersten Besuch ohne Wahl entscheidet die Browsersprache; gespeichert wird erst, wenn jemand selbst umschaltet.
      Ist der Speicher gesperrt (privates Fenster), gibt es keine Automatik.
   2. Darstellung: System, Hell oder Dunkel. Gewaehlt ueber die Knoepfe oben, gemerkt nur fuer die laufende Sitzung
      (sessionStorage casy_theme, ebenfalls Abschnitt 6). Vorgabe System. */
(function(){
  var path=location.pathname, isDe=/\/de\.html$/.test(path), saved=null, ok=true;
  try{ saved=localStorage.getItem('casy_lang'); }catch(e){ ok=false; }
  // Alte Verweise auf die Startseite mit ?app=… (bis 09/2026 gab es keine App-Seiten) fuehren jetzt zur App-Seite
  var app=(location.search.match(/[?&]app=(shutterlife|sequenz|sqnz)\b/)||[])[1];
  if(app && /^\/((de|index)\.html)?$/.test(path)){ location.replace('/'+(app==='sqnz'?'sequenz':app)+'/'+(isDe?'de.html':'')); return; }
  var want=saved;
  // ohne lesbaren Speicher keine Automatik: sonst kaeme man von der deutschen nie auf die englische Seite
  if(ok && !want && !isDe && !/\.html$/.test(path.replace(/index\.html$/,''))){
    // Erster Besuch auf einer englischen Adresse: deutscher Browser bekommt die deutsche Seite
    var nav=(navigator.languages&&navigator.languages[0])||navigator.language||'';
    if(/^de\b/i.test(nav)) want='de';
  }
  if(want==='de' && !isDe){
    var de=/\/$/.test(path) ? path+'de.html' : /\/index\.html$/.test(path) ? path.replace(/index\.html$/,'de.html') : null;
    if(de){ location.replace(de+location.search+location.hash); return; }
  }
  if(saved==='en' && isDe){ location.replace(path.replace(/de\.html$/,'')+location.search+location.hash); return; }
})();
(function(){
  var choice='system', mq=matchMedia('(prefers-color-scheme: dark)'), root=document.documentElement;
  try{ choice=sessionStorage.getItem('casy_theme')||'system'; }catch(e){}
  function apply(){ root.setAttribute('data-theme', choice==='system' ? (mq.matches?'dark':'light') : choice); }
  apply();
  mq.addEventListener('change',function(){ if(choice==='system') apply(); });
  window.casyTheme={
    get:function(){ return choice; },
    set:function(v){ choice=v; try{ v==='system' ? sessionStorage.removeItem('casy_theme') : sessionStorage.setItem('casy_theme',v); }catch(e){} apply(); }
  };
})();
