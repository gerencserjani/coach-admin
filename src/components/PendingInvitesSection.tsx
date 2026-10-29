import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { coachesApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

/**
 * Every sent invite that hasn't been accepted yet (see coach-calendar's
 * CoachInviteLog/findPendingInvites()) -- lets the admin see a lost or
 * unopened invite without asking the coach directly. "Resend" is just
 * calling invite() again with the same values; it doesn't create or
 * change any Coach row, same as the original invite.
 */
export function PendingInvitesSection() {
  const queryClient = useQueryClient();
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: pendingInvites, isLoading } = useQuery({
    queryKey: ["pending-invites"],
    queryFn: coachesApi.pendingInvites,
  });

  async function handleResend(invite: {
    email: string;
    name: string;
    frontendUrl: string;
  }) {
    setError(null);
    setResendingEmail(invite.email);
    try {
      await coachesApi.invite(invite);
      await queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
    } catch (err) {
      setError(getErrorMessage(err, "Could not resend invite."));
    } finally {
      setResendingEmail(null);
    }
  }

  if (isLoading) return null;
  if (!pendingInvites || pendingInvites.length === 0) return null;

  return (
    <div className="card">
      <h2>Pending invites</h2>
      <p className="muted">
        Sent but not yet accepted -- the coach hasn't opened the link and set
        her password yet.
      </p>
      {error && <div className="error">{error}</div>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Site</th>
            <th>Sent</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pendingInvites.map((invite) => (
            <tr key={invite.email}>
              <td>{invite.name}</td>
              <td>{invite.email}</td>
              <td>{invite.frontendUrl}</td>
              <td>{new Date(invite.sentAt).toLocaleString()}</td>
              <td>
                <button
                  type="button"
                  disabled={resendingEmail === invite.email}
                  onClick={() => handleResend(invite)}
                >
                  {resendingEmail === invite.email ? "Resending..." : "Resend"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
