/**
 * Anima App Homepage Clone — animations.js
 * Vanilla JS implementation of scroll reveals, stagger animations,
 * navbar headroom behavior, hero load sequence, typewriter placeholder,
 * counter animation, tabs, mobile drawer, parallax, and micro-interactions.
 */

(function () {
  'use strict';

  if (window.history && window.history.replaceState && window.location.protocol !== 'file:') {
    const p = window.location.pathname;
    let clean = p.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (clean.length > 1 && clean.endsWith('/')) clean = clean.slice(0, -1);
    if (clean !== p) {
      window.history.replaceState(null, '', clean + window.location.search + window.location.hash);
    }
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initHeroAmbientGlow();
    initPageLoadSequence();
    initScrollAnimations();
    initNavbarScroll();
    initNotificationBar();
    initMobileMenu();
    initDesktopDropdown();
    initPromptWidget();
    initQuoteShowcase();
    initFeatureTabs();
    initCounterAnimation();
    initWorkStatsCounter();
    initChartAnimations();
    initParallax();
    initSmoothScroll();
    initHoverMicroInteractions();
    initVideoModal();
  });

  /* -----------------------------------------------------------------
     1. HERO AMBIENT GLOW ELEMENT
  ----------------------------------------------------------------- */
  function initHeroAmbientGlow() {
    const hero = document.querySelector('.hero');
    if (!hero || hero.querySelector('.hero__ambient-glow')) return;

    const glow = document.createElement('div');
    glow.className = 'hero__ambient-glow';
    glow.setAttribute('aria-hidden', 'true');
    hero.insertBefore(glow, hero.firstChild);
  }

  /* -----------------------------------------------------------------
     2. PAGE LOAD SEQUENCE (HERO ENTRANCE)
  ----------------------------------------------------------------- */
  function initPageLoadSequence() {
    const heroTargets = document.querySelectorAll('.hero [data-animate]');
    if (!heroTargets.length) return;

    if (prefersReducedMotion) {
      heroTargets.forEach((el) => el.classList.add('is-animated'));
      return;
    }

    // Trigger hero elements in staggered sequence right after initial paint
    requestAnimationFrame(() => {
      heroTargets.forEach((el, index) => {
        const explicitDelay = parseInt(el.getAttribute('data-animate-delay') || '', 10);
        const delay = Number.isFinite(explicitDelay) ? explicitDelay : index * 100;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-animated');
      });
    });
  }

  /* -----------------------------------------------------------------
     3. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
     Supports: fade-up, fade-left, fade-right, fade-in, scale-up, stagger
  ----------------------------------------------------------------- */
  function initScrollAnimations() {
    const animatedEls = document.querySelectorAll('[data-animate]');
    if (!animatedEls.length) return;

    // Auto-assign stagger delays to children of [data-animate="stagger"]
    document.querySelectorAll('[data-animate="stagger"]').forEach((container) => {
      const children = container.querySelectorAll('[data-animate]');
      children.forEach((child, idx) => {
        if (!child.hasAttribute('data-animate-delay')) {
          child.setAttribute('data-animate-delay', String(idx * 80));
        }
      });
    });

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      animatedEls.forEach((el) => el.classList.add('is-animated'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-animate-delay') || '0', 10);
          if (delay > 0) {
            el.style.transitionDelay = `${delay}ms`;
          }

          el.classList.add('is-animated');
          obs.unobserve(el);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    animatedEls.forEach((el) => {
      // Hero elements are already handled by initPageLoadSequence
      if (el.closest('.hero')) return;
      observer.observe(el);
    });
  }

  /* -----------------------------------------------------------------
     4. NAVBAR SCROLL BEHAVIOR (Headroom-style)
  ----------------------------------------------------------------- */
  function initNavbarScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let ticking = false;

    function updateHeader() {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY <= 16) {
        header.classList.add('headroom--top');
        header.classList.remove('headroom--scrolled');
      } else {
        header.classList.remove('headroom--top');
        header.classList.add('headroom--scrolled');
      }
      ticking = false;
    }

    updateHeader();

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateHeader);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* -----------------------------------------------------------------
     5. NOTIFICATION BAR DISMISS
  ----------------------------------------------------------------- */
  function initNotificationBar() {
    const bar = document.getElementById('notification-bar');
    const closeBtn = document.getElementById('notification-close');
    if (!bar || !closeBtn) return;

    closeBtn.addEventListener('click', () => {
      bar.classList.add('is-dismissed');
      bar.setAttribute('aria-hidden', 'true');
    });
  }

  /* -----------------------------------------------------------------
     6. MOBILE MENU TOGGLE
  ----------------------------------------------------------------- */
  function initMobileMenu() {
    const burger = document.getElementById('burger-menu');
    const mobileNav = document.getElementById('mobile-nav');
    if (!burger || !mobileNav) return;

    function setOpen(open) {
      burger.classList.toggle('is-open', open);
      mobileNav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      mobileNav.setAttribute('aria-hidden', String(!open));
    }

    burger.addEventListener('click', () => {
      const isOpen = burger.classList.contains('is-open');
      setOpen(!isOpen);
    });

    mobileNav.querySelectorAll('.mobile-nav__link').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024 && mobileNav.classList.contains('is-open')) {
        setOpen(false);
      }
    });
  }

  /* -----------------------------------------------------------------
     7. DESKTOP DROPDOWN ACCESSIBILITY
  ----------------------------------------------------------------- */
  function initDesktopDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const trigger = dropdown && dropdown.querySelector('.dropdown__trigger');
    if (!dropdown || !trigger) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dropdown.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && dropdown.classList.contains('is-open')) {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('is-open')) {
        dropdown.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      }
    });
  }

  /* -----------------------------------------------------------------
     8. HERO PROMPT WIDGET & TYPEWRITER PLACEHOLDER
  ----------------------------------------------------------------- */
  function initPromptWidget() {
    const card = document.querySelector('.anima-figma-div');
    const textarea = document.querySelector('.anima-figma-text-wrapper');
    const figmaBtn = document.getElementById('anima-figma-figma-button');
    const websiteBtn = document.getElementById('anima-figma-website-button');
    const submitBtn = document.getElementById('anima-figma-arrow-button');
    if (!card || !textarea) return;

    const prompts = [
      'Describe your app, paste a Figma link, or enter a URL...',
      'Build a SaaS analytics dashboard in React with dark mode...',
      'Clone https://stripe.com/pricing into an editable React app...',
      'Turn our Figma design system into production components...',
    ];

    let promptIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typewriterTimer = null;
    let userInteracting = false;

    function tickTypewriter() {
      if (prefersReducedMotion || userInteracting || textarea.value.length > 0) return;

      const current = prompts[promptIndex];
      if (!isDeleting) {
        charIndex++;
        textarea.setAttribute('placeholder', current.slice(0, charIndex));
        if (charIndex === current.length) {
          isDeleting = true;
          typewriterTimer = setTimeout(tickTypewriter, 2200);
          return;
        }
        typewriterTimer = setTimeout(tickTypewriter, 45);
      } else {
        charIndex--;
        textarea.setAttribute('placeholder', current.slice(0, charIndex));
        if (charIndex === 0) {
          isDeleting = false;
          promptIndex = (promptIndex + 1) % prompts.length;
          typewriterTimer = setTimeout(tickTypewriter, 400);
          return;
        }
        typewriterTimer = setTimeout(tickTypewriter, 22);
      }
    }

    if (!prefersReducedMotion) {
      typewriterTimer = setTimeout(tickTypewriter, 1500);
    }

    textarea.addEventListener('focus', () => {
      userInteracting = true;
      clearTimeout(typewriterTimer);
      card.classList.add('is-focused');
    });

    textarea.addEventListener('blur', () => {
      card.classList.remove('is-focused');
      if (textarea.value.trim() === '') {
        userInteracting = false;
        charIndex = 0;
        isDeleting = false;
        if (!prefersReducedMotion) {
          typewriterTimer = setTimeout(tickTypewriter, 1000);
        }
      }
    });

    if (figmaBtn) {
      figmaBtn.addEventListener('click', () => {
        const active = figmaBtn.classList.toggle('is-active');
        if (websiteBtn) websiteBtn.classList.remove('is-active');
        if (active) {
          userInteracting = true;
          clearTimeout(typewriterTimer);
          textarea.setAttribute('placeholder', 'Paste your Figma file or frame URL (e.g. figma.com/design/...)');
        }
        textarea.focus();
      });
    }

    if (websiteBtn) {
      websiteBtn.addEventListener('click', () => {
        const active = websiteBtn.classList.toggle('is-active');
        if (figmaBtn) figmaBtn.classList.remove('is-active');
        if (active) {
          userInteracting = true;
          clearTimeout(typewriterTimer);
          textarea.setAttribute('placeholder', 'Enter any website URL to clone (e.g. https://example.com)');
        }
        textarea.focus();
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const value = textarea.value.trim();
        if (!value) {
          card.classList.remove('is-shake');
          void card.offsetWidth; // trigger reflow for replay
          card.classList.add('is-shake');
          textarea.focus();
          return;
        }
        window.open('https://projects.animaapp.com/signup', '_blank', 'noopener');
      });
    }
  }

  /* -----------------------------------------------------------------
     8B. 4-CARD ROTATING QUOTE SHOWCASE
  ----------------------------------------------------------------- */
  function initQuoteShowcase() {
    const showcase = document.getElementById('quote-showcase');
    if (!showcase) return;

    const cards = Array.from(showcase.querySelectorAll('[data-quote-card]'));
    const dots = Array.from(showcase.querySelectorAll('[data-quote-dot]'));
    const counter = showcase.querySelector('[data-quote-counter]');
    const prevBtn = showcase.querySelector('[data-quote-prev]');
    const nextBtn = showcase.querySelector('[data-quote-next]');
    const progressBar = showcase.querySelector('[data-quote-progress]');

    if (!cards.length) return;

    const DURATION = 4500;
    const total = cards.length;
    let currentIndex = cards.findIndex((c) => c.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    let isPaused = false;
    let elapsed = 0;
    let lastTimestamp = null;
    let rafId = null;

    function formatIndex(idx) {
      return `${String(idx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }

    function showCard(index) {
      currentIndex = ((index % total) + total) % total;

      cards.forEach((card, i) => {
        const active = i === currentIndex;
        card.classList.toggle('is-active', active);
        card.setAttribute('aria-hidden', String(!active));
      });

      dots.forEach((dot, i) => {
        const active = i === currentIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', String(active));
      });

      if (counter) {
        counter.textContent = formatIndex(currentIndex);
      }

      elapsed = 0;
      lastTimestamp = null;
      if (progressBar) {
        progressBar.style.transform = 'scaleX(0)';
      }
    }

    function tick(timestamp) {
      if (!isPaused && !prefersReducedMotion) {
        if (lastTimestamp === null) {
          lastTimestamp = timestamp;
        }
        elapsed += timestamp - lastTimestamp;
        lastTimestamp = timestamp;

        const progress = Math.min(elapsed / DURATION, 1);
        if (progressBar) {
          progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
        }

        if (elapsed >= DURATION) {
          showCard(currentIndex + 1);
        }
      } else {
        lastTimestamp = null;
      }

      rafId = requestAnimationFrame(tick);
    }

    // Dot navigation
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-quote-dot') || '0', 10);
        if (!Number.isNaN(idx)) {
          showCard(idx);
        }
      });
    });

    // Prev / Next buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => showCard(currentIndex - 1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => showCard(currentIndex + 1));
    }

    // Keyboard navigation within showcase
    showcase.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        showCard(currentIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showCard(currentIndex - 1);
      }
    });

    // Pause on hover & focus
    showcase.addEventListener('mouseenter', () => {
      isPaused = true;
    });
    showcase.addEventListener('mouseleave', () => {
      isPaused = false;
      lastTimestamp = null;
    });
    showcase.addEventListener('focusin', () => {
      isPaused = true;
    });
    showcase.addEventListener('focusout', (e) => {
      if (!showcase.contains(e.relatedTarget)) {
        isPaused = false;
        lastTimestamp = null;
      }
    });

    // Initialize state & start rotation loop
    showCard(currentIndex);
    if (!prefersReducedMotion) {
      rafId = requestAnimationFrame(tick);
    }
  }

  /* -----------------------------------------------------------------
     9. PRODUCT FEATURES TABS
  ----------------------------------------------------------------- */
  function initFeatureTabs() {
    const tabButtons = Array.from(document.querySelectorAll('.features-tabs__nav .tab-btn'));
    const tabPanels = Array.from(document.querySelectorAll('.features-tabs__content .tab-panel'));
    if (!tabButtons.length || !tabPanels.length) return;

    function activateTab(index) {
      tabButtons.forEach((btn, i) => {
        const isActive = i === index;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });

      tabPanels.forEach((panel, i) => {
        const isActive = i === index;
        panel.classList.toggle('active', isActive);
        panel.setAttribute('aria-hidden', String(!isActive));

        if (isActive) {
          panel.classList.add('is-animated');
          panel.classList.remove('is-entering');
          void panel.offsetWidth;
          panel.classList.add('is-entering');
        }
      });
    }

    tabButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => activateTab(index));

      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = (index + 1) % tabButtons.length;
          tabButtons[next].focus();
          activateTab(next);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = (index - 1 + tabButtons.length) % tabButtons.length;
          tabButtons[prev].focus();
          activateTab(prev);
        }
      });
    });
  }

  /* -----------------------------------------------------------------
     10. COUNTER / NUMBER ANIMATION (1.8M+)
  ----------------------------------------------------------------- */
  function initCounterAnimation() {
    const statEl = document.querySelector('.social-stats__number');
    if (!statEl || prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const targetValue = 1.8;
    const duration = 1400;
    let hasRun = false;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || hasRun) return;
          hasRun = true;
          obs.unobserve(statEl);

          const startTime = performance.now();

          function updateCount(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = (targetValue * eased).toFixed(1);
            statEl.textContent = `${current}M+`;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              statEl.textContent = '1.8M+';
            }
          }

          requestAnimationFrame(updateCount);
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(statEl);
  }

  /* -----------------------------------------------------------------
     10B. WORK & IMPACT STATS COUNT-UP ([data-count-to])
  ----------------------------------------------------------------- */
  function initWorkStatsCounter() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach((el) => {
        const target = el.getAttribute('data-count-to') || '0';
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        el.textContent = `${prefix}${target}${suffix}`;
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          obs.unobserve(el);

          const rawTarget = el.getAttribute('data-count-to') || '0';
          const target = parseFloat(rawTarget);
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const decimals = (rawTarget.split('.')[1] || '').length;
          const duration = 1200;
          const startTime = performance.now();

          function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = target * eased;
            const formatted = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
            el.textContent = `${prefix}${formatted}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              el.textContent = `${prefix}${rawTarget}${suffix}`;
            }
          }

          requestAnimationFrame(step);
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  /* -----------------------------------------------------------------
     10C. WORK & IMPACT SVG CHART / BAR ANIMATIONS ([data-chart-animate])
  ----------------------------------------------------------------- */
  function initChartAnimations() {
    const charts = document.querySelectorAll('[data-chart-animate]');
    if (!charts.length) return;

    function revealChart(container) {
      container.classList.add('is-chart-visible');

      const bars = container.querySelectorAll('[data-bar-width]');
      bars.forEach((bar, idx) => {
        const targetWidth = bar.getAttribute('data-bar-width');
        if (!targetWidth) return;
        if (!prefersReducedMotion) {
          bar.style.transitionDelay = `${idx * 90}ms`;
        }
        bar.style.width = targetWidth;
      });

      const rings = container.querySelectorAll('.donut-ring');
      rings.forEach((ring, idx) => {
        const targetDash = ring.dataset.targetDasharray;
        const targetOffset = ring.getAttribute('data-target-offset');
        if (!prefersReducedMotion) {
          ring.style.transitionDelay = `${idx * 120}ms`;
        }
        if (targetDash) {
          ring.style.strokeDasharray = targetDash;
        }
        if (targetOffset !== null) {
          ring.style.strokeDashoffset = targetOffset;
        }
      });
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      charts.forEach(revealChart);
      return;
    }

    // Prepare donut rings at 0 length so they animate cleanly into view
    charts.forEach((container) => {
      container.querySelectorAll('.donut-ring').forEach((ring) => {
        const initialDash = ring.getAttribute('stroke-dasharray');
        if (initialDash) {
          ring.dataset.targetDasharray = initialDash;
          ring.style.strokeDasharray = '0 289';
        }
      });
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const container = entry.target;
          obs.unobserve(container);
          requestAnimationFrame(() => revealChart(container));
        });
      },
      { threshold: 0.25 }
    );

    charts.forEach((container) => observer.observe(container));
  }

  /* -----------------------------------------------------------------
     11. PARALLAX SCROLLING EFFECTS
  ----------------------------------------------------------------- */
  function initParallax() {
    if (prefersReducedMotion) return;

    const ctaBgImg = document.querySelector('.final-cta-bg__img');
    const ctaSection = document.querySelector('.final-cta-section');
    if (!ctaBgImg || !ctaSection) return;

    let ticking = false;

    function updateParallax() {
      const rect = ctaSection.getBoundingClientRect();
      const viewportH = window.innerHeight;

      if (rect.bottom > 0 && rect.top < viewportH) {
        const progress = (viewportH - rect.top) / (viewportH + rect.height);
        const offset = (progress - 0.5) * 40;
        ctaBgImg.style.transform = `translateY(${offset.toFixed(1)}px) scale(1.08)`;
      }
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* -----------------------------------------------------------------
     12. SMOOTH SCROLL FOR ANCHOR LINKS
  ----------------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const header = document.getElementById('header');
        const offset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      });
    });
  }

  /* -----------------------------------------------------------------
     13. HOVER & PRESS MICRO-INTERACTIONS (Class toggles)
  ----------------------------------------------------------------- */
  function initHoverMicroInteractions() {
    const hoverTargets = document.querySelectorAll(
      '.bento-card, .stack-track, .api-card, .blog-card, .template-card'
    );

    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => el.classList.add('is-hovered'));
      el.addEventListener('mouseleave', () => el.classList.remove('is-hovered'));
    });

    const pressTargets = document.querySelectorAll('.button, .anima-submit-btn');
    pressTargets.forEach((btn) => {
      btn.addEventListener('mousedown', () => btn.classList.add('is-pressed'));
      btn.addEventListener('mouseup', () => btn.classList.remove('is-pressed'));
      btn.addEventListener('mouseleave', () => btn.classList.remove('is-pressed'));
    });
  }

  /* -----------------------------------------------------------------
     14. VIDEO MODAL CONTROLS
  ----------------------------------------------------------------- */
  function initVideoModal() {
    const overlay = document.getElementById('video-modal-overlay');
    const closeBtn = document.getElementById('video-modal-close');
    if (!overlay || !closeBtn) return;

    const content = overlay.querySelector('.vm--content');

    function closeModal() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      if (content) content.innerHTML = '';
    }

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeModal();
      }
    });
  }
})();
