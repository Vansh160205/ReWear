import express from "express";
import { createSwap, getIncomingSwaps, getSwapHistory, respondToSwap } from "../controllers/swapController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

router.post("/", verifyToken, createSwap); // Request a swap
router.get("/incoming", verifyToken, getIncomingSwaps); // See pending swaps
router.post("/respond/:id", verifyToken, respondToSwap); // Approve/Reject
router.get("/history", verifyToken, getSwapHistory); // Get swaps for requester

export default router;
