import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { beastyCheckController } from "../controllers/beasty.controller.js";





const router = Router()


router.get("/check", verifyJWT, beastyCheckController)



export default router;