import { Router } from "express";
import { teamLogin } from "../controllers/teamAuth.controller.js";

const router = Router();

router.post("/login", teamLogin);

export default router;
