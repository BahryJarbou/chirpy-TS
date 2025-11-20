import { Request, Response } from "express";

import { respondWithError, respondWithJson } from "./json.js";

export async function handlerValidateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  let params: parameters = req.body;

  const maxChirpLength = 140;
  if (params.body.length > maxChirpLength) {
    respondWithError(res, 400, "Chirp is too long");
    return;
  }

  respondWithJson(res, 200, {
    valid: true,
  });
}
