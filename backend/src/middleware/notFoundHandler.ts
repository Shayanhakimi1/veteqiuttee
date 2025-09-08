import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
  next(error);
}