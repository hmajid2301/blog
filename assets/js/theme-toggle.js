// Palette + light/dark switcher. Drives html[data-theme] × html[data-mode],
// which the zz* palette CSS reads. Runs in <head> so the first paint is correct.
(() => {
  const root = document.documentElement;
  const PALETTE_KEY = "pref-palette";
  const MODE_KEY = "pref-mode";

  const read = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, v); } catch {} };

  function palette() {
    return read(PALETTE_KEY) === "fireside" ? "fireside" : "cat";
  }

  function mode() {
    const saved = read(MODE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function apply() {
    const p = palette();
    const m = mode();
    root.dataset.theme = p;
    root.dataset.mode = m;
    root.style.colorScheme = m;
    document.querySelectorAll("[data-palette]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.palette === p)));
    const toggle = document.getElementById("mode-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", m === "dark" ? "Switch to light mode" : "Switch to dark mode");
    }
  }

  function bind() {
    document.addEventListener("click", (e) => {
      const paletteBtn = e.target.closest("[data-palette]");
      if (paletteBtn) { write(PALETTE_KEY, paletteBtn.dataset.palette); apply(); return; }
      if (e.target.closest("#mode-toggle")) { write(MODE_KEY, mode() === "dark" ? "light" : "dark"); apply(); }
    });
    apply();
  }

  apply(); // set html attributes immediately, before first paint
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
