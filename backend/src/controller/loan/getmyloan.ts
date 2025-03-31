import { Request, Response } from "express";
import loanModel from "../../models/Loan";

interface AuthenticatedRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
  isVerifier?: boolean;
}

export default async function getmyloan(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(403).json({
        message: "Access denied",
        error: true,
        success: false,
      });
      return;
    }

    // Updated to populate user name and profilePic from userId
    const Loans = await loanModel
      .find({ userId: req.userId })
      .populate("userId", "name profilePic");

    res.status(200).json({
      success: true,
      error: false,
      message: "Unverified loans retrieved successfully",
      loan: Loans,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
