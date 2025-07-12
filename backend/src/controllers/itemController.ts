import { Request, Response } from "express";
import prisma from "../lib/prisma";


// Add New Item
export const addItem = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const {
    title,
    description,
    category,
    size,
    condition,
    tags,
    isRedeemable,
    pointsCost,
  } = req.body;

  try {
    const imageFiles = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;

    const item = await prisma.item.create({
      data: {
        title,
        description,
        category,
        size,
        condition,
        tags: parsedTags,
        images: imageFiles,
        status:"pending", // Set status to pending for admin review
        ownerId: userId,
        approved: false, // 🛑 require admin approval
        isRedeemable: isRedeemable === "true", // because form data sends strings
        pointsCost: pointsCost ? Number(pointsCost) : null,
      },
    });

    res.status(201).json({ message: "Item submitted for review", item });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Failed to create item" });
  }
};


// Get all items
export const getItems = async (_req: Request, res: Response) => {
  try {
    const items = await prisma.item.findMany({
      where: { available: true,approved: true }, // Only fetch approved items
      include: { owner: true },
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

export const getItemsOfUser = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
    try {
        const items = await prisma.item.findMany({
        where: { ownerId: userId, available: true,approved: true },
        include: { owner: true },
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user's items" });
    }
}


// Get single item by ID
export const getItemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const item = await prisma.item.findUnique({
      where: { id: Number(id),approved: true }, // Only fetch approved items
      include: { owner: true },
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
};
