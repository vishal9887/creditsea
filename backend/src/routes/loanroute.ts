import express from "express";
import createloan from "../controller/loan/createloan";
import verifyloan from "../controller/loan/verifyloan";
import approveloan from "../controller/loan/approveloan";
import getallusers from "../controller/loan/getallusers";
import giveaccesstousers from "../controller/loan/giveaccesstousers";
import {
  authToken,
  checkAdmin,
  checkisVerifier,
} from "../middleware/authToken";
import getloan from "../controller/loan/getloan";
import getmyloan from "../controller/loan/getmyloan";
const router = express.Router();
router.post("/createloan", authToken, createloan);
router.get("/getloan", authToken, checkAdmin, checkisVerifier, getloan);
router.get("/getmyloan", authToken, getmyloan);
router.post("/verifyloan", authToken, checkisVerifier, verifyloan);
router.post("/approveloan", authToken, checkAdmin, approveloan);
router.get("/getallusers", authToken, checkAdmin, getallusers);
router.post("/accesstousers", authToken, checkAdmin, giveaccesstousers);
export default router;
