import { Router } from "express";
import * as jobController from '../controllers/job.controller';
import { uploadSinglePdf } from '../middlewares/upload.middleware';

const router = Router();

router.get('/detail/:id', jobController.detail);

router.post(
  '/apply', 
  uploadSinglePdf('fileCV'),
  jobController.applyPost
);

export default router;
