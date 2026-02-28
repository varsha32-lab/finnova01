/**
 * FinNova Advisory – script.js
 * Features:
 *  1. Navbar: scroll-shrink + mobile hamburger toggle
 *  2. Anti-gravity / parallax floating elements
 *  3. Scroll animations via IntersectionObserver
 *  4. Animated stat counter
 *  5. Testimonial slider (auto-play, dots, prev/next, keyboard)
 *  6. Contact form validation + simulated submission
 *  7. Newsletter form handler
 *  8. Active nav-link highlight on scroll
 *  9. Back-to-top button
 * 10. Smooth scroll for anchor links
 */

/* ============================================================
   1. DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initAntiGravity();
  initScrollAnimations();
  initStatCounters();
  initTestimonialSlider();
  initContactForm();
  initNewsletterForm();
  initBackToTop();
  initActiveSectionHighlight();
  initSmoothScroll();
});


/* ============================================================
   2. NAVBAR – scroll shrink + hamburger
   ============================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Shrink navbar on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close nav on link click (mobile)
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      document.body.style.overflow = '';
    });
  });
}


/* ============================================================
   3. ANTI-GRAVITY PARALLAX – floating icons follow mouse
   ============================================================ */
function initAntiGravity() {
  const hero          = document.querySelector('.hero');
  const floatingIcons = document.querySelectorAll('.floating-icon[data-depth]');
  const heroGraphic   = document.getElementById('heroGraphic');

  if (!hero || !floatingIcons.length) return;

  // Store original positions for reference
  const origins = Array.from(floatingIcons).map(el => {
    const rect  = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  });

  let ticking = false;
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  // Track mouse position relative to centre of hero
  hero.addEventListener('mousemove', e => {
    const rect    = hero.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    mouseX = e.clientX - rect.left - centerX;
    mouseY = e.clientY - rect.top  - centerY;

    if (!ticking) {
      requestAnimationFrame(animateParallax);
      ticking = true;
    }
  });

  // Reset on mouse leave (smooth return to center)
  hero.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  function animateParallax() {
    ticking = false;

    // Smooth lerp toward mouse position
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    floatingIcons.forEach(icon => {
      const depth  = parseFloat(icon.dataset.depth) || 0.2;
      const maxDist = 40;
      const moveX  = Math.max(-maxDist, Math.min(maxDist, currentX * depth));
      const moveY  = Math.max(-maxDist, Math.min(maxDist, currentY * depth));
      // Apply translation on top of existing CSS animation
      icon.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    // Subtle tilt on dashboard card
    if (heroGraphic) {
      const tiltX = (currentY / window.innerHeight) * 8;
      const tiltY = (currentX / window.innerWidth)  * -8;
      const card  = heroGraphic.querySelector('.dashboard-card');
      if (card) {
        card.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      }
    }

    // Continue smoothing if still moving
    if (Math.abs(currentX - mouseX) > 0.5 || Math.abs(currentY - mouseY) > 0.5) {
      requestAnimationFrame(animateParallax);
      ticking = true;
    }
  }
}


/* ============================================================
   4. SCROLL ANIMATIONS – IntersectionObserver
   ============================================================ */
function initScrollAnimations() {
  // Stagger delay for sibling elements in grids
  const staggerParents = ['.services-grid', '.blog-grid', '.about-cards'];
  staggerParents.forEach(selector => {
    const parent = document.querySelector(selector);
    if (!parent) return;
    parent.querySelectorAll('.fade-in-up').forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.12}s`;
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

  // Parallax on scroll for hero orbs
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const orbs = document.querySelectorAll('.hero-orb');
    orbs.forEach((orb, i) => {
      const speed = 0.2 + i * 0.08;
      orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }, { passive: true });
}


/* ============================================================
   5. ANIMATED STAT COUNTERS
   ============================================================ */
function initStatCounters() {
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  if (!statNumbers.length) return;

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1800; // ms
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed  = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });

  statNumbers.forEach(el => counterObserver.observe(el));
}


/* ============================================================
   6. TESTIMONIAL SLIDER
   ============================================================ */
function initTestimonialSlider() {
  const slider   = document.getElementById('testimonialSlider');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('sliderDots');

  if (!slider) return;

  const slides    = slider.querySelectorAll('.testimonial-slide');
  const total     = slides.length;
  let   current   = 0;
  let   autoTimer = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function goTo(index) {
    current = (index + total) % total;
    slider.style.transform = `translateX(-${current * 100}%)`;
    dotsWrap.querySelectorAll('.dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
      dot.setAttribute('aria-selected', i === current);
    });
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);

  // Auto-play every 5 seconds
  function startAuto() {
    autoTimer = setInterval(next, 5000);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  // Pause on hover
  slider.parentElement.addEventListener('mouseenter', () => clearInterval(autoTimer));
  slider.parentElement.addEventListener('mouseleave', startAuto);

  // Touch / swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  });

  // Keyboard navigation
  slider.parentElement.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
}


/* ============================================================
   7. CONTACT FORM – validation + simulated submit
   ============================================================ */
function initContactForm() {
  const form       = document.getElementById('contactForm');
  if (!form) return;

  const nameInput    = form.querySelector('#name');
  const emailInput   = form.querySelector('#email');
  const messageInput = form.querySelector('#message');
  const submitBtn    = document.getElementById('submitBtn');
  const successMsg   = document.getElementById('formSuccess');

  const nameError    = document.getElementById('nameError');
  const emailError   = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');

  // Inline validation helpers
  function showError(input, errorEl, msg) {
    input.closest('.input-wrapper').querySelector('input, textarea').classList.add('error');
    errorEl.textContent = msg;
  }
  function clearError(input, errorEl) {
    const field = input.closest('.input-wrapper')?.querySelector('input, textarea');
    if (field) field.classList.remove('error');
    if (errorEl) errorEl.textContent = '';
  }

  // Live validation on blur
  nameInput.addEventListener('blur',    () => validateName(nameInput, nameError));
  emailInput.addEventListener('blur',   () => validateEmail(emailInput, emailError));
  messageInput.addEventListener('blur', () => validateMessage(messageInput, messageError));

  function validateName(input, errorEl) {
    clearError({ closest: () => input.parentElement }, errorEl);
    const val = input.value.trim();
    if (!val) {
      input.classList.add('error');
      errorEl.textContent = 'Name is required.';
      return false;
    }
    if (val.length < 2) {
      input.classList.add('error');
      errorEl.textContent = 'Please enter your full name.';
      return false;
    }
    input.classList.remove('error');
    return true;
  }

  function validateEmail(input, errorEl) {
    clearError({ closest: () => input.parentElement }, errorEl);
    const val     = input.value.trim();
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      input.classList.add('error');
      errorEl.textContent = 'Email address is required.';
      return false;
    }
    if (!emailRx.test(val)) {
      input.classList.add('error');
      errorEl.textContent = 'Please enter a valid email address.';
      return false;
    }
    input.classList.remove('error');
    return true;
  }

  function validateMessage(input, errorEl) {
    clearError({ closest: () => input.parentElement }, errorEl);
    const val = input.value.trim();
    if (!val) {
      input.classList.add('error');
      errorEl.textContent = 'Please write a brief message.';
      return false;
    }
    if (val.length < 10) {
      input.classList.add('error');
      errorEl.textContent = 'Message must be at least 10 characters.';
      return false;
    }
    input.classList.remove('error');
    return true;
  }

  // Form submit
  form.addEventListener('submit', e => {
    e.preventDefault();

    const isNameOk    = validateName(nameInput, nameError);
    const isEmailOk   = validateEmail(emailInput, emailError);
    const isMsgOk     = validateMessage(messageInput, messageError);

    if (!isNameOk || !isEmailOk || !isMsgOk) {
      // Scroll to first error
      form.querySelector('.error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate async submit
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    btnText.style.display    = 'none';
    btnLoading.style.display = 'inline-flex';
    submitBtn.disabled       = true;

    setTimeout(() => {
      btnText.style.display    = 'inline-flex';
      btnLoading.style.display = 'none';
      submitBtn.disabled       = false;

      form.reset();
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Hide success after 6s
      setTimeout(() => { successMsg.style.display = 'none'; }, 6000);
    }, 1800);
  });
}


/* ============================================================
   8. NEWSLETTER FORM
   ============================================================ */
function initNewsletterForm() {
  const form  = document.getElementById('newsletterForm');
  const input = document.getElementById('newsletterEmail');
  const btn   = document.getElementById('newsletterSubmit');
  if (!form || !input) return;

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const val = input.value.trim();
    if (!emailRx.test(val)) {
      input.style.borderColor = 'var(--color-danger)';
      input.focus();
      return;
    }
    input.style.borderColor = '';
    btn.innerHTML = '<i class="fas fa-check"></i>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    input.value = '';
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
      btn.style.background = '';
    }, 3000);
  });
}


/* ============================================================
   9. BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
  10. ACTIVE NAV-LINK HIGHLIGHT based on scroll position
   ============================================================ */
function initActiveSectionHighlight() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinksA = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksA.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.45 });

  sections.forEach(section => observer.observe(section));
}


/* ============================================================
  11. SMOOTH SCROLL for all anchor links
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


/* ============================================================
  12. CURSOR GLOW TRAIL (subtle, desktop only)
   ============================================================ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: fine)').matches) {
    const trail = document.createElement('div');
    trail.id = 'cursorTrail';
    Object.assign(trail.style, {
      position: 'fixed',
      width: '320px',
      height: '320px',
      pointerEvents: 'none',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(108,99,255,0.08), transparent 70%)',
      transform: 'translate(-50%, -50%)',
      zIndex: '9999',
      transition: 'left 0.15s ease, top 0.15s ease',
      willChange: 'left, top',
      top: '-200px',
      left: '-200px',
    });
    document.body.appendChild(trail);

    document.addEventListener('mousemove', e => {
      trail.style.left = e.clientX + 'px';
      trail.style.top  = e.clientY + 'px';
    }, { passive: true });
  }
})();
