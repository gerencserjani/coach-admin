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
  // The coach's own site, set once at invite-acceptance time -- see
  // coach-calendar's CoachesService.invite/acceptInvite. Null for a coach
  // that predates this field, or for the ADMIN account.
  frontendUrl: string | null;
}

export interface LoginResponse {
  accessToken: string;
  coach: Coach;
}

export interface AllowedOrigin {
  id: string;
  origin: string;
  label: string | null;
  createdAt: string;
}
