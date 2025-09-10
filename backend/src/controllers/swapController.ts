import { Request, Response } from "express";
import prisma from "../lib/prisma";

// Create Swap Request
export const createSwap = async (req: Request, res: Response) => {
  const requesterId = (req as any).userId;
  const { itemId, offeredItemId } = req.body;
  try {
    const item = await prisma.item.findUnique({ where: { id: Number(itemId) } });

    if (!item || !item.available) {
      return res.status(400).json({ error: "Item not available for swap" });
    }

    if (item.ownerId === requesterId) {
      return res.status(400).json({ error: "You cannot request your own item" });
    }

    const swap = await prisma.swap.create({
      data: {
        itemId: Number(itemId),
        requesterId,
        ownerId: item.ownerId,
        offeredItemId: offeredItemId ? Number(offeredItemId) : null,
        status: "pending",
      },
    });

    res.status(201).json(swap);
  } catch (err) {
    console.error("Swap request error:", err);
    res.status(500).json({ error: "Swap request failed" });
  }
};

// Get Incoming Swap Requests (For item owner)
export const getIncomingSwaps = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const swaps = await prisma.swap.findMany({
      where: {
        ownerId: userId,
        status: "pending",
      },
      include: {
        item: true,
        requester: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json(swaps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incoming swaps" });
  }
};

// Approve or Reject a Swap
export const respondToSwap = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const { decision } = req.body; // "approved" or "rejected"
console.log("Responding to swap ID:", userId, "Decision:", decision);
  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "Invalid decision" });
  }

  try {
    const swap = await prisma.swap.findUnique({
      where: { id: Number(id) },
      include: {
        item: true,
        offeredItem: true,
      },
    });

    if (!swap || swap.ownerId !== userId) {
      return res.status(404).json({ error: "Swap request not found or unauthorized" });
    }

    // Update the swap status
    const updatedSwap = await prisma.swap.update({
      where: { id: Number(id) },
      data: { status: decision },
    });

    if (decision === "approved") {
      const updates = [];
      const REWARD_FOR_ITEM_SWAP = 20; // 👈 Define fixed reward for 2-way swaps

      const requester = await prisma.user.findUnique({
        where: { id: swap.requesterId },
      });

      const owner = await prisma.user.findUnique({
        where: { id: swap.ownerId },
      });

      // ✅ Point-based redemption
      if (!swap.offeredItemId && swap.item.isRedeemable) {
        const cost = swap.item.pointsCost ?? 0;

        if (!requester || requester.points < cost) {
          return res.status(400).json({ error: "Requester has insufficient points" });
        }

        // Deduct from requester
        updates.push(
          prisma.user.update({
            where: { id: requester.id },
            data: { points: requester.points - cost },
          })
        );

        // Add to owner
        if (owner) {
          updates.push(
            prisma.user.update({
              where: { id: owner.id },
              data: { points: owner.points + cost },
            })
          );
        }

        // Transfer ownership
        updates.push(
          prisma.item.update({
            where: { id: swap.itemId },
            data: {
              ownerId: swap.requesterId,
              available: false,
            },
          })
        );

        // Log redemption
        updates.push(
          prisma.redemption.create({
            data: {
              itemId: swap.itemId,
              userId: swap.requesterId,
              pointsUsed: cost,
            },
          })
        );
      }

      // ✅ Two-way item swap logic
      if (swap.offeredItemId) {
        // Transfer ownership
        updates.push(
          prisma.item.update({
            where: { id: swap.itemId },
            data: {
              ownerId: swap.requesterId,
              available: false,
            },
          })
        );

        updates.push(
          prisma.item.update({
            where: { id: swap.offeredItemId },
            data: {
              ownerId: swap.ownerId,
              available: false,
            },
          })
        );

        // Add fixed reward points to item owner
        if (owner) {
          updates.push(
            prisma.user.update({
              where: { id: owner.id },
              data: {
                points: owner.points + REWARD_FOR_ITEM_SWAP,
              },
            })
          );
        }
      }

      await prisma.$transaction(updates);
    }
    console.log("Swap updated:", updatedSwap);
    res.json({ message: `Swap ${decision}`, swap: updatedSwap });
  } catch (err) {
    console.error("Error responding to swap:", err);
    res.status(500).json({ error: "Failed to respond to swap request" });
  }
};

// Get Swap History (completed swaps for logged-in user)
export const getSwapHistory = async (req: Request, res: Response) => {
  const userId = (req as any).userId;

  try {
    const swaps = await prisma.swap.findMany({
      where: {
        OR: [{ requesterId: userId }, { ownerId: userId }],
        NOT: { status: "pending" },
      },
      include: {
        item: true,
        requester: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(swaps);
  } catch (err) {
    console.error("Failed to get swap history:", err);
    res.status(500).json({ error: "Failed to fetch swap history" });
  }
};
