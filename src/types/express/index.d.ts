// This file extends the Express Request interface with custom properties.

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedParams?: any;
      validatedQuery?: any;
      validatedFile?: Express.Multer.File;
    }
  }
}

// This export is necessary to make the file a module.
export {};
