import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState } from "react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Clock } from "lucide-react";
import { date, fmt } from "../../lib/format.js";
import { api } from "../../lib/api.js";
import { Field } from "../../components/ui/Field.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { Badge } from "../../components/ui/Badge.jsx";

export function Shifts() {
  const { notify } = useApp(),
    { data, loading, error, load } = useData("/shifts");
  const [amount, setAmount] = useState(""),
    [formError, setFormError] = useState("");
  const open = data?.find((s) => !s.closed_at);
  return (
    <>
      <PageTitle
        title="Your working day."
        description="Record your opening float and counted closing cash."
      />
      <ErrorBox error={error || formError} />
      <section className="panel padded shift-panel">
        <Clock size={27} />
        <h2>{open ? "Your shift is open" : "Ready to start your shift?"}</h2>
        <p className="muted">
          {open
            ? "Opened " +
              date(open.opened_at) +
              " · Cash float " +
              fmt(open.opening_cash)
            : "Record the cash in the till before you start billing."}
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              !confirm(
                open
                  ? "Close your shift with this counted cash amount?"
                  : "Open a new shift?",
              )
            )
              return;
            try {
              await api("/shifts", {
                method: "POST",
                body: { action: open ? "close" : "open", amount },
              });
              setAmount("");
              setFormError("");
              load();
              notify(open ? "Shift closed" : "Shift opened");
            } catch (e) {
              setFormError(e.message);
            }
          }}
        >
          <Field
            label={open ? "Counted closing cash" : "Opening cash float"}
            type="number"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button>{open ? "Close shift" : "Open shift"}</Button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Shift history</h2>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <Table
            rows={data || []}
            columns={[
              {
                key: "opened_at",
                label: "Opened",
                render: (r) => new Date(r.opened_at).toLocaleString("en-IN"),
              },
              {
                key: "opening_cash",
                label: "Opening cash",
                render: (r) => fmt(r.opening_cash),
              },
              {
                key: "closing_cash",
                label: "Closing cash",
                render: (r) =>
                  r.closing_cash === null ? "—" : fmt(r.closing_cash),
              },
              {
                key: "closed_at",
                label: "Status",
                render: (r) => (
                  <Badge tone={r.closed_at ? "neutral" : "green"}>
                    {r.closed_at ? "Closed" : "Open"}
                  </Badge>
                ),
              },
            ]}
          />
        )}
      </section>
    </>
  );
}
