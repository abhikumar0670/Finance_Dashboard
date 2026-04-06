import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getSummary = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = await this.dashboardService.getSummary();

      res.status(200).json({
        success: true,
        message: 'Dashboard summary retrieved successfully',
        data: summary
      });
    } catch (error) {
      next(error);
    }
  };
}
