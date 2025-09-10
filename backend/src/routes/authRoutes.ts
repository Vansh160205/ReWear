import express from "express";
import { getUserProfile, loginUser, signupUser } from "../controllers/authController";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", signupUser); 
router.get("/profile", getUserProfile);

export default router;
