import { Request, Response } from "express";
import { config } from "../config.js";
import { resetUsers } from "../lib/db/queries/users.js";

export async function handlerReset(_: Request, res: Response) {
  config.api.fileServerHits = 0;
  await resetUsers();
  res.status(200).send("users are reset and hits reset to 0");
}
