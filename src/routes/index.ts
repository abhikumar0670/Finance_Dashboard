import { Router } from 'express';
import authRoutes from './auth.routes';
import financeRecordRoutes from './financeRecord.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/records', financeRecordRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
