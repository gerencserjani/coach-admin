import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { allowedOriginsApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

/**
 * localhost origins are always CORS-allowed by the backend regardless of
 * this list (see coach-calendar's isLocalhostOrigin) -- this only manages
 * everything else (each coach's own deployed frontend, etc.).
 */
export function AllowedOriginsSection() {
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: origins, isLoading } = useQuery({
    queryKey: ["allowed-origins"],
    queryFn: allowedOriginsApi.list,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await allowedOriginsApi.create({
        origin,
        label: label || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["allowed-origins"] });
      setOrigin("");
      setLabel("");
    } catch (err) {
      setError(getErrorMessage(err, "Could not add origin."));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id: string) {
    setError(null);
    setRemovingId(id);
    try {
      await allowedOriginsApi.remove(id);
      await queryClient.invalidateQueries({ queryKey: ["allowed-origins"] });
    } catch (err) {
      setError(getErrorMessage(err, "Could not remove origin."));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="card">
      <h2>Allowed origins (CORS)</h2>
      <p className="muted">
        localhost is always allowed regardless of this list -- only add deployed
        origins here (a coach's own site, etc.).
      </p>
      <form onSubmit={handleSubmit}>
        <label>
          Origin
          <input
            placeholder="https://peti-coaching.vercel.app"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
        </label>
        <label>
          Label (optional)
          <input value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add origin"}
        </button>
      </form>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Origin</th>
              <th>Label</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {origins?.map((o) => (
              <tr key={o.id}>
                <td>{o.origin}</td>
                <td className="muted">{o.label ?? "—"}</td>
                <td>
                  <button
                    type="button"
                    disabled={removingId === o.id}
                    onClick={() => handleRemove(o.id)}
                  >
                    {removingId === o.id ? "Removing..." : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
