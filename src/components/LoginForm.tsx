import { useState } from "react";
import { authApi } from "../api/endpoints";
import { getErrorMessage, setAuthToken } from "../api/client";
import type { Coach } from "../api/models";
import { EnvSwitcher } from "./EnvSwitcher";

interface LoginFormProps {
  onLoggedIn: (coach: Coach) => void;
}

export function LoginForm({ onLoggedIn }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { accessToken, coach } = await authApi.login({ email, password });
      if (coach.role !== "ADMIN") {
        setError(
          "This account isn't an ADMIN -- this tool is for platform admins only.",
        );
        return;
      }
      setAuthToken(accessToken);
      onLoggedIn(coach);
    } catch (err) {
      setError(getErrorMessage(err, "Login failed."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1>Coach Admin</h1>
      <div className="card">
        <EnvSwitcher onChange={() => setError(null)} />
      </div>
      <form onSubmit={handleSubmit} className="card">
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
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
