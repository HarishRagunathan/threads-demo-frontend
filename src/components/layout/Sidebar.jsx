import { Badge } from "../ui/Badge.jsx";
import { nav } from "../../config/navigation.js";
import { can } from "../../lib/permissions.js";
import { api } from "../../lib/api.js";
import { LogOut } from "lucide-react";
import React from "react";

export function Sidebar({ mobile, user, go, page, setUser }) {
  return (
    <aside className={mobile ? "sidebar open" : "sidebar"}>
      <div className="brand">
        <span className="brand-icon">
          t<span>l</span>
        </span>
        <div>
          thread & ledger<small>RETAIL WORKSPACE</small>
        </div>
      </div>
      <div className="shop-switch">
        <span className="shop-avatar">TL</span>
        <div>
          Thread & Ledger<small>Single shop · Chennai</small>
        </div>
        <Badge tone="neutral">DEMO</Badge>
      </div>
      <nav>
        {nav.map(([section, items]) => (
          <div className="nav-group" key={section}>
            <p>{section}</p>
            {items
              .filter(
                ([, , _, permission]) =>
                  !permission ||
                  (permission === "admin"
                    ? user.role === "admin"
                    : can(user, permission)),
              )
              .map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => go(key)}
                  className={page === key ? "nav-item active" : "nav-item"}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                  {key === "pos" && <span className="shortcut">POS</span>}
                </button>
              ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="avatar">{user.name[0]}</div>
        <div>
          <strong>{user.name}</strong>
          <small>
            {user.role === "admin" ? "Administrator" : "Billing staff"}
          </small>
        </div>
        <button
          title="Sign out"
          className="icon-button"
          onClick={async () => {
            await api("/auth/logout", { method: "POST" });
            setUser(null);
          }}
        >
          <LogOut size={17} />
        </button>
      </div>
    </aside>
  );
}
