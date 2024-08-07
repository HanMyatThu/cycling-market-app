import { RequestHandler } from "express";
import { User } from "src/models/user";
import { JsonOne } from "src/resources/responseResource";
import { createUserSchema } from "src/validationSchemas/authSchema";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { authToken } from "src/models/authToken";
import { SendEmail } from "src/utils/sendEmail";

export const createNewUser: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    const isUserExisted = await User.findOne({ email });
    if (isUserExisted) {
      return JsonOne(null, 400, "User with email is already registered", res);
    }

    const user = new User({
      ...req.body,
    });
    await user.save();

    //generate token for login
    const token = crypto.randomBytes(36).toString("hex");
    await authToken.create({
      owner: user._id,
      token,
    });
    const link = `http://localhost:8000/verify?id=${user._id}&token=${token}`;

    //verify email
    await SendEmail(
      user.email,
      "verification@cyclemarket.com",
      `<h1>Please click on <a href="${link}">this link</a> to verify your account</h1>`
    );

    res.send(link);
  } catch (error) {
    JsonOne(null, 500, "Server Error", res);
  }
};

export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const { id, token } = req.body;
    const verifiedToken = await authToken.findOne({
      owner: id,
    });
    if (!verifiedToken) return JsonOne(null, 403, "Unauthorized Request!", res);

    const isMatched = await verifiedToken.compareToken(token);
    if (!isMatched)
      return JsonOne(null, 403, "Unauthorized Request, Invalid Token", res);

    await User.findByIdAndUpdate(id, { verified: true });

    await authToken.findByIdAndDelete(verifiedToken._id);

    res.send({ message: "Thanks for joining us. Your Email is verified." });
  } catch (e) {
    JsonOne(null, 500, "Server Error", res);
  }
};

export const signIn: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return JsonOne(null, 403, "Invalid Credentials", res);

    const isMatched = await user.comparePassword(password);
    if (!isMatched) return JsonOne(null, 403, "Invalid Credentials", res);

    const payload = { id: user._id };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!);

    if (!user.tokens) user.tokens = [refreshToken];
    else user.tokens.push(refreshToken);

    await user.save();

    return JsonOne(
      {
        profile: {
          id: user._id,
          email: user.email,
          name: user.name,
          verified: user.verified,
        },
        tokens: {
          refresh: refreshToken,
          accessToken,
        },
      },
      200,
      null,
      res
    );
  } catch (e) {
    JsonOne(null, 500, "Server Error", res);
  }
};
