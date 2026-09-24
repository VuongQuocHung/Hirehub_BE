import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
import { AccountRequest } from "../interfaces/request.interface";
import AccountCompany from "../models/account-company.model";
import Job from "../models/job.model";
import CV from "../models/cv.model";
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

export const registerPost = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body;
    const existAccount = await AccountUser.findOne({
      email: email
    });

    if (existAccount) {
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!"
      });
      return;
    }

    // Mã hóa mật khẩu với bcryptjs 
    const salt = await bcrypt.genSalt(10); // Tạo salt - chuỗi ngẫu nhiên có 10 ký tự 
    const hashedPassword = await bcrypt.hash(password, salt); // Mã hóa mật khẩu

    // console.log("Chạy vào controller");

    const newAccount = new AccountUser({
      fullName: fullName,
      email: email,
      password: hashedPassword,
      status: "initial"
    });

    await newAccount.save();

    // hàm của express: chuyển js sang json và trả về cho frontend json
    res.json({
      code: "success",
      message: "Đăng ký thành công"
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đăng ký thất bại"
    })
  }
}

export const loginPost = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existAccount = await AccountUser.findOne({
      email: email
    });

    if (!existAccount) {
      res.json({
        code: "error",
        message: 'Email không tồn tại'
      });
      return;
    }
    // Kiểm tra mật khẩu khớp hay không
    const isPasswordValid = await bcrypt.compare(password, `${existAccount.password}`);

    if (!isPasswordValid) {
      res.json({
        code: "error",
        message: 'Mật khẩu không đúng'
      });
      return;
    }

    // Tạo chuỗi bảo mật JWT 
    const token = jwt.sign(
      {
        id: existAccount.id,
        email: existAccount.email,
        type: "user"
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: "7d" // token có hiệu lực trong 7 ngày hoặc 1 ngày
      }
    )
    res.cookie("token", token, {
      maxAge: (1 * 24 * 60 * 60 * 1000) * 7, // 7 ngày
      httpOnly: true, // JavaScript trên trình duyệt không thể đọc token
      // Frontend gọi backend qua /api cùng domain nên Lax vừa đủ an toàn,
      // không cần bật cookie của bên thứ ba bằng SameSite=None.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS khi deploy
      path: "/"
    })

    res.json({
      code: "success",
      message: "Đăng nhập thành công!"
    });

  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đăng nhập thất bại"
    })
  }
}

export const profilePatch = async (req: AccountRequest, res: Response) => {
  try {
    const existEmail = await AccountUser.findOne({
      email: req.body.email,
      _id: { $ne: req.account.id }
    });

    if (existEmail) {
      res.json({
        code: "error",
        message: "Email đã tồn tại trong hệ thống!"
      });
      return;
    }

    req.body.avatar = req.file ? req.file.path : "";

    await AccountUser.updateOne({
      _id: req.account.id
    }, req.body);

    // Tạo chuỗi bảo mật JWT
    const token = jwt.sign(
      {
        id: req.account.id,
        email: req.body.email,
        type: "user"
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: "1d" // token có hiệu lực trong 1 ngày
      }
    );

    res.cookie("token", token, {
      maxAge: (1 * 24 * 60 * 60 * 1000), // 1 ngày
      httpOnly: true, // JavaScript trên trình duyệt không thể đọc token
      sameSite: "lax", // Request đi qua /api cùng domain frontend
      secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS khi deploy
      path: "/"
    });

    res.json({
      code: "success",
      message: "Cập nhật thành công!"
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    });
  }
}

export const listCV = async (req: AccountRequest, res: Response) => {
  try {
    const email = req.account.email;

    const find = {
      email: email
    };

    // Phân trang
    const page = req.query.page ? parseInt(`${req.query.page}`) : 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const totalRecord = await CV.countDocuments(find);
    const totalPage = Math.ceil(totalRecord/limit);
    // Hết Phân trang

    const cvList = await CV
      .find(find)
      .limit(limit)
      .skip(skip)
      .sort({
        createdAt: "desc"
      });
    const dataFinal = [];

    for(const cv of cvList) {
      const job = await Job.findOne({
        _id: cv.jobId
      })

      const company = await AccountCompany.findOne({
        _id: job?.companyId
      })

      const data = {
        id: cv.id,
        jobName: job?.title,
        companyName: company?.companyName,
        jobSalaryMin: job?.salaryMin,
        jobSalaryMax: job?.salaryMax,
        jobPosition: job?.position,
        jobWorkingForm: job?.workingForm,
        status: cv.status
      }

      dataFinal.push(data);
    }

    res.json({
      code: "success",
      message: "Danh sách CV!",
      cvList: dataFinal,
      totalPage: totalPage
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!"
    });
  }
}
