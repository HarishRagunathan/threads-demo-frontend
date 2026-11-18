import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./styles/print.css";
import "./styles/pos.css";
import "./styles/theme.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { applyAppearance, readAppearance } from "./theme/theme.js";
import { installPrintHandlers } from "./lib/printing.js";

const removePrintHandlers = installPrintHandlers();
if (import.meta.hot) import.meta.hot.dispose(removePrintHandlers);

applyAppearance(
  readAppearance(),
  window.matchMedia("(prefers-color-scheme: dark)").matches,
);
createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
