import { Request, Response } from "express";
import userModel from "../../models/userModel";
interface AuthenticatedRequest extends Request {
  userId?: string;
  isAdmin?: boolean;
}
export default async function searchUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if(!req.isAdmin){
      res.status(403).json({
        message: "Access denied",
        error: true,
        success: false,
      });
      return;
    }
    const { query } = req.query;
    const filter: Record<string, any> = {};
    if (query) {
      const searchRegex = new RegExp(query as string, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { role: searchRegex },
      ];
    }

    const users = await userModel.find(query ? filter : {});

    res.status(200).json({
      success: true,
      error: false,
      message: "Users list",
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "Internal Server Error",
      error: true,
      success: false,
    });
  }
}
