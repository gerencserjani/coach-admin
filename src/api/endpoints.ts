import { ApiError, extractApiErrorMessage, getApiClient } from "./client";
import type {
  AllowedOrigin,
  Coach,
  CoachListItem,
  LoginResponse,
} from "./models";
import type { components } from "./types.generated";

async function unwrap<T>(
  promise: Promise<{ data?: unknown; error?: unknown }>,
): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new ApiError(extractApiErrorMessage(error));
  return data as T;
}

export const authApi = {
  login: (body: components["schemas"]["LoginDto"]) =>
    unwrap<LoginResponse>(getApiClient().POST("/auth/login", { body })),

  me: () => unwrap<Coach>(getApiClient().GET("/coaches/me")),
};

export const coachesApi = {
  list: () => unwrap<CoachListItem[]>(getApiClient().GET("/coaches")),

  invite: (body: components["schemas"]["InviteCoachDto"]) =>
    unwrap<void>(getApiClient().POST("/coaches", { body })),

  revokeSessions: (id: string) =>
    unwrap<Coach>(
      getApiClient().PATCH("/coaches/{id}/revoke-sessions", {
        params: { path: { id } },
      }),
    ),

  setFrontendUrl: (id: string, frontendUrl: string) =>
    unwrap<Coach>(
      getApiClient().PATCH("/coaches/{id}/frontend-url", {
        params: { path: { id } },
        body: { frontendUrl },
      }),
    ),
};

export const allowedOriginsApi = {
  list: () => unwrap<AllowedOrigin[]>(getApiClient().GET("/allowed-origins")),

  create: (body: components["schemas"]["CreateAllowedOriginDto"]) =>
    unwrap<AllowedOrigin>(getApiClient().POST("/allowed-origins", { body })),

  remove: (id: string) =>
    unwrap<void>(
      getApiClient().DELETE("/allowed-origins/{id}", {
        params: { path: { id } },
      }),
    ),
};
