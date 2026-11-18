import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState } from "react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Plus } from "lucide-react";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { Field } from "../../components/ui/Field.jsx";
import { permissionList } from "../../config/permissions.js";

export function Staff() {
  const { notify } = useApp(),
    { data, loading, error, load } = useData("/users");
  const [edit, setEdit] = useState(null),
    [formError, setFormError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <PageTitle
        title="A team you can count on."
        description="Give every staff member the right level of access."
      >
        <Button
          icon={Plus}
          onClick={() => {
            setFormError("");
            setEdit({
              name: "",
              username: "",
              password: "",
              mobile: "",
              active: true,
              permissions: ["sales", "customers", "reprint"],
            });
          }}
        >
          Add staff
        </Button>
      </PageTitle>
      <ErrorBox error={error} />
      <section className="panel">
        {loading ? (
          <Loading />
        ) : (
          <Table
            rows={data || []}
            columns={[
              { key: "name", label: "Name" },
              { key: "username", label: "Username" },
              {
                key: "role",
                label: "Role",
                render: (r) => <Badge>{r.role}</Badge>,
              },
              {
                key: "active",
                label: "Account",
                render: (r) => (r.active ? "Active" : "Inactive"),
              },
              {
                key: "permissions",
                label: "Permissions",
                render: (r) =>
                  r.role === "admin" ? "Full access" : r.permissions.join(", "),
              },
              {
                key: "edit",
                label: "",
                render: (r) =>
                  r.role === "staff" && (
                    <button
                      className="text-button"
                      onClick={() => {
                        setFormError("");
                        setEdit({ ...r, password: "" });
                      }}
                    >
                      Edit access
                    </button>
                  ),
              },
            ]}
          />
        )}
      </section>
      {edit && (
        <Modal
          title={edit.id ? "Edit staff account" : "New billing staff"}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const body = { ...edit };
                if (!body.password) delete body.password;
                await api("/users" + (edit.id ? "/" + edit.id : ""), {
                  method: edit.id ? "PUT" : "POST",
                  body,
                });
                setEdit(null);
                load();
                notify("Staff account saved");
              } catch (e) {
                setFormError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="form-grid">
              {[
                ["name", "Full name"],
                ["username", "Username"],
                ["mobile", "Mobile"],
                [
                  "password",
                  edit.id ? "Reset password · optional" : "Password",
                ],
              ].map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  type={key === "password" ? "password" : "text"}
                  minLength={key === "password" ? 10 : undefined}
                  required={
                    key === "name" ||
                    key === "username" ||
                    (key === "password" && !edit.id)
                  }
                  value={edit[key]}
                  onChange={(e) => setEdit({ ...edit, [key]: e.target.value })}
                />
              ))}
            </div>
            <h3>Permissions</h3>
            <div className="permission-grid">
              {permissionList.map((p) => (
                <label className="check-field" key={p}>
                  <input
                    type="checkbox"
                    checked={edit.permissions.includes(p)}
                    onChange={(e) =>
                      setEdit({
                        ...edit,
                        permissions: e.target.checked
                          ? [...edit.permissions, p]
                          : edit.permissions.filter((v) => v !== p),
                      })
                    }
                  />
                  {p.replace("_", " ")}
                </label>
              ))}
            </div>
            <label className="check-field">
              <input
                type="checkbox"
                checked={edit.active}
                onChange={(e) => setEdit({ ...edit, active: e.target.checked })}
              />{" "}
              Account active
            </label>
            <ErrorBox error={formError} />
            <div className="modal-actions">
              <Button disabled={busy}>Save staff account</Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
