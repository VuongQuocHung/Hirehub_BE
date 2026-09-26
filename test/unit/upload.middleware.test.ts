import express, {
  Request,
  RequestHandler,
  Response
} from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";

// Thay Cloudinary bằng bộ nhớ tạm.
// Test sẽ không tải file thật lên Cloudinary.
vi.mock("../../helpers/cloudinary.helper", async () => {
  const multer = (await import("multer")).default;

  return {
    storage: multer.memoryStorage()
  };
});

import {
  uploadImageArray,
  uploadSingleImage,
  uploadSinglePdf
} from "../../middlewares/upload.middleware";

import { imagePost } from "../../controllers/upload.controller";

// Tạo Express app nhỏ chỉ dùng để test middleware upload.
const createUploadApp = (middleware: RequestHandler) => {
  const app = express();

  app.post(
    "/upload",
    middleware,
    (req: Request, res: Response) => {
      const files = Array.isArray(req.files) ? req.files : [];

      res.status(200).json({
        code: "success",
        fileSize: req.file?.size,
        filesCount: files.length
      });
    }
  );

  return app;
};

describe("uploadSingleImage", () => {
  it("chấp nhận ảnh PNG hợp lệ", async () => {
    const app = createUploadApp(uploadSingleImage("file"));

    const response = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("fake-image"), {
        filename: "image.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe("success");
  });

  it("từ chối file không phải ảnh", async () => {
    const app = createUploadApp(uploadSingleImage("file"));

    const response = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("text-file"), {
        filename: "document.txt",
        contentType: "text/plain"
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
    expect(response.body.message).toContain(
      "Chỉ chấp nhận file ảnh"
    );
  });

  it("từ chối ảnh lớn hơn 5 MB", async () => {
    const app = createUploadApp(uploadSingleImage("file"));
    const largeFile = Buffer.alloc(5 * 1024 * 1024 + 1);

    const response = await request(app)
      .post("/upload")
      .attach("file", largeFile, {
        filename: "large.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
    expect(response.body.message).toContain("File too large");
  });

  it("cho phép đi tiếp khi không gửi ảnh", async () => {
    const app = createUploadApp(uploadSingleImage("file"));

    const response = await request(app).post("/upload");

    expect(response.status).toBe(200);
    expect(response.body.code).toBe("success");
  });
});

describe("uploadImageArray", () => {
  it("chấp nhận số ảnh nằm trong giới hạn", async () => {
    const app = createUploadApp(
      uploadImageArray("images", 2)
    );

    const response = await request(app)
      .post("/upload")
      .attach("images", Buffer.from("image-1"), {
        filename: "image-1.png",
        contentType: "image/png"
      })
      .attach("images", Buffer.from("image-2"), {
        filename: "image-2.jpg",
        contentType: "image/jpeg"
      });

    expect(response.status).toBe(200);
    expect(response.body.filesCount).toBe(2);
  });

  it("từ chối khi gửi quá số lượng ảnh", async () => {
    const app = createUploadApp(
      uploadImageArray("images", 2)
    );

    const response = await request(app)
      .post("/upload")
      .attach("images", Buffer.from("image-1"), {
        filename: "image-1.png",
        contentType: "image/png"
      })
      .attach("images", Buffer.from("image-2"), {
        filename: "image-2.png",
        contentType: "image/png"
      })
      .attach("images", Buffer.from("image-3"), {
        filename: "image-3.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
  });
});

describe("uploadSinglePdf", () => {
  it("chấp nhận CV dạng PDF", async () => {
    const app = createUploadApp(uploadSinglePdf("fileCV"));

    const response = await request(app)
      .post("/upload")
      .attach("fileCV", Buffer.from("fake-pdf"), {
        filename: "cv.pdf",
        contentType: "application/pdf"
      });

    expect(response.status).toBe(200);
    expect(response.body.code).toBe("success");
  });

  it("từ chối CV không phải PDF", async () => {
    const app = createUploadApp(uploadSinglePdf("fileCV"));

    const response = await request(app)
      .post("/upload")
      .attach("fileCV", Buffer.from("document"), {
        filename: "cv.docx",
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
    expect(response.body.message).toContain(
      "CV phải là file PDF"
    );
  });

  it("từ chối PDF lớn hơn 5 MB", async () => {
    const app = createUploadApp(uploadSinglePdf("fileCV"));
    const largePdf = Buffer.alloc(5 * 1024 * 1024 + 1);

    const response = await request(app)
      .post("/upload")
      .attach("fileCV", largePdf, {
        filename: "large-cv.pdf",
        contentType: "application/pdf"
      });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
  });
});

describe("imagePost", () => {
  it("trả lỗi khi TinyMCE không gửi ảnh", async () => {
    const app = express();

    app.post(
      "/upload",
      uploadSingleImage("file"),
      imagePost
    );

    const response = await request(app).post("/upload");

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("error");
    expect(response.body.message).toContain(
      "Vui lòng chọn ảnh"
    );
  });
});