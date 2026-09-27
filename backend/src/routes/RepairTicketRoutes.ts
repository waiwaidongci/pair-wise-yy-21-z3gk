import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";

const router = Router();
router.get("/", repairTicketController.list);
router.get("/:id/candidates", repairTicketController.candidates);
router.post("/:id/dispatch", repairTicketController.dispatch);
router.post("/:id/arrive", repairTicketController.arrive);
router.post("/:id/start-repair", repairTicketController.startRepair);
router.post("/:id/restore", repairTicketController.restore);
router.post("/:id/close", repairTicketController.close);

export default router;
