import { error } from "console";
import { RequestHandler } from "express";
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
    const user = req.user;
    res.json({
      profile: req.user,
    });
  } catch (error) {
    return JsonOne(null, 500, "Server Error", res);
  }
};
