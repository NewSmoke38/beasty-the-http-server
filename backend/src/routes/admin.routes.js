import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllUsers } from "../controllers/admin.controller.js";


const router = Router()


router.get("/users", verifyJWT, getAllUsers);







export default router;