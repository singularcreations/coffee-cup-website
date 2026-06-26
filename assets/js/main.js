/* ============================================================
   EL DESAYUNO — MAIN JAVASCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     HEADER: SCROLL STATE + SMOOTH ANCHOR
     ============================================================ */
  const header = document.getElementById('site-header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // Contact nav smooth scroll
  document.querySelectorAll('a[href="#contact"], .nav-contact').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById('contact');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // Close mobile nav if open
        navMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.classList.remove('open');
      }
    });
  });

  /* ============================================================
     MOBILE HAMBURGER MENU
     ============================================================ */
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('main-nav');

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close nav when a link is clicked
  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ============================================================
     HERO SLIDER
     ============================================================ */
  const slides     = document.querySelectorAll('.slide');
  const dots       = document.querySelectorAll('.dot');
  const prevBtn    = document.getElementById('sliderPrev');
  const nextBtn    = document.getElementById('sliderNext');
  let   current    = 0;
  let   sliderTimer;

  function goToSlide(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function startSliderAuto() {
    sliderTimer = setInterval(() => goToSlide(current + 1), 5000);
  }

  function resetSliderAuto() {
    clearInterval(sliderTimer);
    startSliderAuto();
  }

  prevBtn.addEventListener('click', () => { goToSlide(current - 1); resetSliderAuto(); });
  nextBtn.addEventListener('click', () => { goToSlide(current + 1); resetSliderAuto(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index, 10));
      resetSliderAuto();
    });
  });

  // Touch/swipe on hero
  let touchStartX = 0;
  const sliderEl = document.querySelector('.hero-slider');
  sliderEl.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  sliderEl.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { goToSlide(diff > 0 ? current + 1 : current - 1); resetSliderAuto(); }
  }, { passive: true });

  startSliderAuto();

  /* ============================================================
     FEATURED BREAKFAST CAROUSEL
     ============================================================ */
  const carousel   = document.getElementById('featuredCarousel');
  const cards      = carousel.querySelectorAll('.feat-card');
  const carPrev    = document.getElementById('carouselPrev');
  const carNext    = document.getElementById('carouselNext');
  let   carIndex   = 0;

  function getVisibleCount() {
    return window.innerWidth > 1024 ? 3 : window.innerWidth > 600 ? 2 : 1;
  }

  function getCardWidth() {
    if (!cards.length) return 0;
    const card = cards[0];
    const style = window.getComputedStyle(card);
    return card.offsetWidth + parseInt(style.marginRight || 0) + 28; // 28 = gap
  }

  function updateCarousel() {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, cards.length - visible);
    carIndex = Math.min(carIndex, maxIndex);
    const offset = carIndex * getCardWidth();
    carousel.style.transform = `translateX(-${offset}px)`;
    carPrev.disabled = carIndex === 0;
    carNext.disabled = carIndex >= maxIndex;
    carPrev.style.opacity = carIndex === 0 ? '0.4' : '1';
    carNext.style.opacity = carIndex >= maxIndex ? '0.4' : '1';
  }

  carPrev.addEventListener('click', () => { carIndex = Math.max(0, carIndex - 1); updateCarousel(); });
  carNext.addEventListener('click', () => {
    const visible = getVisibleCount();
    const max = Math.max(0, cards.length - visible);
    carIndex = Math.min(max, carIndex + 1);
    updateCarousel();
  });

  // Touch/swipe on carousel
  let carTouchStart = 0;
  carousel.addEventListener('touchstart', e => { carTouchStart = e.changedTouches[0].clientX; }, { passive: true });
  carousel.addEventListener('touchend', e => {
    const diff = carTouchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        const visible = getVisibleCount();
        const max = Math.max(0, cards.length - visible);
        carIndex = Math.min(max, carIndex + 1);
      } else {
        carIndex = Math.max(0, carIndex - 1);
      }
      updateCarousel();
    }
  }, { passive: true });

  window.addEventListener('resize', updateCarousel, { passive: true });
  updateCarousel();

  /* ============================================================
     MENU CATEGORY SLIDER (one at a time, auto-rotating)
     ============================================================ */
  const menuGrid      = document.getElementById('menuGrid');
  const menuPrev      = document.getElementById('menuSliderPrev');
  const menuNext      = document.getElementById('menuSliderNext');
  const menuDotsWrap  = document.getElementById('menuSliderDots');
  const menuCats      = menuGrid ? Array.from(menuGrid.querySelectorAll('.menu-category')) : [];
  let   menuIndex     = 0;
  let   menuTimer;

  // Build dots
  if (menuDotsWrap && menuCats.length) {
    menuCats.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'menu-slider-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Category ${i + 1}`);
      dot.addEventListener('click', () => { goToMenu(i); resetMenuTimer(); });
      menuDotsWrap.appendChild(dot);
    });
  }

  function getMenuDots() {
    return menuDotsWrap ? menuDotsWrap.querySelectorAll('.menu-slider-dot') : [];
  }

  function goToMenu(n) {
    menuIndex = (n + menuCats.length) % menuCats.length;
    const catW = menuCats[0] ? menuCats[0].offsetWidth : 0;
    menuGrid.style.transform = `translateX(-${menuIndex * catW}px)`;
    getMenuDots().forEach((d, i) => d.classList.toggle('active', i === menuIndex));
    menuPrev.style.opacity = menuIndex === 0 ? '0.4' : '1';
    menuNext.style.opacity = menuIndex === menuCats.length - 1 ? '0.4' : '1';
  }

  function startMenuTimer() {
    menuTimer = setInterval(() => goToMenu(menuIndex + 1), 3500);
  }

  function resetMenuTimer() {
    clearInterval(menuTimer);
    startMenuTimer();
  }

  if (menuPrev && menuNext && menuCats.length) {
    menuPrev.addEventListener('click', () => { goToMenu(menuIndex - 1); resetMenuTimer(); });
    menuNext.addEventListener('click', () => { goToMenu(menuIndex + 1); resetMenuTimer(); });

    // Touch swipe
    let menuTouchStart = 0;
    menuGrid.addEventListener('touchstart', e => { menuTouchStart = e.changedTouches[0].clientX; }, { passive: true });
    menuGrid.addEventListener('touchend', e => {
      const diff = menuTouchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        goToMenu(diff > 0 ? menuIndex + 1 : menuIndex - 1);
        resetMenuTimer();
      }
    }, { passive: true });

    window.addEventListener('resize', () => goToMenu(menuIndex), { passive: true });
    goToMenu(0);
    startMenuTimer();
  }

  /* ============================================================
     PARALLAX SCROLL
     ============================================================ */
  const parallaxBg = document.getElementById('parallaxBg');

  if (parallaxBg) {
    const parallaxSection = parallaxBg.closest('.parallax-section');
    window.addEventListener('scroll', () => {
      const rect = parallaxSection.getBoundingClientRect();
      const viewH = window.innerHeight;
      if (rect.bottom < 0 || rect.top > viewH) return;
      const progress = (viewH - rect.top) / (viewH + rect.height);
      const shift = (progress - 0.5) * 140;
      parallaxBg.style.transform = `translateY(${shift}px)`;
    }, { passive: true });
  }

  /* ============================================================
     ACTIVE NAV LINK ON SCROLL
     ============================================================ */
  const navLinks   = document.querySelectorAll('.header-nav a');
  const sections   = [
    document.getElementById('home') || document.querySelector('.hero-slider'),
    document.getElementById('featured'),
    document.getElementById('menu'),
    document.getElementById('story'),
    document.getElementById('contact'),
  ];

  window.addEventListener('scroll', () => {
    let found = 0;
    sections.forEach((sec, i) => {
      if (!sec) return;
      if (window.scrollY >= sec.offsetTop - 100) found = i;
    });
    navLinks.forEach((link, i) => link.classList.toggle('active', i === found));
  }, { passive: true });

  /* ============================================================
     ANIMATE ITEMS ON SCROLL (intersection observer)
     ============================================================ */
  const animEls = document.querySelectorAll('.feat-card, .menu-category, .story-text, .story-image');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    observer.observe(el);
  });

  /* ============================================================
     COOKIE CONSENT BANNER
     ============================================================ */
  const cookieOverlay = document.getElementById('cookieOverlay');

  if (!localStorage.getItem('cookieConsent')) {
    cookieOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCookie() {
    cookieOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('cookieAccept').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'accepted');
    closeCookie();
  });
  document.getElementById('cookieDeny').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'denied');
    closeCookie();
  });
  document.getElementById('cookieSave').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', 'saved');
    closeCookie();
  });

  document.querySelectorAll('.cookie-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cookie-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.cookie-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  /* ============================================================
     FEATURED ITEM MODAL
     ============================================================ */
  const modal        = document.getElementById('itemModal');
  const modalImg     = document.getElementById('itemModalImg');
  const modalLabel   = document.getElementById('itemModalLabel');
  const modalName    = document.getElementById('itemModalName');
  const modalDesc    = document.getElementById('itemModalDesc');
  const modalPrice   = document.getElementById('itemModalPrice');
  const modalClose   = document.getElementById('itemModalClose');

  document.querySelectorAll('.feat-card').forEach(card => {
    card.addEventListener('click', () => {
      const img   = card.querySelector('.feat-img-wrap img');
      const label = card.querySelector('.feat-label');
      const name  = card.querySelector('.feat-name');
      const desc  = card.querySelector('.feat-desc');
      const price = card.querySelector('.feat-price');

      modalImg.src         = img ? img.src : '';
      modalImg.alt         = img ? img.alt : '';
      modalLabel.textContent = label ? label.textContent : '';
      modalName.textContent  = name  ? name.textContent  : '';
      modalDesc.textContent  = desc  ? desc.textContent  : '';
      modalPrice.textContent = price ? price.textContent : '';

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

});
