import { Request, Response } from "express";
import prisma from "../lib/prisma";

// Get all unapproved item listings
export const getPendingItems = async (_req: Request, res: Response) => {

  try {
    const userId = (_req as any).userId;
    // Check if user is admin
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

// Approve or Reject an item
export const moderateItem = async (req: Request, res: Response) => {
  const { id,decision } = req.body; // "approved" or "rejected"
    console.log("Moderation request for item ID:", id, "Decision:", decision);
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
        where: { id: Number(id) },
        data: { approved: true ,status: "available"}, // Set status to available when approved
      });
    } else {
      await prisma.item.delete({
        where: { id: Number(id) },
      });
    }

    res.json({ message: `Item ${decision}` });
  } catch (err) {
    console.error("Moderation error:", err);
    res.status(500).json({ error: "Failed to moderate item" });
  }
};
