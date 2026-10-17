import { randomBytes, timingSafeEqual } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import express from 'express';

const COOKIE_NAME = 'webdev_app_session';
const ADMIN_EMAILS = new Set(
  (process.env.POPO_ADMIN_EMAILS || 's7382@bot.cue.im')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);
// Public testing mode is opt-in only; normal operation uses Manus OAuth.
export const ADMIN_TEST_MODE = process.env.POPO_ADMIN_TEST_MODE === 'true';

function secretKey() {
  return process.env.MANUS_JWT_SECRET ? new TextEncoder().encode(process.env.MANUS_JWT_SECRET) : null;
}

export function publicOrigin(req) {
  const forwardedHost = req.headers['x-forwarded-host'];
  const forwardedProto = req.headers['x-forwarded-proto'];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || req.headers.host;
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto) || (req.secure ? 'https' : 'http');
  return `${proto}://${host}`;
}

function readEmail(payload) {
  const candidate = payload?.email || payload?.emailAddress || payload?.user?.email;
  return typeof candidate === 'string' ? candidate.toLowerCase() : null;
}

function pinsMatch(provided, expected) {
  if (!provided || !expected) return false;
  const providedBytes = Buffer.from(String(provided));
  const expectedBytes = Buffer.from(String(expected));
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes);
}

export async function getSession(req) {
  const token = req.cookies?.[COOKIE_NAME];
  const secret = secretKey();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (process.env.MANUS_PROJECT_ID && payload.appId && payload.appId !== process.env.MANUS_PROJECT_ID) return null;
    const email = readEmail(payload);
    const testMode = payload.testMode === true;
    return {
      openId: payload.openId || payload.sub || null,
      email,
      name: payload.name || null,
      isAdmin: testMode || Boolean(email && ADMIN_EMAILS.has(email)),
      demoMode: testMode,
    };
  } catch {
    return null;
  }
}

export function requireAdmin(handler) {
  return async (req, res, next) => {
    const session = await getSession(req);
    if (ADMIN_TEST_MODE) {
      req.user = { email: 'demo@popopet.local', name: 'POPO 테스트 관리자', isAdmin: true, demoMode: true };
      try {
        await handler(req, res, next);
      } catch (error) {
        next(error);
      }
      return;
    }
    if (!session?.isAdmin) {
      res.status(session ? 403 : 401).json({ error: 'admin_auth_required', loginUrl: '/api/auth/login' });
      return;
    }
    req.user = session;
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function authRoutes(app) {
  app.get('/api/auth/me', async (req, res) => {
    const session = await getSession(req);
    if (ADMIN_TEST_MODE) {
      res.json({ signedIn: false, demoMode: true, user: { email: 'demo@popopet.local', name: 'POPO 테스트 관리자' }, isAdmin: true });
      return;
    }
    res.json({ signedIn: Boolean(session), demoMode: Boolean(session?.demoMode), user: session ? { email: session.email, name: session.name } : null, isAdmin: Boolean(session?.isAdmin) });
  });

  app.post('/api/auth/test-login', express.json({ limit: '8kb' }), async (req, res, next) => {
    try {
      const requestedPin = String(req.body?.pin || '');
      if (!process.env.POPO_ADMIN_TEST_PIN || !pinsMatch(requestedPin, process.env.POPO_ADMIN_TEST_PIN)) {
        res.status(401).json({ error: 'test_pin_invalid', message: '테스트 PIN이 올바르지 않습니다.' });
        return;
      }
      const secret = secretKey();
      if (!secret || !process.env.MANUS_PROJECT_ID) {
        res.status(503).json({ error: 'test_login_not_configured' });
        return;
      }
      const sessionToken = await new SignJWT({ appId: process.env.MANUS_PROJECT_ID, openId: 'popo-test-pin', email: 'test@popopet.local', name: 'POPO 임시 테스트 관리자', testMode: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject('popo-test-pin')
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(secret);
      res.cookie(COOKIE_NAME, sessionToken, { httpOnly: true, sameSite: 'lax', secure: publicOrigin(req).startsWith('https://'), maxAge: 15 * 60 * 1000, path: '/' });
      res.json({ ok: true, demoMode: true, expiresInSeconds: 900 });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/login', (req, res) => {
    if (!process.env.MANUS_OAUTH_PORTAL_URL || !process.env.MANUS_PROJECT_ID) {
      res.status(503).json({ error: 'oauth_not_configured' });
      return;
    }
    const nonce = randomBytes(24).toString('hex');
    const redirectUri = `${publicOrigin(req)}/api/auth/callback`;
    const state = Buffer.from(JSON.stringify({ nonce, redirectUri })).toString('base64url');
    res.cookie('popo_oauth_nonce', nonce, { httpOnly: true, sameSite: 'lax', secure: redirectUri.startsWith('https://'), maxAge: 10 * 60 * 1000, path: '/' });
    const portal = new URL(`${process.env.MANUS_OAUTH_PORTAL_URL.replace(/\/$/, '')}/app-auth`);
    portal.searchParams.set('appId', process.env.MANUS_PROJECT_ID);
    portal.searchParams.set('redirectUri', redirectUri);
    portal.searchParams.set('state', state);
    portal.searchParams.set('responseType', 'code');
    res.redirect(portal.toString());
  });

  app.get('/api/auth/callback', async (req, res, next) => {
    try {
      const { code, state } = req.query;
      const storedNonce = req.cookies?.popo_oauth_nonce;
      const parsedState = state ? JSON.parse(Buffer.from(String(state), 'base64url').toString('utf8')) : null;
      if (!code || !parsedState?.nonce || parsedState.nonce !== storedNonce || !parsedState.redirectUri) {
        res.status(400).send('인증 상태가 만료되었거나 유효하지 않습니다. 다시 로그인해 주세요.');
        return;
      }
      const exchangeUrl = `${process.env.MANUS_OAUTH_API_URL}/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
      const exchange = await fetch(exchangeUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clientId: process.env.MANUS_PROJECT_ID, grantType: 'authorization_code', code, redirectUri: parsedState.redirectUri }),
      });
      if (!exchange.ok) throw new Error(`OAuth token exchange failed: ${exchange.status}`);
      const token = await exchange.json();
      const infoResponse = await fetch(`${process.env.MANUS_OAUTH_API_URL}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ accessToken: token.accessToken }),
      });
      if (!infoResponse.ok) throw new Error(`OAuth identity lookup failed: ${infoResponse.status}`);
      const info = await infoResponse.json();
      const secret = secretKey();
      if (!secret) throw new Error('MANUS_JWT_SECRET is not available');
      const sessionToken = await new SignJWT({ appId: process.env.MANUS_PROJECT_ID, openId: info.openId, email: info.email, name: info.name })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(info.openId || info.email)
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret);
      res.clearCookie('popo_oauth_nonce', { path: '/' });
      res.cookie(COOKIE_NAME, sessionToken, { httpOnly: true, sameSite: 'lax', secure: parsedState.redirectUri.startsWith('https://'), maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });
      res.redirect('/admin');
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.redirect('/admin');
  });
}
