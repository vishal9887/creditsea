import { Request, Response } from "express";
import userModel from "../../models/userModel";
interface AuthenticatedRequest extends Request {
  isAdmin?: boolean;
}
export default async function giveAccessToUsers(
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
    const { userId, role } = req.body;

    // Validate input
    if (!userId || !role) {
      res.status(400).json({
        message: "User ID and role are required",
        error: true,
        success: false,
      });
      return;
    }

    // Allowed roles (for security)
    const allowedRoles = ["USER", "VERIFIER", "ADMIN"];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        message: "Invalid role provided",
        error: true,
        success: false,
      });
      return;
    }

    // Find and update user
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { role: role },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
      return;
    }

    res.status(200).json({
      success: true,
      error: false,
      message: `User role updated to ${role} successfully`,
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
