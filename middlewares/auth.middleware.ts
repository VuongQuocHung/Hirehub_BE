import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import AccountUser from '../models/account-user.model';
import { AccountRequest } from '../interfaces/request.interface';

export const verifyTokenUser = async (
  req: AccountRequest, 
  res: Response, 
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;
    if(!token) {
      res.json({
        code: "error",
        message: "Vui lòng gửi kèm token!"
      });
      return;
    }

    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload;
    const { id, email, type } = decoded;

    if(type != "user") {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ!"
      });
      return;
    }
    
    const existAccount = await AccountUser.findOne({
      _id: id,
      email: email
    });

    if(!existAccount) {
      res.clearCookie("token");
      res.json({
        code: "error",
        message: "Token không hợp lệ!"
      });
      return;
    }

    req["account"] = existAccount;

    next();
  } catch (error) {
    // console.log(error);
    res.json({
      code: "error",
      message: "Dữ liệu không hợp lệ!",
    });
  }
}