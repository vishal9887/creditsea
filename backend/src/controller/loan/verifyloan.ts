import { Request, Response } from "express";
import loanModel from "../../models/Loan";
import { Types } from "mongoose";

interface AuthenticatedRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
  isVerifier?: boolean;
}

export default async function verifyLoan(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    // Check if the user is a verifier
    if (!req.isVerifier) {
      res.status(403).json({
        message: "Access denied. Only verifiers can verify loans.",
        error: true,
        success: false,
      });
      return;
    }
    const { id, approve } = req.body;

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

    // Update loan: Set isVerified based on approve & assign verifierId
    loan.isVerified = approve ? true : false;
    loan.verifierId = new Types.ObjectId(req.userId as string); // Set verifierId

    await loan.save();

    res.status(200).json({
      success: true,
      error: false,
      message: `Loan verification ${approve ? "approved" : "rejected"}`,
      data: loan,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
