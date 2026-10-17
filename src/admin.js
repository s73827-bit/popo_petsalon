const $ = (selector) => document.querySelector(selector);
const adminState = { reviews: [], cases: [], reservations: [] };

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || payload.error || `요청 실패 (${response.status})`);
  return payload;
}

function setFeedback(message, tone = 'info') {
  const target = $('#caseFeedback');
  if (!target) return;
  target.textContent = message;
  target.dataset.tone = tone;
}

async function boot() {
  try {
    const testRequested = new URLSearchParams(window.location.search).get('test') === '1';
    if (testRequested) {
      $('#adminTestLogin')?.classList.remove('hidden');
      $('#testPinForm')?.addEventListener('submit', handleTestPinLogin);
    }
    const session = await api('/api/auth/me');
    $('#adminIdentity').textContent = session.demoMode ? '테스트 PIN · 15분 세션' : (session.user?.email || '');
    if (!session.isAdmin) {
      $('#adminGateMessage').textContent = session.signedIn
        ? '현재 로그인한 계정에는 관리자 권한이 없습니다.'
        : '관리자 이메일로 로그인하면 대시보드가 열립니다.';
      return;
    }
    if (!session.demoMode) $('#adminTestWarning')?.classList.add('hidden');
    $('#adminGate').classList.add('hidden');
    $('#adminWorkspace').classList.remove('hidden');
    $('#adminLogout').classList.remove('hidden');
    bindEvents();
    await refreshAll();
  } catch (error) {
    $('#adminGateMessage').textContent = error.message;
  }
}

