import mongoose, { Document, Schema, Types } from 'mongoose';
import { TransactionType } from '../types';

export interface IFinanceRecord extends Document {
  amount: number;
  type: TransactionType;
  category: string;
  date: Date;
  description: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const financeRecordSchema = new Schema<IFinanceRecord>(
  {
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive']
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: [true, 'Transaction type is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters']
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound indexes for optimized queries
financeRecordSchema.index({ date: -1, category: 1 });
financeRecordSchema.index({ type: 1, isDeleted: 1 });
financeRecordSchema.index({ createdBy: 1, isDeleted: 1 });
financeRecordSchema.index({ isDeleted: 1, date: -1 });

export const FinanceRecord = mongoose.model<IFinanceRecord>('FinanceRecord', financeRecordSchema);
