import { Router } from "express";
import * as companyController from '../controllers/company.controller'
import * as companyValidate from '../validates/company.validate';
import * as authMiddleware from '../middlewares/auth.middleware'
import {
  uploadImageArray,
  uploadSingleImage
} from '../middlewares/upload.middleware';

const router = Router();

router.post('/register', companyValidate.registerPost, companyController.registerPost);

router.post('/login', companyValidate.loginPost, companyController.loginPost);

router.patch(
  '/profile',
  authMiddleware.verifyTokenCompany,
  uploadSingleImage('logo'),
  companyValidate.profilePatch,
  companyController.profilePatch,
)

router.post(
  '/job/create',
  authMiddleware.verifyTokenCompany,
  uploadImageArray('images', 5),
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
  authMiddleware.verifyTokenCompany,
  companyController.editJob
)

router.patch(
  '/job/edit/:id', 
  authMiddleware.verifyTokenCompany,
  uploadImageArray('images', 8),
  companyValidate.createJobPost, 
  companyController.editJobPatch
)

router.delete(
  '/job/delete/:id', 
  authMiddleware.verifyTokenCompany,
  companyController.deleteJobDel
)


router.get(
  '/detail/:id', 
  companyController.detail
)


router.get(
  '/cv/list', 
  authMiddleware.verifyTokenCompany,
  companyController.listCV
)


router.get(
  '/cv/detail/:id', 
  authMiddleware.verifyTokenCompany,
  companyController.detailCV
)

router.patch(
  '/cv/change-status/:id', 
  authMiddleware.verifyTokenCompany,
  companyController.changeStatusPatch
)

router.delete(
  '/cv/delete/:id', 
  authMiddleware.verifyTokenCompany,
  companyController.deleteCVDel
)


router.get('/list', companyController.list);


export default router;

