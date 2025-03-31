import { Request, Response } from "express";
import loanModel from "../../models/Loan";
interface AuthenticatedRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
}
export default async function getverifiedLoan(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.isAdmin) {
      res.status(403).json({
        message: "Access denied",
        error: true,
        success: false,
      });
      return;
    }
    const verifiedLoans = await loanModel.find({
      isVerified: true,
      approverId: { $exists: false },
    });
    res.status(200).json({
      success: true,
      error: false,
      message: "verified loans ",
      data: verifiedLoans,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
