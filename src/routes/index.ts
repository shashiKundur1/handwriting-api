import { Router } from "express";
import digitizeRoutes from "../features/digitizer/routes/digitize.routes";

const router = Router();

router.use("/digitize", digitizeRoutes);

export default router;
