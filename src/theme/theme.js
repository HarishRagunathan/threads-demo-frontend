export const THEME_KEY = "thread-ledger-appearance";
export const DEFAULT_PRIMARY = "#6d5ef4";
export const COLOR_PRESETS = [
  { name: "Violet", value: "#6d5ef4" },
  { name: "Indigo", value: "#4361ee" },
  { name: "Teal", value: "#0d9488" },
  { name: "Rose", value: "#df4775" },
  { name: "Amber", value: "#c98308" },
  { name: "Sky", value: "#0284c7" },
];

export function readAppearance() {
  try {
    const saved = JSON.parse(localStorage.getItem(THEME_KEY) || "null");
    return {
      mode: ["light", "dark", "system"].includes(saved?.mode)
        ? saved.mode
        : "light",
      primary: /^#[\da-f]{6}$/i.test(saved?.primary || "")
        ? saved.primary.toLowerCase()
        : DEFAULT_PRIMARY,
    };
  } catch {
    return { mode: "light", primary: DEFAULT_PRIMARY };
  }
}

export function foregroundFor(hex) {
  const values = hex
    .slice(1)
    .match(/.{2}/g)
    .map((n) => parseInt(n, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const luminance =
    values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
  return (luminance + 0.05) / 0.05 > 1.05 / (luminance + 0.05)
    ? "#101828"
    : "#ffffff";
}

export function readableAccent(hex, dark) {
  const original = hex
    .slice(1)
    .match(/.{2}/g)
    .map((n) => parseInt(n, 16));
  const background = dark ? [19, 30, 49] : [255, 255, 255];
  const luminance = (rgb) =>
    rgb
      .map((n) => n / 255)
      .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
      .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
  const bg = luminance(background);
  for (let step = 0; step <= 10; step++) {
    const rgb = original.map((v) =>
      Math.round(v + (((dark ? 255 : 0) - v) * step) / 10),
    );
    const fg = luminance(rgb);
    if ((Math.max(bg, fg) + 0.05) / (Math.min(bg, fg) + 0.05) >= 4.5)
      return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  return dark ? "#ffffff" : "#000000";
}

export function applyAppearance({ mode, primary }, systemDark) {
  const resolved = mode === "system" ? (systemDark ? "dark" : "light") : mode;
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--primary-ink", foregroundFor(primary));
  root.style.setProperty(
    "--primary-text",
    readableAccent(primary, resolved === "dark"),
  );
  root.style.colorScheme = resolved;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolved === "dark" ? "#121b2e" : primary);
}
