import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import AccountUser from "../models/account-user.model";
import AccountCompany from "../models/account-company.model";
import { sanitizeRichText } from "../helpers/sanitize-html.helper";

export const check = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.json({
        code: "error",
        message: "Bạn chưa đăng nhập"
      });
      return;
    }
    const decoded = jwt.verify(token, `${process.env.JWT_SECRET}`) as jwt.JwtPayload;
    const { id, email, type } = decoded;
    if (type === "user") {
      const existAccount = await AccountUser.findOne({
        _id: id,
        email: email
      });
      if (!existAccount) {
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
        email: existAccount.email,
        phone: existAccount.phone,
        avatar: existAccount.avatar
      }

      res.json({
        code: "success",
        message: "Thành công",
        infoUser: infoUser,
      });
    } else if (type === "company") {
      const existAccount = await AccountCompany.findOne({
        _id: id,
        email: email
      });
      if (!existAccount) {
        res.clearCookie('token');
        res.json({
          code: "error",
          message: "Tài khoản không tồn tại"
        });
        return;
      }
      const infoCompany = {
        id: existAccount.id,
        companyName: existAccount.companyName,
        email: existAccount.email,
        city: existAccount.city,
        address: existAccount.address,
        companyModel: existAccount.companyModel,
        companyEmployees: existAccount.companyEmployees,
        workingTime: existAccount.workingTime,
        workOvertime: existAccount.workOvertime,
        phone: existAccount.phone,
        description: sanitizeRichText(existAccount.description),
        logo: existAccount.logo
      }

      res.json({
        code: "success",
        message: "Thành công",
        infoCompany: infoCompany,
      });
    }
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "";
    if (errorName === "JsonWebTokenError" || errorName === "TokenExpiredError") {
      res.clearCookie('token');
      res.json({
        code: "error",
        message: "Token khong hop le"
      });
      return;
    }

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
