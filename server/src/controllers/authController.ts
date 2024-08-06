import { RequestHandler } from "express";
import { User } from "src/models/user";
import { JsonOne } from "src/resources/responseResource";
import { createUserSchema } from "src/validationSchemas/authSchema";

import crypto from "crypto";
import { authToken } from "src/models/authToken";
import { SendEmail } from "src/utils/sendEmail";

export const createNewUser: RequestHandler = async (req, res) => {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).send(validation.error.format());
    }
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
  } catch (error) {}
};
