import { Router } from "express";
import {
  createNewUser,
  generateForgetPassLink,
  generateVerificationLink,
  grantValid,
  refreshToken,
  resetPassword,
  signIn,
  verifyEmail,
} from "src/controllers/authController";
import {
  getProfile,
  getPublicProfile,
  updateAvatar,
  updateProfile,
} from "src/controllers/userController";
import { isAuth, isValidPassResetToken } from "src/middlewares/auth";
import { fileUpload } from "src/middlewares/file-upload";
import { validate } from "src/middlewares/validator";
import {
  createUserSchema,
  resetPasswordSchema,
  verifyTokenSchema,
} from "src/validationSchemas/authSchema";

const authRouter = Router();

authRouter.post("/sign-up", validate(createUserSchema), createNewUser);
authRouter.post("/verify", validate(verifyTokenSchema), verifyEmail);
authRouter.get("/verify-token", isAuth, generateVerificationLink);
authRouter.post("/refresh-token", refreshToken);
authRouter.post("/forget-pass", generateForgetPassLink);
authRouter.post(
  "/verify-pass-reset-token",
  validate(verifyTokenSchema),
  isValidPassResetToken,
  grantValid
);
authRouter.post(
  "/reset-pass",
  validate(resetPasswordSchema),
  isValidPassResetToken,
  resetPassword
);

authRouter.post("/sign-in", signIn);
authRouter.post("/sign-out", isAuth);

authRouter.get("/profile", isAuth, getProfile);
authRouter.get("/profile/:id", isAuth, getPublicProfile);
authRouter.patch("/update-profile", isAuth, updateProfile);

authRouter.patch("/update-avatar", isAuth, fileUpload, updateAvatar);

export default authRouter;
