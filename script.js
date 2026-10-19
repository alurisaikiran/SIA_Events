/*
══════════════════════════════════════════════════════════════
  SIA EVENTS — Script v2
  • Video only in hero header
  • Scroll drives hero video parallax drift
  • CSS background-attachment:fixed handles section parallax
  • Reveal, counters, testimonials, form
══════════════════════════════════════════════════════════════
*/

"use strict";

/* ════════════════════════════════════════════════════════════
   STICKY NAV
════════════════════════════════════════════════════════════ */
(function () {
  const nav = document.getElementById('siteNav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
})();


/* ════════════════════════════════════════════════════════════
   HAMBURGER
════════════════════════════════════════════════════════════ */
(function () {
  const btn   = document.getElementById('burger');
  const links = document.getElementById('navCenter');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }));
})();


/* ════════════════════════════════════════════════════════════
   HERO VIDEO — SCROLL PARALLAX DRIFT
   The video stays ONLY in the hero section.
   As you scroll DOWN, the video drifts downward (parallax).
   This gives the "motion when scrolling" effect in the header.
════════════════════════════════════════════════════════════ */
(function () {
  const video = document.getElementById('heroVid');
  const hero  = document.querySelector('.hero');
  if (!video || !hero) return;

  function onScroll() {
    const scrollY = window.scrollY;
    const heroH   = hero.offsetHeight;

    // Stop once the hero is fully off screen
    if (scrollY > heroH) return;

    // Drift the video downward as user scrolls.
    // scale(1.12) in CSS gives ~6% buffer on every edge (~54px for 900px hero).
    // Cap drift at 50px so we never expose a gap — keep scale + drift in sync.
    const drift = Math.min(scrollY * 0.18, 50);
    video.style.transform = `scale(1.12) translateY(${drift}px)`;

    // Gently fade + lift the hero text as user scrolls away
    const progress = scrollY / heroH;
    const body = hero.querySelector('.hero-body');
    if (body) {
      body.style.opacity   = Math.max(0, 1 - progress * 2.4).toString();
      body.style.transform = `translateY(${scrollY * 0.12}px)`;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ════════════════════════════════════════════════════════════
   SECTION BACKGROUNDS — EXTRA JS PARALLAX
   CSS background-attachment:fixed already gives natural parallax.
   This JS layer adds an extra subtle transform for richer motion.
════════════════════════════════════════════════════════════ */
(function () {
  const bgs = document.querySelectorAll('.img-section-bg');
  if (!bgs.length) return;

  // Detect iOS where fixed attachment is broken
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    // On iOS: fall back to JS-only parallax (fixed bg already set to scroll in CSS media query)
    bgs.forEach(bg => { bg.style.backgroundAttachment = 'scroll'; });
  }

  function onScroll() {
    const sy = window.scrollY;
    const vh = window.innerHeight;

    bgs.forEach(bg => {
      const section = bg.closest('.img-section');
      if (!section) return;
      const rect = section.getBoundingClientRect();

      // Only process when section is near/in viewport
      if (rect.bottom < -100 || rect.top > vh + 100) return;

      if (isIOS) {
        // iOS: background-attachment:fixed is unsupported — simulate with backgroundPosition
        const progress = (vh - rect.top) / (vh + rect.height);
        const yPct = 20 + progress * 60; // shift from 20% to 80%
        bg.style.backgroundPosition = `center ${yPct}%`;
      }
      // Desktop: CSS fixed attachment handles parallax natively
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ════════════════════════════════════════════════════════════
   SCROLL REVEAL
════════════════════════════════════════════════════════════ */
(function () {
  const els = document.querySelectorAll('.js-reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.dataset.delay) || 0;
      setTimeout(() => e.target.classList.add('visible'), delay);
      observer.unobserve(e.target);
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════════════════
   COUNTER ANIMATION
════════════════════════════════════════════════════════════ */
(function () {
  const counts = document.querySelectorAll('.count[data-to]');
  if (!counts.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = +el.dataset.to;
      const dur    = 1600;
      const t0     = performance.now();

      function tick(now) {
        const progress = Math.min((now - t0) / dur, 1);
        const ease     = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counts.forEach(c => observer.observe(c));
})();


/* ════════════════════════════════════════════════════════════
   TESTIMONIALS CAROUSEL
════════════════════════════════════════════════════════════ */
(function () {
  const cards = document.querySelectorAll('.tcard');
  const dots  = document.querySelectorAll('.td');
  const prev  = document.getElementById('tPrev');
  const next  = document.getElementById('tNext');
  if (!cards.length) return;

  let cur   = 0;
  let timer = null;

  function show(n) {
    cards[cur].classList.remove('active');
    dots[cur].classList.remove('active');
    cur = (n + cards.length) % cards.length;
    cards[cur].classList.add('active');
    dots[cur].classList.add('active');
  }

  function autoPlay() {
    timer = setInterval(() => show(cur + 1), 5000);
  }
  function resetTimer() {
    clearInterval(timer);
    autoPlay();
  }

  prev  && prev.addEventListener('click',  () => { show(cur - 1); resetTimer(); });
  next  && next.addEventListener('click',  () => { show(cur + 1); resetTimer(); });
  dots.forEach(d => d.addEventListener('click', () => { show(+d.dataset.i || [].indexOf.call(dots, d)); resetTimer(); }));

  // Fix dot index
  dots.forEach((d, i) => d.dataset.i = i);

  // Touch swipe
  let sx = 0;
  const wrap = document.querySelector('.testi-wrap');
  if (wrap) {
    wrap.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend',   e => {
      const dx = sx - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 50) { show(dx > 0 ? cur + 1 : cur - 1); resetTimer(); }
    }, { passive: true });
  }

  autoPlay();
})();


/* ════════════════════════════════════════════════════════════
   CONTACT FORM
════════════════════════════════════════════════════════════ */
(function () {
  const form    = document.getElementById('cForm');
  const btn     = document.getElementById('cSubmit');
  const success = document.getElementById('fSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }

    setTimeout(() => {
      if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; }
      if (success) success.classList.add('show');
      form.reset();
      setTimeout(() => success && success.classList.remove('show'), 5000);
    }, 1200);
  });
})();


/* ════════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL
════════════════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('siteNav')?.offsetHeight || 70;
      const y    = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();


/* ════════════════════════════════════════════════════════════
   SERVICE ROW HOVER — underline effect already in CSS,
   but add a class for enhanced styling if needed
════════════════════════════════════════════════════════════ */
(function () {
  document.querySelectorAll('.svc-row').forEach(row => {
    row.addEventListener('mouseenter', () => row.classList.add('hovered'));
    row.addEventListener('mouseleave', () => row.classList.remove('hovered'));
  });
})();
