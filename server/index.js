import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import Stripe from 'stripe';
import { createServer as createViteServer } from 'vite';
import {
  ensureSchema,
  storageMode,
  listReviews,
  createReview,
  deleteReview,
  listCases,
  createCase,
  updateCase,
  deleteCase,
  createReservation,
  listReservations,
  updateReservationStatus,
  recordStripeEvent,
} from './db.js';
import { authRoutes, requireAdmin } from './auth.js';
import { uploadImage, validateImage } from './storage.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const address = '경기도 안양시 동안구 관양동 1455-11';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2 },
  fileFilter: (_req, file, callback) => {
    try {
      validateImage(file);
      callback(null, true);
    } catch (error) {
      callback(error);
    }
  },
});

app.disable('x-powered-by');
app.use(cookieParser());

app.get('/_app/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'popo', storageMode });
});

app.get('/api/public-config', (_req, res) => {
  const mapsApiUrl = process.env.MANUS_API_URL ? `${process.env.MANUS_API_URL.replace(/\/$/, '')}/v1/maps/proxy/maps/api/js` : null;
  res.set('Cache-Control', 'public, max-age=60');
  res.json({
    address,
    mapsApiUrl,
    mapsBrowserKey: process.env.MANUS_API_BROWSER_KEY || null,
    stripeReady: Boolean(stripe),
    catalogConfigured: false,
  });
});

authRoutes(app);

// Stripe webhook must receive exact raw bytes before any JSON parser.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      res.status(503).json({ error: 'stripe_webhook_not_configured' });
      return;
    }
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    const isNew = await recordStripeEvent(event.id, event.type);
    // The catalog is intentionally empty while the owner decides products/prices.
    // Acknowledge subscribed events and make redelivery idempotent without granting entitlements.
    if (!isNew) {
      res.json({ received: true, duplicate: true });
      return;
    }
    res.json({ received: true, handled: false, reason: 'catalog_not_configured' });
  } catch (error) {
    if (error?.type === 'StripeSignatureVerificationError') {
      res.status(400).json({ error: 'invalid_stripe_signature' });
      return;
    }
    next(error);
  }
});

app.use(express.json({ limit: '1mb' }));

app.get('/api/reviews', async (_req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json({ reviews: await listReviews() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reviews', upload.single('image'), async (req, res, next) => {
  try {
    const authorName = String(req.body.authorName || '').trim();
    const text = String(req.body.text || '').trim();
    const rating = Number(req.body.rating);
    if (!authorName || authorName.length > 80 || !text || text.length > 2000 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ error: 'review_fields_invalid' });
      return;
    }
    const imageUrl = req.file ? await uploadImage(req.file, 'popo/reviews') : null;
    const review = await createReview({ rating, text, authorName, imageUrl });
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
});

app.get('/api/cases', async (_req, res, next) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json({ cases: await listCases() });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reservations', async (req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  try {
    const fields = {
      ownerName: String(req.body.ownerName || '').trim(),
      phone: String(req.body.phone || req.body.ownerPhone || '').trim(),
      petName: String(req.body.petName || '').trim(),
      breed: String(req.body.breed || '').trim(),
      weight: String(req.body.weight || '').trim(),
      serviceType: String(req.body.serviceType || '').trim(),
      styleRequest: String(req.body.styleRequest || '').trim(),
      petNotes: String(req.body.petNotes || '').trim(),
      preferredDate: String(req.body.preferredDate || '').trim(),
      preferredTime: String(req.body.preferredTime || '').trim(),
    };
    const required = ['ownerName', 'phone', 'petName', 'breed', 'weight', 'serviceType'];
    if (required.some((key) => !fields[key]) || Object.values(fields).some((value) => value.length > 2000)) {
      res.status(400).json({ error: 'reservation_fields_invalid' });
      return;
    }
    const reservation = await createReservation(fields);
    res.status(201).json({ reservation: { id: reservation.id, status: reservation.status, createdAt: reservation.createdAt } });
  } catch (error) {
    next(error);
  }
});

app.get('/api/payments/catalog', (_req, res) => {
  res.json({ configured: false, products: [], message: '상품·가격 등록 후 Checkout을 활성화할 수 있습니다.' });
});

app.post('/api/payments/checkout', (_req, res) => {
  res.status(409).json({ error: 'catalog_not_configured', message: 'POPO 상품과 가격이 아직 등록되지 않아 결제를 시작할 수 없습니다.' });
});

