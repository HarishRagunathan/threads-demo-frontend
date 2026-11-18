import React, { useState, useEffect } from "react";
import { Empty } from "./Empty.jsx";
import { Button } from "./Button.jsx";

export function Table({ columns, rows, onRow }) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [rows.length]);
  if (!rows.length) return <Empty />;
  const pages = Math.ceil(rows.length / 12);
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice((page - 1) * 12, page * 12).map((row, i) => (
              <tr
                key={row.id ?? i}
                className={onRow ? "clickable" : ""}
                onClick={() => onRow?.(row)}
              >
                {columns.map((c) => (
                  <td key={c.key}>
                    {c.render ? c.render(row) : (row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span>
          {rows.length} records · Page {page} of {pages}
        </span>
        <div>
          <Button
            variant="ghost"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="ghost"
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}
