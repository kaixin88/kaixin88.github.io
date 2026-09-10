const THEME_KEY = "theme";
const SCHEME_KEY = "scheme";
const LIGHT = "light";
const DARK = "dark";
const DEFAULT_SCHEME = "xuanzhi";

function getPreferredTheme(): string {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? DARK
    : LIGHT;
}

// Reuse the value already set by the inline FOUC-prevention script if available.
let themeValue: string =
  (window as unknown as { __theme?: { value: string } }).__theme?.value ??
  getPreferredTheme();

let schemeValue: string =
  (window as unknown as { __theme?: { scheme?: string } }).__theme?.scheme ??
  localStorage.getItem(SCHEME_KEY) ??
  DEFAULT_SCHEME;

function persist(): void {
  localStorage.setItem(THEME_KEY, themeValue);
  localStorage.setItem(SCHEME_KEY, schemeValue);
  reflect();
}

function reflect(): void {
  const root = document.firstElementChild;
  root?.setAttribute("data-theme", themeValue);
  root?.setAttribute("data-scheme", schemeValue);
  root?.classList.toggle("dark", themeValue === DARK);
  document.querySelector("#theme-btn")?.setAttribute("aria-label", themeValue);

  // 高亮当前选中的配色按钮
  document.querySelectorAll<HTMLButtonElement>(".scheme-btn").forEach(btn => {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.scheme === schemeValue ? "true" : "false"
    );
  });

  // Fill <meta name="theme-color"> with the computed background colour so
  // Android's browser chrome matches the page background.
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

function setup(): void {
  reflect();

  // 关灯 / 开灯
  document.querySelector("#theme-btn")?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    persist();
  });

  // 三套配色切换
  document.querySelectorAll<HTMLButtonElement>(".scheme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      schemeValue = btn.dataset.scheme ?? DEFAULT_SCHEME;
      persist();
    });
  });
}

setup();

// Re-run after View Transitions navigation.
document.addEventListener("astro:after-swap", setup);

// Carry the theme-color value across View Transitions to prevent the
// Android navigation bar from flashing during page transitions.
document.addEventListener("astro:before-swap", event => {
  const color = document
    .querySelector("meta[name='theme-color']")
    ?.getAttribute("content");
  if (color) {
    (event as { newDocument: Document }).newDocument
      .querySelector("meta[name='theme-color']")
      ?.setAttribute("content", color);
  }
});

// Sync with OS-level dark/light preference changes.
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", ({ matches }) => {
    themeValue = matches ? DARK : LIGHT;
    persist();
  });
