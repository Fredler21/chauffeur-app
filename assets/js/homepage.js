/* ==========================================================
   HOMEPAGE.JS — Showcase interactions + Driver Profile Modal
   No selection logic — homepage is purely editorial/showcase.
   Users must click "Continue Booking" to access booking flow.
   ========================================================== */
(() => {
  'use strict';

  /* ══════════════════════════════════════════
     DRIVER DATA — Full profiles & reviews
     ══════════════════════════════════════════ */
  const driverProfiles = {
    fredler: {
      photo: 'assets/images/drivers/driver1.jpg',
      name: 'Fredler G. Pierre-Louis (Freddy)',
      title: 'Most Experienced Chauffeur · 3 Languages',
      rating: '5.0',
      rides: '150',
      years: '7+',
      background: 'Fredler is the most experienced chauffeur on the team with over 7 years of professional driving across Uber, Lyft, and private clients. Fluent in English, French, and Haitian Creole, he brings world-class communication to every ride. Fredler holds a clean commercial driving record, is fully background-checked, and maintains the highest safety standards. His clients describe him as punctual, discreet, and effortlessly professional — the kind of driver who anticipates your needs before you even think of them. Whether it\'s a high-stakes airport transfer or a late-night event pickup, Fredler delivers a flawless experience every single time.',
      whyDrive: '"I believe every person deserves to feel important. When someone gets in my car, they\'re not just a passenger — they\'re my guest. I take pride in making sure they arrive feeling valued, relaxed, and on time. That\'s not just my job — it\'s who I am."',
      reviews: [
        { stars: 5, text: '"Fredler is in a league of his own. Impeccable timing, immaculate vehicle, and a level of professionalism I\'ve never experienced with any other service. He made a stressful travel day feel effortless."', author: 'Marcus T., Boca Raton', date: 'Feb 2026' },
        { stars: 5, text: '"I book Fredler for every business trip now. The car is always spotless, he\'s always early, and he handles everything with such grace. My colleagues thought I had a personal driver — that\'s the level of service he provides."', author: 'Angela M., Miami', date: 'Jan 2026' },
        { stars: 5, text: '"Fredler picked us up from FLL at midnight and still had cold water ready and the car at the perfect temperature. He speaks French, which was a huge plus for my parents visiting from Haiti. Truly exceptional."', author: 'Jean-Pierre L., Coral Springs', date: 'Jan 2026' },
        { stars: 5, text: '"We used Fredler for our wedding day transportation. He was impeccable — suited up, doors opened, route timed perfectly. Our guests couldn\'t stop talking about the chauffeur experience. Worth every penny."', author: 'Sarah & Michael W., Parkland', date: 'Dec 2025' },
        { stars: 5, text: '"I\'ve ridden with Uber Black hundreds of times. Fredler is better. No exaggeration. The professionalism, the vehicle condition, the entire experience — it\'s on another level."', author: 'David K., Fort Lauderdale', date: 'Nov 2025' }
      ]
    },
    sebastien: {
      photo: 'assets/images/drivers/driver2.jpg',
      name: 'Sebastien Jouthe (Babas)',
      title: 'Senior Chauffeur · HVAC Certified',
      rating: '5.0',
      rides: '123',
      years: '3+',
      location: 'Massachusetts — Boston · Randolph · Brockton · Taunton',
      background: 'Sebastien brings a unique blend of technical expertise and genuine hospitality to every ride. A certified HVAC professional turned chauffeur, he approaches driving with the same precision he brings to everything — meticulous climate control, perfectly planned routes, and zero tolerance for delays. Based in the greater Boston area, Sebastien serves clients across Randolph, Brockton, Taunton, and surrounding Massachusetts communities. He is fully licensed, insured, and background-checked. Known for his calm demeanor and natural warmth, he has a gift for making even the most time-pressed executives feel at ease. Note: Sebastien is not available for Florida trips.',
      whyDrive: '"For me, driving isn\'t just about getting from A to B — it\'s about creating a moment of peace in someone\'s day. Whether it\'s a stressful business trip or a celebration, I want my clients to sit back and know everything is handled. That peace of mind is what I deliver."',
      reviews: [
        { stars: 5, text: '"Sebastien turned a simple ride into a premium experience. He had the car at the perfect temperature, opened every door, and handled our luggage with care. Truly five-star service from start to finish."', author: 'Camille & David R., Randolph, MA', date: 'Feb 2026' },
        { stars: 5, text: '"Babas is the real deal. I was running late for a flight out of Logan and he had already mapped out the fastest route from Brockton. Got me there with time to spare. Calm, collected, and completely professional."', author: 'Robert N., Brockton, MA', date: 'Jan 2026' },
        { stars: 5, text: '"Hired Sebastien for a corporate client visit in Boston. He greeted our guests by name, had refreshments ready, and drove with absolute smoothness. Our clients were blown away. He made us look incredible."', author: 'Patricia H., Boston, MA', date: 'Dec 2025' },
        { stars: 5, text: '"What sets Sebastien apart is the little things — the temperature already perfect when you get in, the smooth acceleration, the fact that he remembers your preferences from the last ride. That\'s luxury."', author: 'Thomas G., Taunton, MA', date: 'Nov 2025' },
        { stars: 5, text: '"We booked Sebastien for our anniversary dinner in Boston. He arrived early, had soft jazz playing, and timed everything perfectly. It wasn\'t just a ride — it was the start of a perfect evening."', author: 'Michelle & Andre K., Randolph, MA', date: 'Oct 2025' }
      ]
    },
    nason: {
      photo: 'assets/images/drivers/driver3.jpg',
      name: 'Nason Valcin (Napo)',
      title: 'Elite Chauffeur · 4+ Years',
      rating: '5.0',
      rides: '99',
      years: '4+',
      background: 'Nason is a rising star who has earned a loyal following in record time. With 4+ years of professional driving experience and nearly 100 rides completed, he combines razor-sharp punctuality with a natural gift for hospitality. Nason is fully licensed, insured, and background-checked. He knows every route in South Florida like the back of his hand, from rush-hour shortcuts to the smoothest airport approaches. Clients regularly request him by name, drawn to his warm professionalism, silky-smooth driving style, and the extra effort he puts into every single trip. Whether it\'s a dawn airport run or a late-night event, Nason delivers with precision and grace.',
      whyDrive: '"There\'s nothing more rewarding than earning someone\'s trust. My clients rely on me to be there — no excuses, no delays. That responsibility is what keeps me sharp every single day. I don\'t just want to be on time — I want to be the best part of their day."',
      reviews: [
        { stars: 5, text: '"Nason is the definition of dependable. Eight business trips and counting — always early, always professional, always a step ahead. I won\'t ride with anyone else."', author: 'Jonathan H., Coral Springs', date: 'Feb 2026' },
        { stars: 5, text: '"Napo is incredible. I had a 5 AM flight and he was already waiting outside at 3:45 AM with the car warmed up. Zero stress, zero rushing. Just pure professionalism. My go-to driver from now on."', author: 'Kevin S., Coconut Creek', date: 'Jan 2026' },
        { stars: 5, text: '"I was nervous booking a chauffeur for the first time, but Nason put me completely at ease. He was friendly, professional, and his driving was so smooth I almost fell asleep. Highest recommendation."', author: 'Lisa M., Pompano Beach', date: 'Jan 2026' },
        { stars: 5, text: '"Nason drove our family of five to a wedding in Palm Beach. He was patient with our kids, helped with all the bags, and had the SUV immaculate. The whole family loved him."', author: 'The Williams Family, Tamarac', date: 'Dec 2025' },
        { stars: 5, text: '"Booked Nason for a night out with friends. He recommended the best route to avoid traffic, was right there when we called for pickup, and even had phone chargers ready. This is what premium service looks like."', author: 'Chris A., Sunrise', date: 'Nov 2025' }
      ]
    }
  };

  /* ══════════════════════════════════════════
     DRIVER SHOWCASE CARDS — Subtle entrance animation
     ══════════════════════════════════════════ */
  const showcaseCards = document.querySelectorAll('.driver-showcase-card');

  if (showcaseCards.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, idx * 120);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    showcaseCards.forEach(card => observer.observe(card));
  }

  /* ══════════════════════════════════════════
     DRIVER PROFILE MODAL
     ══════════════════════════════════════════ */
  const modalBackdrop = document.getElementById('driverModal');
  const modalClose    = document.getElementById('dpModalClose');
  const dpPhoto       = document.getElementById('dpPhoto');
  const dpName        = document.getElementById('dpName');
  const dpTitle       = document.getElementById('dpTitle');
  const dpRating      = document.getElementById('dpRating');
  const dpRides       = document.getElementById('dpRides');
  const dpYears       = document.getElementById('dpYears');
  const dpBackground  = document.getElementById('dpBackground');
  const dpWhyDrive    = document.getElementById('dpWhyDrive');
  const dpReviews     = document.getElementById('dpReviews');

  function openDriverModal(driverId) {
    const d = driverProfiles[driverId];
    if (!d || !modalBackdrop) return;

    dpPhoto.src = d.photo;
    dpPhoto.alt = d.name;
    dpName.textContent = d.name;
    dpTitle.textContent = d.title;
    dpRating.textContent = d.rating;
    dpRides.textContent = d.rides;
    dpYears.textContent = d.years;
    dpBackground.textContent = d.background;
    dpWhyDrive.textContent = d.whyDrive;

    // Build reviews
    dpReviews.innerHTML = d.reviews.map(r => `
      <div class="dp-review-card">
        <div class="dp-review-top">
          <span class="dp-review-stars">${'★'.repeat(r.stars)}</span>
          <span class="dp-review-date">${r.date}</span>
        </div>
        <p class="dp-review-text">${r.text}</p>
        <div class="dp-review-author">— ${r.author}</div>
      </div>
    `).join('');

    modalBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Scroll modal to top
    const modalEl = modalBackdrop.querySelector('.dp-modal');
    if (modalEl) modalEl.scrollTop = 0;
  }

  function closeDriverModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  // Card click handlers
  showcaseCards.forEach(card => {
    const driverId = card.dataset.driver;
    if (!driverId) return;
    card.addEventListener('click', () => openDriverModal(driverId));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDriverModal(driverId); }
    });
  });

  // Close handlers
  if (modalClose) modalClose.addEventListener('click', closeDriverModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', e => {
      if (e.target === modalBackdrop) closeDriverModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDriverModal();
  });

  /* ══════════════════════════════════════════
     PREMIUM CTA — Subtle glow pulse on scroll into view
     ══════════════════════════════════════════ */
  const ctaBtn = document.querySelector('.cta-premium-btn');
  if (ctaBtn) {
    const ctaObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          ctaBtn.classList.add('glow-pulse');
          ctaObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    ctaObserver.observe(ctaBtn);
  }

  /* ══════════════════════════════════════════
     COUNTER ANIMATION — Stats section + ride counts
     ══════════════════════════════════════════ */
  function animateCounters(selector) {
    const counters = document.querySelectorAll(selector);
    if (!counters.length) return;
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const suffix = el.dataset.suffix || '';
          const duration = 1600;
          const startTime = performance.now();

          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(target * eased).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => counterObserver.observe(c));
  }

  animateCounters('.stat-number[data-count]');
  animateCounters('.dsc-rides-number[data-count]');

})();
