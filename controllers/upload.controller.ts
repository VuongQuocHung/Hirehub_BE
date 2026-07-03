import { Request, Response } from "express";

export const imagePost = async (req: Request, res: Response) => {
  const link = req.file ? req.file.path : "";
  res.json({
    location: link
  });
}