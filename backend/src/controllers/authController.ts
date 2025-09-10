import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
    console.log("Login attempt with email:", email,password);
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: "User do not exist" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "6h" }
    );
    const isAdmin = user.isAdmin;
    console.log("User logged in successfully:", user.id, user.email, isAdmin);
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
    });
    return res.json({ message: 'Login successful' });
  } catch (error) {
    return res.status(500).json({ error: "Login failed" });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; isAdmin: boolean };
    console.log("Decoded token:", decoded);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    console.log("User found:", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log("User profile retrieved:", user.id, user.email, user.name, user.isAdmin);
    return res.json({user:{
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,}
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export const signupUser = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ userId: newUser.id, email: newUser.email,isAdmin:newUser.isAdmin }, JWT_SECRET, {
      expiresIn: "6h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
    });
    return res.status(201).json({message:"Signup successful"});
  } catch (error) {
    return res.status(500).json({ error: "Signup failed" });
  }
};
