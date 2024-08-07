import { RequestHandler } from "express";
import { JsonOne } from "src/resources/responseResource";
import "dotenv/config";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { User } from "src/models/user";

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
