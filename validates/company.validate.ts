import Joi from 'joi';
import type { NextFunction, Request, Response } from 'express';

export const registerPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    companyName: Joi.string()
      .required()
      .min(3)
      .max(200)
      .messages({
        "string.empty": "Vui lòng nhập tên công ty",
        "string.min": "Tên công ty phải có ít nhất 3 ký tự",
        "string.max": "Tên công ty phải có nhiều nhất 200 ký tự",
      }),
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng nhập email",
        "string.email": "Email không đúng định dạng"
      }),
    password: Joi
      .string()
      .required()
      .min(8)
      .custom((value, helpers) => {
        if (!/[A-Z]/.test(value)) {
          return helpers.error('password.uppercase');
        }
        if (!/[a-z]/.test(value)) {
          return helpers.error('password.lowercase');
        }
        if (!/\d/.test(value)) {
          return helpers.error('password.number');
        }
        if (!/[@$!%*?&]/.test(value)) {
          return helpers.error('password.special');
        }
        return value;
      })
      .messages({
        "string.empty": "Vui lòng nhập mật khẩu",
        "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
        "password.uppercase": "Mật khẩu phải chứa ít nhất một ký tự in hoa!",
        "password.lowercase": "Mật khẩu phải chứa ít nhất một ký tự in thường!",
        "password.number": "Mật khẩu phải chứa ít nhất một chữ số!",
        "password.special": "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!",
      }),
  })
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage,
    });
    return;
  }
  next();
}

export const loginPost = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng nhập email",
        "string.email": "Email không đúng định dạng"
      }),
    password: Joi
      .string()
      .required()
      .min(8)
      .messages({
        "string.min": "Mật khẩu phải chứa ít nhất 8 ký tự!",
      }),
  })
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage,
    });
    return;
  }
  next();
}

export const profilePatch = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    companyName: Joi.string()
      .required()
      .min(3)
      .max(200)
      .messages({
        "string.empty": "Vui lòng nhập tên công ty!",
        "string.min": "Tên công ty phải có ít nhất 3 ký tự!",
        "string.max": "Tên công ty không được vượt quá 200 ký tự!",
      }),
    email: Joi.string()
      .required()
      .email()
      .messages({
        "string.empty": "Vui lòng nhập email!",
        "string.email": "Email không đúng định dạng!"
      }),
    city: Joi.string().allow(''),
    address: Joi.string().allow(''),
    companyModel: Joi.string().allow(''),
    companyEmployees: Joi.string().allow(''),
    workingTime: Joi.string().allow(''),
    workOvertime: Joi.string().allow(''),
    phone: Joi.string().allow(''),
    description: Joi.string().allow(''),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    res.json({
      code: "error",
      message: errorMessage,
    });
    return;
  }
  next();
}
