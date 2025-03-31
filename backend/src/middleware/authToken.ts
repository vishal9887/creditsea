import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import userModel from "../models/userModel";
interface AuthenticatedRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
  isVerifier?: boolean;
}

interface CustomJwtPayload extends JwtPayload {
  _id: string;
}
const authToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        message: "Authorization token missing or invalid",
        error: true,
        success: false,
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const secretKey = process.env.TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("TOKEN_SECRET_KEY is not set in environment variables");
    }
    const decoded = jwt.verify(token, secretKey) as CustomJwtPayload;
    if (!decoded || !decoded._id) {
      res.status(403).json({
        message: "Invalid or expired token",
        error: true,
        success: false,
      });
      return;
    }
    req.userId = decoded._id;
    next();
    
  } catch (err) {
    console.error("JWT Verification Error:", err);
    console.log(err);
    res.status(403).json({
      message: "Invalid or expired token",
      error: true,
      success: false,
    });
  }
};

const checkAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User ID is missing from request",
        error: true,
        success: false,
      });
      return;
    }

    const user = await userModel.findById(req.userId);
    if (!user) {
      res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
      return;
    }
    req.isAdmin = user.role === "ADMIN";
    next();
  } catch (err) {
    console.error("Error checking user role:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};
const checkisVerifier = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  
  try {
    if (!req.userId) {
      res.status(401).json({
        message: "User ID is missing from request",
        error: true,
        success: false,
      });
      return;
    }
    const user = await userModel.findById(
      new mongoose.Types.ObjectId(req.userId)
    );
    if (!user) {
      res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
      return;
    }
    req.isVerifier = user.role === "VERIFIER";
    next();
  } catch (err) {
    console.error("Error checking user role:", err);
    res.status(500).json({
      message: "Internal Server Error",
      error: true,
      success: false,
    });
  }
};
export { authToken, checkAdmin, checkisVerifier };