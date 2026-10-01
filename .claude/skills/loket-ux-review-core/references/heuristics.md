# Usability & craft reference

Conformance is the floor. These principles are what separate an interface that *passes* from
one that is genuinely good to use. Cite them by name alongside WCAG criteria when both apply.

## Contents
1. Nielsen's 10 usability heuristics
2. Cognitive load and interaction principles
3. Visual hierarchy and layout
4. Forms and input
5. Inclusive design principles
6. PWA-specific concerns

---

## 1. Nielsen's 10 usability heuristics

Jakob Nielsen's heuristics remain the standard vocabulary for evaluative review. Use them
to name *why* something feels off when no WCAG criterion is technically violated.

1. **Visibility of system status** — the interface always tells the user what is going on
   (loading, saved, syncing). Silent waits and unconfirmed actions erode trust.
2. **Match between system and the real world** — language, icons, and order follow the
   user's mental model, not the database schema.
3. **User control and freedom** — clearly marked exits, undo, cancel. No dead ends.
4. **Consistency and standards** — same thing, same name, same place (ties to WCAG 3.2.3/3.2.4).
5. **Error prevention** — better than good error messages. Constrain, confirm destructive
   actions, disable invalid options (ties to 3.3.4).
6. **Recognition rather than recall** — show options; don't make users remember them across
   screens (ties to 3.3.7 Redundant Entry).
7. **Flexibility and efficiency of use** — accelerators for experts, simple path for novices.
8. **Aesthetic and minimalist design** — every extra element competes with the essential
   ones for attention. Remove, don't just shrink.
9. **Help users recognise, diagnose, and recover from errors** — plain-language messages
   that say what went wrong and how to fix it (ties to 3.3.1/3.3.3).
10. **Help and documentation** — discoverable, task-focused, in a consistent place (3.2.6).

## 2. Cognitive load and interaction principles

- **Hick's Law** — decision time grows with the number and complexity of choices. Long flat
  menus and 12-field forms tax users; chunk and progressively disclose.
- **Miller's ~7±2 / chunking** — group related items; people hold a small number of chunks
  in working memory, not a long list.
- **Fitts's Law** — time to hit a target depends on its size and distance. Bigger, closer,
  edge-anchored targets are faster — and this directly reinforces 2.5.8 Target Size.
- **Jakob's Law** — users spend most of their time on *other* sites, so they expect yours to
  work like those. Novelty in core controls is a usability tax.
- **Progressive disclosure** — reveal complexity only when needed. Reduces initial load and
  decision paralysis.
- **Feedback latency** — < 100 ms feels instant; < 1 s keeps flow with a subtle cue; > 1 s
  needs an explicit indicator (ties to 4.1.3 Status Messages).
- **Recognition of state** — every interactive element should make its states legible:
  default, hover, focus, active, disabled, selected, loading, error. Missing states are a
  top source of "feels off".

## 3. Visual hierarchy and layout

- **Hierarchy** — size, weight, colour, and spacing should encode importance. If everything
  is bold, nothing is. The eye should have an obvious first, second, third stop.
- **Proximity & grouping (Gestalt)** — related elements sit closer; whitespace is structure,
  not waste. Label-to-field distance, card padding, and section gaps all carry meaning.
- **Alignment** — a consistent grid reduces cognitive friction; ragged alignment reads as
  unfinished.
- **Spacing scale** — use a consistent scale (e.g. 4/8px steps), not arbitrary values. This
  is where a design-system review usually finds drift.
- **Type scale & measure** — limited, harmonious sizes; line length ~45–75 characters for
  comfortable reading.
- **Colour as reinforcement, never sole signal** — pair colour with icon/text/shape
  (1.4.1). Check the design in greyscale.

## 4. Forms and input

Forms are where most real friction and most accessibility failures concentrate.

- Every field has a persistent, programmatically associated label (placeholder is not a
  label).
- Group related fields with `<fieldset>`/`<legend>`; associate errors via
  `aria-describedby`; mark invalid fields with `aria-invalid`.
- Show requirements up front (format, constraints), not only after a failed submit.
- Errors: identify in text + colour + (ideally) icon; keep them adjacent to the field;
  summarise at the top for long forms and move focus there on submit.
- Inputs declare purpose for autofill (`autocomplete` tokens — 1.3.5) and the right
  `inputmode`/`type` for mobile keyboards.
- Don't re-ask for data already provided (3.3.7); let password managers and paste work (3.3.8).

## 5. Inclusive design principles

- **Recognise exclusion** — every design decision can include or exclude. Ask who is shut out.
- **Solve for one, extend to many** — designing for a permanent constraint (one arm) helps
  temporary (broken arm) and situational (holding a baby) cases too. Captions help in noisy
  trains; high contrast helps in sunlight.
- **Range of abilities, not "disabled vs not"** — vision, motor, cognitive, hearing, and
  speech all sit on spectra, and most are situational for everyone sometimes.
- **Respect user settings** — reduced motion, dark mode, font size, language. Honour
  `prefers-reduced-motion` and `prefers-color-scheme`; never trap users in your defaults.
- **Plain language** — clear beats clever. Reading level is an accessibility issue, not just
  a style one.

## 6. PWA-specific concerns

- **Offline & state clarity** — make connectivity and sync state visible (system status).
  A silently failing offline action is a trust failure.
- **Install / update prompts** — discoverable but not nagging; respect dismissal.
- **Touch ergonomics** — thumb-reachable primary actions; targets ≥24px (2.5.8), comfortable
  spacing; avoid drag-only interactions (2.5.7).
- **Motion & transitions** — gate non-essential animation behind `prefers-reduced-motion`;
  meditation/wellbeing apps especially should let users opt for stillness.
- **Focus across route changes** — in a client-rendered app, move focus to the new
  view/heading on navigation and announce it (SPA route changes are invisible to screen
  readers otherwise — a very common React/PWA gap touching 2.4.3 and 4.1.3).
