import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { allowedOriginsApi, coachesApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { Coach } from "../api/models";

export function CoachList() {
  const queryClient = useQueryClient();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: coachesApi.list,
  });
  const { data: origins } = useQuery({
    queryKey: ["allowed-origins"],
    queryFn: allowedOriginsApi.list,
  });

  async function handleRevoke(id: string) {
    setError(null);
    setRevokingId(id);
    try {
      await coachesApi.revokeSessions(id);
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
    } catch (err) {
      setError(getErrorMessage(err, "Could not revoke sessions."));
    } finally {
      setRevokingId(null);
    }
  }

  if (isLoading) return <p>Loading coaches...</p>;

  return (
    <div className="card">
      <h2>Coaches</h2>
      {error && <div className="error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Id</th>
            <th>Site</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {coaches?.map((coach) => (
            <tr key={coach.id}>
              <td>{coach.name}</td>
              <td>{coach.email}</td>
              <td>{coach.role}</td>
              <td className="muted">{coach.id}</td>
              <td>
                <SiteCell
                  coach={coach}
                  coaches={coaches}
                  origins={origins}
                  onError={setError}
                />
              </td>
              <td>
                <button
                  type="button"
                  disabled={revokingId === coach.id}
                  onClick={() => handleRevoke(coach.id)}
                >
                  {revokingId === coach.id ? "Revoking..." : "Revoke sessions"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * A coach's `frontendUrl` is normally set once, automatically, when an
 * invite is accepted (see coach-calendar's CoachesService.acceptInvite) --
 * this dropdown exists only to fix up the one coach that predates that flow
 * (the seeded ADMIN account) and so never got one. Deliberately offers the
 * same already-allow-listed AllowedOrigin rows InviteCoachForm's dropdown
 * does, filtered the same way (excluding sites a *different* coach already
 * owns), so a site can never be assigned here that invite() wouldn't also
 * have accepted.
 */
function SiteCell({
  coach,
  coaches,
  origins,
  onError,
}: {
  coach: Coach;
  coaches: Coach[];
  origins: { id: string; origin: string; label: string | null }[] | undefined;
  onError: (message: string | null) => void;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(coach.frontendUrl ?? "");
  const [submitting, setSubmitting] = useState(false);

  const takenByOther = new Set(
    coaches
      .filter((c) => c.id !== coach.id && c.frontendUrl)
      .map((c) => c.frontendUrl),
  );
  const selectableOrigins = origins?.filter(
    (o) => o.origin === coach.frontendUrl || !takenByOther.has(o.origin),
  );

  if (!editing) {
    return (
      <span>
        {coach.frontendUrl ?? <span className="muted">— none —</span>}{" "}
        <button type="button" onClick={() => setEditing(true)}>
          {coach.frontendUrl ? "Change" : "Set"}
        </button>
      </span>
    );
  }

  async function handleSave() {
    onError(null);
    setSubmitting(true);
    try {
      await coachesApi.setFrontendUrl(coach.id, value);
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      setEditing(false);
    } catch (err) {
      onError(getErrorMessage(err, "Could not set site."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <span>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="" disabled>
          Select an allowed origin...
        </option>
        {selectableOrigins?.map((o) => (
          <option key={o.id} value={o.origin}>
            {o.label ? `${o.label} (${o.origin})` : o.origin}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={submitting || !value}
        onClick={handleSave}
      >
        {submitting ? "Saving..." : "Save"}
      </button>
      <button type="button" onClick={() => setEditing(false)}>
        Cancel
      </button>
    </span>
  );
}
