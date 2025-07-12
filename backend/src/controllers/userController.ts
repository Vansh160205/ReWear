import { Request, Response } from "express";
import prisma from "../lib/prisma"

// GET all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { items: true, swaps: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET single user by ID
export const getUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { items: true, swaps: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// CREATE user (useful for admin/manual testing)
export const createUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, password, name },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: "User creation failed" });
  }
};

// UPDATE user by ID
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, password } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, password },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Update failed" });
  }
};

// DELETE user by ID
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: "Deletion failed" });
  }
};
