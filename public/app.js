const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

const syncHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
};

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menu?.classList.toggle('is-open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

menu?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menu?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');

if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });

  revealItems.forEach((item) => revealObserver.observe(item));
}

const serviceDetails = document.querySelectorAll('.service-accordion details');

serviceDetails.forEach((detail) => {
  detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    serviceDetails.forEach((other) => {
      if (other !== detail) other.open = false;
    });
  });
});

if (!reducedMotion) {
  const gallery = document.querySelector('.hero-gallery');
  window.addEventListener('scroll', () => {
    if (!gallery || window.scrollY > window.innerHeight) return;
    gallery.style.setProperty('--hero-shift', `${window.scrollY * 0.08}px`);
  }, { passive: true });
}

const reviewsTrack = document.querySelector('[data-reviews-track]');
const reviewsPrevious = document.querySelector('[data-reviews-prev]');
const reviewsNext = document.querySelector('[data-reviews-next]');

if (reviewsTrack) {
  const reviewStep = () => {
    const card = reviewsTrack.querySelector('.review-card');
    return card ? card.getBoundingClientRect().width + 18 : reviewsTrack.clientWidth;
  };
  const moveReviews = (direction) => reviewsTrack.scrollBy({ left: reviewStep() * direction, behavior: reducedMotion ? 'auto' : 'smooth' });
  reviewsPrevious?.addEventListener('click', () => moveReviews(-1));
  reviewsNext?.addEventListener('click', () => moveReviews(1));

  if (!reducedMotion) {
    let reviewTimer;
    const stopReviews = () => window.clearInterval(reviewTimer);
    const startReviews = () => {
      stopReviews();
      reviewTimer = window.setInterval(() => {
        const atEnd = reviewsTrack.scrollLeft + reviewsTrack.clientWidth >= reviewsTrack.scrollWidth - 8;
        reviewsTrack.scrollTo({ left: atEnd ? 0 : reviewsTrack.scrollLeft + reviewStep(), behavior: 'smooth' });
      }, 6500);
    };
    reviewsTrack.addEventListener('mouseenter', stopReviews);
    reviewsTrack.addEventListener('mouseleave', startReviews);
    reviewsTrack.addEventListener('focusin', stopReviews);
    reviewsTrack.addEventListener('focusout', startReviews);
    startReviews();
  }
}
