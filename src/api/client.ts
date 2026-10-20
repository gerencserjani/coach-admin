import createClient from "openapi-fetch";
import type { paths } from "./types.generated";

const AUTH_TOKEN_KEY = "coach_admin_auth_token";
const BASE_URL_KEY = "coach_admin_base_url";
const DEFAULT_BASE_URL = "http://localhost:3000";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // localStorage unavailable -- auth just won't persist across reloads
  }
}

export function getBaseUrl(): string {
  try {
    return localStorage.getItem(BASE_URL_KEY) ?? DEFAULT_BASE_URL;
  } catch {
    return DEFAULT_BASE_URL;
  }
}

/**
 * Switching environments (local dev backend vs. the deployed Cloud Run
 * backend) also logs out -- a token minted by one backend's JWT_SECRET is
 * never valid against the other, so carrying it over would just produce a
 * confusing 401 instead of a clean "please log in again".
 */
export function setBaseUrl(url: string): void {
  try {
    localStorage.setItem(BASE_URL_KEY, url);
  } catch {
    // ignore
  }
  setAuthToken(null);
}

/**
 * Unlike a typical single-backend frontend, this tool's base URL is a
 * runtime choice (see the env switcher in App.tsx), not a build-time
 * VITE_API_URL -- so the client can't be a single module-level constant.
 * Call this fresh wherever a request is made instead of caching the
 * result; openapi-fetch's createClient() is cheap.
 */
export function getApiClient() {
  const client = createClient<paths>({ baseUrl: getBaseUrl() });
  client.use({
    onRequest({ request }) {
      const token = getAuthToken();
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
      return request;
    },
  });
  return client;
}

interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {}

export function extractApiErrorMessage(body: unknown): string {
  const parsed = body as ApiErrorBody | undefined;
  const msg = parsed?.message;
  if (Array.isArray(msg)) return msg.join(" ");
  if (typeof msg === "string") return msg;
  return "Unexpected error.";
}

export function getErrorMessage(
  error: unknown,
  fallback = "Unexpected error.",
): string {
  return error instanceof ApiError ? error.message : fallback;
}
