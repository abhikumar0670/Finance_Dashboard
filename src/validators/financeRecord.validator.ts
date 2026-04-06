import { z } from 'zod';
import { TransactionType } from '../types';

export const createFinanceRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.nativeEnum(TransactionType),
    category: z.string().min(1, 'Category is required').max(50),
    date: z.string().datetime().or(z.date()).optional(),
    description: z.string().max(500).optional().default('')
  })
});

export const updateFinanceRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    type: z.nativeEnum(TransactionType).optional(),
    category: z.string().min(1).max(50).optional(),
    date: z.string().datetime().or(z.date()).optional(),
    description: z.string().max(500).optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid record ID')
  })
});

export const getFinanceRecordsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    category: z.string().optional(),
    type: z.nativeEnum(TransactionType).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10')
  })
});

export const deleteFinanceRecordSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid record ID')
  })
});

export type CreateFinanceRecordInput = z.infer<typeof createFinanceRecordSchema>['body'];
export type UpdateFinanceRecordInput = z.infer<typeof updateFinanceRecordSchema>['body'];
export type GetFinanceRecordsQuery = z.infer<typeof getFinanceRecordsSchema>['query'];
