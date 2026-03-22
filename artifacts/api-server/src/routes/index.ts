import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import doctorsRouter from "./doctors";

const router: IRouter = Router();

router.use(healthRouter);
router.use(openaiRouter);
router.use(doctorsRouter);

export default router;
