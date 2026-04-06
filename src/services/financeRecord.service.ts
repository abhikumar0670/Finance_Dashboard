import { Types } from 'mongoose';
import { FinanceRecord, IFinanceRecord } from '../models/FinanceRecord.model';
import { AppError } from '../utils/AppError';
import {
  CreateFinanceRecordInput,
  UpdateFinanceRecordInput,
  GetFinanceRecordsQuery
} from '../validators/financeRecord.validator';

export class FinanceRecordService {
  async createRecord(
    data: CreateFinanceRecordInput,
    userId: string
  ): Promise<IFinanceRecord> {
    const record = await FinanceRecord.create({
      ...data,
      createdBy: new Types.ObjectId(userId)
    });

    return record;
  }

  async getRecords(filters: GetFinanceRecordsQuery): Promise<{
    records: IFinanceRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const { startDate, endDate, category, type, page = 1, limit = 10 } = filters;

    // Build query
    const query: any = { isDeleted: false };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) {
      query.category = category;
    }

    if (type) {
      query.type = type;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      FinanceRecord.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      FinanceRecord.countDocuments(query)
    ]);

    return {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getRecordById(id: string): Promise<IFinanceRecord> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid record ID', 400);
    }

    const record = await FinanceRecord.findOne({
      _id: id,
      isDeleted: false
    }).populate('createdBy', 'name email');

    if (!record) {
      throw new AppError('Record not found', 404);
    }

    return record;
  }

  async updateRecord(
    id: string,
    data: UpdateFinanceRecordInput
  ): Promise<IFinanceRecord> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid record ID', 400);
    }

    const record = await FinanceRecord.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!record) {
      throw new AppError('Record not found', 404);
    }

    return record;
  }

  async deleteRecord(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new AppError('Invalid record ID', 400);
    }

    const record = await FinanceRecord.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!record) {
      throw new AppError('Record not found', 404);
    }
  }
}
