import e, { Router } from "express";
import userRoutes from './user.route'
import authRoutes from './auth.route'

const router = Router();

router.use('/user', userRoutes);
router.use('/auth', authRoutes);

export default router;