// Hand-written response types -- the backend's OpenAPI spec only documents
// request bodies/params accurately (response schemas are generic since
// they aren't backed by dedicated DTO classes). Mirrors coach-calendar's
// actual Coach model (see that repo's src/api/models.ts in betti-coaching
// for the same pattern).

export type CoachRole = "ADMIN" | "COACH";
export type Locale = "hu" | "en";

export interface Coach {
  id: string;
  email: string;
  name: string;
  preferredLocale: Locale;
  role: CoachRole;
  createdAt: string;
  updatedAt: string;
  sessionsRevokedAt: string | null;
}

export interface LoginResponse {
  accessToken: string;
  coach: Coach;
}
