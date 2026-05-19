import express, { Request, Response } from 'express'
import cors from 'cors'
import routes from './routes/index.route'
import dotenv from 'dotenv'
dotenv.config()
import { connectDB } from './configs/database.config'
import cookieParser from 'cookie-parser'

// Kết nối đến MongoDB
connectDB();

const app = express()
const port = 4000

// Cấu hình CORS 
app.use(cors({
  origin: process.env.DOMAIN_FE, // Sử dụng biến môi trường
  methods: ['GET', 'POST', 'PATCH', 'DELETE'], // Cho phép các phương thức HTTP cần thiết
  allowedHeaders: ['Content-Type', 'Authorization'], // Cho phép các header cần thiết
  credentials: true
}))

// Cho phép gửi data dang JSON trong body của request
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!')
})

// Sử dụng cookie-parser để phân tích cookie từ request
app.use(cookieParser());

// Thiết lập đường dẫn
app.use("/", routes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})
