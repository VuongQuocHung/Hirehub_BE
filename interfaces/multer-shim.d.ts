declare module "multer" {
  import { Request, RequestHandler } from "express";

  export interface StorageEngine {
    _handleFile(
      req: Request,
      file: Express.Multer.File,
      callback: (error?: any, info?: Partial<Express.Multer.File>) => void
    ): void;

    _removeFile(
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null) => void
    ): void;
  }

  export interface Options {
    storage?: StorageEngine;
    dest?: string;
    limits?: any;
    preservePath?: boolean;
    fileFilter?: (
      req: Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile?: boolean) => void
    ) => void;
  }

  export interface Multer {
    single(fieldName: string): RequestHandler;
    array(fieldName: string, maxCount?: number): RequestHandler;
    fields(fields: readonly { name: string; maxCount?: number }[]): RequestHandler;
    any(): RequestHandler;
    none(): RequestHandler;
  }

  export default function multer(options?: Options): Multer;
}
