import React from "react";

export function Badge({ children, tone = "green" }) {
  return <span className={"badge " + tone}>{children}</span>;
}
