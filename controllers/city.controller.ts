import { Request, Response } from "express";
import City from "../models/city.model";

export const list = async (req: Request, res: Response) => {
  try {
    const cityList = await City.find({});
    res.json({
      code: "success",
      message: "Thành công",
      cityList: cityList
    })
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Thất bại"
    })
  }
}   