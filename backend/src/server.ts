import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
// Import routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
// import itemRoutes from "./routes/items";
// import adminRoutes from "./routes/admin";

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = 8000;

// // Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Rewear API is running" });
});
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Start server
app.listen(8000, () => {
  console.log(`🚀 Server running at http://localhost:8000`);
});
