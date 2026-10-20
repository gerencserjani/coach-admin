import { useState } from "react";
import { getAuthToken, setAuthToken } from "./api/client";
import type { Coach } from "./api/models";
import { EnvSwitcher } from "./components/EnvSwitcher";
import { LoginForm } from "./components/LoginForm";
import { CoachList } from "./components/CoachList";
import { CreateCoachForm } from "./components/CreateCoachForm";

export default function App() {
  const [coach, setCoach] = useState<Coach | null>(null);

  // A stored token from a previous session isn't re-validated here --
  // if it's stale/expired, the first API call will 401 and the relevant
  // view will show that error. Keeping this simple rather than adding a
  // startup /coaches/me check for a single-user internal tool.
  if (!coach && getAuthToken()) {
    // Token exists but we don't know which coach it belongs to after a
    // reload -- just drop it and ask to log in again instead of guessing.
    setAuthToken(null);
  }

  if (!coach) {
    return <LoginForm onLoggedIn={setCoach} />;
  }

  return (
    <div>
      <div className="topbar">
        <h1>Coach Admin</h1>
        <div>
          <span className="muted">
            {coach.name} ({coach.role})
          </span>{" "}
          <button
            type="button"
            onClick={() => {
              setAuthToken(null);
              setCoach(null);
            }}
          >
            Log out
          </button>
        </div>
      </div>
      <div className="card">
        <EnvSwitcher
          onChange={() => {
            setAuthToken(null);
            setCoach(null);
          }}
        />
      </div>
      <CreateCoachForm />
      <CoachList />
    </div>
  );
}
