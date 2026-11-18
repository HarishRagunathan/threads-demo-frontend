import { Menu, ChevronRight } from "lucide-react";
import { nav } from "../../config/navigation.js";
import { date } from "../../lib/format.js";
import React from "react";
import { ThemeControls } from "./ThemeControls.jsx";

export function Topbar({ setMobile, mobile, page, user }) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button
          className="icon-button mobile-only"
          onClick={() => setMobile(!mobile)}
        >
          <Menu size={21} />
        </button>
        <span>Workspace</span>
        <ChevronRight size={14} />
        <strong>
          {nav.flatMap((n) => n[1]).find((n) => n[0] === page)?.[1]}
        </strong>
      </div>
      <div className="top-right">
        <ThemeControls />
        <span className="connection">
          <i /> Client demo
        </span>
        <span className="top-date">{date(new Date())}</span>
        <div className="avatar small">{user.name[0]}</div>
      </div>
    </header>
  );
}
