// POPO 애견미용샵 공개 페이지 인터랙션
// 모바일 메뉴, FAQ, 예약 안내, 브라우저 기반 후기 작성

const REVIEW_STORAGE_KEY = 'popo-local-reviews-v1';
const REVIEW_LIMIT = 30;
const $ = (selector, root = document) => root.querySelector(selector);

window.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initFaqAccordion();
  initReservationForm();
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

function initReservationForm() {
  const form = $('#reservationForm');
  const feedback = $('#formFeedback');
  if (!form || !feedback) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = readReservationFields(form);
    resetFeedback(feedback);

    if (hasMissingReservationField(fields)) {
      showReservationValidation(feedback);
    } else {
      showReservationSummary(feedback, fields);
    }

    feedback.classList.remove('hidden');
    feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function readReservationFields(form) {
  return {
    ownerName: getFieldValue(form, 'ownerName'),
    ownerPhone: getFieldValue(form, 'ownerPhone'),
    petName: getFieldValue(form, 'petName'),
    petBreed: getFieldValue(form, 'petBreed'),
    petWeight: getFieldValue(form, 'petWeight'),
    serviceType: getFieldValue(form, 'serviceType'),
  };
}

function getFieldValue(form, fieldName) {
  return form.elements.namedItem(fieldName)?.value?.trim() || '';
}

function hasMissingReservationField(fields) {
  return ['ownerName', 'ownerPhone', 'petName', 'petBreed', 'petWeight', 'serviceType']
    .some((fieldName) => !fields[fieldName]);
}

function resetFeedback(feedback, tone = 'info') {
  feedback.className = `form-feedback ${tone}`;
  feedback.textContent = '';
}

function showReservationValidation(feedback) {
  const title = document.createElement('strong');
  title.textContent = '입력 항목 확인 안내';
  const message = document.createElement('span');
  message.textContent = '필수 항목(보호자 성함, 연락처, 반려견 이름, 견종, 체중, 희망 서비스)을 모두 입력해 주세요.';
  const note = document.createElement('small');
  note.className = 'feedback-note';
  note.textContent = '현재는 안내용 화면이며, 예약 정보는 서버로 전송되거나 저장되지 않습니다.';
  feedback.append(title, document.createElement('br'), message, document.createElement('br'), note);
}

function showReservationSummary(feedback, fields) {
  const title = document.createElement('strong');
  title.textContent = '양식 구성 확인 완료';
  const greeting = document.createElement('p');
  greeting.className = 'feedback-greeting';
  greeting.textContent = `«${fields.ownerName}» 보호자님과 «${fields.petName}»(${fields.petBreed}, ${fields.petWeight}) 아이를 위한 맞춤 케어 양식이 구성되었습니다.`;
  const note = document.createElement('span');
  note.className = 'feedback-note feedback-notice';
  note.textContent = '현재 사이트는 오픈 준비용 안내 페이지입니다. 예약 신청은 매장 공식 채널을 통해 순차적으로 진행됩니다.';
  feedback.append(title, document.createElement('br'), greeting, note);
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
