// PoPo애견미용실 공개 페이지 인터랙션
// 모바일 메뉴, FAQ 아코디언, 구글 지도

const $ = (selector, root = document) => root.querySelector(selector);

window.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFaqAccordion();
  initLocationMap();
});

// 메뉴는 한 벌(#siteNav)만 있다. 데스크톱에서는 CSS로 항상 보이고, 모바일에서만 토글한다.
function initMobileNav() {
  const toggleButton = $('#navToggle');
  const mobileNav = $('#siteNav');
  const links = document.querySelectorAll('#siteNav .nav-link');

  if (!toggleButton || !mobileNav) return;

  const setMenuState = (isOpen) => {
    mobileNav.classList.toggle('is-open', isOpen);
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    toggleButton.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
  };

  toggleButton.addEventListener('click', () => {
    setMenuState(!mobileNav.classList.contains('is-open'));
  });
  links.forEach((link) => link.addEventListener('click', () => setMenuState(false)));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !mobileNav.classList.contains('is-open')) return;
    setMenuState(false);
    toggleButton.focus();
  });
}

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const question = $('.faq-question', item);
    const answer = $('.faq-answer', item);
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      items.forEach((otherItem) => {
        if (otherItem === item) return;
        $('.faq-question', otherItem)?.setAttribute('aria-expanded', 'false');
        $('.faq-answer', otherItem)?.classList.remove('is-open');
      });
      question.setAttribute('aria-expanded', String(!isExpanded));
      answer.classList.toggle('is-open', !isExpanded);
    });
  });
}

// 구글 지도(Maps Embed API). 키는 .env.local의 VITE_GOOGLE_MAPS_EMBED_KEY에서 빌드할 때 들어온다.
// 키가 없으면 지도 영역을 숨긴 채로 둔다.
function initLocationMap() {
  const container = $('#locationMap');
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY;
  if (!container || !apiKey) return;

  const params = new URLSearchParams({
    key: apiKey,
    q: container.dataset.query,
    language: 'ko',
    region: 'KR',
  });
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.google.com/maps/embed/v1/place?${params}`;
  iframe.title = 'PoPo애견미용실 위치 지도';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;

  container.prepend(iframe);
  container.hidden = false;
}
