import { Request, Response } from "express";
import AccountCompany from "../models/account-company.model";
const bcrypt = require("bcryptjs");

export const registerPost = async (req: Request, res: Response) => {
  try {
    const {companyName, email, password} = req.body;
    const existAccount = await AccountCompany.findOne({
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
