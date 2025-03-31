import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import userModel from "../../models/userModel";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export default async function userdetails(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    let userId = req.userId;
    // If userId is not provided, extract it from the token
    if (!userId) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new Error("Unauthorized: No token provided");
      }

      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      if (!decoded || !decoded.id) {
        throw new Error("Unauthorized: Invalid token");
      }

      userId = decoded.id;
    }

    // Fetch user from the database
    const user = await userModel.findById(userId).select("-password"); // Exclude password
    if (!user) throw new Error("User not found");
    res.status(200).json({
      success: true,
      error: false,
      message: "User details retrieved successfully",
      user, // Send full user details (excluding password)
    });
  } catch (err) {
    res.status(401).json({
      message: err instanceof Error ? err.message : "An unknown error occurred",
      error: true,
      success: false,
    });
  }
}
