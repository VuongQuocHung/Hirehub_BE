import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.route";

const app = express();

// Chỉ cho phép frontend đã cấu hình gọi API và gửi kèm cookie xác thực.
app.use(cors({
  origin: process.env.DOMAIN_FE,
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Đọc dữ liệu JSON được gửi trong body của request.
app.use(express.json());

// Đọc cookie để các middleware xác thực có thể lấy token.
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Gắn toàn bộ route của ứng dụng.
app.use("/", routes);

// Không gọi connectDB() hoặc listen() trong file này.
// Nhờ đó Supertest có thể import app mà không mở server thật.
export default app;
