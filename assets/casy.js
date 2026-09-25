  /* Galerie-Band am Handy: Knoepfe springen um zwei Bilder, der Zaehler folgt
     auch beim Wischen. Am Desktop ist die Leiste per CSS ausgeblendet. */
  /* Je Galerie-Kasten eine eigene Steuerung (ShutterLife: ein Kasten, SQNZ: iPhone und Apple Watch).
     data-per="1": ein Geraet pro Ansicht (Apple Watch am Handy). */
  function makeGal(box){
    const gal=box.querySelector('.ad-gal'); if(!gal) return null;
    const per=+(gal.dataset.per||2);
    const imgs=[...gal.querySelectorAll('img')], pagesN=Math.ceil(imgs.length/per);
    const prev=box.querySelector('.ad-gal-btn[data-dir="-1"]'), next=box.querySelector('.ad-gal-btn[data-dir="1"]');
    const count=box.querySelector('.ad-gal-count');
    let page=0, t;
    function render(){
      const a=page*per+1, b=Math.min(a+per-1,imgs.length);
      const span = a===b ? String(a) : a+'–'+b;
      count.textContent=(lang==='en'?(a===b?'Screenshot ':'Screenshots '):(a===b?'Bild ':'Bilder '))+span+(lang==='en'?' of ':' von ')+imgs.length;
      prev.disabled=page===0; next.disabled=page===pagesN-1;
    }
    // Ziel einer Seite: bei zwei Geraeten die linke Kante des ersten Bildes, bei einem Geraet
    // (Apple Watch am Handy) so, dass das Bild in der Mitte der Galerie steht. Frueher stand hier
    // nur offsetLeft: die Watch lag dann um die halbe Restbreite links (Owner 14.09.: „nicht mehr mittig").
    function target(p){
      const im=imgs[p*per];
      return per===1 ? im.offsetLeft-(gal.clientWidth-im.offsetWidth)/2 : im.offsetLeft;
    }
    function go(p){
      page=Math.max(0,Math.min(pagesN-1,p));
      const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
      gal.scrollTo({left:target(page), behavior:reduce?'auto':'smooth'});
      render();
    }
    // Aendert sich die Breite (Fenster verkleinern, Handy drehen), bleibt die Scrollposition sonst
    // stehen und das aktuelle Bild rutscht aus der Mitte. Ohne Animation neu ausrichten.
    if('ResizeObserver' in window){
      new ResizeObserver(()=>{ if(gal.scrollWidth>gal.clientWidth) gal.scrollTo({left:target(page),behavior:'auto'}); }).observe(gal);
    }
    prev.addEventListener('click',()=>go(page-1));
    next.addEventListener('click',()=>go(page+1));
    gal.addEventListener('scroll',()=>{
      clearTimeout(t);
      t=setTimeout(()=>{
        const step=gal.clientWidth+parseFloat(getComputedStyle(gal).columnGap||0);
        const p=Math.round(gal.scrollLeft/step);
        if(p!==page){ page=p; render(); }
      },80);
    },{passive:true});
    return {render};
  }
  const adGals=[...document.querySelectorAll('.ad-gal-box')].map(makeGal).filter(Boolean);

  /* Reiter: welcher Inhalt unter dem App-Kopf steht. Beim Wechsel innerhalb der
     App-Seite springt die Seite nicht nach oben; ist die Leiste schon oben
     angeheftet, bleibt sie dort und der neue Inhalt beginnt direkt darunter. */
  function setHdr(){ const h=document.querySelector('header'); if(!h) return; const r=document.documentElement.style;
    r.setProperty('--hdr',h.offsetHeight+'px'); r.setProperty('--hdr-sicht',(h.classList.contains('weg')?0:h.offsetHeight)+'px'); }
  const handy=matchMedia('(max-width:640px)');
  setHdr(); addEventListener('resize',setHdr);
  function setAppView(view, keepPos, pageId){
    const art=document.querySelector('#'+(pageId||'page-app')+' .ad-page'); if(!art) return;
    const anchor=art.querySelector('.ad-tabs-anchor');
    const kopf=document.querySelector('header'), hdr=kopf.offsetHeight;
    const tabsNav=art.querySelector('.ad-tabs');
    const wasStuck = keepPos && (handy.matches
      ? tabsNav.getBoundingClientRect().bottom <= (kopf.classList.contains('weg')?0:hdr)+51
      : anchor.getBoundingClientRect().top < hdr);
    art.querySelectorAll('.ad-panel').forEach(p=>{ p.hidden = p.dataset.view!==view; });
    art.querySelectorAll('.ad-tabs a').forEach(a=>{
      if(a.dataset.view===view) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    /* Kopf bleibt immer wie auf der Uebersicht (Owner 14.09.). Damit der Text trotzdem
       sofort sichtbar ist, rollt ein Rechts-Reiter die Leiste direkt unter die Kopfzeile,
       auch beim direkten Aufruf (etwa ueber den Datenschutz-Link in der App).
       instant: die Vorlage scrollt sonst weich, der Text stuende kurz ausserhalb. */
    const gapAbove=parseFloat(getComputedStyle(art.querySelector('.ad-tabs')).marginTop)||0; // Abstand ueber der Leiste
    if(handy.matches){
      /* Handy (18.09.): Kopf weg, Reiter aus dem Bild, der Text beginnt direkt unter der schmalen Zeile (50 px) */
      if(view!=='overview' || wasStuck){
        const ziel=Math.max(0, tabsNav.getBoundingClientRect().bottom + window.scrollY - 18);  // Titel rund 16 px unter der Zeile
        window.scrollTo({top:ziel, behavior:'instant'}); if(window.casyKopf) window.casyKopf.weg(true, ziel);
      }
    } else if(view!=='overview' || wasStuck) window.scrollTo({top: anchor.getBoundingClientRect().top + gapAbove + window.scrollY - hdr, behavior:'instant'});
    if(keepPos || view!=='overview'){
      const target = view==='overview' ? art.querySelector('.ad-name') : art.querySelector('.ad-panel[data-view="'+view+'"] .ad-doc-title');
      if(target) target.focus({preventScroll:true});
    }
    curView=view; updateTitle(); tabsEdge(); updateMini();
  }

  /* Schmale Zeile am Handy: Beschriftung und Haken nach aktuellem Bereich und Sprache */
  function updateMini(){
    const K={de:{overview:'Übersicht',datenschutz:'Datenschutz',support:'Support',hinweise:'Hinweise',impressum:'Impressum'},
             en:{overview:'Overview',datenschutz:'Privacy',support:'Support',hinweise:'App Notes',impressum:'Legal Notice'}};
    const L=document.documentElement.lang==='en'?'en':'de';
    document.querySelectorAll('.ad-mini').forEach(m=>{
      const cur=m.closest('.ad-page').querySelector('.ad-tabs a[aria-current]'), v=cur?cur.dataset.view:'overview';
      m.querySelector('.ad-mini-akt').textContent=K[L][v];
      m.querySelectorAll('.ad-mini-menu a').forEach(a=>{ a.textContent=K[L][a.dataset.view];
        if(a.dataset.view===v) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
    });
  }

  /* 2.4.2: Seitentitel je Ansicht und Sprache */
  let curPage='home', curView='overview';
  const TITLES={
    de:{home:'Casy Studio: Apps für Apple-Plattformen',contact:'Kontakt · Casy Studio',privacy:'Datenschutz Website · Casy Studio',impressum:'Impressum · Casy Studio',app:'ShutterLife · Casy Studio',sqnz:'SQNZ · Casy Studio'},
    en:{home:'Casy Studio: Apps for Apple platforms',contact:'Contact · Casy Studio',privacy:'Website Privacy · Casy Studio',impressum:'Legal Notice · Casy Studio',app:'ShutterLife · Casy Studio',sqnz:'SQNZ · Casy Studio'}
  };
  function updateTitle(){
    // nicht die Variable lang lesen: route() laeuft, bevor "let lang" deklariert ist
    const L=document.documentElement.lang==='en'?'en':'de';
    let s=TITLES[L][curPage]||TITLES[L].home;
    if((curPage==='app'||curPage==='sqnz') && curView!=='overview'){
      const tab=document.querySelector('#'+pages[curPage]+' .ad-tabs a[data-view="'+curView+'"]');
      if(tab) s=tab.textContent.trim()+' · '+s;
    }
    document.title=s;
  }

  /* Reiterleiste: weiche Kante rechts, solange rechts noch Reiter verborgen sind */
  function tabsEdge(){
    document.querySelectorAll('nav.ad-tabs').forEach(n=>n.classList.toggle('more', n.scrollWidth - n.clientWidth - n.scrollLeft > 4));
  }
  document.querySelectorAll('nav.ad-tabs').forEach(n=>n.addEventListener('scroll',tabsEdge,{passive:true}));
  /* Angedockt oder nicht (18.09.): entscheidet, ob die Leiste ihre Flaeche zeigt. Gemessen am Anker ueber der Leiste. */
  (function(){
    const paare=[...document.querySelectorAll('.ad-tabs-anchor')].map(a=>[a, a.nextElementSibling]).filter(([,n])=>n&&n.classList.contains('ad-tabs'));
    if(!paare.length) return;
    let laeuft=false;
    function pruefen(){
      laeuft=false;
      const hdr=document.querySelector('header').offsetHeight;
      paare.forEach(([anker,nav])=>{
        const sichtbar=nav.offsetParent!==null;
        nav.classList.toggle('gedockt', sichtbar && !handy.matches && anker.getBoundingClientRect().top <= hdr + 1);
        const mini=anker.previousElementSibling;
        if(mini && mini.classList.contains('ad-mini')){
          const oben=document.querySelector('header').classList.contains('weg')?0:hdr;
          const an=sichtbar && handy.matches && nav.getBoundingClientRect().bottom <= oben + 51;  // Reiter ganz unter der 50-px-Zeile
          mini.classList.toggle('an',an); if(!an && window.casyMiniZu) window.casyMiniZu(mini);
        }
      });
    }
    addEventListener('scroll',()=>{ if(!laeuft){ laeuft=true; requestAnimationFrame(pruefen); } },{passive:true});
    addEventListener('resize',pruefen); addEventListener('load',pruefen); pruefen();
    window.casyTabsPruefen=pruefen;
  })();
  addEventListener('resize',tabsEdge);

  /* Handy (18.09.): Kopf weicht beim Runterscrollen, ein Stueck hoch holt ihn sofort zurueck (wie Safari). Tastaturfokus
     im Kopf holt ihn ebenfalls zurueck. Ab 641 px bleibt er fest wie bisher. */
  (function(){
    const h=document.querySelector('header'); if(!h) return;
    let last=window.scrollY;
    function weg(w, y){
      if(typeof y==='number') last=y;
      if(h.classList.contains('weg')===w){ return; }
      h.classList.toggle('weg',w); setHdr(); if(window.casyTabsPruefen) window.casyTabsPruefen();
    }
    window.casyKopf={weg, menu:o=>menu(o)};
    addEventListener('scroll',()=>{
      const y=window.scrollY, d=y-last; last=y;
      if(!handy.matches || h.classList.contains('menu-offen')){ weg(false); return; }
      if(y<=h.offsetHeight) weg(false); else if(d>6) weg(true); else if(d<-6) weg(false);
    },{passive:true});
    h.addEventListener('focusin',()=>weg(false));
    handy.addEventListener('change',()=>{ weg(false); menu(false); });

    /* Menue-Knopf im Kopf: Apps, Kontakt, Darstellung */
    const btn=h.querySelector('.nav-menu');
    function menu(o){ h.classList.toggle('menu-offen',o); if(btn) btn.setAttribute('aria-expanded',o?'true':'false'); setHdr(); }
    if(btn){
      btn.addEventListener('click',()=>menu(!h.classList.contains('menu-offen')));
      h.querySelectorAll('.links a').forEach(a=>a.addEventListener('click',()=>menu(false)));
      document.addEventListener('click',e=>{ if(!h.contains(e.target)) menu(false); });
      document.addEventListener('keydown',e=>{ if(e.key==='Escape' && h.classList.contains('menu-offen')){ menu(false); btn.focus(); } });
    }

    /* Auswahl in der schmalen Zeile */
    function miniSet(m,o){ const b=m.querySelector('.ad-mini-btn'), l=m.querySelector('.ad-mini-menu');
      b.setAttribute('aria-expanded',o?'true':'false'); l.hidden=!o; }
    window.casyMiniZu=m=>{ if(m.querySelector('.ad-mini-btn').getAttribute('aria-expanded')==='true') miniSet(m,false); };
    document.querySelectorAll('.ad-mini').forEach(m=>{
      const b=m.querySelector('.ad-mini-btn');
      b.addEventListener('click',()=>miniSet(m, b.getAttribute('aria-expanded')!=='true'));
      m.querySelectorAll('.ad-mini-menu a').forEach(a=>a.addEventListener('click',()=>miniSet(m,false)));
      document.addEventListener('click',e=>{ if(!m.contains(e.target)) window.casyMiniZu(m); });
      document.addEventListener('keydown',e=>{ if(e.key==='Escape' && b.getAttribute('aria-expanded')==='true'){ miniSet(m,false); b.focus(); } });
    });
  })();

  /* QR: Klick oeffnet/schliesst, Esc und Klick daneben schliessen */
  (function(){
    const w=document.querySelector('.ad-qr-wrap'); if(!w) return;
    const b=w.querySelector('.ad-qr');
    const set=o=>{ w.classList.toggle('open',o); b.setAttribute('aria-expanded',o?'true':'false'); };
    b.addEventListener('click',()=>set(!w.classList.contains('open')));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape' && w.classList.contains('open')){ set(false); b.focus(); } });
    document.addEventListener('click',e=>{ if(!w.contains(e.target)) set(false); });
  })();

  /* Skip-Link: springt zum Inhalt, ohne die Hash-Route zu veraendern */
  document.querySelectorAll('[data-skip]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault(); const m=document.getElementById('main-content'); if(m) m.focus();
  }));

  const pages = {app:'page-app',sqnz:'page-sqnz',home:'page-home',contact:'page-contact',privacy:'page-privacy',impressum:'page-impressum'};

  /* Jede Adresse ist eine eigene Datei (seit dem Livegang 09/2026): welche Seite und welcher Reiter,
     steht am <body> (data-page, data-view). Die Sprache steht an <html lang>; DE/EN sind Links auf die Nachbardatei. */
  const lang = document.documentElement.lang==='en' ? 'en' : 'de';
  curPage = document.body.dataset.page || 'home';
  if(document.body.dataset.view) setAppView(document.body.dataset.view, false, pages[curPage]);
  else updateTitle();

  // „Zu den Apps" auf der Startseite: weich scrollen statt springen
  document.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{
    const el=document.getElementById('apps'); if(!el) return;
    e.preventDefault();
    el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }));

  // Kontakt: der Knopf traegt den Betreff, sonst passiert hier nichts mehr.
  const MAIL='support@casystudio.com';
  const SUBJ={de:'Hallo Casy Studio',en:'Hello Casy Studio'};
  const mailDirect=document.getElementById('mailto-direct');
  if(mailDirect) mailDirect.addEventListener('click',function(){
    this.href='mailto:'+MAIL+'?subject='+encodeURIComponent(SUBJ[lang]);
  });

  /* Sprachwahl merken (localStorage casy_lang, steht so in der Datenschutzerklaerung Abschnitt 6).
     Das Umleiten beim Laden macht casy-kopf.js, bevor die Seite zeichnet. Beim Wechsel bleibt die Scrollposition,
     damit die Seite nicht springt (Owner 05.09.): sie reist im Adressanker mit (#y=…) und wird hier wieder eingenommen. */
  document.querySelectorAll('header .lang a').forEach(a=>a.addEventListener('click',e=>{
    try{ localStorage.setItem('casy_lang', a.getAttribute('lang')); }catch(err){}
    if(window.scrollY>0 && !location.hash){ e.preventDefault(); location.href=a.getAttribute('href')+'#y='+Math.round(window.scrollY); }
  }));
  (function(){
    const m=location.hash.match(/^#y=(\d+)$/); if(!m) return;
    history.replaceState(null,'',location.pathname+location.search);
    const go=()=>window.scrollTo({top:+m[1],behavior:'instant'});
    go(); addEventListener('load',go,{once:true});
  })();

  adGals.forEach(g=>g.render()); tabsEdge(); updateMini();

  /* ===================== Suche (19.09.2026) =====================
     Kein externer Dienst, nichts verlaesst das Geraet. Der Index entsteht beim Oeffnen aus der Seite selbst (also immer in der
     eingestellten Sprache). Dazu kommen gepflegte Umschreibungen (UMSCHR): so fragen Leute, die die Fachwoerter nicht kennen.
     Schluessel ist die DEUTSCHE Ueberschrift; die englische Fassung findet ihre Umschreibungen ueber dieselbe Position.
     Rechtstexte nur mit Ueberschriften, damit „Kamera" zuerst in der Hilfe landet und nicht in der Datenschutzerklaerung.
     Neue Frage in Support oder Uebersicht? Hier eine Zeile ergaenzen. */
  const UMSCHR={
    'APP:ShutterLife':'voraussetzungen welches iphone ipad mac requirements auslösezähler auslösungen wie oft ausgelöst wie viele fotos bilder gemacht kamera alter wie alt ist meine kamera gebrauchte kamera kaufen verkaufen verschleiß verschluss shutter count shutter counter how many shots camera age used camera',
    'APP:SQNZ':'sequence lite intervall timer intervalltimer workout training sport tabata hiit fitness stoppuhr countdown boxen zirkeltraining interval timer circuit boxing',
    'Welche Kameras werden unterstützt?':'kamera liste modelle geht meine kamera funktioniert mit meiner kamera canon nikon sony fujifilm fuji pentax leica ricoh unterstützte kameras kompatibel supported cameras which cameras compatible does my camera work',
    'Warum zeigt meine Kamera keinen Auslösezähler?':'kamera wird nicht erkannt camera not recognized not detected no shutter count erkennt meine kamera nicht kein wert keine zahl zeigt nichts an funktioniert nicht klappt nicht leer nicht auslesbar spiegelreflex dslr smartphone handy kompaktkamera no count shows nothing not working does not work',
    'Wie genau ist der Auslösezähler?':'stimmt der wert richtig genauigkeit falsch zu hoch zu niedrig zuverlässig vertrauen hdr firmware zurückgesetzt accurate wrong number reliable',
    'Welche Dateiformate werden unterstützt?':'raw jpeg jpg heic heif cr2 cr3 nef arw raf pef dng dateityp welche dateien format file type file formats',
    'Braucht ShutterLife eine Internetverbindung?':'offline ohne internet wlan netz mobile daten hochladen server upload wifi',
    'Was bedeutet „Bearbeitungssoftware in der Datei vermerkt"?':'fehlermeldung meldung bearbeitetes bild erkannt bearbeitet software lightroom photoshop exportiert foto geht nicht whatsapp messenger original exif fehlt error message edited image',
    'Wie lösche ich meinen Messverlauf?':'verlauf löschen historie entfernen alle löschen messungen weg delete history clear',
    'Wie kann ich helfen, die App zu verbessern?':'datenspende daten spenden feedback rückmeldung vorschlag verbessern mithelfen fehler melden bug melden data donation help improve',
    'Vor dem Kauf prüfen':'vor dem kauf welche kamera geht vorher testen ausprobieren gebrauchte kamera kaufen before buying check first',
    'Deine Kamera fehlt?':'kamera wird nicht erkannt kamera nicht dabei nicht unterstützt fehlt neue kamera hinzufügen foto schicken einsenden firmware camera missing not supported add my camera',
    "So funktioniert's":'anleitung wie benutze ich bedienung erste schritte foto importieren öffnen how to use import photo',
    'Zählerstand und Prüfschwelle':'prozent schwelle lebensdauer wie lange hält der verschluss hersteller angabe ausfall kaputt verschleiß percentage lifespan rated shutter life',
    'Sorgfältig getestet':'getestet zuverlässig seriennummer fälschung manipuliert echt tested genuine serial number',
    'Datenschutz von Grund auf':'privat daten sicher tracking was passiert mit meinen fotos privacy',
    'Hilf mit, ShutterLife besser zu machen':'datenspende daten spenden feedback rückmeldung verbessern mithelfen data donation help improve',
    'Hilf mit, SQNZ besser zu machen':'datenspende daten spenden feedback rückmeldung verbessern mithelfen data donation help improve',
    'Wie erstelle ich einen Timer?':'neuer timer anlegen erstellen plus hinzufügen eigenen timer bauen create new timer add',
    'Wie funktioniert die KI-Hilfe beim Erstellen?':'ki chatgpt claude künstliche intelligenz text beschreiben automatisch erstellen ai',
    'Wie synchronisiere ich mit der Apple Watch?':'uhr watch verbinden koppeln abgleichen sync synchronisieren smartwatch erscheint nicht auf der uhr',
    'Pausiert der Timer automatisch bei einem Anruf?':'anruf telefon klingelt telefonat unterbrochen phone call pause',
    'Wie teile ich einen Timer mit anderen?':'teilen verschicken senden freunde weitergeben datei qr share send',
    'Wie stelle ich meinen Kauf wieder her?':'gekauft premium weg verloren neues iphone handy gewechselt wiederherstellen restore purchase bezahlt',
    'Ist Premium ein Abo?':'abo abonnement kündigen kosten preis monatlich einmal bezahlen subscription price cancel',
    'Wie lösche ich meine Daten?':'daten löschen zurücksetzen alles weg entfernen reset delete data',
    'Braucht SQNZ eine Internetverbindung?':'offline ohne internet wlan netz flugmodus wifi',
    'Fehlt auf älteren Geräten etwas?':'welches iphone läuft auf meinem iphone geht mein iphone voraussetzungen kompatibel iphone 8 iphone 11 iphone se which iphone requirements compatible altes iphone alte uhr ältere geräte doppeltippen funktioniert nicht series old device double tap',
    'Kostenlos und Premium':'kostenlos gratis preis kosten was ist frei premium unterschied free price',
    'Timer selbst bauen':'intervalle runden pausen eigene timer vorlagen tabata custom intervals rounds',
    'Flows':'mehrere timer hintereinander kombinieren verketten ablauf programm chain',
    'Ton, Sprache, Haptik':'ton sound vibration sprachansage stimme ansage piepton lautstärke leise voice',
    'Auch bei gesperrtem Bildschirm':'sperrbildschirm hintergrund display aus gesperrt live aktivität widget lock screen background',
    'Apple Watch':'uhr watch handgelenk smartwatch',
    'Statistik':'statistik verlauf streak rekorde auswertung fortschritt history stats progress',
    'Timer aus Text erstellen':'ki chatgpt claude text beschreiben ai',
    'Apple Health, wenn du willst':'health gesundheit app kalorien training speichern fitness',
    'Datenschutz':'privat daten tracking privacy',
    'Gesundheitshinweis':'medizin arzt gesundheit risiko warnung health warning',
    'DOC:datenschutz':'datenschutzerklärung privacy policy dsgvo gdpr was speichert ihr daten',
    'DOC:support':'hilfe kontakt problem frage fragen help contact faq',
    'DOC:hinweise':'nutzungsbedingungen agb bedingungen regeln terms of use terms',
    'DOC:impressum':'impressum anbieter adresse legal notice imprint',
    'HOME:kontakt':'kontakt email mail schreiben erreichen frage stellen contact email reach',
    'HOME:ueber':'über uns wer seid ihr wer steckt dahinter studio about us who',
    'HOME:apps':'alle apps übersicht welche apps all apps',
    'HOME:datenschutz':'datenschutz website cookies privacy website',
    'HOME:impressum':'impressum anbieter adresse wer steckt dahinter legal notice imprint'
  };
  const SUCH_TXT={
    de:{label:'Suche',ph:'Wonach suchst du?',zu:'Schließen',start:'Beschreib einfach, was du suchst. Zum Beispiel:',
        bsp:['Wie oft hat meine Kamera ausgelöst?','Kamera wird nicht erkannt','Kauf wiederherstellen','Timer auf der Uhr'],
        nix:'Dazu haben wir nichts gefunden.',nix2:'Versuch es mit anderen Worten, oder frag uns direkt. Wir antworten persönlich.',frag:'Frag uns direkt',lade:'Suche wird vorbereitet …',
        treffer:n=>n===1?'1 Treffer':n+' Treffer',ov:'Übersicht',support:'Support',datenschutz:'Datenschutz',hinweise:'Hinweise zur App',impressum:'Impressum',
        web:'Website',betreff:'Frage von casystudio.com',body:q=>'Ich habe auf der Website gesucht nach: '+q+'\n\n'},
    en:{label:'Search',ph:'What are you looking for?',zu:'Close',start:'Just describe what you are looking for. For example:',
        bsp:['How many shots has my camera taken?','Camera not recognized','Restore purchase','Timer on the watch'],
        nix:'We found nothing for that.',nix2:'Try other words, or ask us directly. We answer personally.',frag:'Ask us directly',lade:'Preparing search …',
        treffer:n=>n===1?'1 result':n+' results',ov:'Overview',support:'Support',datenschutz:'Privacy',hinweise:'App Notes',impressum:'Legal Notice',
        web:'Website',betreff:'Question from casystudio.com',body:q=>'I searched the website for: '+q+'\n\n'}
  };
  const STOPP=new Set(('der die das den dem des ein eine einen einem einer eines und oder aber ist sind war bin bist wie was wo wann warum wieso weshalb welche welcher welches '+
    'ich mein meine meinen meinem meiner mir mich du dein deine dir dich es er sie wir ihr man kann koennen kann konnen muss soll will mit von vom zu zum zur im in ins auf fur '+
    'bei nicht kein keine keinen noch schon auch nur mal denn dass bitte gibt geht hat habe haben hast wird werden wurde so da dann als am an aus uber um wenn ob sich hier '+
    'the a an is are was be how what where why when which i my me mine do does did can could to of in on for with and or not no it its you your we our this that there have has').split(' '));
  function suchNorm(t){
    return (t||'').toLowerCase().replace(/ä|ae/g,'a').replace(/ö|oe/g,'o').replace(/ü|ue/g,'u').replace(/ß/g,'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
  }
  function suchStamm(w){
    if(w.length>5){ for(const e of ['ungen','ung','en','er','es','e','n','s']){ if(w.endsWith(e) && w.length-e.length>=4) return w.slice(0,-e.length); } }
    return w;
  }
  function suchWoerter(t, stopp){ return suchNorm(t).split(' ').filter(w=>w && (!stopp || !STOPP.has(w))).map(suchStamm); }
  function abstand(a,b,max){ // Levenshtein mit Abbruch
    if(Math.abs(a.length-b.length)>max) return max+1;
    let v=Array.from({length:b.length+1},(_,i)=>i);
    for(let i=1;i<=a.length;i++){ let prev=v[0], min=v[0]=i;
      for(let j=1;j<=b.length;j++){ const tmp=v[j]; v[j]=Math.min(v[j]+1,v[j-1]+1,prev+(a[i-1]===b[j-1]?0:1)); prev=tmp; if(v[j]<min) min=v[j]; }
      if(min>max) return max+1; }
    return v[b.length];
  }
  function passt(q,t){
    if(q===t) return 1;
    if(q.length>=4 && t.startsWith(q)) return .85;
    if(t.length>=4 && q.startsWith(t) && t.length>=q.length*.7) return .75;
    if(q.length>=4 && t.includes(q)) return .7;           // Wortteile: „zahler" in „auslosezahler"
    if(q.length>=4){ const d=abstand(q,t,q.length>=7?2:1); if(d<=(q.length>=7?2:1)) return .65; } // Tippfehler
    return 0;
  }
  const suchText=el=>{ if(!el) return ''; const c=el.cloneNode(true); c.querySelectorAll('.soon-pill').forEach(x=>x.remove()); return c.textContent.trim(); };
  /* Seit dem Livegang ist jede Adresse eine eigene Datei. Beim ersten Oeffnen der Suche holt das Skript die
     Nachbarseiten derselben Website (fetch, gleicher Server, kein Dritter) und baut daraus den Index; so bleibt er
     immer auf dem Stand der Dateien, und es gibt keine zweite Liste, die man pflegen muss. Auf Englisch kommen die
     deutschen Seiten dazu, weil die Umschreibungen an den deutschen Ueberschriften haengen (gleiche Position). */
  const SEITEN=['/','/kontakt/','/datenschutz/','/impressum/',
    '/shutterlife/','/shutterlife/privacy/','/shutterlife/support/','/shutterlife/terms/','/shutterlife/impressum/',
    '/sequenz/','/sequenz/privacy/','/sequenz/support/','/sequenz/terms/','/sequenz/impressum/'];
  const APPBASIS={shutterlife:'/shutterlife/',sqnz:'/sequenz/'}, VIEWPFAD={overview:'',datenschutz:'privacy/',support:'support/',hinweise:'terms/',impressum:'impressum/'};
  const seiteUrl=(p,L)=>p+(L==='de'?'de.html':'');
  const hierPfad=location.pathname.replace(/(index|de)\.html$/,'');
  function suchSammeln(doc, L){
    const X=SUCH_TXT[L], out=[], eigen=doc===document;
    const add=o=>{ o.text=(o.text||'').replace(/\s+/g,' ').trim(); if(!eigen) o.el=null; out.push(o); };
    const zu=(p,id)=>seiteUrl(p,L)+'#s='+encodeURIComponent(id);
    [['page-app','shutterlife','ShutterLife'],['page-sqnz','sqnz','SQNZ']].forEach(([pid,slug,name])=>{
      const pg=doc.getElementById(pid); if(!pg) return; const B=APPBASIS[slug];
      add({id:pid+'|app',key:'APP:'+name,ort:'App',titel:name,text:((pg.querySelector('.ad-claim')||{}).textContent||'')+' '+((pg.querySelector('.ad-desc')||{}).textContent||''),
        href:seiteUrl(B,L),el:pg.querySelector('.ad-name'),art:'app'});
      pg.querySelectorAll('.ad-panel[data-view="overview"] .ad-sec').forEach((sec,i)=>{ const h=sec.querySelector('h3'); if(!h) return; const id=pid+'|ov|'+i;
        add({id,ort:name+' · '+X.ov,titel:suchText(h),text:(sec.querySelector('p')||{}).textContent,href:zu(B,id),el:sec,art:'abschnitt'}); });
      ['datenschutz','support','hinweise','impressum'].forEach(v=>{
        const pan=pg.querySelector('.ad-panel[data-view="'+v+'"]'); if(!pan) return; const t=pan.querySelector('.ad-doc-title'), P=B+VIEWPFAD[v];
        add({id:pid+'|'+v,key:'DOC:'+v,ort:name,titel:t?suchText(t):X[v],text:'',href:seiteUrl(P,L),el:t,art:'seite'});
        if(v==='support') pan.querySelectorAll('.faq').forEach((f,i)=>{ const h=f.querySelector('h4'); if(!h) return; const id=pid+'|faq|'+i;
          add({id,ort:name+' · '+X.support,titel:suchText(h),text:[...f.querySelectorAll('p')].map(p=>p.textContent).join(' '),href:zu(P,id),el:f,art:'frage'}); });
        else pan.querySelectorAll('.ad-doc-body h3').forEach((h,i)=>{ const id=pid+'|'+v+'|'+i;
          add({id,ort:name+' · '+X[v],titel:suchText(h),text:'',href:zu(P,id),el:h,art:'recht'}); });
      });
    });
    const home=doc.getElementById('page-home');
    if(home){ const apps=doc.getElementById('apps'), band=home.querySelector('.about-band');
      if(apps) add({id:'home|apps',key:'HOME:apps',ort:X.web,titel:(apps.querySelector('h2')||{}).textContent||'Apps',text:'',href:seiteUrl('/',L)+'#apps',el:apps,art:'seite'});
      if(band) add({id:'home|ueber',key:'HOME:ueber',ort:X.web,titel:(band.querySelector('h3')||{}).textContent,text:(band.querySelector('.band-text')||{}).textContent,href:zu('/','home|ueber'),el:band,art:'abschnitt'}); }
    const kon=doc.getElementById('page-contact');
    if(kon) add({id:'kontakt',key:'HOME:kontakt',ort:X.web,art:'kontakt',titel:(kon.querySelector('h1')||{}).textContent,text:(kon.querySelector('.c-card-h')||{}).textContent,href:seiteUrl('/kontakt/',L),el:kon.querySelector('h1')});
    [['page-privacy','datenschutz','/datenschutz/'],['page-impressum','impressum','/impressum/']].forEach(([pid,k,P])=>{ const pg=doc.getElementById(pid); if(!pg) return;
      add({id:pid,key:'HOME:'+k,ort:X.web,titel:(pg.querySelector('h1')||{}).textContent,text:'',href:seiteUrl(P,L),el:pg.querySelector('h1'),art:'seite'});
      pg.querySelectorAll('h2').forEach((x,i)=>{ const id=pid+'|'+i;
        add({id,ort:X.web+' · '+(pg.querySelector('h1')||{}).textContent,titel:x.textContent,text:'',href:zu(P,id),el:x,art:'recht'}); }); });
    return out;
  }
  function suchVorbereiten(out, suchDE){
    out.forEach(o=>{
      const de=suchDE&&suchDE[o.id], syn=UMSCHR[o.key]||UMSCHR[(de||o.titel||'').trim()]||'';
      o.fT=suchWoerter(o.titel+' '+(de&&de!==o.titel?de:'')); o.fS=suchWoerter(syn); o.fB=suchWoerter(o.text); o.synN=suchNorm(syn);
    });
    return out;
  }
  // Alle Seiten einer Sprache; die offene Seite kommt aus dem DOM (dann kann ein Treffer direkt dorthin springen)
  function seitenLaden(L){
    return Promise.all(SEITEN.map(p=>{
      if(L===lang && p===hierPfad) return Promise.resolve(suchSammeln(document,L));
      return fetch(seiteUrl(p,L)).then(r=>r.ok?r.text():'').then(t=>t?suchSammeln(new DOMParser().parseFromString(t,'text/html'),L):[]).catch(()=>[]);
    })).then(listen=>{ const seen=new Set(), out=[];
      listen.flat().forEach(o=>{ if(!seen.has(o.id)){ seen.add(o.id); out.push(o); } }); return out; });
  }
  let suchIndex=null;
  function suchIndexHolen(){
    if(!suchIndex) suchIndex=Promise.all([seitenLaden(lang), lang==='en'?seitenLaden('de'):null]).then(([out,de])=>{
      const suchDE={}; (de||out).forEach(o=>{ suchDE[o.id]=(o.titel||'').trim(); });
      return suchVorbereiten(out, suchDE);
    });
    return suchIndex;
  }
  // Treffer auf einer anderen Seite: dort ueber den Anker #s=<Position> ansteuern und kurz markieren
  function suchMarkieren(el){
    el.scrollIntoView({block:'start',behavior:'instant'});
    if(!el.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT)$/.test(el.tagName)) el.setAttribute('tabindex','-1');
    el.focus({preventScroll:true});
    el.classList.remove('such-treffer'); void el.offsetWidth; el.classList.add('such-treffer');
  }
  (function(){
    const m=location.hash.match(/^#s=(.+)$/); if(!m) return;
    const id=decodeURIComponent(m[1]); history.replaceState(null,'',location.pathname+location.search);
    const o=suchSammeln(document,lang).find(x=>x.id===id);
    if(o&&o.el){ const go=()=>suchMarkieren(o.el); go(); addEventListener('load',go,{once:true}); }
  })();
  function suchen(q, idx){
    const qw=suchWoerter(q,true); if(!qw.length) return [];
    const qn=suchNorm(q), GEW={frage:1.15,abschnitt:1.05,app:1.1,kontakt:1.25,seite:1,recht:.6};
    return idx.map(o=>{
      let sum=0, hits=0;
      qw.forEach(w=>{ let best=0;
        for(const [f,g] of [[o.fT,3],[o.fS,2.6],[o.fB,1]]){ for(const t of f){ const p=passt(w,t)*g; if(p>best) best=p; if(best>=3) break; } }
        if(best>0){ sum+=best; hits++; } });
      const deckung=hits/qw.length;
      if(!hits || (qw.length>=2 && deckung<.5)) return null;
      let score=sum*(.4+deckung)*(GEW[o.art]||1);
      if(qw.length>=2 && qn.length>=6 && (o.synN.includes(qn) || suchNorm(o.titel).includes(qn))) score+=3;
      return {o,score};
    }).filter(Boolean).sort((a,b)=>b.score-a.score).filter((r,i,a)=>r.score>=Math.max(1.2,a[0].score*.3)).slice(0,8).map(r=>r.o);
  }
  (function(){
    const dlg=document.getElementById('such'), feld=document.getElementById('such-feld'), liste=document.getElementById('such-liste'),
          status=document.getElementById('such-status'), zu=dlg.querySelector('.such-zu'), knopf=document.querySelector('.nav-such');
    let idx=[], treffer=[], ausloeser=null, timer=null;
    const X=()=>SUCH_TXT[document.documentElement.lang==='en'?'en':'de'];
    const esc=t=>(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const kurz=t=>t.length>150?t.slice(0,147).replace(/\s+\S*$/,'')+' …':t;
    function zeigen(){
      const q=feld.value.trim(), x=X();
      if(!q){ liste.innerHTML='<div class="such-leer">'+esc(x.start)+'<div class="such-bsp">'+x.bsp.map(b=>'<button type="button">'+esc(b)+'</button>').join('')+'</div></div>';
        liste.querySelectorAll('.such-bsp button').forEach(b=>b.addEventListener('click',()=>{ feld.value=b.textContent; zeigen(); feld.focus(); }));
        status.textContent=''; treffer=[]; return; }
      if(!idx.length){ liste.innerHTML='<div class="such-leer">'+esc(x.lade)+'</div>'; status.textContent=''; treffer=[]; return; }
      treffer=suchen(q, idx);
      if(!treffer.length){
        const mail='mailto:support@casystudio.com?subject='+encodeURIComponent(x.betreff)+'&body='+encodeURIComponent(x.body(q));
        liste.innerHTML='<div class="such-leer"><b>'+esc(x.nix)+'</b><br>'+esc(x.nix2)+'<br><a class="btn" href="'+mail+'">'+esc(x.frag)+'</a></div>';
        status.textContent=x.nix; return; }
      liste.innerHTML=treffer.map((o,i)=>'<a href="'+o.href+'" data-i="'+i+'"><span class="such-ort">'+esc(o.ort)+'</span><span class="such-titel">'+esc(o.titel)+'</span>'+
        (o.text?'<span class="such-text">'+esc(kurz(o.text))+'</span>':'')+'</a>').join('');
      liste.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); gehe(treffer[+a.dataset.i]); }));
      status.textContent=x.treffer(treffer.length);
    }
    function oeffnen(){
      if(window.casyKopf && window.casyKopf.menu) window.casyKopf.menu(false);
      ausloeser=document.activeElement;
      suchIndexHolen().then(i=>{ idx=i; if(!dlg.hidden && feld.value.trim()) zeigen(); });
      const x=X(); dlg.setAttribute('aria-label',x.label); feld.placeholder=x.ph; feld.setAttribute('aria-label',x.label); zu.textContent=x.zu;
      dlg.hidden=false; document.documentElement.classList.add('such-offen'); zeigen(); feld.focus(); feld.select();
    }
    function schliessen(zurueck){
      dlg.hidden=true; document.documentElement.classList.remove('such-offen');
      if(zurueck && ausloeser && ausloeser.focus) ausloeser.focus();
    }
    function gehe(o){
      schliessen(false);
      if(o.el && document.contains(o.el)) suchMarkieren(o.el); else location.href=o.href;
    }
    knopf.addEventListener('click',oeffnen);
    zu.addEventListener('click',()=>schliessen(true));
    dlg.addEventListener('click',e=>{ if(e.target===dlg) schliessen(true); });
    feld.addEventListener('input',()=>{ clearTimeout(timer); timer=setTimeout(zeigen,90); });
    feld.addEventListener('keydown',e=>{
      if(e.key==='Enter'){ e.preventDefault(); clearTimeout(timer); zeigen(); if(treffer[0]) gehe(treffer[0]); }
      if(e.key==='ArrowDown'){ const a=liste.querySelector('a'); if(a){ e.preventDefault(); a.focus(); } } });
    liste.addEventListener('keydown',e=>{ const a=[...liste.querySelectorAll('a')], i=a.indexOf(document.activeElement); if(i<0) return;
      if(e.key==='ArrowDown'&&a[i+1]){ e.preventDefault(); a[i+1].focus(); }
      if(e.key==='ArrowUp'){ e.preventDefault(); (a[i-1]||feld).focus(); } });
    document.addEventListener('keydown',e=>{
      if(!dlg.hidden && e.key==='Escape'){ e.preventDefault(); schliessen(true); return; }
      if(!dlg.hidden && e.key==='Tab'){ // Fokus bleibt im Fenster
        const f=[feld,...liste.querySelectorAll('a,button'),zu]; const i=f.indexOf(document.activeElement);
        if(e.shiftKey && i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey && i===f.length-1){ e.preventDefault(); f[0].focus(); } }
      const tipp=/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||'');
      if(dlg.hidden && !tipp && (e.key==='/' || ((e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k'))){ e.preventDefault(); oeffnen(); } });
    window.casySuche={oeffnen, suchen:q=>suchIndexHolen().then(i=>suchen(q,i).map(o=>o.ort+' | '+o.titel+' | '+o.href))};
  })();


  /* Geraete-Bewegung: Gruppe → iPhone → iPad → Mac → Gruppe. Das gewaehlte Geraet gleitet aus seiner Lage in der
     Gruppe gross in die Mitte (FLIP: Lage aus dem Layout, Bewegung per transform), die anderen blenden aus.
     Gruppe 5 s, Einzelgeraet 4,5 s, jeweils plus 1,4 s Bewegung. Haelt an bei Pause-Knopf, Maus, Tastaturfokus,
     unsichtbarem Tab; Punkt antippen oder wischen haelt an. „Bewegung reduzieren": nur die Gruppe. */
  (function(){
    const rot=document.querySelector('.dev-rot'); if(!rot) return;
    const MOVE=1400, DWELL_GROUP=5000, DWELL=4500, NAMES={iphone:'iPhone',ipad:'iPad',watch:'Apple Watch',mac:'Mac'};
    const stage=rot.querySelector('.dev-stage'), dotsBox=rot.querySelector('.dev-dots'), pauseBtn=rot.querySelector('.dev-pause'), cap=rot.querySelector('.dev-cap');
    const imgs={}; stage.querySelectorAll('.devices img').forEach(im=>imgs[im.dataset.dev]=im);
    const en=()=>document.documentElement.lang==='en';
    const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
    let states=[], i=0, mode='run', hov=false, foc=false, tHandle=null, tStart=0, remain=0;
    const suspended=()=>hov||foc||document.hidden;
    const stepFor=k=>MOVE+(states[k].startsWith('group')?DWELL_GROUP:DWELL);
    // Lage im Layout relativ zur Buehne (transforms veraendern das Layout nicht)
    function natural(im){ let x=0,y=0,e=im; while(e&&e!==stage){ x+=e.offsetLeft; y+=e.offsetTop; e=e.offsetParent; } return {x,y,w:im.offsetWidth,h:im.offsetHeight}; }
    function target(dev,n){
      const W=stage.clientWidth, H=stage.clientHeight-44, asp=n.w/n.h;
      // Watch einzeln 360 px hoch (Gehaeuse gut 230 px, ueber Apples 200 px), die anderen wie bisher
      let h=Math.min(H-10, dev==='watch'?360:560), w=h*asp;
      if(w>W){ w=W; h=w/asp; }
      return {x:(W-w)/2, y:(H-h)/2, w, h};
    }
    function apply(){
      const st=states[i], grp=st==='groupA'?'A':st==='groupB'?'B':null;
      const stack=reduce()&&fitsB();
      stage.classList.toggle('stack',stack);
      stage.dataset.show = stack ? 'all' : (grp||'single');
      Object.entries(imgs).forEach(([dev,im])=>{
        if(stack){ im.style.transform=''; im.style.opacity=''; return; }
        // Gruppe: deren Geraete zeigt das CSS (am Handy ohne Mac), die andere Gruppe blendet weich aus
        if(grp){ im.style.transform=''; im.style.opacity = im.parentElement.dataset.grp===grp ? '' : '0'; return; }
        if(dev!==st){ im.style.transform=''; im.style.opacity='0'; return; }
        const n=natural(im), tg=target(dev,n), s=tg.w/n.w;
        im.style.transform='translate('+(tg.x-n.x)+'px,'+(tg.y-n.y)+'px) scale('+s+')';
        im.style.opacity='1';
        cap.style.top=Math.round(tg.y+tg.h+14)+'px';   // Name direkt unter dem Geraet, nicht dahinter
      });
      cap.classList.toggle('on', !grp && !stack);
      if(!grp) cap.textContent=NAMES[st];
    }
    // Gruppe B nur, wenn iPhone + Watch im gemeinsamen Massstab nebeneinander in die Buehne passen (sonst weglassen, nicht verkleinern)
    function fitsB(){
      const g=stage.querySelector('.grpB'), gap=parseFloat(getComputedStyle(g).columnGap)||0;
      return imgs.iphone.offsetWidth+imgs.watch.offsetWidth+gap <= stage.clientWidth;
    }
    // Ablauf: Gruppe A, Gruppe B, dann einzeln Mac, iPad, iPhone, Apple Watch
    function available(){
      const W=stage.clientWidth;
      const macH=W/(imgs.mac.naturalWidth/imgs.mac.naturalHeight||1600/966);
      return ['groupA', fitsB()&&'groupB', macH>=200&&'mac', 'ipad', 'iphone', 'watch'].filter(Boolean);   // Apple: einzeln mindestens 200 px
    }
    function labels(){
      pauseBtn.setAttribute('aria-label', mode==='run' ? (en()?'Pause switching':'Wechsel anhalten') : (en()?'Resume switching':'Wechsel fortsetzen'));
      cap.setAttribute('aria-live', mode==='run'?'off':'polite');
      rot.classList.toggle('paused', mode!=='run');
    }
    function arm(ms){ clearTimeout(tHandle); remain=ms; tStart=performance.now(); if(!suspended()) tHandle=setTimeout(()=>{ if(mode==='run') go(i+1); }, ms); }
    function freeze(){ if(tHandle){ clearTimeout(tHandle); tHandle=null; remain=Math.max(0, remain-(performance.now()-tStart)); } }
    function resume(){ if(mode==='run' && !suspended() && !tHandle) arm(remain); }
    function build(){
      states=available(); if(i>=states.length) i=0;
      dotsBox.innerHTML='';
      states.forEach((s,k)=>{const b=document.createElement('button');b.type='button';
        const nm=s==='groupA'?(en()?'Mac and iPad':'Mac und iPad'):s==='groupB'?(en()?'iPhone and Apple Watch':'iPhone und Apple Watch'):NAMES[s];
        b.setAttribute('aria-label',en()?('Show '+nm):(nm+' zeigen'));
        b.addEventListener('click',()=>{ mode='stop'; clearTimeout(tHandle); tHandle=null; go(k); });
        dotsBox.appendChild(b);});
      render();
    }
    function render(){
      if(reduce()){ i=0; mode='stop'; clearTimeout(tHandle); tHandle=null; }
      apply();
      [...dotsBox.children].forEach((b,k)=>b.setAttribute('aria-current',k===i?'true':'false'));
      labels();
      if(mode==='run' && states.length>1){ clearTimeout(tHandle); tHandle=null; remain=stepFor(i); tStart=performance.now(); if(!suspended()) arm(remain); }
    }
    function go(k){ i=(k+states.length)%states.length; render(); }
    pauseBtn.addEventListener('click',()=>{
      if(mode==='run'){ mode='hold'; freeze(); labels(); }
      else if(mode==='hold'){ mode='run'; labels(); resume(); }
      else { mode='run'; go(i+1); }
    });
    rot.addEventListener('mouseenter',()=>{ hov=true; freeze(); });
    rot.addEventListener('mouseleave',()=>{ hov=false; resume(); });
    rot.addEventListener('focusin',()=>{ foc=true; freeze(); });
    rot.addEventListener('focusout',e=>{ if(!rot.contains(e.relatedTarget)){ foc=false; resume(); } });
    let x0=null;
    stage.addEventListener('touchstart',e=>{x0=e.changedTouches[0].clientX;},{passive:true});
    stage.addEventListener('touchend',e=>{ if(x0===null) return; const dx=e.changedTouches[0].clientX-x0; x0=null;
      if(Math.abs(dx)>40){ mode='stop'; clearTimeout(tHandle); tHandle=null; go(i+(dx<0?1:-1)); } },{passive:true});
    document.addEventListener('visibilitychange',()=>{ document.hidden?freeze():resume(); });
    // Fenstergroesse geaendert: Ziel neu berechnen, ohne Bewegung
    let rz; addEventListener('resize',()=>{ stage.classList.add('no-anim'); const n=available().length; if(n!==states.length) build(); else apply();
      clearTimeout(rz); rz=setTimeout(()=>stage.classList.remove('no-anim'),50); });
    const mq=matchMedia('(prefers-reduced-motion: reduce)');
    (mq.addEventListener?mq.addEventListener('change',build):mq.addListener(build));
    window.devRotLang=()=>build();
    /* Owner 16.09.: „der Mac wird nicht einzeln angezeigt". Ursache gemessen: Kommt man ueber eine Unterseite
       (Kontakt, ShutterLife) auf die Startseite, ist die Buehne beim Start unsichtbar und 0 px breit. Dann fielen
       Mac einzeln UND „iPhone und Apple Watch" aus der Liste (6 → 4 Stationen), und der Seitenwechsel rechnete nicht
       neu. Jetzt: wird die Buehne sichtbar (0 → echte Breite), neu aufbauen, ohne Bewegung. */
    if('ResizeObserver' in window){
      let w0=stage.clientWidth;
      new ResizeObserver(()=>{ const w=stage.clientWidth;
        if(w0===0 && w>0){ stage.classList.add('no-anim'); build(); setTimeout(()=>stage.classList.remove('no-anim'),50); }
        w0=w; }).observe(stage);
    }
    if(imgs.mac.complete) build(); else imgs.mac.addEventListener('load',build,{once:true});
    addEventListener('load',()=>{ stage.classList.add('no-anim'); apply(); setTimeout(()=>stage.classList.remove('no-anim'),50); });
  })();
  // Darstellungs-Schalter (15.09.2026): System / Hell / Dunkel, Logik im Kopf (window.casyTheme)
  (function(){
    const btns=[...document.querySelectorAll('[data-theme-set]')];
    const sync=()=>btns.forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.themeSet===window.casyTheme.get())));
    btns.forEach(b=>b.addEventListener('click',()=>{ window.casyTheme.set(b.dataset.themeSet); sync(); }));
    btns.forEach(b=>b.addEventListener('pointerenter',()=>{ b.title=b.getAttribute('aria-label')||''; }));
    sync();
  })();

  /* ============ Fehler und Ausfaelle sichtbar machen (18.09.2026, Owner-Auftrag) ============
     Auf einer Seite ohne Server koennen vier Dinge schiefgehen: das Skript bricht ab (Knoepfe tot),
     das Netz fehlt (App-Store-Links), ein Bild fehlt, oder das Mailprogramm oeffnet nicht.
     Jeder Fall bekommt eine Rueckmeldung mit Ausweg. Nichts davon blockiert die Seite. */
  (function(){
    const en=()=>document.documentElement.lang==='en';
    let leiste, schliessTimer;
    function bauen(){
      if(leiste) return leiste;
      leiste=document.createElement('div');
      leiste.className='hinweis'; leiste.setAttribute('role','status'); leiste.setAttribute('aria-live','polite');
      leiste.innerHTML='<span class="txt"></span><button type="button" class="tun" hidden></button><button type="button" class="zu" aria-label="Schließen">&times;</button>';
      leiste.querySelector('.zu').addEventListener('click',()=>verbergen());
      document.body.appendChild(leiste);
      return leiste;
    }
    function verbergen(){ if(leiste) leiste.classList.remove('an'); clearTimeout(schliessTimer); }
    /* text: Meldung · aktion: {text, tun} oder null · dauer: ms, 0 = bleibt stehen */
    function zeigen(text, aktion, dauer){
      const l=bauen();
      l.querySelector('.txt').textContent=text;
      const knopf=l.querySelector('.tun');
      if(aktion){ knopf.hidden=false; knopf.textContent=aktion.text; knopf.onclick=aktion.tun; }
      else { knopf.hidden=true; knopf.onclick=null; }
      l.querySelector('.zu').setAttribute('aria-label', en()?'Dismiss':'Schließen');
      l.classList.add('an');
      clearTimeout(schliessTimer);
      if(dauer) schliessTimer=setTimeout(verbergen, dauer);
    }
    window.casyHinweis=zeigen;

    /* 1 · Skriptfehler: nur EINMAL melden, sonst haemmert eine kaputte Schleife den Nutzer zu */
    let schonGemeldet=false;
    function skriptfehler(){
      if(schonGemeldet) return; schonGemeldet=true;
      zeigen(en() ? 'Something on this page did not work. Reloading usually helps.'
                  : 'Etwas auf dieser Seite hat nicht funktioniert. Meist hilft ein Neuladen.',
             {text: en()?'Reload':'Neu laden', tun:()=>location.reload()}, 0);
    }
    addEventListener('error', e=>{ if(e && e.target && e.target!==window) return; skriptfehler(); }, true);
    addEventListener('unhandledrejection', skriptfehler);

    /* 2 · Kein Netz: die Seite laeuft weiter, App Store und QR brauchen aber eine Verbindung */
    function netzlage(){
      if(navigator.onLine===false){
        zeigen(en() ? 'No internet connection. The page keeps working, links to the App Store do not.'
                    : 'Keine Internetverbindung. Die Seite funktioniert weiter, Links zum App Store nicht.', null, 0);
      } else verbergen();
    }
    addEventListener('offline', netzlage); addEventListener('online', netzlage);
    if(navigator.onLine===false) netzlage();

    /* 3 · Bild fehlt: ruhige Flaeche mit dem Alternativtext statt kaputtem Symbol */
    addEventListener('error', e=>{
      const el=e.target;
      if(!el || el.tagName!=='IMG' || el.dataset.fehltBehandelt) return;
      el.dataset.fehltBehandelt='1';
      const txt=el.getAttribute('alt');
      el.classList.add('fehlt');
      el.removeAttribute('src');
      el.setAttribute('role','img');
      el.setAttribute('aria-label', txt || (en()?'Image could not be loaded':'Bild konnte nicht geladen werden'));
    }, true);

    /* 4 · Mail-Knopf: ohne eingerichtetes Mailprogramm passiert sonst gar nichts */
    document.addEventListener('click', e=>{
      const a=e.target.closest && e.target.closest('a[href^="mailto:"]');
      if(!a) return;
      const adresse=decodeURIComponent(a.getAttribute('href').slice(7).split('?')[0]);
      setTimeout(()=>{
        zeigen(en() ? 'Your mail app should have opened. If not, write to '+adresse
                    : 'Dein Mailprogramm sollte sich geöffnet haben. Falls nicht, schreib an '+adresse,
               {text: en()?'Copy address':'Adresse kopieren', tun:()=>{
                  const fertig=()=>zeigen(en()?'Address copied.':'Adresse kopiert.', null, 2600);
                  const misslungen=()=>zeigen((en()?'Copying did not work. The address is ':'Kopieren hat nicht geklappt. Die Adresse lautet ')+adresse, null, 7000);
                  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(adresse).then(fertig, misslungen);
                  else misslungen();
               }}, 9000);
      }, 800);
    });
  })();
