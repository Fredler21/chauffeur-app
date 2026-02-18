/* ==========================================================
   CAROUSEL.JS — Prev/Next, Dots, Swipe, Mouse-drag, Autoplay
   ========================================================== */
(() => {
  'use strict';

  const track = document.querySelector('[data-carousel-track]');
  if (!track) return;

  const slides  = track.querySelectorAll('.slide');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const dots    = document.querySelectorAll('[data-dot]');
  const total   = slides.length;
  let current   = 0;
  let autoTimer = null;

  function goTo(i) {
    if (i < 0) i = total - 1;
    if (i >= total) i = 0;
    current = i;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn?.addEventListener('click', () => { prev(); resetAuto(); });
  nextBtn?.addEventListener('click', () => { next(); resetAuto(); });

  dots.forEach(d => d.addEventListener('click', () => {
    goTo(Number(d.getAttribute('data-dot')));
    resetAuto();
  }));

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  /* Touch swipe */
  let sx = 0, sy = 0, dragging = false;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dragging = true; }, { passive: true });
  track.addEventListener('touchmove', e => {
    if (!dragging) return;
    const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) e.preventDefault();
  }, { passive: false });
  track.addEventListener('touchend', e => {
    if (!dragging) return; dragging = false;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
  }, { passive: true });

  /* Mouse drag */
  let mx = 0, mDown = false;
  track.addEventListener('mousedown', e => { mx = e.clientX; mDown = true; track.style.cursor = 'grabbing'; });
  window.addEventListener('mouseup', e => {
    if (!mDown) return; mDown = false; track.style.cursor = '';
    const dx = e.clientX - mx;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
  });
  track.querySelectorAll('img').forEach(img => img.addEventListener('dragstart', e => e.preventDefault()));

  /* Autoplay */
  function startAuto() { stopAuto(); autoTimer = setInterval(next, 5000); }
  function stopAuto()  { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  function resetAuto() { stopAuto(); startAuto(); }
  document.addEventListener('visibilitychange', () => document.hidden ? stopAuto() : startAuto());

  goTo(0);
  startAuto();
})();
