import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import AccountUser from "../models/account-user.model";

export const check = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    
    if(!token){
      res.json({
        code: "error",
        message: "Bạn chưa đăng nhập"
      });
      return;
    }
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload;
    const {id, email} = decoded;
    const existAccount = await AccountUser.findOne({
      _id: id,
      email: email
    });
    if(!existAccount){
      res.clearCookie('token');
      res.json({
        code: "error",
        message: "Tài khoản không tồn tại"
      });
      return;
    }

    const infoUser = {
      id: existAccount.id,
      fullName: existAccount.fullName,
    }

    res.json({
      code: "success",
      message: "Thành công",
      infoUser: infoUser,
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Có lỗi xảy ra"
    })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    res.json({
      code: "success",
      message: "Đăng xuất thành công"
    }); 
    
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ"
    })
  }
}
