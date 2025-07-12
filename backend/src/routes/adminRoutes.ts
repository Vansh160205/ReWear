import express from "express";
import { getPendingItems, getUsersForAdmin, moderateItem } from "../controllers/adminController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.get("/pending-items",verifyToken, getPendingItems);
router.get("/users",verifyToken,getUsersForAdmin);
router.post("/moderate-item", verifyToken,moderateItem);

export default router;
