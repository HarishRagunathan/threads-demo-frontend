import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Palette, Check, X, RotateCcw } from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { COLOR_PRESETS, foregroundFor } from "../../theme/theme.js";

export function ThemeControls() {
  const { mode, resolved, primary, setMode, setPrimary, reset } = useTheme();
  const [open, setOpen] = useState(false);
  const host = useRef(null),
    trigger = useRef(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e) => {
      if (!host.current?.contains(e.target)) setOpen(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="theme-controls" ref={host}>
      <button
        className="theme-toggle"
        type="button"
        aria-label={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
        title={`Switch to ${resolved === "dark" ? "light" : "dark"} theme`}
        onClick={() => setMode(resolved === "dark" ? "light" : "dark")}
      >
        {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
      <button
        className="appearance-trigger"
        type="button"
        ref={trigger}
        aria-label="Appearance and primary color"
        aria-expanded={open}
        aria-controls="appearance-panel"
        onClick={() => setOpen(!open)}
      >
        <Palette size={17} />
        <span>Appearance</span>
        <i style={{ background: primary }} />
      </button>
      {open && (
        <section
          id="appearance-panel"
          className="appearance-panel"
          role="dialog"
          aria-label="Appearance settings"
        >
          <div className="appearance-heading">
            <div>
              <h2>Make it yours</h2>
              <p>A workspace in your favourite colours.</p>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Close appearance settings"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X size={18} />
            </button>
          </div>
          <span className="appearance-label">THEME</span>
          <div className="theme-options">
            {[
              ["light", "Light", Sun],
              ["dark", "Dark", Moon],
              ["system", "System", Monitor],
            ].map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
          <span className="appearance-label">PRIMARY COLOUR</span>
          <div className="colour-presets">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.name}
                type="button"
                aria-label={`${color.name} primary color`}
                aria-pressed={primary === color.value}
                title={color.name}
                style={{
                  background: color.value,
                  color: foregroundFor(color.value),
                }}
                onClick={() => setPrimary(color.value)}
              >
                {primary === color.value && <Check size={19} />}
              </button>
            ))}
          </div>
          <label className="custom-colour">
            <span>
              Custom colour<small>Buttons, highlights & navigation</small>
            </span>
            <input
              type="color"
              aria-label="Custom primary color"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
            />
            <code>{primary.toUpperCase()}</code>
          </label>
          <div className="appearance-footer">
            <span>Saved on this browser</span>
            <button type="button" className="text-button" onClick={reset}>
              <RotateCcw size={13} />
              Reset
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
