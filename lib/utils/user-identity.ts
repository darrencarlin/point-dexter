import { v4 as uuid } from "uuid";

/**
 * Utility functions for managing user identity (both authenticated and anonymous)
 */

const ANONYMOUS_USER_ID_KEY = "anonymous_user_id";
const ANONYMOUS_USER_NAME_KEY = "anonymous_user_name";

/**
 * Generate a unique anonymous user ID and store in localStorage (persists across sessions)
 */
export function getAnonymousUserId(): string {
  if (typeof window === "undefined") return "";

  let userId = localStorage.getItem(ANONYMOUS_USER_ID_KEY);

  if (!userId) {
    const id = uuid();
    userId = `anon_${id}`;
    localStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
  }

  return userId;
}

/**
 * Get or set anonymous user name from localStorage (persists across sessions)
 */
export function getAnonymousUserName(): string {
  if (typeof window === "undefined") return "Anonymous";
  return localStorage.getItem(ANONYMOUS_USER_NAME_KEY) || "Anonymous";
}

/**
 * Set anonymous user name in localStorage
 */
export function setAnonymousUserName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ANONYMOUS_USER_NAME_KEY, name);
}

/**
 * Get the current user ID (anonymous ID as fallback)
 */
export function getCurrentUserId(): string {
  return getAnonymousUserId();
}

/**
 * Get the current user name (anonymous name as fallback)
 */
export function getCurrentUserName(): string {
  return getAnonymousUserName();
}

/**
 * Get effective user ID - authenticated user ID if available, otherwise anonymous ID
 */
export function getEffectiveUserId(
  session?: { user?: { id?: string } } | null
): string {
  return session?.user?.id ?? getAnonymousUserId();
}

/**
 * Get effective user name - authenticated user name if available, otherwise anonymous name
 */
export function getEffectiveUserName(
  session?: { user?: { name?: string } } | null
): string {
  return session?.user?.name ?? getAnonymousUserName();
}
