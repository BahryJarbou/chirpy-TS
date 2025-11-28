import { Request, Response, NextFunction } from "express";
import { config } from "../../config.js";

export async function middlewareMetricsInc(
  _: Request,
  __: Response,
  next: NextFunction
) {
  config.api.fileServerHits++;
  next();
}
