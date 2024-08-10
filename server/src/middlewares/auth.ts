import { RequestHandler } from "express";
import { JsonOne } from "src/resources/responseResource";
import "dotenv/config";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { User } from "src/models/user";
import { PasswordResetTokenModel } from "src/models/passwordResetToken";

export const isAuth: RequestHandler = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken) return JsonOne(null, 401, "Unauthorized Error", res);
    const token = authToken?.split("Bearer ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    const user = await User.findById(payload.id);
    if (!user) return JsonOne(null, 401, "Unauthorized Error", res);

    req.user = {
      id: payload.id,
      name: user.name,
      email: user.email,
      verified: user.verified,
      avatar: user.avatar.url,
    };

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return JsonOne(null, 401, "Token is expired", res);
    } else {
      return JsonOne(null, 500, "Unknown Error", res);
    }
  }
};

export const isValidPassResetToken: RequestHandler = async (req, res, next) => {
  const { id, token } = req.body;
  const resetPassToken = await PasswordResetTokenModel.findOne({ owner: id });

  if (!resetPassToken) return JsonOne(null, 403, "Unauthorized Requesst!", res);

  const matched = resetPassToken.compareToken(token);
  if (!matched) return JsonOne(null, 403, "Unauthorized Requesst!", res);

  next();
};
