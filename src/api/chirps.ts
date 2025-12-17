import { Request, Response } from "express";

import { respondWithJson } from "./json.js";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./errors.js";
import {
  createChirp,
  deleteChirp,
  getChirpById,
  getChirps,
} from "../lib/db/queries/chirps.js";
import { validateJWT } from "../auth.js";
import { getBearerToken } from "../auth.js";
import { config } from "../config.js";

export async function handlerCreateChirp(req: Request, res: Response) {
  type parameters = {
    body: string;
  };

  type Headers = {
    authorization: string;
  };

  let params: parameters = req.body;
  let headers = req.headers as Headers;

  if (!headers.authorization) {
    throw new UnauthorizedError("User not authorized");
  }

  if (!params.body) {
    throw new BadRequestError("Missing required fields");
  }

  const token = getBearerToken(req);
  let userId = "";
  try {
    userId = validateJWT(token, config.jwt.secret);
  } catch (error) {
    throw new UnauthorizedError("401 Forbidden");
  }

  const cleaned = validateChirp(params.body);
  const chirp = await createChirp({ body: cleaned, userId: userId });

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

export async function handlerDeleteChirp(req: Request, res: Response) {
  const { chirpID } = req.params;
  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.jwt.secret);
  console.log("USERID", userId);
  console.log("CHIRPID", chirpID);
  const chirp = await getChirpById(chirpID);
  if (!chirp) {
    throw new NotFoundError(`Chirp with chirpId: ${chirpID} not found`);
  }
  if (chirp.userId !== userId) {
    throw new ForbiddenError("couldn't delete chirp, unauthorized author");
  }
  const isDeleted = await deleteChirp(chirpID, userId);
  if (!isDeleted) {
    throw new Error(`Failed to delete chirp with chirpId: ${chirpID}`);
  }
  res.status(204).send();
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
