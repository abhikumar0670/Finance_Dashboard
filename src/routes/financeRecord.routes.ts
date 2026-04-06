import { Router } from 'express';
import { FinanceRecordController } from '../controllers/financeRecord.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createFinanceRecordSchema,
  updateFinanceRecordSchema,
  getFinanceRecordsSchema,
  deleteFinanceRecordSchema
} from '../validators/financeRecord.validator';
import { UserRole } from '../types';

const router = Router();
const financeRecordController = new FinanceRecordController();

// All routes require authentication
router.use(authenticate);

// POST /records - Admin only
router.post(
  '/',
  requireRole([UserRole.ADMIN]),
  validate(createFinanceRecordSchema),
  financeRecordController.createRecord
);

// GET /records - Admin and Analyst
router.get(
  '/',
  requireRole([UserRole.ADMIN, UserRole.ANALYST]),
  validate(getFinanceRecordsSchema),
  financeRecordController.getRecords
);

// GET /records/:id - Admin and Analyst
router.get(
  '/:id',
  requireRole([UserRole.ADMIN, UserRole.ANALYST]),
  financeRecordController.getRecordById
);

// PUT /records/:id - Admin only
router.put(
  '/:id',
  requireRole([UserRole.ADMIN]),
  validate(updateFinanceRecordSchema),
  financeRecordController.updateRecord
);

// DELETE /records/:id - Admin only (soft delete)
router.delete(
  '/:id',
  requireRole([UserRole.ADMIN]),
  validate(deleteFinanceRecordSchema),
  financeRecordController.deleteRecord
);

export default router;
