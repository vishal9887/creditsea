import { Request, Response } from "express";
import loanModel from "../../models/Loan";
interface AuthenticatedRequest extends Request {
    userId?: string;
  }
export default async function createloan(req:AuthenticatedRequest, res: Response): Promise<void> {
    try {
        const { fullName, amount, loanTenure, employmentStatus, reason, streetAddress, cityStateZip } = req.body;
        const userId = req.userId;
        if (!userId) throw new Error("User ID is required");
        if (!fullName) throw new Error("Full name is required");
        if (!amount) throw new Error("Loan amount is required");
        if (!loanTenure) throw new Error("Loan tenure is required");
        if (!employmentStatus) throw new Error("Employment status is required");
        if (!reason) throw new Error("Reason for loan is required");
        if (!streetAddress || !cityStateZip) throw new Error("Complete address is required");
        const newLoan = new loanModel({
            userId,
            fullName,
            amount,
            loanTenure,
            employmentStatus,
            reason,
            streetAddress,
            cityStateZip,
            isVerified: false,
            status: "PENDING",
        });
        await newLoan.save();

        res.status(201).json({
            success: true,
            message: "Loan application submitted successfully!",
            data: newLoan,
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: true,
            message: err instanceof Error ? err.message : "An unknown error occurred",
        });
    }
}
