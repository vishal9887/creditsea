import mongoose, { ConnectOptions } from "mongoose";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import cloudinary from "cloudinary";
import { UploadApiResponse } from "cloudinary";

const connectDB = async (): Promise<void> => {
  try {
    const data = await mongoose.connect(
      process.env.MONGO_URI as string,
      {
        dbName: "Creditsea",
      } as ConnectOptions
    );

    console.log(`Connected to DB: ${data.connection.host}`);
  } catch (error) {
    console.error("Failed to connect to DB", error);
    process.exit(1);
  }
};
const validateHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const errorMessages = errors
    .array()
    .map((error) => error.msg)
    .join(", ");
  res.status(400).json({ success: false, message: errorMessages });
};
const getBase64 = (file: Express.Multer.File): string => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};
const uploadFilesToCloudinary = async (
  files: Express.Multer.File[] = []
): Promise<{ public_id: string; url: string }[]> => {
  const uploadPromises = files.map(
    (file) =>
      new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.v2.uploader.upload(
          getBase64(file),
          {
            resource_type: "auto",
            public_id: uuid(),
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          }
        );
      })
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (err) {
    throw new Error("Error uploading files to Cloudinary");
  }
};
export { connectDB, validateHandler, uploadFilesToCloudinary };
