# Standards reference — WCAG 2.2, EN 301 549, EAA, WCAG 3.0

Working checklist for conformance review. Map every finding to a specific success
criterion (SC) and its level. Levels: **A** (minimum), **AA** (the legal/operative
target almost everywhere), **AAA** (aspirational, not required wholesale).

## Contents
1. How to use this checklist
2. The four principles (POUR) and all SC by level
3. The most-failed criteria, explained
4. The 9 criteria new in WCAG 2.2
5. EN 301 549 and the European Accessibility Act
6. WCAG 3.0 forward-look (Bronze/Silver/Gold)
7. Fast numeric reference

---

## 1. How to use this checklist

WCAG 2.2 (W3C Recommendation, Oct 2023; also ISO/IEC 40500:2025) has 87 success criteria
across 4 principles, 13 guidelines. You do not test all 87 every time — you test what the
artefact actually contains. A static text page never triggers the time-based-media
criteria; a form-heavy flow leans hard on guideline 3.3.

Each SC is *testable*: it passes or fails for a given interface. When you cite one, name it
canonically (number + title + level), e.g. "2.4.7 Focus Visible (AA)".

## 2. POUR — all success criteria

### Perceivable — information must be presentable in ways users can perceive

**1.1 Text Alternatives**
- 1.1.1 Non-text Content (A)

**1.2 Time-based Media**
- 1.2.1 Audio-only and Video-only (Prerecorded) (A)
- 1.2.2 Captions (Prerecorded) (A)
- 1.2.3 Audio Description or Media Alternative (Prerecorded) (A)
- 1.2.4 Captions (Live) (AA)
- 1.2.5 Audio Description (Prerecorded) (AA)
- 1.2.6–1.2.9 Sign language, extended AD, media alt, live audio-only (AAA)

**1.3 Adaptable**
- 1.3.1 Info and Relationships (A) — structure conveyed in code, not only visually
- 1.3.2 Meaningful Sequence (A)
- 1.3.3 Sensory Characteristics (A) — not "click the round button on the right" alone
- 1.3.4 Orientation (AA) — works in both portrait and landscape
- 1.3.5 Identify Input Purpose (AA) — autocomplete tokens on inputs
- 1.3.6 Identify Purpose (AAA)

**1.4 Distinguishable**
- 1.4.1 Use of Color (A) — colour is never the only signal
- 1.4.2 Audio Control (A)
- 1.4.3 Contrast (Minimum) (AA) — 4.5:1 text, 3:1 large text
- 1.4.4 Resize Text (AA) — usable at 200% zoom
- 1.4.5 Images of Text (AA)
- 1.4.6–1.4.9 Enhanced contrast, low background audio, visual presentation, images of text (AAA)
- 1.4.10 Reflow (AA) — no 2-D scroll at 320 CSS px width / 400% zoom
- 1.4.11 Non-text Contrast (AA) — 3:1 for UI components, focus rings, graph parts
- 1.4.12 Text Spacing (AA) — survives user spacing overrides
- 1.4.13 Content on Hover or Focus (AA) — dismissible, hoverable, persistent tooltips

### Operable — UI and navigation must be operable

**2.1 Keyboard Accessible**
- 2.1.1 Keyboard (A) — everything works from the keyboard
- 2.1.2 No Keyboard Trap (A)
- 2.1.4 Character Key Shortcuts (A)
- 2.1.3 Keyboard (No Exception) (AAA)

**2.2 Enough Time**
- 2.2.1 Timing Adjustable (A)
- 2.2.2 Pause, Stop, Hide (A) — for moving/auto-updating content
- 2.2.3–2.2.6 (AAA)

**2.3 Seizures and Physical Reactions**
- 2.3.1 Three Flashes or Below Threshold (A)
- 2.3.2–2.3.3 (AAA) — incl. Animation from Interactions (respect reduced-motion)

**2.4 Navigable**
- 2.4.1 Bypass Blocks (A) — skip link / landmarks
- 2.4.2 Page Titled (A)
- 2.4.3 Focus Order (A)
- 2.4.4 Link Purpose (In Context) (A)
- 2.4.5 Multiple Ways (AA)
- 2.4.6 Headings and Labels (AA) — descriptive
- 2.4.7 Focus Visible (AA)
- 2.4.8–2.4.10 (AAA)
- **2.4.11 Focus Not Obscured (Minimum) (AA) — new in 2.2**
- 2.4.12 Focus Not Obscured (Enhanced) (AAA) — new in 2.2
- 2.4.13 Focus Appearance (AAA) — new in 2.2

**2.5 Input Modalities**
- 2.5.1 Pointer Gestures (A)
- 2.5.2 Pointer Cancellation (A)
- 2.5.3 Label in Name (A) — visible label is part of the accessible name
- 2.5.4 Motion Actuation (A)
- 2.5.5–2.5.6 (AAA)
- **2.5.7 Dragging Movements (AA) — new in 2.2** — drag has a single-pointer alternative
- **2.5.8 Target Size (Minimum) (AA) — new in 2.2** — 24×24 CSS px (with spacing exception)

### Understandable — information and operation must be understandable

**3.1 Readable**
- 3.1.1 Language of Page (A) — `lang` attribute
- 3.1.2 Language of Parts (AA)
- 3.1.3–3.1.6 (AAA)

**3.2 Predictable**
- 3.2.1 On Focus (A)
- 3.2.2 On Input (A) — no surprise context change on input
- 3.2.3 Consistent Navigation (AA)
- 3.2.4 Consistent Identification (AA)
- 3.2.5 Change on Request (AAA)
- **3.2.6 Consistent Help (A) — new in 2.2** — help in a consistent location

