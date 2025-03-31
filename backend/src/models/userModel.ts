import mongoose, { Document, Schema } from "mongoose";
export type UserRole = "USER" | "VERIFIER" | "ADMIN";
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    profilePic: string[];
    role: UserRole;
}
const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true },
        profilePic: { type: [String], default: [] },
        role: { type: String, enum: ["USER", "VERIFIER", "ADMIN"], default: "USER" },
    },
    {
        timestamps: true,
    }
);
const userModel = mongoose.model<IUser>("user", userSchema);

export default userModel;
