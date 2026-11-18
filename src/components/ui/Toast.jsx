import { Check, X } from "lucide-react";
import React from "react";

export function Toast({ toast, setToast }) {
  return (
    <div className="toast" role="status">
      <Check size={18} />
      {toast}
      <button className="icon-button" onClick={() => setToast("")}>
        <X size={16} />
      </button>
    </div>
  );
}
