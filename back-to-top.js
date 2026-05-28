/* Casy Studio — Back-to-Top button for long legal/info sub-pages.
   Behavior:
   - Fades in after ~200px scroll, hides at top
   - Smooth scroll to top on click
   - Respects prefers-reduced-motion (no smooth, no fade transition)
   - Keyboard accessible (visible focus ring via :focus-visible in CSS)
   - localStorage-free; coexists with /lang-persist.js without conflict */
(function () {
    var SHOW_THRESHOLD = 200;
    var btn = null;
    var ticking = false;
    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setVisible(show) {
        if (!btn) return;
        if (show) btn.classList.add('is-visible');
        else btn.classList.remove('is-visible');
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () {
            setVisible(window.scrollY > SHOW_THRESHOLD);
            ticking = false;
        });
    }

    function onClick(event) {
        event.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: reducedMotion ? 'auto' : 'smooth'
        });
        // Move keyboard focus back to top so tab order resumes from there.
        var skipLink = document.querySelector('.skip-link');
        var topTarget = skipLink || document.querySelector('header') || document.body;
        if (topTarget && typeof topTarget.focus === 'function') {
            try { topTarget.focus({ preventScroll: true }); } catch (e) { topTarget.focus(); }
        }
    }

    function init() {
        btn = document.querySelector('[data-back-to-top]');
        if (!btn) return;
        btn.addEventListener('click', onClick);
        window.addEventListener('scroll', onScroll, { passive: true });
        // Initial state in case the page loaded already scrolled (anchor link).
        setVisible(window.scrollY > SHOW_THRESHOLD);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
