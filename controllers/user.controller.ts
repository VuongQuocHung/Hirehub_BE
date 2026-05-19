import { Request, Response } from "express";
import AccountUser from "../models/account-user.model";
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

export const registerPost = async (req: Request, res: Response) => {
  try {
    const {fullName, email, password} = req.body;
    const existAccount = await AccountUser.findOne({
      email: email
    });

    if(existAccount){
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
    const {email, password} = req.body;

    const existAccount = await AccountUser.findOne({
      email: email
    });

    if(!existAccount){
      res.json({
        code: "error",
        message: 'Email không tồn tại'
      });
      return;
    }
    // Kiểm tra mật khẩu khớp hay không
    const isPasswordValid = await bcrypt.compare(password, `${existAccount.password}`);
  
    if(!isPasswordValid){
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
        email: existAccount.email
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
      secure: false
    })
  
    res.json({
      code: "success",
      message: "Đăng nhập thành công!"
    });

  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Đăng ký thất bại"
    })
  }
}