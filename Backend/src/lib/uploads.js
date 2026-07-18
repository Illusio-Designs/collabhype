import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

// Where uploaded files (brand logos, etc.) are stored on disk. Defaults to
// Backend/uploads, which the FTP deploy workflow explicitly never deletes, so
// files survive every deploy. Override with UPLOAD_DIR if the host needs an
// absolute path outside the app root.
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(here, '../../uploads');
