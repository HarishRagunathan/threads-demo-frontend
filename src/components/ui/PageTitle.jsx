import React from "react";

export function PageTitle({
  eyebrow = "YOUR SHOP, CONNECTED",
  title,
  description,
  children,
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="actions">{children}</div>
    </div>
  );
}
