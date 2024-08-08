import { RequestHandler } from "express";
import { User } from "src/models/user";
import { JsonOne } from "src/resources/responseResource";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { authToken } from "src/models/authToken";
import { SendEmail } from "src/utils/sendEmail";
import { PasswordResetTokenModel } from "src/models/passwordResetToken";
import Mail from "nodemailer/lib/mailer";

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
    const link = `http://localhost:8000/verify.html?id=${user._id}&token=${token}`;

    //verify email
    await SendEmail(
      user.email,
      "verification@cyclemarket.com",
      `<h1>Please click on <a href="${link}">this link</a> to verify your account</h1>`
    );

    JsonOne(
      { message: "We have sent verification to your email. Please verify it." },
      200,
      null,
      res
    );
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

export const generateVerificationLink: RequestHandler = async (req, res) => {
  try {
    const { id, email } = req.user;

    const token = crypto.randomBytes(36).toString("hex");
    await authToken.findOneAndDelete({ owner: id });
    await authToken.create({ owner: id, token });

    const link = `http://localhost:8000/verify.html?id=${id}&token=${token}`;
    //verify email
    await SendEmail(
      email,
      "verification@cyclemarket.com",
      `<h1>Please click on <a href="${link}">this link</a> to verify your account</h1>`
    );

    JsonOne(
      { message: "We have sent verification to your email. Please verify it." },
      200,
      null,
      res
    );
  } catch (error) {
    JsonOne(null, 500, "Server Error", res);
  }
};

export const refreshToken: RequestHandler = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return JsonOne(null, 401, "Unauthorized Request!", res);

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET!) as {
      id: string;
    };
    if (payload.id) {
      const user = await User.findOne({
        _id: payload.id,
        tokens: refreshToken,
      });

      if (!user) {
        // user is compromised and removed all the previous tokens
        await User.findByIdAndUpdate(payload.id, { tokens: [] });
        return JsonOne(null, 401, "Unauthorized Request!", res);
      }

      const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "15m",
      });

      const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET!);

      user.tokens = user.tokens.filter((t) => t !== refreshToken);
      user.tokens.push(newRefreshToken);
      await user.save();

      JsonOne(
        {
          tokens: { refresh: newRefreshToken, access: newAccessToken },
        },
        200,
        null,
        res
      );
    }
  } catch (error) {
    JsonOne(null, 500, "Server Error", res);
  }
};

export const SignOut: RequestHandler = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return JsonOne(null, 401, "Unauthorized Request!", res);

    user.tokens = [];
    await user.save();

    JsonOne(
      {
        message: "You have successfully Logout",
      },
      200,
      null,
      res
    );
  } catch (e) {
    JsonOne(null, 500, "Server Error", res);
  }
};

export const generateForgetPassLink: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return JsonOne(null, 404, "Account Not Found", res);

    //remove token if existed
    await PasswordResetTokenModel.findOneAndDelete({ owner: user._id });

    const token = crypto.randomBytes(36).toString("hex");
    await PasswordResetTokenModel.create({ owner: user._id, token });

    const passResetLink = `${process.env.PASSWORD_RESET_LINK}?id=${user._id}&token=${token}`;

    await SendEmail(
      user.email,
      "support@cyclemarket.com",
      `<h1>Please click on <a href="${passResetLink}">this link</a> to reset your password</h1>`
    );

    JsonOne(
      {
        message: "Please check your email to reset your password",
      },
      200,
      null,
      res
    );
  } catch (error) {
    JsonOne(null, 500, "Server Error", res);
  }
};

export const grantValid: RequestHandler = async (req, res) => {
  res.json({
    valid: true,
  });
};

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { id, password } = req.body;
    const user = await User.findById(id);
    if (!user) return JsonOne(null, 403, "Unauthorized Access!", res);

    const matched = await user.comparePassword(password);
    if (matched)
      return JsonOne(null, 422, "New Password must be different!", res);

    user.password = password;
    await user.save();

    await PasswordResetTokenModel.findOneAndDelete({ owner: user._id });

    JsonOne(
      {
        message: "Your password is updated",
      },
      200,
      null,
      res
    );
  } catch (error) {
    JsonOne(null, 500, "Server Error", res);
  }
};
