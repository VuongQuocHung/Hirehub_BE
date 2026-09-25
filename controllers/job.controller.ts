import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import CV from "../models/cv.model";
import { sanitizeRichText } from "../helpers/sanitize-html.helper";

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
      // Frontend render trường này dưới dạng HTML nên luôn làm sạch trước.
      description: sanitizeRichText(record.description),
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

export const applyPost = async (req: Request, res: Response) => {
  try {
    // Không tin vào validation ở frontend vì người dùng có thể gọi API trực tiếp.
    if (!req.file) {
      res.status(400).json({
        code: "error",
        message: "Vui lòng tải lên CV dạng PDF!"
      });
      return;
    }

    const existCV = await CV.findOne({
      jobId: req.body.jobId,
      email: req.body.email
    })

    if(existCV) {
      res.json({
        code: "error",
        message: "Bạn đã từng nộp CV cho công việc này!"
      });
      return;
    }

    req.body.fileCV = req.file.path;

    const newRecord = new CV(req.body);
    await newRecord.save();

    res.json({
      code: "success",
      message: "Ứng tuyển thành công!"
    })

  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!"
    })
  }
}
