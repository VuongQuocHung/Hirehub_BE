import { Router } from "express";
import * as userController from '../controllers/user.controller'
import * as userValidate from '../validates/user.validate';
import * as authMiddleware from '../middlewares/auth.middleware'

const router = Router();

router.post('/register', userValidate.registerPost, userController.registerPost);

router.post('/login', userValidate.loginPost, userController.loginPost);

router.patch('/profile', authMiddleware.verifyTokenUser, userValidate.profilePatch, userController.profilePatch);

export default router;

