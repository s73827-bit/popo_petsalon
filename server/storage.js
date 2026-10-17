import { randomUUID } from 'node:crypto';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateImage(file) {
  if (!file) return null;
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    const error = new Error('지원되는 이미지 형식은 JPG, PNG, WEBP입니다.');
    error.statusCode = 400;
    throw error;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    const error = new Error('이미지는 5MB 이하만 업로드할 수 있습니다.');
    error.statusCode = 400;
    throw error;
  }
  return file;
}

function safeExtension(mimetype) {
  return mimetype === 'image/jpeg' ? 'jpg' : mimetype.split('/')[1];
}

export async function uploadImage(file, scope) {
  validateImage(file);
  if (!file) return null;

  const baseName = `${scope}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${safeExtension(file.mimetype)}`;
  const apiUrl = process.env.MANUS_API_URL;
  const apiKey = process.env.MANUS_API_KEY;

  // 로컬 Preview에서 storage 런타임 값이 아직 주입되지 않은 경우에도 폼을 검증할 수 있도록
  // 임시 data URL을 사용한다. Cloud/Published에서는 stable Manus Storage URL을 사용한다.
  if (!apiUrl || !apiKey) {
    return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  const presign = await fetch(`${apiUrl}/v1/storage/presign/put?path=${encodeURIComponent(baseName)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!presign.ok) throw new Error(`이미지 저장 URL 발급 실패: ${presign.status}`);
  const payload = await presign.json();
  if (!payload.url) throw new Error('이미지 저장 URL이 반환되지 않았습니다.');

  const upload = await fetch(payload.url, {
    method: 'PUT',
    headers: { 'content-type': file.mimetype },
    body: file.buffer,
  });
  if (!upload.ok) throw new Error(`이미지 업로드 실패: ${upload.status}`);
  return `/manus-storage/${baseName}`;
}
