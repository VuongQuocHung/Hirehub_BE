import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import * as authMiddleware from "../middlewares/auth.middleware";
import { uploadSingleImage } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  '/image',
  // Chỉ doanh nghiệp đã đăng nhập mới được upload ảnh từ TinyMCE.
  authMiddleware.verifyTokenCompany,
  uploadSingleImage('file'),
  uploadController.imagePost
);

export default router;
