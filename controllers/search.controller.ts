import { Request, Response } from "express";
import Job from "../models/job.model";
import AccountCompany from "../models/account-company.model";
import City from "../models/city.model";

export const search = async (req: Request, res: Response) => {
  try {
    const dataFinal = [];

    if(Object.keys(req.query).length > 0){
      const find: any = {};
      if(req.query.technology) {
        find.technologies = req.query.technology;
      }

      if(req.query.city){
        const city = await City.findOne({
          name: `${req.query.city}`
        })

        if(city){
          const companyList = await AccountCompany.find({
            city: `${city.id}`
          })


          const companyIdList = companyList.map(item => item.id);
          find.companyId = { $in: companyIdList }; // $in: bên trong
        }
      }

      if(req.query.company) {
        const company = await AccountCompany.findOne({
          companyName: `${req.query.company}`
        })
        find.companyId = company?.id;
      }

      if(req.query.keyword) {
        // const regex = new RegExp(`${req.query.keyword}`, "i");
        // find.title = regex;
        find.title = { $regex: `${req.query.keyword}`, $options: "i" };
      }

      if(req.query.position) {
        find.position = req.query.position;
      }


      const jobs = await Job
        .find(find)
        .sort({
          createdAt: "desc"
        });

      for(const item of jobs){
        const company = await AccountCompany.findOne({
          _id: item.companyId
        })

        const city = await City.findOne({
          _id: company?.city
        })
        if(company && city) {
          const itemFinal = {
            id: item.id,
            companyLogo: company.logo,
            title: item.title,
            companyName: company.companyName,
            salaryMin: item.salaryMin,
            salaryMax: item.salaryMax,
            position: item.position,
            workingForm: item.workingForm,
            cityName: city.name,
            technologies: item.technologies
          };
          dataFinal.push(itemFinal);
        }
      }
    }

    res.json({
      code: "success",
      message: "Thành công!",
      jobs: dataFinal
    });
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!"
    });

  }
}