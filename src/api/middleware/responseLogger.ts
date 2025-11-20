import { Request, Response, NextFunction } from "express";
export async function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.on("finish", () => {
    const resCode = res.statusCode;
    if (resCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${resCode}`);
    }
  });
  next();
}
