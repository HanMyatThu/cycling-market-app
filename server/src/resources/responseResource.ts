import { error } from "console";
import { Response } from "express";

export const JsonOne = (
  data: any,
  code: number,
  errorMsg: string | null,
  res: Response
) => {
  return res.status(code).send({
    data,
    error: errorMsg
      ? {
          code,
          message: errorMsg,
        }
      : null,
  });
};
