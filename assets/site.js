/* ============ DIGIKEDI — shared site JS ============ */
(function () {
  /* ---- Header scroll state ---- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile nav ---- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('x');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* ---- Scroll reveal + counters (rAF/scroll based for reliability) ---- */
  const fmt = (n) => n.toLocaleString('tr-TR');
  const countUp = (el) => {
    if (el.dataset.done) return; el.dataset.done = '1';
    const target = parseInt(el.dataset.count, 10);
    const dur = 1500; const start = performance.now();
    const step = (t) => {
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = fmt(Math.floor(eased * target));
      if (p < 1) requestAnimationFrame(step);
      else el.firstChild.nodeValue = fmt(target);
    };
    requestAnimationFrame(step);
    // Safety net: timers fire even when rAF is throttled/frozen, so the
    // final value is always shown regardless of render state.
    setTimeout(() => { el.firstChild.nodeValue = fmt(target); }, dur + 250);
  };

  const reveals = Array.from(document.querySelectorAll('.reveal'));
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  const vhNow = () => window.innerHeight || document.documentElement.clientHeight;

  // On load: anything already in the initial viewport is shown instantly (no anim → capture-safe).
  // Only elements scrolled into view later get the entrance animation.
  reveals.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < vhNow() * 0.95) el.dataset.seen = '1';
  });

  const check = () => {
    const vh = vhNow();
    reveals.forEach(el => {
      if (el.dataset.seen) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.88 && r.bottom > 0) { el.dataset.seen = '1'; el.classList.add('in'); setTimeout(() => el.classList.add('done'), 850); }
    });
    counters.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.85 && r.bottom > 0) countUp(el);
    });
  };
  check();
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', check);
  window.addEventListener('load', check);
  setTimeout(check, 300);
  // Counters: fallback trigger that doesn't depend on a window scroll event
  // (some embeds lay the page out at full height and never scroll the window).
  setTimeout(() => counters.forEach(countUp), 600);

  /* ---- Language toggle (TR / EN) ---- */
  const KEY = 'digikedi-lang';
  const setLang = (lang) => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
      if (el.dataset.tr === undefined) el.dataset.tr = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.tr;
    });
    document.querySelectorAll('[data-en-ph]').forEach(el => {
      if (el.dataset.trPh === undefined) el.dataset.trPh = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPh : el.dataset.trPh);
    });
    document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  };
  document.querySelectorAll('.lang-toggle button').forEach(b => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  let saved = 'tr';
  try { saved = localStorage.getItem(KEY) || 'tr'; } catch (e) {}
  setLang(saved);

  /* ---- Contact form (demo) ---- */
  const form = document.querySelector('form[data-demo]');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const lang = document.documentElement.lang;
      btn.textContent = lang === 'en' ? 'Sent ✓' : 'Gönderildi ✓';
      btn.style.background = 'var(--mint)';
      btn.style.color = 'var(--ink)';
      form.reset();
      setTimeout(() => {
        btn.textContent = lang === 'en' ? 'Send message' : 'Mesajı gönder';
        btn.style.background = '';
        btn.style.color = '';
      }, 2600);
    });
  }
})();
