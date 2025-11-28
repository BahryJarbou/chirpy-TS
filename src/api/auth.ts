import type { Request, Response } from "express";
import { User } from "src/lib/db/schema";
import { respondWithJson } from "./json";
import { UnauthorizedError } from "./errors";
import { checkPasswordHash } from "src/auth";
import { getUserByEmail } from "src/lib/db/queries/users";

export async function handlerLogin(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  if (!params.email || !params.password) {
    console.log("missing params");
    throw new Error("Missing required fields");
  }
  const user = await getUserByEmail(params.email);
  if (!user) {
    console.log("missing user");
    throw new UnauthorizedError("Incorrect email or password");
  }

  if (!(await checkPasswordHash(params.password, user.hashedPassword))) {
    throw new UnauthorizedError("Incorrect email or password");
  }
  respondWithJson(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } satisfies User);
}
