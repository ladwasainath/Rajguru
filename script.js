// Simple interactions: mobile menu + categories toggle + search handling
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
const categoriesBtn = document.getElementById('categoriesBtn');
const categoriesPanel = document.getElementById('categoriesPanel');
const searchBtn = document.getElementById('searchBtn');
const mainSearch = document.getElementById('mainSearch');

hamburger && hamburger.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  mainNav.classList.toggle('open');
});

categoriesBtn && categoriesBtn.addEventListener('click', (e) => {
  const showing = !categoriesPanel.hidden;
  categoriesPanel.hidden = showing; // toggle
  categoriesBtn.setAttribute('aria-expanded', String(!showing));
});

// close categories panel when clicking outside
document.addEventListener('click', (e) => {
  if (!categoriesPanel || !categoriesBtn) return;
  if (categoriesPanel.contains(e.target) || categoriesBtn.contains(e.target)) return;
  if (!categoriesPanel.hidden) categoriesPanel.hidden = true;
});

searchBtn && searchBtn.addEventListener('click', () => {
  const q = mainSearch.value.trim();
  if (!q) {
    mainSearch.focus();
    return;
  }
  // placeholder behavior: normally you'd send request or navigate to search results
  alert('Search for: ' + q);
});

// allow Enter to submit search
mainSearch && mainSearch.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

/* Carousel: initialize/destroy helpers so we can swap main content dynamically */
function initCarousel() {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return null;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const dotsContainer = document.getElementById('carouselDots');
  let current = 0;
  const total = slides.length;
  const intervalMs = 2500;
  let timer = null;

  // build dots (clear existing)
  if (dotsContainer) dotsContainer.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }

  function update() {
    track.style.transform = `translateX(-${current * 100}%)`;
    const dots = dotsContainer.querySelectorAll('.carousel-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function next() {
    current = (current + 1) % total;
    update();
  }

  function goTo(i) {
    current = i % total;
    update();
    restartTimer();
  }

  function startTimer() {
    timer = setInterval(next, intervalMs);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function restartTimer() { stopTimer(); startTimer(); }

  // pause on pointer enter
  const onEnter = () => stopTimer();
  const onLeave = () => startTimer();
  carousel.addEventListener('mouseenter', onEnter);
  carousel.addEventListener('mouseleave', onLeave);

  // arrow buttons
  const prevBtn = carousel.querySelector('.carousel-arrow.prev');
  const nextBtn = carousel.querySelector('.carousel-arrow.next');
  const prevHandler = () => { current = (current - 1 + total) % total; update(); restartTimer(); };
  const nextHandler = () => { next(); restartTimer(); };
  if (prevBtn) prevBtn.addEventListener('click', prevHandler);
  if (nextBtn) nextBtn.addEventListener('click', nextHandler);

  // start
  update();
  startTimer();

  function destroy() {
    stopTimer();
    carousel.removeEventListener('mouseenter', onEnter);
    carousel.removeEventListener('mouseleave', onLeave);
    if (prevBtn) prevBtn.removeEventListener('click', prevHandler);
    if (nextBtn) nextBtn.removeEventListener('click', nextHandler);
    if (dotsContainer) dotsContainer.innerHTML = '';
  }

  const controller = { destroy };
  window.heroCarouselController = controller;
  return controller;
}

// initialize carousel on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initCarousel();
});

// (About modal removed; About now opens a separate page `about.html` in a new tab)
// --- Dynamic navigation: load internal pages into #mainContent and use History API ---
(function(){
  const mainContent = document.getElementById('mainContent');
  if (!mainContent) return;

  // ensure initial state stores current content
  history.replaceState({html: mainContent.innerHTML, title: document.title}, document.title, window.location.href);

  // helper to initialize interactive bits in loaded content
  function initPageFeatures(){
    // init carousel if present
    try { initCarousel(); } catch(e){ /* ignore */ }
  }

  async function loadPage(url){
    try {
      const res = await fetch(url, {credentials: 'same-origin'});
      if (!res.ok) { window.location.href = url; return; }
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newMain = doc.querySelector('main');
      const newTitle = doc.title || '';

      // destroy carousel before replacing content
      if (window.heroCarouselController && typeof window.heroCarouselController.destroy === 'function') {
        window.heroCarouselController.destroy();
        window.heroCarouselController = null;
      }

      // push state with the new content
      history.pushState({html: newMain ? newMain.innerHTML : text, title: newTitle}, newTitle, url);

      // swap content
      mainContent.innerHTML = newMain ? newMain.innerHTML : text;
      document.title = newTitle;

      // re-run page features for the loaded content
      initPageFeatures();
      window.scrollTo(0,0);
    } catch(err){
      console.error('Failed to load page', err);
      window.location.href = url;
    }
  }

  // intercept clicks on internal links that point to about.html (or same-origin)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    // only handle same-origin paths and specifically about.html
    if (href.endsWith('about.html')){
      e.preventDefault();
      loadPage(href);
    }
  });

  // handle back/forward
  window.addEventListener('popstate', (e) => {
    const state = e.state;
    if (state && state.html !== undefined){
      // destroy any active carousel first
      if (window.heroCarouselController && typeof window.heroCarouselController.destroy === 'function') {
        window.heroCarouselController.destroy();
        window.heroCarouselController = null;
      }
      mainContent.innerHTML = state.html;
      document.title = state.title || document.title;
      initPageFeatures();
    } else {
      // no state: reload to be safe
      window.location.reload();
    }
  });
})();
