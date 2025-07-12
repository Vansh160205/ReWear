import express from "express";
import { addItem, getItems, getItemById, getItemsOfUser } from "../controllers/itemController";
import { verifyToken } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.post("/", verifyToken, upload.array("images", 5), addItem);  // max 5 images
router.get("/", getItems);
router.get("/user", verifyToken,getItemsOfUser);

router.get("/:id", getItemById);

export default router;
