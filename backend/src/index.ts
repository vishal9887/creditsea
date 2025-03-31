import express, { Request, Response } from "express";
import  {connectDB}  from "./utils/features";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import cors from "cors";
import userRoute from "./routes/userroute";
import loanRoute from "./routes/loanroute";
dotenv.config({
    path: "./.env",
});
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("hello worldd");
});
app.use("/user",userRoute);
app.use("/loan",loanRoute);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Connected to DB");
        console.log("Server is running on port " + PORT);
    });
});
