import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { UserRole } from '../types';

const router = Router();
const dashboardController = new DashboardController();

// All routes require authentication
router.use(authenticate);

// GET /dashboard/summary - Accessible by Viewer, Analyst, and Admin
router.get(
  '/summary',
  requireRole([UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN]),
  dashboardController.getSummary
);

export default router;
