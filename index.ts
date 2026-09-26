import "dotenv/config";
import app from "./app";
import { connectDB } from "./configs/database.config";

const port = process.env.PORT || 4000;

// File index chỉ chịu trách nhiệm kết nối database và khởi động server.
const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`Website đang chạy trên cổng ${port}`);
  });
};

startServer();
