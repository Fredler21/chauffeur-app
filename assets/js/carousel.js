(() => {
  /* ===== CAROUSEL — prev / next / dots / swipe / autoplay ===== */

  const track = document.querySelector('[data-carousel-track]');
  if (!track) return;                       // not on a page with a carousel

  const slides = track.querySelectorAll('.slide');
  const prevBtn = document.querySelector('[data-carousel-prev]');
  const nextBtn = document.querySelector('[data-carousel-next]');
  const dots = document.querySelectorAll('[data-dot]');
  const total = slides.length;
  let current = 0;
  let autoTimer = null;

  /* ---- core navigation ---- */
  function goTo(index) {
    if (index < 0) index = total - 1;
    if (index >= total) index = 0;
    current = index;

    track.style.transform = `translateX(-${current * 100}%)`;

    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* ---- button clicks ---- */
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  /* ---- dot clicks ---- */
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.getAttribute('data-dot')));
      resetAuto();
    });
  });

  /* ---- keyboard (when carousel is focused / visible) ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });

  /* ---- touch / swipe support ---- */
  let startX = 0;
  let startY = 0;
  let dragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    dragging = true;
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    /* prevent vertical scroll while swiping horizontally */
    if (!dragging) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      e.preventDefault();
    }
  }, { passive: false });

  track.addEventListener('touchend', (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) {          // min swipe distance
      dx < 0 ? next() : prev();
      resetAuto();
    }
  }, { passive: true });

  /* ---- mouse drag (desktop) ---- */
  let mouseStartX = 0;
  let mouseDown = false;

  track.addEventListener('mousedown', (e) => {
    mouseStartX = e.clientX;
    mouseDown = true;
    track.style.cursor = 'grabbing';
  });

  window.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    track.style.cursor = '';
    const dx = e.clientX - mouseStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
      resetAuto();
    }
  });

  /* prevent ghost image on drag */
  track.querySelectorAll('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  /* ---- autoplay (every 5 s) ---- */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, 5000);
  }

  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function resetAuto() {
    stopAuto();
    startAuto();
  }

  /* pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAuto() : startAuto();
  });

  /* ---- init ---- */
  goTo(0);
  startAuto();
})();
