import { and, eq } from "drizzle-orm";
import { db } from "../index.js";
import { Chirp, NewChirp, chirps } from "../schema.js";

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

export async function deleteChirp(chirpID: string, userId: string) {
  const result: Chirp[] = await db
    .delete(chirps)
    .where(eq(chirps.id, chirpID))
    .returning();
  console.log(result);
  return result.length > 0;
}
