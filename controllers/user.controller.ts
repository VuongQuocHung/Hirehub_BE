import { Request, Response } from "express";

export const registerPost = (req: Request, res: Response) => {
  console.log(req.body);

  res.json({
    code: "success",
    message: "Đăng ký thành công!"
  });
}