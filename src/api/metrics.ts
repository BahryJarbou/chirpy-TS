import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerMetrics(_: Request, res: Response) {
  res.set("Content-Type", "text/plain");
  res.send(`Hits: ${config.fileserverHits}`);
}

export async function handlerReset(_: Request, res: Response) {
  config.fileserverHits = 0;
  res.write("Hits reset to 0");
  res.end();
}
