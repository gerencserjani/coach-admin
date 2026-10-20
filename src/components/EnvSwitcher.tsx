import { useState } from "react";
import { getBaseUrl, setBaseUrl } from "../api/client";

const LOCAL_DEV_URL = "http://localhost:3000";

interface EnvSwitcherProps {
  onChange: () => void;
}

/**
 * Switching here always logs out (see setBaseUrl) -- a token from one
 * backend is never valid against the other.
 */
export function EnvSwitcher({ onChange }: EnvSwitcherProps) {
  const [value, setValue] = useState(getBaseUrl());

  function apply(url: string) {
    const trimmed = url.trim().replace(/\/+$/, "");
    if (!trimmed) return;
    setValue(trimmed);
    setBaseUrl(trimmed);
    onChange();
  }

  return (
    <div className="topbar">
      <div>
        <strong>Backend:</strong> <span className="muted">{getBaseUrl()}</span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="button" onClick={() => apply(LOCAL_DEV_URL)}>
          Local dev
        </button>
        <input
          placeholder="https://your-prod-backend-url"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") apply(value);
          }}
          style={{ minWidth: "280px" }}
        />
        <button type="button" onClick={() => apply(value)}>
          Use URL
        </button>
      </div>
    </div>
  );
}
