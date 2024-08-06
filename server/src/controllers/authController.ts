import { RequestHandler } from "express";
import { createUserSchema } from "src/validationSchemas/authSchema";

export const createNewUser: RequestHandler = async (req, res) => {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).send(validation.error.format());
    }
    const { email, password, name } = req.body;
  } catch (error) {}
};
