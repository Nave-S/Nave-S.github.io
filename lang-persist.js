/* Casy Studio — Sprachpersistenz für Sub-Pages mit separaten EN/DE-Files.
   Verhalten:
   - Klick auf EN/DE im .lang-switch speichert die Wahl in localStorage.
   - Beim Page-Load: wenn die gespeicherte Sprache von der aktuellen URL abweicht,
     wird automatisch zur passenden Variante redirected.
   - localStorage-Key 'casy_lang' wird mit dem root index.html geteilt. */
(function () {
    var KEY = 'casy_lang';

    function getStored() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; }
    }
    function setStored(lang) {
        try { localStorage.setItem(KEY, lang); } catch (e) {}
    }

    var path = location.pathname;
    var fileName = path.split('/').pop();
    var isDePage = fileName === 'de.html';
    var saved = getStored();

    // Auto-redirect EN → DE if user prefers DE
    if (!isDePage && saved === 'de') {
        var deUrl = null;
        if (path.endsWith('/')) deUrl = path + 'de.html';
        else if (fileName === 'index.html') deUrl = path.slice(0, -'index.html'.length) + 'de.html';
        if (deUrl) { location.replace(deUrl); return; }
    }

    // Auto-redirect DE → EN if user explicitly prefers EN
    if (isDePage && saved === 'en') {
        var enUrl = path.slice(0, -'de.html'.length);
        if (enUrl) { location.replace(enUrl); return; }
    }

    // First visit on a DE page implies preference DE; mirror for EN
    if (saved === null) {
        setStored(isDePage ? 'de' : 'en');
    }

    // Update preference when user clicks language switcher
    document.addEventListener('DOMContentLoaded', function () {
        var links = document.querySelectorAll('.lang-switch a');
        links.forEach(function (link) {
            link.addEventListener('click', function () {
                var href = (link.getAttribute('href') || '').trim();
                var newLang = (href === 'de.html' || href.endsWith('/de.html')) ? 'de' : 'en';
                setStored(newLang);
            });
        });
    });
})();
