import { useState } from "react";
import { coachesApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

/**
 * Invites a brand-new coach -- this does NOT create a Coach row. It only
 * sends a signed accept-link to the given email; the Coach only comes into
 * existence once they open it and set their own password (see
 * gerencserjani/coach-calendar#32). Submitting again for the same
 * not-yet-accepted email just sends a fresh link.
 */
export function InviteCoachForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [frontendUrl, setFrontendUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
          <input
            type="url"
            value={frontendUrl}
            onChange={(e) => setFrontendUrl(e.target.value)}
            placeholder="https://peti-coaching.vercel.app"
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        {success && <div>{success}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Sending invite..." : "Send invite"}
        </button>
      </form>
    </div>
  );
}
