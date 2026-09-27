import { Router } from "express";
import { faultReportController } from "../controllers/FaultReportController";

const router = Router();
router.get("/", faultReportController.list);
router.post("/register", faultReportController.register);

export default router;
