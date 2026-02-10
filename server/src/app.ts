import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { router } from './routes';

const app = express();

const allowedOrigins = env.FRONTEND_URL.split(',')
  .map((origin) => origin.trim().replace(/^["']|["']$/g, ''))
  .filter(Boolean);

const normalizeOrigin = (value: string) => {
  const sanitized = value.trim().replace(/^["']|["']$/g, '');
  try {
    const url = new URL(sanitized);
    const hostname = url.hostname.replace(/^www\./i, '');
    const port = url.port ? `:${url.port}` : '';
    return `${url.protocol}//${hostname}${port}`;
  } catch {
    return sanitized.replace(/\/$/, '').toLowerCase();
  }
};

const allowedOriginSet = new Set(allowedOrigins.map(normalizeOrigin));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOriginSet.has(normalizeOrigin(origin))) return callback(null, true);
      // allow localhost wildcard (port can change)
      if (origin.startsWith('http://localhost') && allowedOrigins.some((o) => o.startsWith('http://localhost'))) {
        return callback(null, true);
      }
      // Return a normal CORS rejection instead of throwing 500 on preflight.
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', router);

export { app };