// Admin API: authentication is applied to every route below.
app.get('/api/admin/reviews', requireAdmin(async (_req, res) => {
  res.json({ reviews: await listReviews({ includeDeleted: true }) });
}));
app.delete('/api/admin/reviews/:id', requireAdmin(async (req, res) => {
  res.json({ deleted: await deleteReview(req.params.id) });
}));

app.get('/api/admin/cases', requireAdmin(async (_req, res) => {
  res.json({ cases: await listCases({ includeDeleted: true }) });
}));
app.post('/api/admin/cases', requireAdmin(async (req, res) => {
  // This handler is replaced below by the multipart-aware route registered later.
  res.status(400).json({ error: 'multipart_required' });
}));
app.put('/api/admin/cases/:id', requireAdmin(async (req, res) => {
  res.status(400).json({ error: 'multipart_required' });
}));
app.delete('/api/admin/cases/:id', requireAdmin(async (req, res) => {
  res.json({ deleted: await deleteCase(req.params.id) });
}));

app.get('/api/admin/reservations', requireAdmin(async (_req, res) => {
  res.set('Cache-Control', 'private, no-store');
  res.json({ reservations: await listReservations() });
}));
app.patch('/api/admin/reservations/:id', requireAdmin(async (req, res) => {
  const reservation = await updateReservationStatus(req.params.id, String(req.body.status || ''));
  if (!reservation) {
    res.status(400).json({ error: 'reservation_status_invalid' });
    return;
  }
  res.json({ reservation });
}));

// Multipart admin case routes use the same OAuth wrapper with upload parsing.
const parseCaseFiles = upload.fields([{ name: 'beforeImage', maxCount: 1 }, { name: 'afterImage', maxCount: 1 }]);

// Express route ordering: these are registered after the JSON-only placeholders and therefore
// intentionally use distinct /multipart suffix endpoints from the browser client.
app.post('/api/admin/cases/multipart', parseCaseFiles, requireAdmin(async (req, res) => {
  const files = req.files || {};
  const body = req.body;
  if (!String(body.title || '').trim() || !String(body.beforeText || '').trim() || !String(body.afterText || '').trim()) {
    res.status(400).json({ error: 'case_fields_invalid' });
    return;
  }
  const [beforeImage, afterImage] = await Promise.all([
    files.beforeImage?.[0] ? uploadImage(files.beforeImage[0], 'popo/cases') : null,
    files.afterImage?.[0] ? uploadImage(files.afterImage[0], 'popo/cases') : null,
  ]);
  const item = await createCase({
    title: String(body.title).trim(),
    breed: String(body.breed || '').trim(),
    beforeText: String(body.beforeText).trim(),
    afterText: String(body.afterText).trim(),
    beforeImageUrl: beforeImage,
    afterImageUrl: afterImage,
    careNote: String(body.careNote || '').trim(),
  });
  res.status(201).json({ case: item });
}));

app.put('/api/admin/cases/:id/multipart', parseCaseFiles, requireAdmin(async (req, res) => {
  const existing = (await listCases()).find((item) => item.id === req.params.id);
  if (!existing) {
    res.status(404).json({ error: 'case_not_found' });
    return;
  }
  const files = req.files || {};
  const [beforeImage, afterImage] = await Promise.all([
    files.beforeImage?.[0] ? uploadImage(files.beforeImage[0], 'popo/cases') : existing.beforeImageUrl,
    files.afterImage?.[0] ? uploadImage(files.afterImage[0], 'popo/cases') : existing.afterImageUrl,
  ]);
  const item = await updateCase(req.params.id, {
    title: String(req.body.title || existing.title).trim(),
    breed: String(req.body.breed || '').trim(),
    beforeText: String(req.body.beforeText || existing.beforeText).trim(),
    afterText: String(req.body.afterText || existing.afterText).trim(),
    beforeImageUrl: beforeImage,
    afterImageUrl: afterImage,
    careNote: String(req.body.careNote || '').trim(),
  });
  res.json({ case: item });
}));

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(isProduction ? dist : root, 'admin.html'));
});

if (isProduction) {
  app.use(express.static(dist, { index: 'index.html' }));
} else {
  const vite = await createViteServer({ root, server: { middlewareMode: true, hmr: true }, appType: 'mpa' });
  app.use(vite.middlewares);
}

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'not_found' });
    return;
  }
  res.status(404).send('Not found');
});

app.use((error, _req, res, _next) => {
  const status = error?.statusCode || (error?.code === 'LIMIT_FILE_SIZE' ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({ error: status >= 500 ? 'server_error' : (error.message || 'request_invalid') });
});

await ensureSchema();
app.listen(port, '0.0.0.0', () => {
  console.log(`POPO server listening on 0.0.0.0:${port} (${storageMode})`);
});
