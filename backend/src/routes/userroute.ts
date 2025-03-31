import express from "express";
import signup from "../controller/user/usersignup";
import signin from "../controller/user/usersignin";
import userdetails from "../controller/user/userdetails";
import { validateHandler } from "../utils/features";
import { avatar } from "../middleware/multer";
import {
  authToken,
} from "../middleware/authToken";
const router = express.Router();
router.post("/signup", avatar, validateHandler, signup);
router.post("/signin", signin);
router.get("/userdetails", authToken, userdetails);
export default router;
