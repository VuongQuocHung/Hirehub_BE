import type { RequestHandler } from "express";
import multer from "multer";
import { storage } from "../helpers/cloudinary.helper";

const MB = 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * MB,
    files: 8
  },
  fileFilter: (req, file, callback) => {
    if (!IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(new Error("Chỉ chấp nhận file ảnh JPG, PNG, WEBP hoặc GIF"));
      return;
    }

    callback(null, true);
  }
});

const pdfUpload = multer({
  storage,
  limits: {
    // Đồng bộ với giới hạn 5 MB đang hiển thị ở form nộp CV.
    fileSize: 5 * MB,
    files: 1
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new Error("CV phải là file PDF"));
      return;
    }

    callback(null, true);
  }
});

// Chuyển lỗi Multer thành JSON để frontend có thể hiển thị thông báo rõ ràng.
const handleUpload = (multerMiddleware: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    multerMiddleware(req, res, (error?: unknown) => {
      if (error) {
        const message = error instanceof Error
          ? error.message
          : "File tải lên không hợp lệ";

        res.status(400).json({
          code: "error",
          message
        });
        return;
      }

      next();
    });
  };
};

export const uploadSingleImage = (fieldName: string): RequestHandler => {
  return handleUpload(imageUpload.single(fieldName));
};

export const uploadImageArray = (
  fieldName: string,
  maxCount: number
): RequestHandler => {
  return handleUpload(imageUpload.array(fieldName, maxCount));
};

export const uploadSinglePdf = (fieldName: string): RequestHandler => {
  return handleUpload(pdfUpload.single(fieldName));
};
