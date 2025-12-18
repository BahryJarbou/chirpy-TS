import type { Request, Response } from "express";

import { User } from "src/lib/db/schema.js";
import { respondWithError, respondWithJson } from "./json.js";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "./errors.js";
import {
  checkPasswordHash,
  getBearerToken,
  makeJWT,
  makeRefreshToken,
} from "../auth.js";
import { getUserByEmail } from "../lib/db/queries/users.js";
import { config } from "../config.js";
import {
  saveRefreshToken,
  userForRefreshToken,
  revokeRefreshToken,
} from "../lib/db/queries/refreshTokens.js";

type LoginResponse = User & { token: string; refreshToken: string };

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
    expiresInSeconds?: number;
  };

  const params: parameters = req.body;

  if (!params.email || !params.password) {
    console.log("missing params");
    throw new BadRequestError("Missing required fields");
  }
  const user = await getUserByEmail(params.email);
  if (!user) {
    console.log("missing user");
    throw new UnauthorizedError("Incorrect email or password");
  }

  if (!(await checkPasswordHash(params.password, user.hashedPassword))) {
    throw new UnauthorizedError("Incorrect email or password");
  }
  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret
  );
  const refreshToken = makeRefreshToken();

  const saved = await saveRefreshToken(user.id, refreshToken);
  if (!saved) {
    throw new ForbiddenError("could not save refresh token");
  }

  respondWithJson(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: accessToken,
    refreshToken: refreshToken,
    isChirpyRed: user.isChirpyRed,
  } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
  const token = getBearerToken(req);
  const result = await userForRefreshToken(token);
  const user = result.user;
  if (!result) {
    throw new UnauthorizedError("invalid refresh token");
  }
  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret
  );
  type Response = { token: string };
  respondWithJson(res, 200, { token: accessToken } satisfies Response);
}

export async function handlerRevokeToken(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();
}
