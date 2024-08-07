import { RequestHandler } from "express";
import { JsonOne } from "src/resources/responseResource";
import * as yup from "yup";

export const validate = (schema: yup.Schema): RequestHandler => {
  return async (req, res, next) => {
    try {
      await schema.validate(
        { ...req.body },
        { strict: true, abortEarly: true }
      );
      next();
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        JsonOne(null, 422, error.message, res);
      } else {
        JsonOne(null, 422, "Server Error", res);
      }
    }
  };
};
