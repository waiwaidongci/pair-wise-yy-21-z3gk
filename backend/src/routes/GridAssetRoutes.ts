import { Router } from "express";
import { gridAssetController } from "../controllers/GridAssetController";

const router = Router();
router.get("/", gridAssetController.list);
export default router;
