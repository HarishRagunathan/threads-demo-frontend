import { ProductFormDialog } from "./ProductFormDialog.jsx";
import { useApp } from "../../context/AppContext.jsx";
import { useData } from "../../hooks/useData.js";
import React, { useState, useRef } from "react";
import { PageTitle } from "../../components/ui/PageTitle.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Download, Upload, Plus, Search, Shirt, Barcode } from "lucide-react";
import { exportExcel } from "../../lib/export.js";
import { can } from "../../lib/permissions.js";
import { api } from "../../lib/api.js";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { Loading } from "../../components/ui/Loading.jsx";
import { Table } from "../../components/ui/Table.jsx";
import { fmt } from "../../lib/format.js";
import { Badge } from "../../components/ui/Badge.jsx";
import { BarcodeLabelDialog } from "../barcodes/BarcodeLabelDialog.jsx";
import { generateBarcodeValue } from "../barcodes/barcodeUtils.js";

export function Products() {
  const { user, notify } = useApp(),
    { data, loading, error, load } = useData("/products"),
    categories = useData("/categories"),
    brands = useData("/brands");
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [edit, setEdit] = useState(null),
    [barcode, setBarcode] = useState(null),
    [formError, setFormError] = useState(""),
    [busy, setBusy] = useState(false);
  const file = useRef();
  const rows = (data || []).filter(
    (p) =>
      (!category || p.category_id === Number(category)) &&
      (p.name + " " + p.code + " " + p.barcode)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const fields = [
    ["name", "Product name", "text"],
    ["code", "Product code · auto if empty", "text"],
    ["barcode", "Barcode · auto if empty", "text"],
    ["category_id", "Category", "category"],
    ["brand_id", "Brand", "brand"],
    ["purchase_price", "Purchase price", "number"],
    ["selling_price", "Retail selling price / piece", "number"],
    ["gst_rate", "Demo GST %", "number"],
    ["hsn", "HSN code · demo", "text"],
    ["opening_stock", "Opening stock", "number"],
    ["min_stock", "Minimum stock", "number"],
    ["image", "Product image URL", "url"],
    ["description", "Description", "textarea"],
  ];
  return (
    <>
      <PageTitle
        title="Your collection."
        description="Retail products, per-piece prices, and a unique scannable barcode for every product."
      >
        <Button
          variant="secondary"
          icon={Download}
          onClick={() =>
            exportExcel(
              rows.map(({ category, brand, stock, id, created_at, ...p }) => ({
                ...p,
                opening_stock: stock,
              })),
              "products",
            )
          }
        >
          Export Excel
        </Button>
        {can(user, "products") && (
          <>
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => file.current.click()}
            >
              Import
            </Button>
            <Button
              icon={Plus}
              onClick={() => {
                setFormError("");
                setEdit({
                  name: "",
                  code: "",
                  barcode: generateBarcodeValue(),
                  category_id: null,
                  brand_id: null,
                  purchase_price: 0,
                  selling_price: 0,
                  gst_rate: 5,
                  hsn: "",
                  opening_stock: 0,
                  min_stock: 5,
                  image: "",
                  description: "",
                  active: true,
                });
              }}
            >
              Add product
            </Button>
            <input
              ref={file}
              type="file"
              hidden
              accept=".xlsx,.xls,.csv"
              onChange={async (e) => {
                try {
                  const f = e.target.files[0];
                  if (!f) return;
                  const XLSX = await import("xlsx");
                  const wb = XLSX.read(await f.arrayBuffer());
                  const rows = XLSX.utils.sheet_to_json(
                    wb.Sheets[wb.SheetNames[0]],
                  );
                  if (
                    !confirm(
                      `Import ${rows.length} new products? All rows will be validated before saving.`,
                    )
                  )
                    return;
                  const result = await api("/products/import", {
                    method: "POST",
                    body: rows,
                  });
                  notify(result.imported + " products imported");
                  load();
                } catch (e) {
                  notify(e.message);
                } finally {
                  e.target.value = "";
                }
              }}
            />
          </>
        )}
      </PageTitle>
      <ErrorBox error={error} />
      <section className="panel">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input
              placeholder="Search product, code or scan barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            aria-label="Category filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.data?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {loading ? (
          <Loading />
        ) : (
          <Table
            rows={rows}
            columns={[
              {
                key: "name",
                label: "Product",
                render: (p) => (
                  <div className="product-cell">
                    <span className="product-icon">
                      {p.image ? (
                        <img src={p.image} alt="" />
                      ) : (
                        <Shirt size={22} />
                      )}
                    </span>
                    <div>
                      <strong>{p.name}</strong>
                      <small>
                        {p.code} · {p.barcode}
                      </small>
                    </div>
                  </div>
                ),
              },
              { key: "category", label: "Category" },
              {
                key: "selling_price",
                label: "Selling price",
                render: (p) => <strong>{fmt(p.selling_price)}</strong>,
              },
              {
                key: "stock",
                label: "In stock",
                render: (p) => (
                  <Badge tone={p.stock <= p.min_stock ? "amber" : "green"}>
                    {p.stock} units
                  </Badge>
                ),
              },
              {
                key: "active",
                label: "Status",
                render: (p) => (p.active ? "Active" : "Inactive"),
              },
              {
                key: "actions",
                label: "",
                render: (p) => (
                  <div className="row-actions">
                    <button
                      className="text-button"
                      title="Generate, download or print barcode labels"
                      onClick={() => setBarcode(p)}
                    >
                      <Barcode size={19} /> Barcode
                    </button>
                    {can(user, "products") && (
                      <button
                        className="text-button"
                        onClick={() => {
                          setFormError("");
                          setEdit(p);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>
      {barcode && (
        <BarcodeLabelDialog
          product={barcode}
          onClose={() => setBarcode(null)}
        />
      )}
      {edit && (
        <ProductFormDialog
          edit={edit}
          setEdit={setEdit}
          setBusy={setBusy}
          load={load}
          notify={notify}
          setFormError={setFormError}
          fields={fields}
          categories={categories}
          brands={brands}
          formError={formError}
          busy={busy}
        />
      )}
    </>
  );
}
