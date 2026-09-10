const THEME_KEY = "theme";
const SCHEME_KEY = "scheme";
const LIGHT = "light";
const DARK = "dark";
const DEFAULT_SCHEME = "zhuqing"; // 默认配色：竹青清雅

// document 级监听是否已绑定（View Transitions 后 document 不变，避免重复叠加）
let globalBound = false;

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
  document
    .querySelector("#theme-btn")
    ?.setAttribute("aria-label", `主题与配色（当前：${schemeValue}）`);

  // 下拉里当前生效的配色打勾，关灯项同步勾选状态
  document.querySelectorAll<HTMLButtonElement>(".scheme-btn").forEach(btn => {
    btn.setAttribute(
      "aria-pressed",
      btn.dataset.scheme === schemeValue ? "true" : "false"
    );
  });
  document
    .querySelector("#dark-toggle")
    ?.setAttribute("aria-checked", themeValue === DARK ? "true" : "false");

  // Fill <meta name="theme-color"> with the computed background colour so
  // Android's browser chrome matches the page background.
  const bg = window.getComputedStyle(document.body).backgroundColor;
  document
    .querySelector("meta[name='theme-color']")
    ?.setAttribute("content", bg);
}

function setup(): void {
  reflect();

  const panel = document.querySelector<HTMLElement>("#theme-panel");
  const themeBtn = document.querySelector<HTMLButtonElement>("#theme-btn");

  const closePanel = () => {
    if (!panel || !themeBtn) return;
    panel.classList.add("hidden");
    themeBtn.setAttribute("aria-expanded", "false");
  };

  // 顶栏一个按钮点开下拉面板
  themeBtn?.addEventListener("click", e => {
    if (!panel) return;
    e.stopPropagation();
    const willOpen = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !willOpen);
    themeBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });

  // 选配色
  document.querySelectorAll<HTMLButtonElement>(".scheme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      schemeValue = btn.dataset.scheme ?? DEFAULT_SCHEME;
      persist();
      closePanel();
    });
  });

  // 关灯 / 开灯
  document.querySelector("#dark-toggle")?.addEventListener("click", () => {
    themeValue = themeValue === LIGHT ? DARK : LIGHT;
    persist();
    closePanel();
  });

  // 点空白处 / 按 Esc 关闭（document 级监听只绑一次，避免 View Transitions 后重复叠加）
  if (!globalBound) {
    globalBound = true;
    document.addEventListener("click", e => {
      const p = document.querySelector<HTMLElement>("#theme-panel");
      const b = document.querySelector<HTMLButtonElement>("#theme-btn");
      if (!p || p.classList.contains("hidden")) return;
      const target = e.target as Node;
      if (!p.contains(target) && !b?.contains(target)) {
        p.classList.add("hidden");
        b?.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", e => {
      if (e.key !== "Escape") return;
      const p = document.querySelector<HTMLElement>("#theme-panel");
      p?.classList.add("hidden");
      document
        .querySelector("#theme-btn")
        ?.setAttribute("aria-expanded", "false");
    });
  }
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
