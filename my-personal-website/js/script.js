document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

// Toggle the mobile menu. preventDefault + stopPropagation make sure
// this click is fully consumed here and never passes through to
// whatever sits behind or around the button.
navToggle.addEventListener('click', (e) => {
  e.preventDefault();
  e.stopPropagation();
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Close the menu on an outside click/tap, without letting that
// click also activate whatever element it landed on.
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && e.target !== navToggle) {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Close the menu on Escape for keyboard users.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.focus();
  }
});

// Belt-and-braces: stop the browser's native drag-ghost from
// starting on the toggle or menu links (some browsers ignore
// draggable="false" on nested icon elements).
document.querySelectorAll('.nav-toggle, .nav-links a, .brand, .nav-cta, .nav-resume').forEach(el => {
  el.addEventListener('dragstart', (e) => e.preventDefault());
});

// Theme toggle: switches data-theme on <html>, persists the choice,
// and keeps the button's label/icon in sync. The actual initial
// theme is already set by the inline script in <head> to avoid a
// flash, so this just wires up the click behavior.
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const root = document.documentElement;

  const syncToggleState = () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    themeToggle.setAttribute('aria-pressed', String(isLight));
    themeToggle.setAttribute('aria-label', isLight ? 'Switch to dark theme' : 'Switch to light theme');
  };
  syncToggleState();

  themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    if (isLight) {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
    syncToggleState();
  });
}

// Scroll-to-top button: fades in once the page has scrolled a bit,
// scrolls smoothly back to the top on click (instantly if the user
// prefers reduced motion).
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
  const toggleScrollTopBtn = () => {
    scrollTopBtn.classList.toggle('show', window.scrollY > 480);
  };
  toggleScrollTopBtn();
  window.addEventListener('scroll', toggleScrollTopBtn, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });
}

// Scroll reveal
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// Contact form: submit via fetch so the page never reloads, then
// clear every field (name, email, subject, message) on success.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('formSubmitBtn');
  const btnLabel = submitBtn.querySelector('.btn-label');
  const statusEl = document.getElementById('formStatus');

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.textContent = '';
    statusEl.classList.remove('is-error', 'is-success');
    submitBtn.disabled = true;
    btnLabel.textContent = 'Sending...';

    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        contactForm.reset(); // clears name, email, subject, and message
        statusEl.textContent = "Thanks — your message is on its way. I'll reply soon.";
        statusEl.classList.add('is-success');
      } else {
        statusEl.textContent = "Something went wrong sending that. Please try again or email me directly.";
        statusEl.classList.add('is-error');
      }
    } catch (err) {
      statusEl.textContent = "Network error — please check your connection and try again.";
      statusEl.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
      btnLabel.textContent = 'Send Message';
    }
  });
}

// Social buttons: small ripple feedback on click (skipped entirely
// if the user prefers reduced motion).
if (!reduceMotion) {
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ripple = document.createElement('span');
      ripple.className = 'social-btn-ripple';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}