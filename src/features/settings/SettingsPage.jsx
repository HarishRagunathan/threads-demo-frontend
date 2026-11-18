import { useApp } from "../../context/AppContext.jsx";
import React, { useState } from "react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { api } from "../../lib/api.js";
import { Field } from "../../components/ui/Field.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ShieldCheck, Download, LockKeyhole } from "lucide-react";
import { Badge } from "../../components/ui/Badge.jsx";
import { download } from "../../lib/export.js";

export function SettingsPage() {
  const { settings, setSettings, notify, setUser } = useApp();
  const [form, setForm] = useState(settings),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [password, setPassword] = useState({ current: "", password: "" });
  return (
    <>
      <PageTitle
        title="Make it your shop."
        description="Shop details, invoice preferences, and demo business settings."
      />
      <ErrorBox error={error} />
      <div className="settings-grid">
        <section className="panel padded">
          <h2>Shop & invoice settings</h2>
          <p className="muted">These details appear on your demo invoices.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const result = await api("/settings", {
                  method: "PUT",
                  body: form,
                });
                setSettings(result);
                notify("Settings saved");
                setError("");
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="form-grid">
              {[
                ["shop_name", "Shop name"],
                ["address", "Address"],
                ["mobile", "Mobile"],
                ["gstin", "Demo GSTIN"],
                ["invoice_prefix", "Invoice prefix"],
                ["footer", "Invoice footer"],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  value={form[key] || ""}
                  required={key === "shop_name"}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ))}
              <Field
                label="Print layout"
                options={["A4", "80mm"]}
                value={form.paper}
                onChange={(e) => setForm({ ...form, paper: e.target.value })}
              />
              <Field
                label="Demo tax split"
                options={[
                  { value: "intra", label: "CGST + SGST (within state)" },
                  { value: "inter", label: "IGST (between states)" },
                ]}
                value={form.tax_mode}
                onChange={(e) => setForm({ ...form, tax_mode: e.target.value })}
              />
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={form.gst_enabled}
                  onChange={(e) =>
                    setForm({ ...form, gst_enabled: e.target.checked })
                  }
                />{" "}
                Enable illustrative GST
              </label>
              <label className="check-field">
                <input
                  type="checkbox"
                  checked={form.credit_sales}
                  onChange={(e) =>
                    setForm({ ...form, credit_sales: e.target.checked })
                  }
                />{" "}
                Allow credit / partial sales
              </label>
            </div>
            <div className="modal-actions">
              <Button disabled={busy}>Save settings</Button>
            </div>
          </form>
        </section>
        <div>
          <section className="panel padded">
            <ShieldCheck size={25} />
            <h2>Demo payments & GST</h2>
            <p className="muted">
              Cash, UPI, Card, and Demo gateway are manual records. No provider
              credentials are collected and no money moves. GST rates are
              configurable sample values.
            </p>
            <Badge tone="amber">Client demo only</Badge>
          </section>
          <section className="panel padded">
            <Download size={23} />
            <h2>Data backup</h2>
            <p className="muted">
              Export a consistent JSON snapshot, including transaction and audit
              history. It includes account password hashes; keep it private.
              Restore instructions are in the project guide.
            </p>
            <Button
              variant="secondary"
              icon={Download}
              onClick={async () => {
                try {
                  download(
                    await api("/backup"),
                    "thread-ledger-demo-backup.json",
                  );
                  notify("Backup downloaded");
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Download backup
            </Button>
          </section>
          <section className="panel padded">
            <LockKeyhole size={23} />
            <h2>Change your password</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await api("/auth/password", {
                    method: "POST",
                    body: password,
                  });
                  setUser(null);
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              <Field
                label="Current password"
                type="password"
                required
                value={password.current}
                onChange={(e) =>
                  setPassword({ ...password, current: e.target.value })
                }
              />
              <Field
                label="New password · at least 10 characters"
                type="password"
                minLength={10}
                required
                value={password.password}
                onChange={(e) =>
                  setPassword({ ...password, password: e.target.value })
                }
              />
              <Button variant="secondary">Change & sign out</Button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
