import React from "react";

export function Field({ label, ...p }) {
  return (
    <label className="field">
      <span>{label}</span>
      {p.options ? (
        <select {...p}>
          {p.options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : p.type === "textarea" ? (
        <textarea {...p} />
      ) : (
        <input {...p} />
      )}
    </label>
  );
}
