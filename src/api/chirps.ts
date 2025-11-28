import { Request, Response } from "express";

import { respondWithJson } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import {
  createChirp,
  getChirpById,
  getChirps,
} from "../lib/db/queries/chirps.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
    userId: string;
  };

  let params: parameters = req.body;

  if (!params.userId || !params.body) {
    throw new BadRequestError("Missing required fields");
  }

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: params.userId });

  if (!chirp) throw new Error("Couldn't create chrip.");

  respondWithJson(res, 201, chirp);
}

export async function handlerGetChirps(req: Request, res: Response) {
  const chirps = await getChirps();
  respondWithJson(res, 200, chirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
  const { chirpId } = req.params;
  if (!chirpId) throw new BadRequestError("id is missing");

  const chirp = await getChirpById(chirpId);
  console.log("chirp: ", chirp);
  if (!chirp)
    throw new NotFoundError(`Chirp with chirpId: ${chirpId} not found`);

  respondWithJson(res, 200, chirp);
}

//helper
function validateChirp(body: string) {
  const profane = ["kerfuffle", "sharbert", "fornax"];
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError(
      `Chirp is too long. Max length is ${maxChirpLength}`
    );
  }

  const words = body.split(" ");
  const filteredWords = words.map((word) =>
    profane.includes(word.toLowerCase()) ? "****" : word
  );

  const cleanedBody = filteredWords.join(" ");
  return cleanedBody;
}
