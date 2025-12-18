import type { Request, Response } from "express";
import { upgradeUser } from "../lib/db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "./errors.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";
export async function handlerPolkaWebhook(req: Request, res: Response) {
  type Parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const key = getAPIKey(req);
  console.log("key", key);
  console.log("POLKA key", config.api.polkaApiKey);
  if (key !== config.api.polkaApiKey) {
    throw new UnauthorizedError("invalid api key");
  }

  const params: Parameters = req.body;
  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }
  const isUpgraded = await upgradeUser(params.data.userId);
  console.log("result", isUpgraded);
  if (!isUpgraded) {
    throw new NotFoundError("user not found");
  }
  res.status(204).send();
}
