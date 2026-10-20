import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { coachesApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

/**
 * Creates a coach with a password set directly by the admin -- the
 * invite-based flow (admin sets only email/name, coach sets her own
 * password via an emailed link) is tracked as
 * gerencserjani/coach-calendar#32. Until that lands, this is how a new
 * coach gets provisioned: give them the password out of band (phone,
 * Signal -- not plaintext email) and have them change it once logged in.
 */
export function CreateCoachForm() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const coach = await coachesApi.create({ name, email, password });
      await queryClient.invalidateQueries({ queryKey: ["coaches"] });
      setSuccess(`Created ${coach.name} (id: ${coach.id})`);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not create coach."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card">
      <h2>Create coach</h2>
      <p className="muted">
        Give the password to the coach out of band, not over email -- they can
        change it after logging in (once gerencserjani/coach-calendar#31 ships).
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
          Initial password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        {success && <div>{success}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create coach"}
        </button>
      </form>
    </div>
  );
}
