import { Request } from "express";

export interface AccountRequest extends Request {
  account?: any;
}