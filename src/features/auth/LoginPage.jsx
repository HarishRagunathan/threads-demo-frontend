import React, { useState } from "react";
import { Badge } from "../../components/ui/Badge.jsx";
import { api } from "../../lib/api.js";
import { Field } from "../../components/ui/Field.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ArrowUpRight, LockKeyhole } from "lucide-react";

export function Login({ onLogin }) {
  const [username, setUsername] = useState("admin"),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="login">
      <div className="login-art">
        <div className="brand light">
          <span className="brand-icon">
            t<span>l</span>
          </span>
          <div>
            thread & ledger<small>RETAIL WORKSPACE</small>
          </div>
        </div>
        <div className="login-copy">
          <span className="eyebrow">LESS ADMIN. MORE POSSIBILITIES.</span>
          <h1>
            A little order.
            <br />A lot of potential.
          </h1>
          <p>
            From the first delivery to the last bill of the day.
            <br />
            Your entire shop, beautifully connected.
          </p>
          <div className="fabric-art">
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
        <small>Designed for the rhythm of everyday retail.</small>
      </div>
      <div className="login-panel">
        <Badge tone="amber">CLIENT DEMONSTRATION</Badge>
        <h1>Welcome to your shop.</h1>
        <p>Sign in to open your retail workspace.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            try {
              onLogin(
                await api("/auth/login", {
                  method: "POST",
                  body: { username, password },
                }),
              );
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Field
            label="Username"
            value={username}
            autoComplete="username"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <ErrorBox error={error} />
          <Button disabled={busy} icon={ArrowUpRight}>
            {busy ? "Signing in…" : "Open workspace"}
          </Button>
        </form>
        <div className="login-note">
          <LockKeyhole size={17} />
          <p>
            Use the demo credentials supplied with this project.
            <br />
            Gateway payments and GST are demonstration only.
          </p>
        </div>
      </div>
    </div>
  );
}
