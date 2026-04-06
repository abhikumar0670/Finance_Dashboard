import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtPayload, UserRole } from '../types';
import { AppError } from '../utils/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided. Please authenticate.', 401);
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.user = decoded;
      next();
    } catch (error) {
      throw new AppError('Invalid or expired token. Please login again.', 401);
    }
  } catch (error) {
    next(error);
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401);
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
