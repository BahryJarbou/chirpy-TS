import argon2 from "argon2";
import type { Request } from "express";
import { BadRequestError, UnauthorizedError } from "./api/errors.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "./config.js";
import crypto from "crypto";

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  if (!password) return false;
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function getBearerToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (
    !authHeader ||
    authHeader.split(" ").length !== 2 ||
    authHeader.split(" ")[0] !== "Bearer"
  )
    throw new UnauthorizedError("401 forbidden");
  const token = authHeader.split(" ")[1];
  return token;
}

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string
): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: "chirpy",
      sub: userID,
      iat: Date.now(),
      exp: Date.now() + expiresIn,
    } satisfies Payload,
    secret,
    { algorithm: "HS256" }
  );
  return token;
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: Payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (err) {
    throw new UnauthorizedError("Invalid token");
  }

  if (decoded.iss !== config.jwt.issuer) {
    throw new UnauthorizedError("Invalid issuer");
  }
  if (!decoded.sub) {
    throw new UnauthorizedError("No user ID in token");
  }

  return decoded.sub;
}

export function makeRefreshToken() {
  const token = crypto.randomBytes(32);
  return token.toString("hex");
}

export function getAPIKey(req: Request) {
  const authHeader = req.headers.authorization;
  if (
    !authHeader ||
    authHeader.split(" ").length !== 2 ||
    authHeader.split(" ")[0] !== "ApiKey"
  ) {
    throw new UnauthorizedError("401 forbidden");
  }
  return authHeader.split(" ")[1];
}
