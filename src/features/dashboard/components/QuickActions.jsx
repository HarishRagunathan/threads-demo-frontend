import { ShoppingBag, Shirt, ArrowUpRight } from "lucide-react";
import { can } from "../../../lib/permissions.js";
import React from "react";

export function QuickActions({ user, go }) {
  return (
    <section className="quick-panel">
      <span className="eyebrow">MAKE ROOM FOR WHAT’S NEXT</span>
      <h2>
        Good days start
        <br />
        with a ready shop.
      </h2>
      <p>Keep your shelves stocked and your checkout moving.</p>
      <div className="quick-illustration">
        <ShoppingBag size={66} strokeWidth={1} />
        <Shirt size={45} strokeWidth={1} />
      </div>
      {can(user, "sales") && (
        <button onClick={() => go("pos")}>
          Open point of sale <ArrowUpRight size={18} />
        </button>
      )}
      {can(user, "purchases") && (
        <button onClick={() => go("purchases")}>
          Record a purchase <ArrowUpRight size={18} />
        </button>
      )}
    </section>
  );
}
