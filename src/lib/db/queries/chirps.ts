import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChirp(chirp: NewChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function getChirps() {
  const result = await db.select().from(chirps);
  return result;
}

export async function getChirpById(id: string) {
  const results = await db.select().from(chirps).where(eq(chirps.id, id));
  if (results.length === 0) {
    return;
  }
  return results[0];
}
