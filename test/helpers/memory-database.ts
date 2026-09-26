import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | undefined;

// Khởi động MongoDB tạm và kết nối Mongoose vào database này.
export const startMemoryDatabase = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

// Xóa dữ liệu sau mỗi test để các test không ảnh hưởng lẫn nhau.
export const clearMemoryDatabase = async () => {
  const collections = Object.values(mongoose.connection.collections);

  await Promise.all(
    collections.map((collection) => collection.deleteMany({}))
  );
};

// Đóng kết nối và giải phóng MongoDB tạm sau khi chạy xong.
export const stopMemoryDatabase = async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
  mongoServer = undefined;
};
