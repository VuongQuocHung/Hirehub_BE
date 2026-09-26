import multer from "multer";

// Storage giả lập Cloudinary: đọc file vào bộ nhớ và trả về một URL giả.
// Nhờ đó integration test không gửi bất kỳ file nào ra Internet.
export const fakeUploadStorage: multer.StorageEngine = {
  _handleFile: (req, file, callback) => {
    const chunks: Buffer[] = [];

    file.stream.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    file.stream.on("error", (error) => {
      callback(error);
    });

    file.stream.on("end", () => {
      const buffer = Buffer.concat(chunks);

      callback(undefined, {
        buffer,
        size: buffer.length,
        path: `https://test.local/${encodeURIComponent(file.originalname)}`
      });
    });
  },

  _removeFile: (req, file, callback) => {
    callback(null);
  }
};
