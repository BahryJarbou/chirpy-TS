import type { Response } from "express";

export function respondWithError(res: Response, code: number, message: string) {
  respondWithJson(res, code, { error: message });
}

export function respondWithJson(res: Response, code: number, payLoad: any) {
  res.header("Content-Type", "application/json");
  const body = JSON.stringify(payLoad);
  res.status(code).send(body);
}
