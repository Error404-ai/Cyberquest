const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');
const { apiLimiter } = require('./middlewares/rateLimit');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());

// ✅ IMPROVED CORS CONFIGURATION
const getAllowedOrigins = () => {
  // Default origins for development
  const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173'
  ];

  // Get origins from environment variable
  if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS
      .split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    
    // In development, merge with defaults; in production, use only env origins
    if (process.env.NODE_ENV === 'production') {
      return envOrigins;
    } else {
      return [...new Set([...defaultOrigins, ...envOrigins])];
    }
  }

  return defaultOrigins;
};

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Log for debugging
    logger.debug(`CORS Request from origin: ${origin}`);
    logger.debug(`Allowed origins: ${allowedOrigins.join(', ')}`);

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Request logging (development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'}`);
    next();
  });
}

// Apply rate limiting to all routes
app.use(apiLimiter);

// Mount API routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// Root endpoint
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

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;