async function handleTestPinLogin(event) {
  event.preventDefault();
  const feedback = $('#testPinFeedback');
  const pin = new FormData(event.currentTarget).get('pin');
  try {
    await api('/api/auth/test-login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pin }) });
    window.location.replace('/admin?test=1');
  } catch (error) {
    if (feedback) {
      feedback.textContent = error.message;
      feedback.dataset.tone = 'error';
    }
  }
}

function bindEvents() {
  $('#refreshReviews').addEventListener('click', loadReviews);
  $('#refreshReservations').addEventListener('click', loadReservations);
  $('#caseForm').addEventListener('submit', saveCase);
  $('#caseCancel').addEventListener('click', resetCaseForm);
}

async function refreshAll() {
  await Promise.all([loadReviews(), loadCases(), loadReservations(), loadPaymentStatus()]);
}

async function loadReviews() {
  const payload = await api('/api/admin/reviews');
  adminState.reviews = payload.reviews || [];
  $('#reviewCount').textContent = String(adminState.reviews.filter((item) => !item.deletedAt).length);
  const target = $('#adminReviewsList');
  if (!adminState.reviews.length) {
    target.innerHTML = '<p class="admin-muted">아직 등록된 리뷰가 없습니다.</p>';
    return;
  }
  target.innerHTML = adminState.reviews.map((review) => `
    <article class="admin-list-item ${review.deletedAt ? 'is-deleted' : ''}">
      <div class="admin-list-item-main">
        <div class="admin-review-top"><span class="admin-stars" aria-label="${review.rating}점">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span><strong>${escapeHtml(review.authorName)}</strong><time>${escapeHtml(formatDate(review.createdAt))}</time></div>
        <p>${escapeHtml(review.text)}</p>
        ${review.imageUrl ? `<img class="admin-thumb" src="${escapeHtml(review.imageUrl)}" alt="${escapeHtml(review.authorName)} 리뷰 사진" />` : ''}
      </div>
      <div class="admin-item-actions">${review.deletedAt ? '<span class="admin-deleted-label">삭제됨</span>' : `<button class="btn btn-danger" type="button" data-delete-review="${escapeHtml(review.id)}">삭제</button>`}</div>
    </article>
  `).join('');
  target.querySelectorAll('[data-delete-review]').forEach((button) => button.addEventListener('click', async () => {
    if (!window.confirm('이 리뷰를 공개 목록에서 삭제할까요?')) return;
    await api(`/api/admin/reviews/${button.dataset.deleteReview}`, { method: 'DELETE' });
    await loadReviews();
  }));
}

async function loadCases() {
  const payload = await api('/api/admin/cases');
  adminState.cases = payload.cases || [];
  $('#caseCount').textContent = String(adminState.cases.filter((item) => !item.deletedAt).length);
  const target = $('#adminCasesList');
  if (!adminState.cases.length) {
    target.innerHTML = '<p class="admin-muted">아직 등록된 미용 케이스가 없습니다.</p>';
    return;
  }
  target.innerHTML = adminState.cases.map((item) => `
    <article class="admin-list-item ${item.deletedAt ? 'is-deleted' : ''}">
      <div class="admin-list-item-main">
        <div class="admin-review-top"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.breed || '견종 미입력')}</span><time>${escapeHtml(formatDate(item.createdAt))}</time></div>
        <div class="admin-case-copy"><div><b>BEFORE</b><p>${escapeHtml(item.beforeText)}</p></div><div><b>AFTER</b><p>${escapeHtml(item.afterText)}</p></div></div>
        ${item.careNote ? `<p class="admin-care-note"><b>CARE NOTE</b> ${escapeHtml(item.careNote)}</p>` : ''}
        <div class="admin-case-images">${item.beforeImageUrl ? `<img class="admin-thumb" src="${escapeHtml(item.beforeImageUrl)}" alt="BEFORE ${escapeHtml(item.title)}" />` : ''}${item.afterImageUrl ? `<img class="admin-thumb" src="${escapeHtml(item.afterImageUrl)}" alt="AFTER ${escapeHtml(item.title)}" />` : ''}</div>
      </div>
      <div class="admin-item-actions">${item.deletedAt ? '<span class="admin-deleted-label">삭제됨</span>' : `<button class="btn btn-secondary" type="button" data-edit-case="${escapeHtml(item.id)}">수정</button><button class="btn btn-danger" type="button" data-delete-case="${escapeHtml(item.id)}">삭제</button>`}</div>
    </article>
  `).join('');
  target.querySelectorAll('[data-edit-case]').forEach((button) => button.addEventListener('click', () => editCase(button.dataset.editCase)));
  target.querySelectorAll('[data-delete-case]').forEach((button) => button.addEventListener('click', async () => {
    if (!window.confirm('이 케이스 스토리를 공개 목록에서 삭제할까요?')) return;
    await api(`/api/admin/cases/${button.dataset.deleteCase}`, { method: 'DELETE' });
    await loadCases();
  }));
}

async function loadReservations() {
  const payload = await api('/api/admin/reservations');
  adminState.reservations = payload.reservations || [];
  $('#newReservationCount').textContent = String(adminState.reservations.filter((item) => item.status === 'new').length);
  const target = $('#adminReservationsList');
  if (!adminState.reservations.length) {
    target.innerHTML = '<p class="admin-muted">아직 접수된 예약 문의가 없습니다.</p>';
    return;
  }
  target.innerHTML = adminState.reservations.map((item) => `
    <article class="admin-list-item">
      <div class="admin-list-item-main">
        <div class="admin-review-top"><strong>${escapeHtml(item.petName)}</strong><span>${escapeHtml(item.ownerName)} · ${escapeHtml(item.phone)}</span><time>${escapeHtml(formatDate(item.createdAt))}</time></div>
        <p>${escapeHtml(item.breed)} / ${escapeHtml(item.weight)} · ${escapeHtml(item.serviceType)}</p>
        ${item.styleRequest ? `<p><b>요청:</b> ${escapeHtml(item.styleRequest)}</p>` : ''}
        ${item.petNotes ? `<p><b>특이사항:</b> ${escapeHtml(item.petNotes)}</p>` : ''}
      </div>
      <label class="admin-status-control">상태<select data-reservation-status="${escapeHtml(item.id)}"><option value="new" ${item.status === 'new' ? 'selected' : ''}>신규</option><option value="contacted" ${item.status === 'contacted' ? 'selected' : ''}>연락 완료</option><option value="confirmed" ${item.status === 'confirmed' ? 'selected' : ''}>예약 확정</option><option value="completed" ${item.status === 'completed' ? 'selected' : ''}>완료</option><option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>취소</option></select></label>
    </article>
  `).join('');
  target.querySelectorAll('[data-reservation-status]').forEach((select) => select.addEventListener('change', async () => {
    await api(`/api/admin/reservations/${select.dataset.reservationStatus}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status: select.value }) });
    await loadReservations();
  }));
}

async function loadPaymentStatus() {
  const payload = await api('/api/payments/catalog');
  $('#paymentPreparationStatus').textContent = payload.configured ? '상품 카탈로그가 구성되어 Checkout을 사용할 수 있습니다.' : payload.message;
}

function editCase(id) {
  const item = adminState.cases.find((entry) => entry.id === id);
  if (!item) return;
  const form = $('#caseForm');
  form.elements.caseId.value = item.id;
  form.elements.title.value = item.title || '';
  form.elements.breed.value = item.breed || '';
  form.elements.beforeText.value = item.beforeText || '';
  form.elements.afterText.value = item.afterText || '';
  form.elements.careNote.value = item.careNote || '';
  $('#caseSubmit').textContent = '케이스 수정 저장';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetCaseForm() {
  $('#caseForm').reset();
  $('#caseId').value = '';
  $('#caseSubmit').textContent = '케이스 저장';
  setFeedback('');
}

async function saveCase(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const id = form.elements.caseId.value;
  const body = new FormData(form);
  body.delete('caseId');
  const url = id ? `/api/admin/cases/${id}/multipart` : '/api/admin/cases/multipart';
  const method = id ? 'PUT' : 'POST';
  try {
    await api(url, { method, body });
    setFeedback(id ? '케이스가 수정되었습니다.' : '케이스가 등록되었습니다.', 'success');
    resetCaseForm();
    await loadCases();
  } catch (error) {
    setFeedback(error.message, 'error');
  }
}

boot();
