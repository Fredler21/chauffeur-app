/* ==========================================================
   ROLLER.JS — Infinite-scroll driver roller (duplicates cards)
   ========================================================== */
(() => {
  'use strict';

  const track = document.getElementById('rollerTrack');
  if (!track) return;

  // Duplicate cards 3x for seamless infinite loop
  const cards = track.innerHTML;
  track.innerHTML = cards + cards + cards;
})();
