import React from "react";

export function Button({ children, icon: Icon, variant = "", ...props }) {
  return (
    <button className={"button " + variant} {...props}>
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}
