import { error } from "console";
import { RequestHandler } from "express";
import { User } from "src/models/user";
import { JsonOne } from "src/resources/responseResource";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  verified: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user: UserProfile;
    }
  }
}

export const getProfile: RequestHandler = async (req, res) => {
  try {
    res.json({
      profile: req.user,
    });
  } catch (error) {
    return JsonOne(null, 500, "Server Error", res);
  }
};

export const updateProfile: RequestHandler = async (req, res) => {
  try {
    const { name } = req.body;
    if (typeof name !== "string" || name.trim().length < 3) {
      return JsonOne(null, 422, "Invalid Name", res);
    }

    const user = await User.findByIdAndUpdate(req.user.id, {
      name,
    });

    JsonOne(
      {
        profile: { ...req.user, name },
      },
      200,
      null,
      res
    );
  } catch (error) {
    return JsonOne(null, 500, "Server Error", res);
  }
};
