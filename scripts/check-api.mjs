const base = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function get(path, options) {
  const response = await fetch(`${base}${path}`, options);
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { response, body };
}

const health = await get('/_app/health');
if (!health.response.ok || !health.body.ok) throw new Error(`health failed: ${health.response.status}`);
const reviews = await get('/api/reviews');
if (!reviews.response.ok || !Array.isArray(reviews.body.reviews)) throw new Error('reviews contract failed');
const cases = await get('/api/cases');
if (!cases.response.ok || !Array.isArray(cases.body.cases)) throw new Error('cases contract failed');
const catalog = await get('/api/payments/catalog');
if (!catalog.response.ok || catalog.body.configured !== false) throw new Error('catalog preparation contract failed');
const invalidReservation = await get('/api/reservations', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
if (invalidReservation.response.status !== 400) throw new Error(`reservation validation failed: ${invalidReservation.response.status}`);
const auth = await get('/api/auth/me');
if (!auth.response.ok || auth.body.demoMode !== false || auth.body.isAdmin !== false) throw new Error('OAuth mode contract failed');
const admin = await get('/api/admin/reviews');
if (admin.response.status !== 401) throw new Error(`OAuth admin protection failed: ${admin.response.status}`);
const badTestPin = await get('/api/auth/test-login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pin: 'invalid' }) });
if (badTestPin.response.status !== 401) throw new Error(`test PIN rejection failed: ${badTestPin.response.status}`);
if (!process.env.POPO_ADMIN_TEST_PIN) throw new Error('test PIN secret is not available to the runtime');
const validTestPin = await get('/api/auth/test-login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pin: process.env.POPO_ADMIN_TEST_PIN }) });
if (validTestPin.response.status !== 200) throw new Error(`valid test PIN failed: ${validTestPin.response.status}`);
const testCookie = validTestPin.response.headers.get('set-cookie')?.split(';')[0];
if (!testCookie) throw new Error('test PIN session cookie was not issued');
const testAdmin = await get('/api/admin/reviews', { headers: { cookie: testCookie } });
if (testAdmin.response.status !== 200) throw new Error(`test PIN admin session failed: ${testAdmin.response.status}`);
console.log('API smoke checks passed:', { health: health.response.status, reviews: reviews.response.status, cases: cases.response.status, catalog: catalog.response.status, auth: auth.response.status, admin: admin.response.status, testPin: badTestPin.response.status, testSession: testAdmin.response.status });
