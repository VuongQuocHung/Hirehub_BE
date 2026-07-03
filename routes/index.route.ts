import e, { Router } from "express";
import userRoutes from './user.route'
import authRoutes from './auth.route'
import companyRoutes from './company.route'
import cityRoutes from "./city.route";

const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/city', cityRoutes);

export default router;