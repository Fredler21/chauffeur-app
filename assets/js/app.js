/* ==========================================================
   APP.JS — Core utilities: loader, dark-mode, navbar, toasts, reveals
   ========================================================== */
(() => {
  'use strict';

  /* ── Page Loader ── */
  const loader = document.getElementById('pageLoader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hide'), 400);
    });
  }

  /* ── Dark Mode Toggle ── */
  const dmToggle = document.getElementById('dmToggle');
  const saved = localStorage.getItem('theme');
  // Default is dark (no class). Light adds .is-light to body + toggle
  function applyTheme(light) {
    document.body.classList.toggle('is-light', light);
    if (dmToggle) dmToggle.classList.toggle('is-light', light);
  }
  applyTheme(saved === 'light');
  dmToggle?.addEventListener('click', () => {
    const goLight = !document.body.classList.contains('is-light');
    applyTheme(goLight);
    localStorage.setItem('theme', goLight ? 'light' : 'dark');
  });

  /* ── Mobile Menu ── */
  const burger = document.getElementById('navBurger');
  const links  = document.getElementById('navLinks');
  burger?.addEventListener('click', () => {
    burger.classList.toggle('open');
    links?.classList.toggle('is-open');
  });

  /* ── Reveal on Scroll ── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ── Footer Year ── */
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── Toast System ── */
  window.showToast = function(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.textContent = message;
    container.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(30px)'; setTimeout(() => t.remove(), 300); }, duration);
  };

})();
