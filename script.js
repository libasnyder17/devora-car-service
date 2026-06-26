// ============================================================
// DEVORA CAR SERVICE — Premium Interactions & Animations
// ============================================================
(function () {
  'use strict';

  // Reduced-motion preference
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // THREE.JS PARTICLES (hero ambient bokeh)
  // ============================================================
  function initParticles() {
    if (prefersReduced) return;
    if (typeof THREE === 'undefined') return;

    const wrap = document.getElementById('heroParticles');
    if (!wrap) return;

    const W = window.innerWidth;
    const H = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.z = 35;

    const COUNT = 110;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 65;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      color: 0xc9a86c,
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
    });

    const pts = new THREE.Points(geo, mat);
    scene.add(pts);

    let raf;
    function tick() {
      raf = requestAnimationFrame(tick);
      pts.rotation.y += 0.00055;
      pts.rotation.x += 0.00018;
      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  // ============================================================
  // GSAP ANIMATIONS
  // ============================================================
  function initAnimations() {
    if (prefersReduced) {
      document.querySelectorAll('[data-animate]').forEach(function (el) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    if (window.gsap && window.ScrollTrigger) {
      initGsapAnimations();
    } else {
      initObserverFallback();
    }
  }

  function initGsapAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero sequence
    var heroTargets = [
      { sel: '.hero-eyebrow', delay: 0.2 },
      { sel: '.hero-title',   delay: 0.44 },
      { sel: '.hero-byline',  delay: 0.65 },
      { sel: '.hero-trust',   delay: 0.78 },
      { sel: '.hero-actions', delay: 0.9 },
      { sel: '.scroll-cue',   delay: 1.1 },
    ];
    heroTargets.forEach(function (item) {
      var el = document.querySelector(item.sel);
      if (!el) return;
      gsap.from(el, {
        opacity: 0, y: 26,
        duration: 1, delay: item.delay,
        ease: 'power3.out',
      });
    });

    // Trust strip stagger
    gsap.from('.trust-item', {
      opacity: 0, y: 14,
      stagger: 0.06,
      duration: 0.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: '.trust-strip', start: 'top 90%', once: true },
    });

    // fade-up elements
    gsap.utils.toArray('[data-animate="fade-up"]').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        }
      );
    });

    // Staggered cards
    gsap.utils.toArray('[data-animate="card"]').forEach(function (card, i) {
      gsap.fromTo(card,
        { opacity: 0, y: 48 },
        {
          opacity: 1, y: 0,
          duration: 0.72,
          ease: 'power3.out',
          delay: (i % 4) * 0.07,
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
        }
      );
    });
  }

  function initObserverFallback() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(function (el) {
      io.observe(el);
    });
  }

  // ============================================================
  // NAVBAR
  // ============================================================
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    function handleScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 56);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Active section highlighting
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.nav-link');

    function highlightActive() {
      var scrollY = window.scrollY + navbar.offsetHeight + 90;
      sections.forEach(function (sec) {
        var top = sec.offsetTop;
        var bottom = top + sec.offsetHeight;
        if (scrollY >= top && scrollY < bottom) {
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          var link = document.querySelector('.nav-link[href="#' + sec.id + '"]');
          if (link) link.classList.add('active');
        }
      });
    }
    window.addEventListener('scroll', highlightActive, { passive: true });
    highlightActive();
  }

  // ============================================================
  // MOBILE NAV
  // ============================================================
  function initMobileNav() {
    var hamburger = document.getElementById('hamburger');
    var navLinks  = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    function closeNav() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('click', function (e) {
      if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        closeNav();
      }
    });
  }

  // ============================================================
  // SMOOTH SCROLLING
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var navbar = document.getElementById('navbar');
        var navH = navbar ? navbar.offsetHeight : 0;
        var top = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top: top, behavior: prefersReduced ? 'auto' : 'smooth' });
      });
    });
  }

  // ============================================================
  // SCROLL TO TOP
  // ============================================================
  function initScrollTop() {
    var btn = document.getElementById('scrollTopBtn');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      btn.classList.toggle('visible', window.scrollY > 420);
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  // ============================================================
  // INIT
  // ============================================================
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initMobileNav();
    initSmoothScroll();
    initScrollTop();
    initAnimations();
    if (typeof THREE !== 'undefined') initParticles();
  });

})();
