import { Search, Shirt, Plus } from "lucide-react";
import { BarcodeBillingInput } from "./BarcodeBillingInput.jsx";
import { fmt } from "../../../lib/format.js";
import { Empty } from "../../../components/ui/Empty.jsx";
import React from "react";

export function ProductCatalog({
  scanInput,
  products,
  search,
  setSearch,
  add,
  setError,
  list,
  kind,
}) {
  return (
    <section className="panel pos-catalog">
      <BarcodeBillingInput
        products={products.data || []}
        loading={products.loading}
        inputRef={scanInput}
        onProduct={add}
        onError={setError}
      />
      <div className="toolbar">
        <div className="search">
          <Search size={19} />
          <input
            disabled={products.loading}
            placeholder="Search products by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="catalog-grid">
        {list.map((p) => (
          <button
            key={p.id}
            className="catalog-card"
            onClick={() => add(p)}
            disabled={kind === "sale" && !p.stock}
          >
            <div className={"catalog-art art-" + (p.id % 5)}>
              {p.image ? (
                <img src={p.image} alt={p.name} />
              ) : (
                <Shirt size={42} strokeWidth={1.1} />
              )}
              <span>{p.stock} in stock</span>
            </div>
            <small>{p.category || "Collection"}</small>
            <strong>{p.name}</strong>
            <div>
              <b>{fmt(kind === "sale" ? p.selling_price : p.purchase_price)}</b>
              <span className="add-circle">
                <Plus size={15} />
              </span>
            </div>
          </button>
        ))}
      </div>
      {!list.length && <Empty text="No matching products" />}
    </section>
  );
}
