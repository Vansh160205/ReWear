import { Request, Response } from "express";
import prisma from "../lib/prisma";
import fs from 'fs';
import csvParser, {CsvParser} from 'csv-parser';
// Get all unapproved item listings
export const getPendingItems = async (_req: Request, res: Response) => {

  try {
    const userId = (_req as any).userId;
    // Check if user is admin
    console.log("Fetching pending items for user ID:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const items = await prisma.item.findMany({
      where: { approved: false,status: "pending" }, // Only fetch pending items
      include: { owner: { select: { id: true, name: true, email: true } } },
    });
    console.log("Pending items fetched:", items);
    console.log("Admin user ID:", userId);

    res.json(items);
  } catch (err) {
    console.error("Error fetching pending items:", err);
    res.status(500).json({ error: "Failed to load pending items" });
  }
};


// GET all users
export const getUsersForAdmin = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { items: true, swaps: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getApprovedItems = async(req:Request,res:Response)=>{
  try{
    console.log("get approved items called");
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
      });
      if(!user || !user.isAdmin){
        return res.status(403).json({error: "Access denied"});
      }
      const items = await prisma.item.findMany({
        where: {approved: true,isFeatured:false},
        include: {owner: {select: {id:true,name:true,email:true}}}
        });
        res.json(items);
        }catch(error){
          console.error("Error fetching approved items:", error);
          res.status(500).json({error: "Failed to load approved items"});
          }
  
}

// Mark an item as featured (admin only)
export const makeItemFeatured = async (req: Request, res: Response) => {
  const { itemId, isFeatured } = req.body;
  try {
    const userId = (req as any).userId;
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }
    const updatedItem = await prisma.item.update({
      where: { id: Number(itemId) },
      data: { isFeatured: Boolean(isFeatured) },
    });

    res.json({
      message: `Item ${isFeatured ? "marked as featured" : "unfeatured"} successfully`,
      item: updatedItem,
    });
  } catch (err) {
    console.error("Failed to mark item as featured:", err);
    res.status(500).json({ error: "Failed to update featured status" });
  }
};

export const uploadItemsCsv = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "CSV file is required" });
  }

  const results: any[] = [];

  fs.createReadStream(file.path)
    .pipe(csvParser())
    .on("data", (row:any) => results.push(row))
    .on("end", async () => {
      try {
        const insertedItems = [];

        for (const row of results) {
          const {
            title,
            description,
            category,
            size,
            condition,
            tags,
            images,
            isRedeemable,
            pointsCost,
            ownerId,
          } = row;

          // 🧠 Parse images from comma-separated file paths
          const imagePaths = images?.split(" ").map((i:string) => i.trim()) || [];

          // 🧠 Tags can be comma-separated or JSON array
          const parsedTags = tags?.split(" ").map((t:string) => t.trim());

          const item = await prisma.item.create({
            data: {
              title,
              description,
              category,
              size,
              condition,
              tags: parsedTags,
              images: imagePaths,
              status: "approved",
              approved: true,
              isRedeemable: isRedeemable === "true",
              pointsCost: pointsCost ? parseInt(pointsCost) : null,
              ownerId: parseInt(ownerId ?? userId), // fallback to uploader if ownerId not given
            },
          });

          insertedItems.push(item);
        }

        res.status(201).json({ message: "CSV upload successful", items: insertedItems });
      } catch (err) {
        console.error("CSV upload error:", err);
        res.status(500).json({ error: "Failed to upload CSV items" });
      }
    });
};

export const moderateItem = async (req: Request, res: Response) => {
  const { itemId,decision } = req.body; // "approved" or "rejected"
    console.log("Moderation request for item ID:", itemId, "Decision:", decision);
  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  try {
     const userId = (req as any).userId;
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (decision === "approved") {
      await prisma.item.update({
        where: { id: Number(itemId) },
        data: { approved: true ,status: "available"}, // Set status to available when approved
      });
    } else {
      await prisma.item.delete({
        where: { id: Number(itemId) },
      });
    }

    res.json({ message: `Item ${decision}` });
  } catch (err) {
    console.error("Moderation error:", err);
    res.status(500).json({ error: "Failed to moderate item" });
  }
};

