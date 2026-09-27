import { Router } from "express";
import { crewController } from "../controllers/CrewController";
import { rbacMiddleware } from "../middlewares/rbacMiddleware";

const router = Router();
router.get("/", crewController.list);
router.patch("/:id", rbacMiddleware(["admin", "dispatcher"]), crewController.update);
export default router;
