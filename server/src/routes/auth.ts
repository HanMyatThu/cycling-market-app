import { Router } from "express";
import {
  createNewUser,
  signIn,
  verifyEmail,
} from "src/controllers/authController";
import { validate } from "src/middlewares/validator";
import {
  createUserSchema,
  verifyTokenSchema,
} from "src/validationSchemas/authSchema";

const authRouter = Router();

authRouter.post("/sign-up", validate(createUserSchema), createNewUser);
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail);
authRouter.post("/sign-in", signIn);

export default authRouter;
