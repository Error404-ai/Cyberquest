const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimit');
const logger = require('./utils/logger');

const app = express();

app.use(helmet());

const getAllowedOrigins = () => {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ];

  if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS
      .split(',')
      .map(o => o.trim())
      .filter(o => o.length > 0);

    return process.env.NODE_ENV === 'production'
      ? envOrigins
      : [...new Set([...defaultOrigins, ...envOrigins])];
  }

  return defaultOrigins;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    logger.debug(`🌍 CORS Request from: ${origin}`);
    logger.debug(`✅ Allowed origins: ${allowedOrigins.join(', ')}`);

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`🚫 Blocked by CORS: ${origin}`);
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
  });
}

app.use(apiLimiter);

app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

app.get('/', (req, res) => {
  res.json({
    message: 'CyberQuest API',
    version: process.env.API_VERSION || 'v1',
    status: 'running',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      games: '/api/v1/games',
      leaderboard: '/api/v1/leaderboard',
      achievements: '/api/v1/achievements'
    }
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
