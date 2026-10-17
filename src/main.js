// PoPo애견미용실 공개 페이지 인터랙션
// 모바일 메뉴, FAQ 아코디언

const $ = (selector, root = document) => root.querySelector(selector);

window.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFaqAccordion();
});

function initMobileNav() {
  const toggleButton = $('#mobileNavToggle');
  const mobileNav = $('#mobileNav');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggleButton || !mobileNav) return;

  const setMenuState = (isOpen) => {
    mobileNav.classList.toggle('is-open', isOpen);
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
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
