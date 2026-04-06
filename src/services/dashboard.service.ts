import { FinanceRecord } from '../models/FinanceRecord.model';
import { TransactionType } from '../types';

interface CategoryTotal {
  category: string;
  total: number;
}

interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  categoryWiseTotals: CategoryTotal[];
  recentActivity: any[];
}

export class DashboardService {
  async getSummary(): Promise<DashboardSummary> {
    // Use MongoDB Aggregation Pipeline for efficient calculation
    const result = await FinanceRecord.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $facet: {
          // Calculate totals by type
          totals: [
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amount' }
              }
            }
          ],
          // Calculate category-wise totals
          categoryTotals: [
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' }
              }
            },
            {
              $project: {
                _id: 0,
                category: '$_id',
                total: 1
              }
            },
            {
              $sort: { total: -1 }
            }
          ],
          // Get recent activity
          recentActivity: [
            {
              $sort: { date: -1 }
            },
            {
              $limit: 5
            },
            {
              $lookup: {
                from: 'users',
                localField: 'createdBy',
                foreignField: '_id',
                as: 'creator'
              }
            },
            {
              $unwind: {
                path: '$creator',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                _id: 1,
                amount: 1,
                type: 1,
                category: 1,
                date: 1,
                description: 1,
                'creator.name': 1,
                'creator.email': 1
              }
            }
          ]
        }
      }
    ]);

    const data = result[0];

    // Extract totals
    let totalIncome = 0;
    let totalExpenses = 0;

    data.totals.forEach((item: any) => {
      if (item._id === TransactionType.INCOME) {
        totalIncome = item.total;
      } else if (item._id === TransactionType.EXPENSE) {
        totalExpenses = item.total;
      }
    });

    const netBalance = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netBalance,
      categoryWiseTotals: data.categoryTotals,
      recentActivity: data.recentActivity
    };
  }
}
