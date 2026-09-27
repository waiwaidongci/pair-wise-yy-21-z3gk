import { Router } from "express";
import { crewController } from "../controllers/CrewController";

const router = Router();
router.get("/", crewController.list);
router.post("/:id/urgent-occupy", crewController.urgentOccupy);

export default router;