**3.3 Input Assistance**
- 3.3.1 Error Identification (A)
- 3.3.2 Labels or Instructions (A)
- 3.3.3 Error Suggestion (AA)
- 3.3.4 Error Prevention (Legal, Financial, Data) (AA)
- 3.3.5–3.3.6 (AAA)
- **3.3.7 Redundant Entry (A) — new in 2.2** — do not re-ask for info already given
- **3.3.8 Accessible Authentication (Minimum) (AA) — new in 2.2** — no cognitive-function
  test (e.g. transcribing, puzzles) without an alternative; allow paste/password managers
- 3.3.9 Accessible Authentication (Enhanced) (AAA) — new in 2.2

### Robust — content must be robust enough for assistive tech

**4.1 Compatible**
- 4.1.1 Parsing — **obsolete and removed in WCAG 2.2** (do not cite it)
- 4.1.2 Name, Role, Value (A) — the bedrock of custom components
- 4.1.3 Status Messages (AA) — live-region announcements without focus change

## 3. The most-failed criteria, explained

These account for the large majority of real-world failures. Know them cold.

- **1.4.3 Contrast (Minimum)** — text needs 4.5:1 against its background; "large text"
  (≥24px, or ≥18.66px bold) needs 3:1. The classic miss is light-grey placeholder/help
  text and disabled-looking-but-active controls.
- **1.1.1 Non-text Content** — meaningful images need alt that conveys the meaning;
  decorative images take `alt=""` so AT skips them. Icon-only buttons need an accessible
  name. The error is alt that describes pixels, not purpose.
- **4.1.2 Name, Role, Value** — a `<div onClick>` styled as a button has no role, no
  keyboard support, no name. Prefer the native element; if you must use ARIA, supply all
  three. This is where most custom-component bugs live.
- **2.4.7 Focus Visible** + **2.4.11 Focus Not Obscured** — a visible focus indicator that
  is not hidden behind sticky headers/footers. Never `outline: none` without a replacement.
- **1.3.1 Info and Relationships** — headings are `<h1>`–`<h6>` in order, lists are lists,
  form fields are associated with `<label>`. Visual structure must exist in the semantics.
- **3.3.1/3.3.2 Errors & Labels** — every field has a programmatic label; errors are
  identified in text (not colour alone) and linked to the field via `aria-describedby`.
- **2.1.1 Keyboard** — tab to every control, operate it, and Esc/arrow as the pattern
  expects. Test this by hand on every review of a live or coded interface.

## 4. The 9 criteria new in WCAG 2.2

2.4.11 Focus Not Obscured (Min, AA) · 2.4.12 Focus Not Obscured (Enh, AAA) · 2.4.13 Focus
Appearance (AAA) · 2.5.7 Dragging Movements (AA) · 2.5.8 Target Size (Min, AA) · 3.2.6
Consistent Help (A) · 3.3.7 Redundant Entry (A) · 3.3.8 Accessible Authentication (Min, AA)
· 3.3.9 Accessible Authentication (Enh, AAA). Also: 4.1.1 Parsing is removed.

For a PWA the high-yield ones are **2.5.8 Target Size** (touch targets ≥24px),
**2.5.7 Dragging** (sliders/carousels need a non-drag path), and **3.3.8** (don't gate
auth behind memory/transcription puzzles, allow password managers).

## 5. EN 301 549 and the European Accessibility Act

- **EN 301 549** is the EU's harmonised accessibility standard for ICT. Its web/software
  requirements incorporate WCAG by reference, so meeting WCAG 2.2 AA covers the bulk of it.
  It adds non-web items (documents, hardware, some functional-performance statements).
- **European Accessibility Act (EAA, Directive 2019/882)** applies from **28 June 2025** to
  many private-sector products and services placed on the EU market — e-commerce, consumer
  banking, e-books, ticketing, and more. It references WCAG 2.2. If a PWA is a commercial
  service to EU consumers, treat AA as a legal floor, not a nice-to-have. Microenterprise
  exemptions exist for some services; flag this as a "check with the business" item rather
  than asserting a legal conclusion.

Practical framing for reports: lead with WCAG 2.2 AA; add a short "EU-context" note when
the artefact looks like an in-scope commercial service.

## 6. WCAG 3.0 forward-look

WCAG 3.0 (W3C Accessibility Guidelines) is a **Working Draft** (latest March 2026), not a
Recommendation — expected ~2028+, and it will coexist with 2.2 for years. Do **not** audit
against it for conformance. It is useful as a growth/readiness lens:

- Moves from binary pass/fail to an **outcomes-based** model with **Bronze / Silver / Gold**
  conformance tiers.
- Introduces *assertions* (testable claims) and technology-specific *methods*.
- Explores a perceptual contrast model (APCA) — still exploratory, not normative.

Takeaway to teach: a solid WCAG 2.2 AA interface already lands roughly at Bronze. Build to
2.2 now; track 3.0 to understand where judgement-based accessibility is heading.

## 7. Fast numeric reference

- Text contrast: **4.5:1** (normal), **3:1** (large ≥24px / ≥18.66px bold). Enhanced (AAA): 7:1 / 4.5:1.
- Non-text / UI component & focus contrast: **3:1** (1.4.11).
- Touch target minimum: **24×24 CSS px** (2.5.8 AA); enhanced **44×44** (2.5.5 AAA).
- Reflow: usable at **320 CSS px** width, no 2-D scrolling (1.4.10).
- Zoom: usable at **200%** (1.4.4) and content reflow at **400%**.
- Text spacing overrides users may apply: line-height 1.5×, paragraph 2×, letter 0.12em,
  word 0.16em — must not clip content (1.4.12).
