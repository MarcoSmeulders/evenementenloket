# Learning curriculum — the UX Engineer growth lens

This reference powers the report's "Groei als UX Engineer" section. Use it to turn findings
into a development path: recurring issue patterns reveal which competency to grow next.

A UX Engineer sits on the bridge between design and frontend — fluent in interaction and
visual craft, accessibility, and design systems, *and* able to implement them well. Reviews
are a feedback signal for which side of that bridge needs strengthening.

## Contents
1. The seven competency domains
2. The maturity ladder
3. From findings to growth (mapping table)
4. How to write the growth section

---

## 1. The seven competency domains

1. **Accessibility & inclusive design** — WCAG/ARIA fluency, assistive-tech reality, designing
   for the range of human abilities.
2. **Interaction design & usability** — flows, states, feedback, mental models, heuristics,
   reducing cognitive load.
3. **Visual & UI craft** — hierarchy, type, colour, spacing, motion; making intent legible.
4. **Design systems** — tokens, components, consistency, documentation, the contract between
   design and code.
5. **Frontend implementation craft** — semantic HTML, correct ARIA, focus management, state
   modelling, performance as a UX concern.
6. **Research & evaluation** — heuristic evaluation, usability testing, instrumentation,
   reading evidence rather than guessing.
7. **Communication & advocacy** — critique, handoff, framing UX/a11y in terms stakeholders
   act on, teaching others.

## 2. The maturity ladder

For each domain, place the reader on a four-rung ladder. The aim is movement, not a grade.

- **Aware** — recognises the concept when named; applies it inconsistently.
- **Applies** — uses it reliably on their own work when prompted.
- **Designs** — makes deliberate, defensible decisions and anticipates trade-offs unprompted.
- **Leads / teaches** — sets the standard for others, codifies it, explains the why.

A senior frontend developer typically arrives strong in *frontend implementation craft* and
*design systems*, growing in *accessibility*, *interaction design*, and *research* — those are
usually the highest-leverage domains for the move into a UX Engineer identity.

## 3. From findings to growth — mapping table

Use the *pattern* across findings, not a single instance, to infer a growth edge.

| Recurring finding pattern | Signals growth in | Suggested next action |
|---|---|---|
| Hand-rolled `div` controls, ARIA misuse | Frontend craft + a11y | Study the WAI-ARIA APG patterns; default to native elements; build one widget from the APG spec end to end |
| Missing focus management on routes/modals | Frontend craft + interaction | Implement a reusable focus-management hook; test every flow keyboard-only |
| Contrast / colour-only signalling repeats | Visual craft + a11y | Build a token palette pre-checked for 4.5:1 / 3:1; adopt a greyscale review habit |
| Undesigned states (hover/focus/error/empty) | Interaction + design systems | Adopt a "states checklist" per component; specify all states at design time |
| Unclear hierarchy / cluttered screens | Visual craft + interaction | Practise the squint test and one-primary-action-per-screen; study type/spacing scales |
| Confusing flows, surprising changes | Interaction + research | Run a 5-user think-aloud test; map the task flow before building |
| Findings hard to act on / not prioritised | Communication | Practise writing findings as impact + fix + effort; lead reviews with the human, not the rule |
| "Passes tools but feels wrong" gaps | Research + interaction | Build a heuristic-evaluation habit; learn to articulate *why* with named principles |

## 4. How to write the growth section

- Anchor in *this* review: name the 1-3 patterns that actually showed up, not a generic plan.
- Place each on the ladder ("you reliably *apply* semantic structure; the next rung is
  *designing* focus management proactively").
- Give 2-3 sequenced, concrete actions — a concept to study, a habit to adopt, a small
  experiment to run on real work. Prefer small reps over big resolutions.
- Connect to the bigger arc: every review is a chance to move one domain one rung. Reflect
  progress when earlier patterns stop recurring — improvement the reader can see is what
  sustains the growth.
- Keep it encouraging and specific. The point is momentum toward the UX Engineer identity,
  built on (not replacing) existing frontend strength.
