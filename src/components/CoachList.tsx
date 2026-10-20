import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { coachesApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

export function CoachList() {
  const queryClient = useQueryClient();
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["coaches"],
    queryFn: coachesApi.list,
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
