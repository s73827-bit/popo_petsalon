// POPO 애견미용샵 공개 페이지 인터랙션
// 모바일 메뉴, FAQ, 브라우저 기반 후기 작성

const REVIEW_STORAGE_KEY = 'popo-local-reviews-v1';
const REVIEW_LIMIT = 30;
const $ = (selector, root = document) => root.querySelector(selector);

window.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFaqAccordion();
  initReviewForm();
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

function getFieldValue(form, fieldName) {
  return form.elements.namedItem(fieldName)?.value?.trim() || '';
}

function initReviewForm() {
  const form = $('#reviewForm');
  const list = $('#reviewList');
  if (!form || !list) return;

  renderLocalReviews(readLocalReviews());
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const review = readReviewFields(form);

    if (!isValidReview(review)) {
      showReviewFeedback('작성자명, 별점, 후기를 모두 입력해 주세요.', 'error');
      return;
    }

    if (!saveReview(review)) {
      showReviewFeedback('브라우저 저장 공간을 사용할 수 없어 후기를 등록하지 못했습니다.', 'error');
      return;
    }

    form.reset();
    renderLocalReviews(readLocalReviews());
    showReviewFeedback('후기가 등록되었습니다. 현재는 이 브라우저에서만 확인할 수 있습니다.', 'success');
  });
}

function readReviewFields(form) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    author: getFieldValue(form, 'author').slice(0, 40),
    rating: Number(form.elements.namedItem('rating')?.value || 0),
    text: getFieldValue(form, 'text').slice(0, 500),
    createdAt: new Date().toISOString(),
  };
}

function isValidReview(review) {
  return Boolean(review.author && review.text && Number.isInteger(review.rating)
    && review.rating >= 1 && review.rating <= 5);
}

function readLocalReviews() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeReview).filter(Boolean).slice(0, REVIEW_LIMIT);
  } catch {
    return [];
  }
}

function normalizeReview(value) {
  if (!value || typeof value !== 'object') return null;
  const createdAt = new Date(value.createdAt);
  const rating = Number(value.rating);
  if (!value.author || !value.text || !Number.isInteger(rating) || rating < 1 || rating > 5
    || Number.isNaN(createdAt.getTime())) return null;
  return {
    id: String(value.id || `${createdAt.getTime()}-${rating}`),
    author: String(value.author).slice(0, 40),
    rating,
    text: String(value.text).slice(0, 500),
    createdAt: createdAt.toISOString(),
  };
}

function saveReview(review) {
  try {
    const reviews = [review, ...readLocalReviews()].slice(0, REVIEW_LIMIT);
    window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviews));
    return true;
  } catch {
    return false;
  }
}

function showReviewFeedback(message, tone) {
  const feedback = $('#reviewFeedback');
  if (!feedback) return;
  feedback.className = `form-feedback ${tone}`;
  feedback.textContent = message;
  feedback.classList.remove('hidden');
}

function renderLocalReviews(reviews) {
  const list = $('#reviewList');
  const count = $('#reviewCount');
  if (!list) return;

  if (count) count.textContent = `${reviews.length}개`;
  list.replaceChildren();

  if (!reviews.length) {
    const empty = document.createElement('p');
    empty.className = 'review-empty';
    empty.textContent = '아직 작성된 후기가 없습니다. 첫 번째 이야기를 남겨 주세요.';
    list.append(empty);
    return;
  }

  reviews.forEach((review) => list.append(createReviewCard(review)));
}

function createReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review-card';

  const top = document.createElement('div');
  top.className = 'review-card-top';
  const author = document.createElement('span');
  author.className = 'review-card-author';
  author.textContent = review.author;
  const date = document.createElement('time');
  date.className = 'review-card-date';
  date.dateTime = review.createdAt;
  date.textContent = new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(review.createdAt));
  top.append(author, date);

  const rating = document.createElement('div');
  rating.className = 'review-card-rating';
  rating.setAttribute('aria-label', `${review.rating}점`);
  rating.textContent = `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`;

  const text = document.createElement('p');
  text.className = 'review-card-text';
  text.textContent = review.text;
  card.append(top, rating, text);
  return card;
}
