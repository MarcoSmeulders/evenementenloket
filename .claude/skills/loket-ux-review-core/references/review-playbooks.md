# Review playbooks — by input type

Each input type enables different checks. Follow the matching playbook; do the manual steps,
not just the ones a tool can automate. Always state confidence and what you could not verify.

## Contents
1. React / TypeScript code
2. Figma / mockup
3. Live URL / PWA
4. Screenshot
5. Cross-cutting manual passes (do these whenever the input allows)

---

## 1. React / TypeScript code

You can verify semantics, ARIA, handlers, and labels from source. You cannot verify rendered
contrast, real focus visibility, or runtime DOM — say so, and reason about likely behaviour.

Inspect in this order:

1. **Element semantics** — is a native element being reimplemented? `<div onClick>` /
   `<span role="button">` where `<button>` belongs. Native elements bring role, focus, and
   keyboard for free (4.1.2, 2.1.1). Flag every hand-rolled interactive `div`/`span`.
2. **Accessible names** — icon-only buttons, inputs without `<label htmlFor>`, links whose
   text is "click here" or just an icon. Check `aria-label`/`aria-labelledby` only where a
   visible label is impossible (1.1.1, 2.4.4, 2.5.3, 3.3.2).
3. **ARIA correctness** — ARIA only where native semantics fall short, and complete when
   used (role + state + relationships). Cross-check widget patterns against the WAI-ARIA
   Authoring Practices (APG) — tabs, dialogs, comboboxes, disclosure, menus. Wrong ARIA is
   worse than none.
4. **Keyboard model** — `onKeyDown`/focus management for custom widgets; focus trap in
   modals and *return* focus on close; `tabIndex` misuse (no positive values; `-1` only for
   programmatic focus). SPA route changes: is focus moved/announced? (2.1.1, 2.1.2, 2.4.3).
5. **State & live regions** — loading/empty/error states present; `aria-live`/`role="status"`
   for async updates and toasts (4.1.3); `aria-expanded`/`aria-selected`/`aria-invalid`
   reflect state.
6. **Structure** — heading levels in order, landmarks (`<main>`, `<nav>`, `<header>`), lists
   as lists (1.3.1).
7. **Media & motion** — `alt` on `<img>`; captions/track on media; `prefers-reduced-motion`
   respected for animation (2.3.3).
8. **Color/contrast in code** — you can flag *suspect* token values (e.g. `#999` on white ≈
   2.85:1) but mark them medium-confidence pending render. Recommend running the live check.

Recommend (and, if executable, run) `eslint-plugin-jsx-a11y` and a component-level axe test
(see tooling). Note: linters catch static issues only.

## 2. Figma / mockup

You can verify contrast, hierarchy, target size, copy, and *designed* states. You cannot
verify real interaction, semantics, or focus — these depend on implementation. A big part of
the value here is catching what the design *fails to specify*.

Inspect:

1. **Contrast** — sample text vs background and UI element vs background against 4.5:1 / 3:1
   / 3:1 (1.4.3, 1.4.11). Watch text over images/gradients.
2. **Target size & spacing** — interactive elements ≥24×24 CSS px with adequate spacing (2.5.8).
3. **States designed?** — are hover, focus, active, disabled, error, selected, loading, and
   empty states drawn? Missing states are the most common design-handoff gap and become
   accessibility bugs downstream.
4. **Focus indication** — is a visible focus style specified, with ≥3:1 contrast (2.4.7, 1.4.11)?
5. **Hierarchy & spacing system** — consistent type scale and spacing tokens; clear primary
   action per screen; greyscale check for colour-only signalling (1.4.1).
6. **Copy & labels** — clear field labels (not placeholder-as-label), button verbs that
   describe the action, error message text drafted.
7. **Reflow intent** — are responsive/mobile frames present, or is only desktop designed
   (1.4.10)?
8. **Motion intent** — is a reduced-motion or "calm" variant considered (relevant for
   wellbeing UIs)?

Frame findings as "the design does not yet specify X" rather than "X is broken".

## 3. Live URL / PWA

The richest input — verify nearly everything, including runtime and assistive-tech output.
Prefer running real tools (see tooling) and report actual results.

Automated layer:
- axe-core (via Playwright) for a baseline scan.
- Lighthouse accessibility + best-practices + PWA categories.
- Pa11y for a second engine / CI-style output.

Manual layer (the ~60% tools miss — always do these):
- **Keyboard-only pass** — unplug the mouse mentally: Tab through everything, operate every
  control, check focus order matches visual order, confirm focus is always visible and not
  obscured by sticky UI (2.1.1, 2.4.3, 2.4.7, 2.4.11), test modal focus trap + return.
- **Screen-reader spot check** — names, roles, states announced; headings/landmarks navigable;
  live regions fire on async changes (4.1.2, 4.1.3, 1.3.1).
- **Zoom/reflow** — 200% zoom and 320px width with no 2-D scroll or clipping (1.4.4, 1.4.10).
- **Reduced motion / dark mode** — toggle OS settings and confirm the app responds.
- **Forms** — label association, error identification, autofill, paste in auth fields.
- **Content over media** — contrast of text on images/video.

PWA extras: offline state visibility, install/update UX, touch target ergonomics, focus
handling across client-side route changes.

## 4. Screenshot

Lowest confidence — visual only. You can assess hierarchy, approximate contrast, layout,
affordance clarity, and copy. You cannot assess interaction, semantics, focus, or hidden
states. Mark most findings medium/low confidence and say plainly what a static image cannot
reveal.

Inspect:
1. Approximate contrast of visible text and key UI elements (estimate ratios, flag likely
   failures, recommend a real check).
2. Visual hierarchy: is the primary action obvious? Is attention guided?
3. Affordances: do interactive things look interactive? Are there ambiguous icons without
   labels?
4. Touch-target size by eye (flag cramped controls).
5. Layout/alignment/spacing consistency; greyscale colour-only reasoning.
6. Copy clarity and labelling.

End screenshot reviews by listing the high-value checks that require the live/coded version,
so the reader knows what is still unverified.

## 5. Cross-cutting manual passes

Whenever the input allows it, these four passes catch what checklists miss:

- **The keyboard pass** (live/code): can you do every task with Tab/Shift-Tab/Enter/Space/
  Esc/arrows, and is focus always visible?
- **The greyscale pass** (any visual input): does anything rely on colour alone?
- **The "200% / 320px" pass** (live/design): does it survive zoom and narrow width?
- **The "first 5 seconds" pass** (any): is it obvious what this screen is for and what to do
  first? This is the usability gut-check that no tool performs.
