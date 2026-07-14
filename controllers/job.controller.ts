import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";

export const detail = async (req: Request, res: Response) => {
  try {
    const record = await Job.findOne({
      _id: req.params.id
    });

    if (!record) {
      res.json({
        code: "error",
        message: "Không tìm thấy công việc!"
      });
      return;
    }

    const companyInfo = await AccountCompany.findOne({
      _id: record.companyId
    });

    if (!companyInfo) {
      res.json({
        code: "error",
        message: "Không tìm thấy company!"
      });
      return;
    }

    const jobDetail = {
      id: record.id,
      title: record.title,
      companyName: companyInfo.companyName,
      salaryMin: record.salaryMin,
      salaryMax: record.salaryMax,
      images: record.images,
      position: record.position,
      workingForm: record.workingForm,
      companyAddress: companyInfo.address,
      technologies: record.technologies,
      description: record.description,
      companyId: record.companyId,
      companyLogo: companyInfo.logo,
      companyModel: companyInfo.companyModel,
      companyEmployees: companyInfo.companyEmployees,
      companyWorkingTime: companyInfo.workingTime,
      companyWorkOvertime: companyInfo.workOvertime
    };

    res.json({
      code: "success",
      message: "Thành công!",
      jobDetail: jobDetail
    });

  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!"
    })
  }
}