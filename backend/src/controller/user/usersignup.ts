import { Request, Response } from "express";
import userModel from "../../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadFilesToCloudinary } from "../../utils/features";

export default async function signup(req: Request, res: Response): Promise<void> {
    try {
        const { email, password, name } = req.body;
        const file = req.file as Express.Multer.File | undefined;

        // Validate input fields
        if (!email) throw new Error("Please provide email");
        if (!password) throw new Error("Please provide password");
        if (!name) throw new Error("Please provide name");

        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            throw new Error("User already exists.");
        }

        // Upload profile picture if provided
        let profilePicUrl = "";
        if (file) {
            const uploadedImageUrls = await uploadFilesToCloudinary([file]);
            if (uploadedImageUrls && uploadedImageUrls.length > 0) {
                profilePicUrl = String(uploadedImageUrls[0].url);
            } else {
                throw new Error("Image upload failed.");
            }
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        if (!hashedPassword) throw new Error("Error while hashing password");

        // Create user payload
        const payload = {
            email,
            name,
            password: hashedPassword,
            profilePic: profilePicUrl,
            role: "USER",
        };

        // Save user to database
        const newUser = new userModel(payload);
        const savedUser = await newUser.save();

        // ✅ Generate JWT Token
        const secretKey = process.env.TOKEN_SECRET_KEY as string;
        if (!secretKey) throw new Error("TOKEN_SECRET_KEY is not set");

        const token = jwt.sign({ _id: savedUser._id.toString() }, secretKey, { expiresIn: "1d" });

        // Send response with token
        res.status(201).json({
            user: savedUser,
            token, // Send token in response
            success: true,
            error: false,
            message: "User created successfully!",
        });

    } catch (err) {
        res.status(400).json({
            message: err instanceof Error ? err.message : "An unknown error occurred",
            error: true,
            success: false,
        });
    }
}
