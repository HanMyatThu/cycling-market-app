import { Router } from "express";
import { createNewUser } from "src/controllers/authController";

const authRouter = Router();

authRouter.post("/sign-up", createNewUser);
authRouter.post("/sign-in");

export default authRouter;
