import { Request, Response } from "express";


export const imagePost = async (req: Request, res: Response) => {
  // TinyMCE luôn phải gửi kèm một ảnh hợp lệ.
  if (!req.file) {
    res.status(400).json({
      code: "error",
      message: "Vui lòng chọn ảnh cần tải lên"
    });
    return;
  }

  res.json({
    location: req.file.path
  });
}
