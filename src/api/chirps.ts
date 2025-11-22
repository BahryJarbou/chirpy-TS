import { NextFunction, Request, Response } from "express";

import { respondWithJson } from "./json.js";
import { BadRequestError } from "./errors.js";

export async function handlerValidateChirp(req: Request, res: Response) {
  const profane = ["kerfuffle", "sharbert", "fornax"];
  type parameters = {
    body: string;
  };

  let params: parameters = req.body;

  const maxChirpLength = 140;

  if (params.body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`
    );
  }

  const words = params.body.split(" ");
  const filteredWords = words.map((word) =>
    profane.includes(word.toLowerCase()) ? "****" : word
  );
  respondWithJson(res, 200, {
    cleanedBody: filteredWords.join(" "),
  });
  console.log(filteredWords);
}
