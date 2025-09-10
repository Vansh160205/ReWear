import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.headers.authorization);
  const token = req.cookies.token;
  console.log("Token from header:", token);
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number,email:string,isAdmin:boolean };
    console.log("Decoded token:", decoded);
    (req as any).userId = decoded.userId;

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};
