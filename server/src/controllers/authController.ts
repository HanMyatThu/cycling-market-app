import { RequestHandler } from "express";
import { User } from "src/models/user";
import { JsonOne } from "src/resources/responseResource";
import { createUserSchema } from "src/validationSchemas/authSchema";

import crypto from "crypto";
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
  } catch (e) {}
};
