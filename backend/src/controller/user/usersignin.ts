import { Request, Response } from "express";
import bcrypt from "bcrypt";
import userModel from "../../models/userModel";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
interface JwtPayload {
  _id: string;
}
export default async function signin(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email) throw new Error("Please provide email");
    if (!password) throw new Error("Please provide password");
    const user = await userModel.findOne({ email });
    if (!user) throw new Error("User not found");
    if (!user.password || typeof user.password !== "string") {
      throw new Error("Invalid or missing password in database");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Incorrect password");
    const userId = (user._id as Types.ObjectId).toString();
    const secretKey = process.env.TOKEN_SECRET_KEY as string;
    if (!secretKey) throw new Error("TOKEN_SECRET_KEY is not set");
    const token = jwt.sign({ _id: userId } as JwtPayload, secretKey, {
      expiresIn: "1d",
    });
    res.status(200).json({
      success: true,
      token: token,
      user:user,
      message: "Logged in successfully",
    });
  } catch (err) {
    res.status(400).json({
      message: err instanceof Error ? err.message : "An unknown error occurred",
      error: true,
      success: false,
    });
  }
}
