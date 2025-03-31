import { Request, Response } from "express";
import loanModel from "../../models/Loan";
import { Types } from "mongoose";

interface AuthenticatedRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
}

export default async function approveLoan(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    // Check if the user is admin
    if (!req.isAdmin) {
      res.status(403).json({
        message: "Access denied. Only Admin can verify loans.",
        error: true,
        success: false,
      });
      return;
    }

    const { id, approve ,remarks} = req.body;

    // Validate loanId
    if (!id) {
      res.status(400).json({
        message: "Loan ID is required",
        error: true,
        success: false,
      });
      return;
    }

    // Find the loan by ID
    const loan = await loanModel.findById(id);
    if (!loan) {
      res.status(404).json({
        message: "Loan not found",
        error: true,
        success: false,
      });
      return;
    }
    if (approve) {
      loan.status = "APPROVED";
      loan.approverId = new Types.ObjectId(req.userId as string);
    } else {
      loan.status = "REJECTED";
      loan.approverId = new Types.ObjectId(req.userId as string);
      loan.remarks=remarks;
    }
    await loan.save();

    res.status(200).json({
      success: true,
      error: false,
      message: `Loan  ${approve ? "approved" : "rejected"} for ${
        loan.fullName
      }`,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
