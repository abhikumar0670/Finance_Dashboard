import { Request, Response, NextFunction } from 'express';
import { FinanceRecordService } from '../services/financeRecord.service';
import {
  CreateFinanceRecordInput,
  UpdateFinanceRecordInput,
  GetFinanceRecordsQuery
} from '../validators/financeRecord.validator';

export class FinanceRecordController {
  private financeRecordService: FinanceRecordService;

  constructor() {
    this.financeRecordService = new FinanceRecordService();
  }

  createRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateFinanceRecordInput = req.body;
      const userId = req.user!.userId;

      const record = await this.financeRecordService.createRecord(data, userId);

      res.status(201).json({
        success: true,
        message: 'Finance record created successfully',
        data: record
      });
    } catch (error) {
      next(error);
    }
  };

  getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: GetFinanceRecordsQuery = req.query as any;
      const result = await this.financeRecordService.getRecords(filters);

      res.status(200).json({
        success: true,
        message: 'Records retrieved successfully',
        data: result.records,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  };

  getRecordById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const record = await this.financeRecordService.getRecordById(id);

      res.status(200).json({
        success: true,
        message: 'Record retrieved successfully',
        data: record
      });
    } catch (error) {
      next(error);
    }
  };

  updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateFinanceRecordInput = req.body;

      const record = await this.financeRecordService.updateRecord(id, data);

      res.status(200).json({
        success: true,
        message: 'Record updated successfully',
        data: record
      });
    } catch (error) {
      next(error);
    }
  };

  deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.financeRecordService.deleteRecord(id);

      res.status(200).json({
        success: true,
        message: 'Record deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}
