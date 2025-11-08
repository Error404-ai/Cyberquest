require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 CyberQuest API running on port ${PORT}`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 API Version: ${process.env.API_VERSION || 'v1'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});
