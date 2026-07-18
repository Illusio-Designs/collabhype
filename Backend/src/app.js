import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import routes from './routes/index.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import { UPLOAD_DIR } from './lib/uploads.js';
import { prisma } from './lib/prisma.js';
import { ensureSeedData } from './lib/referenceSeed.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);

// Serve uploaded files (brand logos, etc.). CORP is relaxed to cross-origin so
// the frontend on another domain can render these images.
app.use(
  '/uploads',
  (_req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(UPLOAD_DIR, { maxAge: '7d', index: false }),
);

// Image uploads carry a base64 body larger than the global 1 MB JSON cap, so
// this router (with its own 8 MB parser) is mounted BEFORE the global parser.
app.use('/api/v1/uploads', uploadRoutes);

// Capture the raw body so the Razorpay webhook can verify the HMAC signature
// against the exact bytes Razorpay sent (req.body would be re-serialized).
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/', (_req, res) => {
  res.json({ name: 'Collabhype API', version: '0.1.0' });
});

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

// Seed reference data (niches + packages) if the DB is empty and provision the
// super-admin from env creds. Triggered here at module load — not only in
// index.js — so it runs regardless of which entry file the host (e.g. cPanel
// Passenger) boots. Idempotent, cheap on later boots, never blocks startup.
void ensureSeedData(prisma);

export default app;
