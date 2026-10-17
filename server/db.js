import mysql from 'mysql2/promise';
import { randomUUID } from 'node:crypto';

const memory = {
  reviews: [],
  cases: [],
  reservations: [],
  stripeEvents: new Set(),
};

const hasDatabase = Boolean(process.env.DATABASE_URL);
const pool = hasDatabase
  ? mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
      namedPlaceholders: true,
      ssl: { rejectUnauthorized: true },
    })
  : null;

export const storageMode = hasDatabase ? 'mysql' : 'memory-preview';

export async function ensureSchema() {
  if (!pool) return;
  const statements = [
    `CREATE TABLE IF NOT EXISTS reviews (
      id VARCHAR(36) PRIMARY KEY,
      rating TINYINT NOT NULL,
      text TEXT NOT NULL,
      author_name VARCHAR(80) NOT NULL,
      image_url TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      INDEX idx_reviews_public (deleted_at, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS case_stories (
      id VARCHAR(36) PRIMARY KEY,
      title VARCHAR(160) NOT NULL,
      breed VARCHAR(80) NULL,
      before_text TEXT NOT NULL,
      after_text TEXT NOT NULL,
      before_image_url TEXT NULL,
      after_image_url TEXT NULL,
      care_note TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL,
      INDEX idx_cases_public (deleted_at, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS reservations (
      id VARCHAR(36) PRIMARY KEY,
      owner_name VARCHAR(100) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      pet_name VARCHAR(100) NOT NULL,
      breed VARCHAR(100) NOT NULL,
      weight VARCHAR(40) NOT NULL,
      service_type VARCHAR(80) NOT NULL,
      style_request TEXT NULL,
      pet_notes TEXT NULL,
      preferred_date VARCHAR(30) NULL,
      preferred_time VARCHAR(40) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'new',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_reservations_status (status, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
    `CREATE TABLE IF NOT EXISTS processed_stripe_events (
      id VARCHAR(255) PRIMARY KEY,
      event_type VARCHAR(120) NOT NULL,
      received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];
  for (const statement of statements) await pool.query(statement);
}

export async function listReviews({ includeDeleted = false } = {}) {
  if (!pool) return memory.reviews.filter((item) => includeDeleted || !item.deletedAt);
  const [rows] = await pool.query(
    `SELECT id, rating, text, author_name AS authorName, image_url AS imageUrl, created_at AS createdAt, deleted_at AS deletedAt
     FROM reviews ${includeDeleted ? '' : 'WHERE deleted_at IS NULL'} ORDER BY created_at DESC`,
  );
  return rows;
}

export async function createReview(data) {
  const row = { id: randomUUID(), ...data, createdAt: new Date().toISOString(), deletedAt: null };
  if (!pool) {
    memory.reviews.unshift(row);
    return row;
  }
  await pool.execute(
    `INSERT INTO reviews (id, rating, text, author_name, image_url) VALUES (:id, :rating, :text, :authorName, :imageUrl)`,
    row,
  );
  return row;
}

export async function deleteReview(id) {
  if (!pool) {
    const row = memory.reviews.find((item) => item.id === id);
    if (row) row.deletedAt = new Date().toISOString();
    return Boolean(row);
  }
  const [result] = await pool.execute(`UPDATE reviews SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id AND deleted_at IS NULL`, { id });
  return result.affectedRows > 0;
}

export async function listCases({ includeDeleted = false } = {}) {
  if (!pool) return memory.cases.filter((item) => includeDeleted || !item.deletedAt);
  const [rows] = await pool.query(
    `SELECT id, title, breed, before_text AS beforeText, after_text AS afterText,
      before_image_url AS beforeImageUrl, after_image_url AS afterImageUrl, care_note AS careNote,
      created_at AS createdAt, updated_at AS updatedAt, deleted_at AS deletedAt
     FROM case_stories ${includeDeleted ? '' : 'WHERE deleted_at IS NULL'} ORDER BY created_at DESC`,
  );
  return rows;
}

export async function createCase(data) {
  const row = { id: randomUUID(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), deletedAt: null };
  if (!pool) {
    memory.cases.unshift(row);
    return row;
  }
  await pool.execute(
    `INSERT INTO case_stories (id, title, breed, before_text, after_text, before_image_url, after_image_url, care_note)
     VALUES (:id, :title, :breed, :beforeText, :afterText, :beforeImageUrl, :afterImageUrl, :careNote)`,
    row,
  );
  return row;
}

export async function updateCase(id, data) {
  if (!pool) {
    const row = memory.cases.find((item) => item.id === id && !item.deletedAt);
    if (!row) return null;
    Object.assign(row, data, { updatedAt: new Date().toISOString() });
    return row;
  }
  await pool.execute(
    `UPDATE case_stories SET title=:title, breed=:breed, before_text=:beforeText, after_text=:afterText,
      before_image_url=:beforeImageUrl, after_image_url=:afterImageUrl, care_note=:careNote WHERE id=:id AND deleted_at IS NULL`,
    { id, ...data },
  );
  const rows = await listCases({ includeDeleted: false });
  return rows.find((row) => row.id === id) ?? null;
}

export async function deleteCase(id) {
  if (!pool) {
    const row = memory.cases.find((item) => item.id === id);
    if (row) row.deletedAt = new Date().toISOString();
    return Boolean(row);
  }
  const [result] = await pool.execute(`UPDATE case_stories SET deleted_at = CURRENT_TIMESTAMP WHERE id = :id AND deleted_at IS NULL`, { id });
  return result.affectedRows > 0;
}

export async function createReservation(data) {
  const row = { id: randomUUID(), ...data, status: 'new', createdAt: new Date().toISOString() };
  if (!pool) {
    memory.reservations.unshift(row);
    return row;
  }
  await pool.execute(
    `INSERT INTO reservations (id, owner_name, phone, pet_name, breed, weight, service_type, style_request, pet_notes, preferred_date, preferred_time, status)
     VALUES (:id, :ownerName, :phone, :petName, :breed, :weight, :serviceType, :styleRequest, :petNotes, :preferredDate, :preferredTime, :status)`,
    row,
  );
  return row;
}

export async function listReservations() {
  if (!pool) return memory.reservations;
  const [rows] = await pool.query(
    `SELECT id, owner_name AS ownerName, phone, pet_name AS petName, breed, weight,
      service_type AS serviceType, style_request AS styleRequest, pet_notes AS petNotes,
      preferred_date AS preferredDate, preferred_time AS preferredTime, status, created_at AS createdAt
     FROM reservations ORDER BY created_at DESC`,
  );
  return rows;
}

export async function updateReservationStatus(id, status) {
  const allowed = new Set(['new', 'contacted', 'confirmed', 'completed', 'cancelled']);
  if (!allowed.has(status)) return null;
  if (!pool) {
    const row = memory.reservations.find((item) => item.id === id);
    if (!row) return null;
    row.status = status;
    return row;
  }
  await pool.execute(`UPDATE reservations SET status=:status WHERE id=:id`, { id, status });
  const rows = await listReservations();
  return rows.find((row) => row.id === id) ?? null;
}

export async function recordStripeEvent(id, eventType) {
  if (!pool) {
    if (memory.stripeEvents.has(id)) return false;
    memory.stripeEvents.add(id);
    return true;
  }
  try {
    await pool.execute(`INSERT INTO processed_stripe_events (id, event_type) VALUES (:id, :eventType)`, { id, eventType });
    return true;
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') return false;
    throw error;
  }
}
