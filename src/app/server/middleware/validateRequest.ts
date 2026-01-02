import { Request, Response, NextFunction } from "express";

export default function validateRequestMiddleware<T>(
  validator: (data: T) => T
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await validator(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
