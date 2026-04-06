import express, { Application } from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

export const createApp = (): Application => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });

  // API routes
  app.use('/api', routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
