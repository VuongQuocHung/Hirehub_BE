import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
import { AccountRequest } from "../interfaces/request.interface";
import Job from "../models/job.model";
import City from "../models/city.model";

export const registerPost = async (req: Request, res: Response) => {
  try {
    const { companyName, email, password } = req.body;
    const existAccount = await AccountCompany.findOne({
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

    const newAccount = new AccountCompany({
      companyName: companyName,
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
    const existAccount = await AccountCompany.findOne({
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
        type: "company"
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: "7d" // token có hiệu lực trong 7 ngày hoặc 1 ngày
      }
    )
    res.cookie("token", token, {
      maxAge: (1 * 24 * 60 * 60 * 1000) * 7, // 7 ngày
      httpOnly: true, // Chỉ cho phép cookie được truy cận bởi server
      sameSite: 'lax', // cho phép truy cập khi khác tên miền
      secure: process.env.NODE_ENV === 'production' ? true : false // true: web là https, false: web là http
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
    const existAccount = await AccountCompany.findOne({
      email: req.body.email,
      _id: {
        $ne: req.account._id
      }
    });

    if (existAccount) {
      res.json({
        code: "error",
        message: "Email đã tồn tại!"
      });
      return;
    }

    req.body.logo = req.file ? req.file.path : "";

    await AccountCompany.updateOne({
      _id: req.account._id
    }, req.body);

    // Tạo chuỗi bảo mật JWT
    const token = jwt.sign(
      {
        id: req.account.id,
        email: req.body.email,
        type: "company"
      },
      `${process.env.JWT_SECRET}`,
      {
        expiresIn: "1d" // token có hiệu lực trong 1 ngày
      }
    );

    res.cookie("token", token, {
      maxAge: (1 * 24 * 60 * 60 * 1000), // 1 ngày
      httpOnly: true, // Chỉ cho phép cookie được truy cập bởi server
      sameSite: "lax", // Cho phép gửi cookie gữa các tên miền khác nhau
      secure: process.env.NODE_ENV === "production" ? true : false // true: web là https, false: web là http
    });
    res.json({
      code: "success",
      message: "Cập nhật thông tin thành công!"
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Cập nhật thông tin thất bại"
    })
  }
}

export const createJobPost = async (req: AccountRequest, res: Response) => {
  try {
    req.body.companyId = req.account.id;
    req.body.salaryMin = req.body.salaryMin ? parseInt(req.body.salaryMin) : 0;
    req.body.salaryMax = req.body.salaryMax ? parseInt(req.body.salaryMax) : 0;
    req.body.technologies = req.body.technologies ? req.body.technologies.split(", ") : [];
    req.body.images = [];
    if (req.files) {
      for (const item of req.files as any[]) {
        req.body.images.push(item.path);
      }
    }
    const newRecord = new Job(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Đã tạo công việc!"
    });


  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Tạo bài đăng thất bại"
    })
  }
}

export const listJob = async (req: AccountRequest, res: Response) => {
  try {
    const companyId = req.account.id;

    const find = {
      companyId : companyId
    }

    // Phân trang
    const page = req.query.page ? parseInt(`${req.query.page}`) : 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const totalRecord = await Job.countDocuments(find);
    const totalPage = Math.ceil(totalRecord/limit);
    // Hết phân trang
    
    const jobList = await Job
      .find(find)
      .limit(limit)
      .skip(skip)
      .sort({
        createAt: "desc"
      })

    const dataFinal = [];

    const city = await City.findOne({
      _id: req.account.city
    });

    for (const job of jobList) {
      const data = {
        id: job.id,
        companyLogo: req.account.logo,
        title: job.title,
        companyName: req.account.companyName,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        position: job.position,
        workingForm: job.workingForm,
        cityName: city?.name,
        technologies: job.technologies,
      }

      dataFinal.push(data);

    }

    res.json({
      code: "success",
      message: "Đã lấy danh sách công việc!",
      jobs: dataFinal,
      totalPage: totalPage
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Lấy danh sách công việc thất bại"
    })
  }
}