import React, { createContext, useContext, useEffect, useState } from "react";
import {
  readAppearance,
  applyAppearance,
  DEFAULT_PRIMARY,
  THEME_KEY,
} from "../theme/theme.js";

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [appearance, setAppearance] = useState(readAppearance);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = (e) => setSystemDark(e.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    applyAppearance(appearance, systemDark);
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(appearance));
    } catch {
      /* Preferences still work if browser storage is disabled. */
    }
  }, [appearance, systemDark]);
  useEffect(() => {
    const sync = (e) => {
      if (e.key === THEME_KEY) setAppearance(readAppearance());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const resolved =
    appearance.mode === "system"
      ? systemDark
        ? "dark"
        : "light"
      : appearance.mode;
  const setMode = (mode) => setAppearance((current) => ({ ...current, mode }));
  const setPrimary = (primary) => {
    if (/^#[\da-f]{6}$/i.test(primary))
      setAppearance((current) => ({
        ...current,
        primary: primary.toLowerCase(),
      }));
  };
  return (
    <ThemeContext.Provider
      value={{
        ...appearance,
        resolved,
        setMode,
        setPrimary,
        reset: () => setAppearance({ mode: "light", primary: DEFAULT_PRIMARY }),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
