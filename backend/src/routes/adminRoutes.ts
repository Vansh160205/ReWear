import express from "express";
import { getApprovedItems, getPendingItems, getUsersForAdmin, makeItemFeatured, moderateItem, uploadItemsCsv } from "../controllers/adminController";
import { verifyToken } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = express.Router();

router.get("/pending-items",verifyToken, getPendingItems);
router.get("/users",verifyToken,getUsersForAdmin);
router.post("/moderate-item", verifyToken,moderateItem);
router.post("/upload-csv",verifyToken,upload.single('file'),uploadItemsCsv);
router.get("/getApprovedItems",verifyToken,getApprovedItems);
router.post("/makeFeatured",verifyToken,makeItemFeatured);
export default router;
