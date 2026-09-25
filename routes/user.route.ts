import { Router } from "express";
import * as userController from '../controllers/user.controller'
import * as userValidate from '../validates/user.validate';
import * as authMiddleware from '../middlewares/auth.middleware'
import { uploadSingleImage } from '../middlewares/upload.middleware';

const router = Router();

router.post('/register', userValidate.registerPost, userController.registerPost);

router.post('/login', userValidate.loginPost, userController.loginPost);

router.patch('/profile',
  authMiddleware.verifyTokenUser,
  uploadSingleImage('avatar'),
  userValidate.profilePatch,
  userController.profilePatch);

  
router.get(
  '/cv/list', 
  authMiddleware.verifyTokenUser,
  userController.listCV
)


export default router;
