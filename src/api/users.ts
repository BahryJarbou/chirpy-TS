import type { Request, Response } from "express";
import { createUser, getUserByEmail } from "../lib/db/queries/users.js";
import { respondWithJson } from "./json.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { checkPasswordHash, hashPassword } from "../auth.js";
import { User } from "src/lib/db/schema.js";

export async function handlerCreateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;
  if (!params.email) {
    throw new BadRequestError("Email is required for user creation");
  }

  if (!params.password) {
    throw new BadRequestError("Password is required for user creation");
  }

  const passwordHashed = await hashPassword(params.password);

  const user = await createUser({
    email: params.email,
    hashedPassword: passwordHashed,
  });
  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJson(res, 201, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies User);
}
