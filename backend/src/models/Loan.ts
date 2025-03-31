import mongoose, { Document, Schema, Types } from "mongoose";
export type LoanStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ILoan extends Document {
  userId: Types.ObjectId;
  verifierId?: Types.ObjectId;
  approverId?: Types.ObjectId;
  fullName: string;
  amount: number;
  loanTenure: number;
  employmentStatus: string;
  reason: string;
  streetAddress: string;
  cityStateZip: string;
  isVerified: boolean;
  status: LoanStatus;
  remarks?: string;
}

const loanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    verifierId: { type: Schema.Types.ObjectId, ref: "user" },
    approverId: { type: Schema.Types.ObjectId, ref: "user" },
    fullName: { type: String, required: true },
    amount: { type: Number, required: true },
    loanTenure: { type: Number, required: true },
    employmentStatus: { type: String, required: true },
    reason: { type: String, required: true },
    streetAddress: { type: String, required: true },
    cityStateZip: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    remarks: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const loanModel = mongoose.model<ILoan>("Loan", loanSchema);

export default loanModel;
