import { Router } from "express";
import { createNewUser } from "src/controllers/authController";

const authRouter = Router();

authRouter.post("/auth/sign-up", createNewUser);
authRouter.post("/auth/sign-in");
authRouter.post("/auth/signup");

export default authRouter;
