import { beforeAll, describe, expect, it, test } from "vitest";
import { getAPIKey, makeJWT, validateJWT } from "./auth";
import { getBearerToken } from "./auth";
import { checkPasswordHash, hashPassword } from "./auth";
import { BadRequestError, UnauthorizedError } from "./api/errors";
import type { Request } from "express";

describe("Passowrd Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });

  it("should return false when password doesn't match a different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });

  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });

  it("should return false for an invalid hash", async () => {
    const result = await checkPasswordHash(password1, "invalidhash");
    expect(result).toBe(false);
  });
});

describe("JWT creation", () => {
  const secret = "secret";
  const wrongSecret = "wrong_secret";
  const userID = "some-unique-user-id";
  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userID, 3600, secret);
  });

  it("should validate a valid token", () => {
    const result = validateJWT(validToken, secret);
    expect(result).toBe(userID);
  });

  it("should throw an error for an invalid token string", () => {
    expect(() => validateJWT("invalid.token.string", secret)).toThrow(
      UnauthorizedError
    );
  });

  it("should throw an error when the token is signed with a wrong secret", () => {
    expect(() => validateJWT(validToken, wrongSecret)).toThrow(
      UnauthorizedError
    );
  });
});

describe("token extraction from request", () => {
  const token1 = "Bearer SomeToken";
  const token2 = "Bearer Some Token";
  const token3 = "Some token";
  const token4 = "";
  const req1 = { headers: { authorization: token1 } } as Request;
  const req2 = { headers: { authorization: token2 } } as Request;
  const req3 = { headers: { authorization: token3 } } as Request;
  const req4 = { headers: { authorization: token4 } } as Request;

  it("should extract a valid token", () => {
    const output = getBearerToken(req1);
    expect(output).toBe("SomeToken");
  });

  it("should throw an error if authorization string has more than 2 splits", () => {
    expect(() => getBearerToken(req2)).toThrow(UnauthorizedError);
  });

  it("should throw an error if authorization string doesn't start with Bearer", () => {
    expect(() => getBearerToken(req3)).toThrow(UnauthorizedError);
  });

  it("should throw an error if authorization string is empty", () => {
    expect(() => getBearerToken(req4)).toThrow(UnauthorizedError);
  });
});

describe("token extraction from request", () => {
  const token1 = "ApiKey SomeToken";
  const token2 = "ApiKey Some Token";
  const token3 = "Some token";
  const token4 = "";
  const req1 = { headers: { authorization: token1 } } as Request;
  const req2 = { headers: { authorization: token2 } } as Request;
  const req3 = { headers: { authorization: token3 } } as Request;
  const req4 = { headers: { authorization: token4 } } as Request;

  it("should extract a valid token", () => {
    const output = getAPIKey(req1);
    expect(output).toBe("SomeToken");
  });

  it("should throw an error if authorization string has more than 2 splits", () => {
    expect(() => getAPIKey(req2)).toThrow(UnauthorizedError);
  });

  it("should throw an error if authorization string doesn't start with Bearer", () => {
    expect(() => getAPIKey(req3)).toThrow(UnauthorizedError);
  });

  it("should throw an error if authorization string is empty", () => {
    expect(() => getAPIKey(req4)).toThrow(UnauthorizedError);
  });
});
