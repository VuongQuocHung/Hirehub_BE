import { Router } from "express";
import * as jobController from '../controllers/job.controller';

const router = Router();

router.get('/detail/:id', jobController.detail);

export default router;
