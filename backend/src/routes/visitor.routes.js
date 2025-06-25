import { Router } from "express";
import { getVisitorCount, incrementVisitorCount, resetVisitorCount } from "../controllers/visitor.controller.js";

const router = Router();

// Public routes (no authentication required)
router.get("/count", getVisitorCount);
router.post("/increment", incrementVisitorCount);

// Admin route (protected)
// router.post("/reset", verifyJWT, resetVisitorCount); // Uncomment when admin middleware is ready

export default router; 