import { Response } from "express";

export const JsonOne = (
  data: any,
  code: number,
  errorMsg: string,
  res: Response
) => {
  return res.status(code).send({
    data,
    error: {
      code,
      message: errorMsg,
    },
  });
};
