import express from "express";
import { loginUser, signupUser } from "../controllers/authController";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", signupUser); 


export default router;
