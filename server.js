const http = require('http');
const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/utils/logger');
const connectDB = require('./src/config/database');
const { initializeSocket } = require('./src/config/socket');

let server;

const startServer = async () => {
  await connectDB();

  server = http.createServer(app);

  // Initialize Socket.io
  initializeSocket(server);

  server.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    logger.info(`API Version: ${config.apiVersion}`);
    logger.info(`Health check: http://localhost:${config.port}/health`);
    logger.info(`API endpoint: http://localhost:${config.port}/api/${config.apiVersion}`);
    logger.info(`WebSocket server initialized`);
  });
};

const gracefulShutdown = signal => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('uncaughtException', err => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', err => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

startServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
