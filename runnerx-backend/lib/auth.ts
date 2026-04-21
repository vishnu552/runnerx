import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = "7d";
const COOKIE_NAME = "runnerx-admin-token";

// ─── Password Helpers ────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ─── JWT Helpers ─────────────────────────────────────────────

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || typeof decoded.userId === 'undefined') return null;
    
    // Ensure userId is a number (it might be a string from old session)
    const userId = Number(decoded.userId);
    if (isNaN(userId)) return null;

    return {
      ...decoded,
      userId
    } as TokenPayload;
  } catch {
    return null;
  }
}

// ─── Cookie Helpers ──────────────────────────────────────────

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
}

// ─── Session Helpers ─────────────────────────────────────────

/**
 * Extracts token from either cookies or the Authorization header.
 */
export async function getToken(request?: Request): Promise<string | null> {
  // 1. Try Cookies
  const cookieToken = await getTokenFromCookies();
  if (cookieToken) return cookieToken;

  // 2. Try Authorization Header
  if (request) {
    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
  }

  return null;
}

/**
 * Gets the current session, checking both cookies and headers.
 * Role-agnostic.
 */
export async function getSession(request?: Request): Promise<TokenPayload | null> {
  const token = await getToken(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Gets the current session and ensures it has the ADMIN role.
 * Used for administrative dashboard routes.
 */
export async function getAdminSession(request?: Request): Promise<TokenPayload | null> {
  const session = await getSession(request);
  if (!session || session.role !== "ADMIN") {
    return null;
  }
  return session;
}
