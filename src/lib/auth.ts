import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const TOKEN_COOKIE_NAME = "auth_token";

export function getTokenCookieName() {
  return TOKEN_COOKIE_NAME;
}

export async function hashPassword(password: string) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

export async function comparePassword(password: string, hash: string) {
  const match = await bcrypt.compare(password, hash);
  return match;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET não definido no ambiente");
  }
  return secret;
}

export function signToken(payload: { userId: number }) {
  const secret = getJwtSecret();
  const token = jwt.sign(payload, secret, { expiresIn: "7d" });
  return token;
}

export function getUserIdFromToken(token: string | undefined | null) {
  if (!token) return null;
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { userId?: number };
    if (!decoded.userId) return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });
  if (existing) {
    throw new Error("E-mail já está em uso");
  }
  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash
    }
  });
  return user;
}

export async function authenticateUser(input: {
  email: string;
  password: string;
}) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() }
  });
  if (!user) {
    return null;
  }
  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    return null;
  }
  return user;
}

