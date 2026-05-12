import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";

export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden. You do not have permission to access this resource.",
      });
      return;
    }
    next();
  };
};
