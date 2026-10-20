import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { allowedOriginsApi, coachesApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

/**
 * Invites a brand-new coach -- this does NOT create a Coach row. It only
 * sends a signed accept-link to the given email; the Coach only comes into
 * existence once they open it and set their own password (see
 * gerencserjani/coach-calendar#32). Submitting again for the same
 * not-yet-accepted email just sends a fresh link.
 *
 * The site field is a dropdown over the already-allow-listed AllowedOrigin
 * rows (see AllowedOriginsSection), not a freehand URL -- an invite can
 * only ever point at a real, known site. Sites that already belong to a
 * coach (coach.frontendUrl) are filtered out here as a UX convenience; the
 * backend enforces the same one-coach-per-site rule for real (see
 * CoachesService.invite's 409).
 */
export function InviteCoachForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [frontendUrl, setFrontendUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: origins } = useQuery({
    queryKey: ["allowed-origins"],
    queryFn: allowedOriginsApi.list,
  });
  const { data: coaches } = useQuery({
    queryKey: ["coaches"],
    queryFn: coachesApi.list,
  });

  const takenSites = new Set(
    coaches?.map((c) => c.frontendUrl).filter((url) => url !== null),
  );
  const availableOrigins = origins?.filter((o) => !takenSites.has(o.origin));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      await coachesApi.invite({ name, email, frontendUrl });
      setSuccess(`Invite sent to ${email}.`);
      setName("");
      setEmail("");
      setFrontendUrl("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not send invite."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2>Invite coach</h2>
      <p className="muted">
        Sends a signed link to this email -- the coach sets her own password
        there, which is what actually creates the account.
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Site URL
          <select
            value={frontendUrl}
            onChange={(e) => setFrontendUrl(e.target.value)}
            required
          >
            <option value="" disabled>
              Select an allowed origin...
            </option>
            {availableOrigins?.map((o) => (
              <option key={o.id} value={o.origin}>
                {o.label ? `${o.label} (${o.origin})` : o.origin}
              </option>
            ))}
          </select>
        </label>
        {origins && availableOrigins?.length === 0 && (
          <p className="muted">
            Every allowed origin already has a coach. Add a new one below first.
          </p>
        )}
        {error && <div className="error">{error}</div>}
        {success && <div>{success}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending invite..." : "Send invite"}
        </button>
      </form>
    </div>
  );
}
