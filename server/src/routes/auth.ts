import { Router } from "express";
import {
  createNewUser,
  generateVerificationLink,
  signIn,
  verifyEmail,
} from "src/controllers/authController";
import { getProfile } from "src/controllers/userController";
import { isAuth } from "src/middlewares/auth";
import { validate } from "src/middlewares/validator";
import {
  createUserSchema,
  verifyTokenSchema,
} from "src/validationSchemas/authSchema";

const authRouter = Router();

authRouter.post("/sign-up", validate(createUserSchema), createNewUser);
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail);
authRouter.post("/sign-in", signIn);
authRouter.get("/verify-token", isAuth, generateVerificationLink);
authRouter.get("/profile", isAuth, getProfile);

export default authRouter;
