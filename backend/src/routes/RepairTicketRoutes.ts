import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();

// 调度员才允许登记来电、派工、到场、复电与归档
const dispatcherOnly = rbacMiddleware(["admin", "dispatcher"]);

router.get("/", repairTicketController.list);
router.post("/calls", dispatcherOnly, repairTicketController.registerCall);
router.get("/:id", repairTicketController.detail);
router.get("/:id/candidates", repairTicketController.candidates);
router.post("/:id/dispatch", dispatcherOnly, repairTicketController.dispatch);
router.post("/:id/arrive", dispatcherOnly, repairTicketController.arrive);
router.post("/:id/restore", dispatcherOnly, repairTicketController.restore);
router.post("/:id/close", dispatcherOnly, repairTicketController.close);

export default router;
