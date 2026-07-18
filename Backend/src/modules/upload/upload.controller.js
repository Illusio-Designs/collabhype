import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { UPLOAD_DIR } from '../../lib/uploads.js';

// Accepted image types → file extension. SVG is intentionally excluded: it can
// carry scripts and we serve these files back to browsers.
const MIME_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const SAFE_FOLDER = /^[a-z0-9-]{1,40}$/;

// POST /api/v1/uploads/image
// Body: { dataUrl: "data:image/png;base64,…", folder?: "brand-logos" }
// Returns: { url } — an absolute URL the frontend can use directly in <img>.
export async function uploadImage(req, res) {
  const dataUrl = String(req.body?.dataUrl ?? '');
  const folderRaw = String(req.body?.folder ?? 'misc');
  const folder = SAFE_FOLDER.test(folderRaw) ? folderRaw : 'misc';

  const match = /^data:([a-z0-9.+/-]+);base64,(.+)$/is.exec(dataUrl);
  if (!match) throw ApiError.badRequest('Expected a base64 image data URL');

  const mime = match[1].toLowerCase();
  const ext = MIME_EXT[mime];
  if (!ext) throw ApiError.badRequest('Unsupported image type — use PNG, JPG, WEBP or GIF');

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0) throw ApiError.badRequest('Image is empty');
  if (buffer.length > MAX_BYTES) throw ApiError.badRequest('Image too large (max 3 MB)');

  const dir = path.join(UPLOAD_DIR, folder);
  await fs.mkdir(dir, { recursive: true });
  const filename = `${crypto.randomBytes(12).toString('hex')}.${ext}`;
  await fs.writeFile(path.join(dir, filename), buffer);

  const base = env.API_BASE_URL.replace(/\/+$/, '');
  res.status(201).json({ url: `${base}/uploads/${folder}/${filename}` });
}
