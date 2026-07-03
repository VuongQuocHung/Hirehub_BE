import { Router } from "express";
import multer from 'multer';
import { storage } from "../helpers/cloudinary.helper";
import * as uploadController from "../controllers/upload.controller";

const upload = multer({ storage: storage });

const router = Router();

router.post('/image', upload.single('file'), uploadController.imagePost);

export default router;  