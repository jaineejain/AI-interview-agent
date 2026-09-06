import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
  getCurrentUser,
  getSessionUser,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/session", getSessionUser);
userRouter.get("/current-user", isAuth, getCurrentUser);

export default userRouter;
