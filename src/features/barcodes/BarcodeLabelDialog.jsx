import React, { useRef, useState } from "react";
import { Printer, Download } from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { Field } from "../../components/ui/Field.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { ErrorBox } from "../../components/ui/ErrorBox.jsx";
import { BarcodeLabel } from "./BarcodeLabel.jsx";
import { downloadBarcodeSvg } from "./barcodeUtils.js";
import { printElement } from "../../lib/printing.js";

export function BarcodeLabelDialog({ product, onClose }) {
  const { settings } = useApp();
  const [copies, setCopies] = useState(1),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const preview = useRef(null),
    sheet = useRef(null);
  const count = Math.max(1, Math.min(100, Number(copies) || 1));
  return (
    <Modal title={"Barcode · " + product.name} onClose={onClose}>
      <p className="info-note">
        Each product has its own saved Code 128 barcode. Print one label per
        piece. At the retail counter, scan this code to add one piece to the
        bill.
      </p>
      <div className="barcode-preview" ref={preview}>
        <BarcodeLabel product={product} shopName={settings.shop_name} />
      </div>
      <div className="barcode-label-settings">
        <Field
          label="Number of labels"
          type="number"
          min="1"
          max="100"
          step="1"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
        />
        <span className="muted">A4 label sheet · up to 100 labels</span>
      </div>
      <ErrorBox error={error} />
      <div className="barcode-actions">
        <Button
          variant="secondary"
          icon={Download}
          onClick={() =>
            downloadBarcodeSvg(
              preview.current.querySelector("svg"),
              product.code,
            )
          }
        >
          Download SVG
        </Button>
        <Button
          icon={Download}
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              const { downloadBarcodePdf } = await import("./barcodePdf.js");
              downloadBarcodePdf(product, settings.shop_name, count);
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Download labels PDF
        </Button>
        <Button
          icon={Printer}
          variant="secondary"
          onClick={() =>
            printElement(sheet.current, {
              title: "Barcode labels - " + product.code,
            })
          }
        >
          Print labels
        </Button>
      </div>
      <div hidden>
        <div ref={sheet} className="barcode-sheet print-area">
          {Array.from({ length: count }, (_, i) => (
            <BarcodeLabel
              key={i}
              product={product}
              shopName={settings.shop_name}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
