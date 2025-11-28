import type { Request, Response, NextFunction } from "express";
import { respondWithError } from "../json.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors.js";

export async function errorHandler(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction
) {
  console.log(err);
  let statusCode = 500;
  let message = "Something went wrong on our end";

  if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  } else if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    message = err.message;
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    message = err.message;
  }

  if (statusCode >= 500) {
    console.error(message);
  }
  respondWithError(res, statusCode, message);
}
