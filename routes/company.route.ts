import { Router } from "express";
import * as companyController from '../controllers/company.controller'
import * as companyValidate from '../validates/company.validate';
import * as authMiddleware from '../middlewares/auth.middleware'
import multer from 'multer';
import { storage } from "../helpers/cloudinary.helper";

const upload = multer({ storage: storage });

const router = Router();

router.post('/register', companyValidate.registerPost, companyController.registerPost);

router.post('/login', companyValidate.loginPost, companyController.loginPost);

router.patch(
  '/profile',
  upload.single('logo'),
  authMiddleware.verifyTokenCompany,
  companyValidate.profilePatch,
  companyController.profilePatch,
)

router.post(
  '/job/create',
  upload.array('images', 5),
  authMiddleware.verifyTokenCompany,
  companyValidate.createJobPost,
  companyController.createJobPost
)

router.get(
  '/job/list',
  authMiddleware.verifyTokenCompany,
  companyController.listJob
)

router.get(
  '/job/edit/:id',
  upload.array('images', 8), 
  authMiddleware.verifyTokenCompany,
  companyController.editJob
)

router.patch(
  '/job/edit/:id', 
  upload.array('images', 8), 
  authMiddleware.verifyTokenCompany,
  companyValidate.createJobPost, 
  companyController.editJobPatch
)

router.delete(
  '/job/delete/:id', 
  authMiddleware.verifyTokenCompany,
  companyController.deleteJobDel
)

router.get('/list', companyController.list);


export default router;

