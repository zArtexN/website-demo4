/* Suray Nail Studio — premium interactions
   Vanilla JS. All libraries optional with graceful fallback. No console errors. */
(function () {
  'use strict';
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 820px)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  var hasSplit = typeof window.SplitType !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  /* ---------- Lucide ---------- */
  try {
    if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
  } catch (e) { /* noop */ }

  /* ---------- Nav ---------- */
  var nav = document.getElementById('nav');
  var menuBtn = document.querySelector('[data-menu]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  function onScrollNav() {
    if (!nav) return;
    nav.classList.toggle('scrolled', (window.scrollY || 0) > 40);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Lenis + GSAP sync ---------- */
  var lenis = null;
  try {
    if (hasLenis && !prefersReduced) {
      lenis = new window.Lenis({ duration: 1.25, smoothWheel: true });
      if (hasST) {
        lenis.on('scroll', function () {
          if (window.ScrollTrigger) window.ScrollTrigger.update();
        });
        if (window.gsap && window.gsap.ticker) {
          window.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
          window.gsap.ticker.lagSmoothing(0);
        } else {
          (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
        }
      } else {
        (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
      }
      // Anchor links via Lenis
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (ev) {
          var id = a.getAttribute('href');
          if (id.length > 1) {
            var el = document.querySelector(id);
            if (el) { ev.preventDefault(); lenis.scrollTo(el, { offset: -60 }); }
          }
        });
      });
    }
  } catch (e) { lenis = null; }
  if (hasST) { try { window.gsap.registerPlugin(window.ScrollTrigger); } catch (e) {} }

  /* ---------- Hero scroll-driven video (rAF) ---------- */
  var video = document.getElementById('heroVideo');
  var hero = document.querySelector('[data-hero]');
  var progress = document.getElementById('progressBar');
  var captionIndex = document.getElementById('captionIndex');
  var heroCaption = document.getElementById('heroCaption');
  var captions = ['Özenli bakım.', 'Temiz ve titiz.', 'Detay odaklı.', 'Size özel.', 'Suray dokunuşu.'];
  var targetTime = 0, displayedTime = 0, lastCaption = -1, videoReady = false;

  if (video) {
    video.muted = true;
    try { video.pause(); } catch (e) {}
    var markReady = function () {
      videoReady = true;
      video.classList.add('ready');
      try { if (video.duration) video.currentTime = 0; } catch (e) {}
    };
    video.addEventListener('canplay', markReady, { once: true });
    video.addEventListener('loadedmetadata', function () {
      try { video.currentTime = 0; } catch (e) {}
    });
    video.addEventListener('error', function () {
      video.classList.remove('ready');
      videoReady = false;
    });
    // Mobile: don't scrub video aggressively; show poster + play muted loop fallback
    if (isMobile) {
      video.setAttribute('preload', 'none');
      videoReady = false;
    }
    // Timeout fallback: if video never loads, keep image fallback visible (no error)
    setTimeout(function () {
      if (!videoReady) video.classList.remove('ready');
    }, 6000);
  }

  function heroProgress() {
    if (!hero) return 0;
    var max = Math.max(1, hero.offsetHeight - window.innerHeight);
    var top = hero.getBoundingClientRect().top;
    var p = Math.min(1, Math.max(0, -top / max));
    return p;
  }
  function updateTarget() {
    var p = heroProgress();
    if (video && video.duration && videoReady && !prefersReduced && !isMobile) {
      targetTime = Math.min(video.duration - 0.05, Math.max(0, p * video.duration));
    }
    if (progress) progress.style.width = (p * 100).toFixed(2) + '%';
    var idx = Math.min(captions.length - 1, Math.floor(p * captions.length));
    if (idx !== lastCaption && captionIndex && heroCaption) {
      lastCaption = idx;
      captionIndex.textContent = String(idx + 1).padStart(2, '0');
      heroCaption.textContent = captions[idx];
    }
    return p;
  }
  function queueSeek() {
    if (!video || !videoReady || prefersReduced || isMobile) return;
    if (!video.duration) return;
    var delta = targetTime - displayedTime;
    if (Math.abs(delta) < 0.03) {
      if (displayedTime !== targetTime) {
        displayedTime = targetTime;
        try { video.currentTime = displayedTime; } catch (e) {}
      }
      return;
    }
    displayedTime += delta * 0.18;
    try { video.currentTime = displayedTime; } catch (e) {}
  }
  (function raf() { updateTarget(); queueSeek(); requestAnimationFrame(raf); })();

  /* ---------- Reveal fallback (no GSAP) ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (!hasST || prefersReduced) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { threshold: 0.12 });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- GSAP premium animations ---------- */
  if (hasGSAP && hasST && !prefersReduced) {
    var gsap = window.gsap;

    // SplitType headings first (so hero words exist before entrance)
    var heroWords = null;
    if (hasSplit) {
      try {
        document.querySelectorAll('[data-split]').forEach(function (h) {
          var split = new window.SplitType(h, { types: 'lines,words', tagName: 'span' });
          if (h.closest('.hero-content')) heroWords = split.words;
          else {
            gsap.from(split.words, {
              yPercent: 110, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.03,
              scrollTrigger: { trigger: h, start: 'top 86%' }
            });
          }
        });
      } catch (e) {}
    }

    // Hero entrance: slow, elegant (fade + subtle scale)
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.hero-video, .hero-fallback', { scale: 1.08, duration: 2.2, ease: 'power2.out' }, 0)
      .from('[data-hero-fade]', { y: 34, opacity: 0, duration: 1.2, stagger: 0.12, delay: 0.25 }, 0.2);
    if (heroWords && heroWords.length) {
      tl.from(heroWords, { yPercent: 110, duration: 1.3, stagger: 0.02 }, '-=0.9');
    } else {
      tl.from('.hero-content h1', { y: 40, opacity: 0, duration: 1.3 }, '-=0.9');
    }

    // Section reveals
    revealEls.forEach(function (el) {
      gsap.fromTo(el, { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    // Image reveal: clip + scale
    gsap.utils.toArray('.reveal-img').forEach(function (fig) {
      var img = fig.querySelector('img');
      gsap.fromTo(fig, { clipPath: 'inset(8% 6% 8% 6%)', opacity: 0.4 }, {
        clipPath: 'inset(0% 0% 0% 0%)', opacity: 1, duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: fig, start: 'top 85%' }
      });
      if (img && !isMobile) {
        gsap.fromTo(img, { scale: 1.12 }, {
          scale: 1, duration: 1.6, ease: 'power3.out',
          scrollTrigger: { trigger: fig, start: 'top 85%' }
        });
      }
    });

    // Parallax: editorial image + hero content drift
    if (!isMobile) {
      gsap.utils.toArray('[data-parallax] img').forEach(function (img) {
        gsap.fromTo(img, { yPercent: -7 }, {
          yPercent: 7, ease: 'none',
          scrollTrigger: { trigger: img.closest('[data-parallax]'), start: 'top bottom', end: 'bottom top', scrub: true }
        });
      });
      gsap.to('.hero-content', {
        yPercent: -12, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: '60% top', scrub: true }
      });
    }

    // CTA micro-interactions
    gsap.utils.toArray('.magnetic').forEach(function (btn) {
      if (isMobile) return;
      btn.addEventListener('mouseenter', function () { gsap.to(btn, { y: -3, duration: 0.4, ease: 'power3.out' }); });
      btn.addEventListener('mouseleave', function () { gsap.to(btn, { y: 0, duration: 0.5, ease: 'power3.out' }); });
    });
  }

  /* ---------- Interactive services: floating hover image (desktop) ---------- */
  (function serviceHover() {
    var preview = document.querySelector('[data-service-preview]');
    var previewImg = preview ? preview.querySelector('[data-service-preview-img]') : null;
    var list = document.querySelector('[data-service-list]');
    if (!preview || !previewImg || !list || isMobile || prefersReduced) return;
    var rows = list.querySelectorAll('article[data-img]');
    if (!rows.length) return;
    var active = false;
    var px = 0, py = 0, cx = 0, cy = 0;
    function loop() {
      cx += (px - cx) * 0.12;
      cy += (py - cy) * 0.12;
      preview.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) scale(' + (active ? 1 : 0.85) + ')';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    document.querySelector('.services').addEventListener('mousemove', function (e) {
      var r = list.getBoundingClientRect();
      px = e.clientX - r.left + 24;
      py = e.clientY - r.top - 140;
    });
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () {
        var src = row.getAttribute('data-img');
        if (src && previewImg.getAttribute('src') !== src) previewImg.setAttribute('src', src);
        active = true;
        preview.classList.add('on');
        if (hasGSAP) window.gsap.to(preview, { opacity: 1, duration: 0.45, ease: 'power3.out' });
        else preview.style.opacity = '1';
      });
      row.addEventListener('mouseleave', function () {
        active = false;
        if (hasGSAP) window.gsap.to(preview, { opacity: 0, duration: 0.4, ease: 'power3.out', onComplete: function () { preview.classList.remove('on'); } });
        else { preview.style.opacity = '0'; preview.classList.remove('on'); }
      });
    });
  })();

  /* ---------- Mobile gallery: Swiper only ---------- */
  try {
    if (window.Swiper && isMobile) {
      var el = document.querySelector('[data-gallery-swiper]');
      if (el) {
        new window.Swiper(el, {
          slidesPerView: 'auto',
          spaceBetween: 12,
          centeredSlides: false,
          pagination: { el: el.querySelector('.swiper-pagination'), clickable: true },
          preloadImages: false,
          lazy: false
        });
      }
    }
  } catch (e) {}

  /* ---------- Safety: no horizontal overflow ---------- */
  function guardOverflow() {
    if (document.documentElement.scrollWidth > window.innerWidth + 1) {
      document.body.style.overflowX = 'hidden';
    }
  }
  window.addEventListener('load', guardOverflow);
  guardOverflow();
})();
