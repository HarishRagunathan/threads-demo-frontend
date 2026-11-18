import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState } from "react";
import { today, fmt } from "../../lib/format.js";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Download, Plus, Search } from "lucide-react";
import { exportExcel } from "../../lib/export.js";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { api } from "../../lib/api.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Field } from "../../components/ui/Field.jsx";
import { PartyHistory } from "../parties/PartyHistory.jsx";

export function Records({ type, config }) {
  const { notify } = useApp(),
    { data, loading, error, load } = useData("/" + type);
  const [search, setSearch] = useState(""),
    [edit, setEdit] = useState(null),
    [history, setHistory] = useState(null),
    [formError, setFormError] = useState(""),
    [busy, setBusy] = useState(false);
  const rows = (data || []).filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase()),
  );
  const open = (r) => {
    setFormError("");
    setEdit(
      r ||
        Object.fromEntries(
          config.fields.map(([k, , , options]) => [
            k,
            options?.[0] || (k === "date" ? today() : ""),
          ]),
        ),
    );
  };
  return (
    <>
      <PageTitle title={config.title} description={config.description}>
        <Button
          variant="secondary"
          icon={Download}
          onClick={() => exportExcel(rows, type)}
        >
          Export
        </Button>
        <Button icon={Plus} onClick={() => open()}>
          Add {config.singular}
        </Button>
      </PageTitle>
      <ErrorBox error={error} />
      <section className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder={"Search " + config.title.toLowerCase()}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge tone="neutral">{rows.length} records</Badge>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <Table
            rows={rows}
            columns={[
              ...config.fields
                .filter(([k]) => !["address", "notes", "gstin"].includes(k))
                .slice(0, 4)
                .map(([key, label]) => ({
                  key,
                  label,
                  render: key === "amount" ? (r) => fmt(r.amount) : undefined,
                })),
              ...(type === "expenses"
                ? []
                : [
                    {
                      key: "active",
                      label: "Status",
                      render: (r) => (
                        <Badge tone={r.active ? "green" : "neutral"}>
                          {r.active ? "Active" : "Inactive"}
                        </Badge>
                      ),
                    },
                  ]),
              {
                key: "actions",
                label: "Actions",
                render: (r) => (
                  <div className="row-actions">
                    <button className="text-button" onClick={() => open(r)}>
                      Edit
                    </button>
                    {["customers", "suppliers"].includes(type) && (
                      <button
                        className="text-button"
                        onClick={() => setHistory(r)}
                      >
                        History
                      </button>
                    )}
                    <button
                      className="text-button muted"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            type === "expenses"
                              ? "Delete this expense? This will be recorded in the activity log."
                              : "Deactivate this record?",
                          )
                        )
                          return;
                        try {
                          await api("/" + type + "/" + r.id, {
                            method: "DELETE",
                          });
                          notify("Record updated");
                          load();
                        } catch (e) {
                          notify(e.message);
                        }
                      }}
                    >
                      {type === "expenses" ? "Delete" : "Deactivate"}
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>
      {edit && (
        <Modal
          title={(edit.id ? "Edit " : "New ") + config.singular}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await api("/" + type + (edit.id ? "/" + edit.id : ""), {
                  method: edit.id ? "PUT" : "POST",
                  body: edit,
                });
                setEdit(null);
                load();
                notify("Saved successfully");
              } catch (e) {
                setFormError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="form-grid">
              {config.fields.map(([key, label, type, options]) => (
                <Field
                  key={key}
                  label={label}
                  type={type || "text"}
                  options={options}
                  value={edit[key] ?? ""}
                  onChange={(e) => setEdit({ ...edit, [key]: e.target.value })}
                  required={[
                    "name",
                    "description",
                    "amount",
                    "date",
                    "category",
                  ].includes(key)}
                  min={type === "number" ? 0.01 : undefined}
                  step={type === "number" ? "0.01" : undefined}
                />
              ))}
              {type !== "expenses" && (
                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={edit.active !== false}
                    onChange={(e) =>
                      setEdit({ ...edit, active: e.target.checked })
                    }
                  />{" "}
                  Active
                </label>
              )}
            </div>
            <ErrorBox error={formError} />
            <div className="modal-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEdit(null)}
              >
                Cancel
              </Button>
              <Button disabled={busy}>Save {config.singular}</Button>
            </div>
          </form>
        </Modal>
      )}
      {history && (
        <PartyHistory
          party={history}
          kind={type === "customers" ? "sale" : "purchase"}
          onClose={() => setHistory(null)}
        />
      )}
    </>
  );
}
