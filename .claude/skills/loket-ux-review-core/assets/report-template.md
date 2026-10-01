---
title: "UX & Accessibility Review — [TARGET]"
target: "[wat is gereviewd: component / scherm / flow / URL]"
input_type: "[react-code | figma | live-url | screenshot]"
date: "[YYYY-MM-DD]"
reviewer: "ux-a11y-reviewer"
wcag_target: "WCAG 2.2 AA"
standards: ["WCAG 2.2", "EN 301 549", "EAA", "WAI-ARIA APG"]
language: "nl"
lastUpdated: "[YYYY-MM-DDTHH:MM:SSZ]"
---

# UX & Accessibility Review — [TARGET]

> Korte één-regel-scope: *wat* is beoordeeld, *waartegen* (AA), en in welke *context* (bv.
> mobiele PWA, EU-consumentendienst).

## Samenvatting

[2-4 zinnen. Wat is de algehele staat? Wat is de belangrijkste boodschap? Welke 1-2 dingen
zou ik als eerste oppakken? Geen opsomming — een eerlijk, leesbaar oordeel.]

## Conformiteit in één oogopslag

| Severity | Aantal | Voorbeeld-SC |
|---|---|---|
| blocker | [n] | [bv. 2.1.1] |
| critical | [n] | [bv. 1.4.3] |
| serious | [n] | [...] |
| moderate | [n] | [...] |
| minor | [n] | [...] |

- **Getoetst niveau:** WCAG 2.2 AA (+ AAA-winst waar goedkoop)
- **EU-context:** [wel/niet van toepassing — korte EN 301 549 / EAA-notitie indien commerciële dienst]
- **Betrouwbaarheid van deze review:** [op basis van het input-type — wat kon en kon niet
  worden geverifieerd. Wees expliciet.]

## Wat goed gaat

[1-4 punten. Benoem oprecht wat sterk is — goede patronen die behouden moeten blijven. Dit
traint mij om sterke beslissingen te herkennen, niet alleen fouten.]

## Bevindingen

> Elke bevinding: wat, hoe erg, welk criterium, waar, het bewijs, **waarom het telt**, en de
> concrete fix. Bewaar stabiele ID's voor de tracker.

### F-01 — [korte titel]

- **Severity:** [blocker/critical/serious/moderate/minor] · **Effort:** [S/M/L] ·
  **Confidence:** [high/medium/low]
- **Criterium:** [bv. 1.4.3 Contrast (Minimum) — AA] | **Heuristiek:** [indien van toepassing,
  bv. Visibility of system status]
- **Locatie:** [bestand/regel, frame-naam, of URL/selector]
- **Bewijs:** [wat ik concreet zag — gemeten ratio, code-snippet, gedrag. Geen aanname als
  feit; markeer wat afgeleid is.]
- **Waarom dit telt:** [1-2 zinnen — het principe + de échte persoon die hier last van heeft.
  Niet "voeg alt toe" maar de reden waarom dit iemand uitsluit.]
- **Fix:**
  ```tsx
  // concrete, toepasbare oplossing — code of ontwerprichtlijn
  ```

### F-02 — [korte titel]

[zelfde structuur...]

## Prioritering

**Quick wins (eerst doen — hoge impact, lage moeite):**
1. [F-0x] — [één regel waarom dit nu loont]

**Strategisch (plannen — hoge impact, grotere moeite):**
1. [F-0x] — [waarom dit aandacht in de backlog verdient]

**Polish (als er tijd is):**
1. [F-0x]

> Redenering bij de volgorde, niet alleen een score: [korte toelichting op de sequencing].

## Verdieping

> De 1-2 leerzaamste concepten uit déze review, echt uitgediept. Mentaal model →
> veelgemaakte misvatting → hoe je de fix generaliseert → één verwijzing om verder te lezen.

### [Concept, bv. "Accessible name vs. label vs. alt"]

[Het mentale model. Wat mensen vaak verkeerd begrijpen. Hoe je dit principe breder toepast dan
deze ene bevinding. Eén bron om door te lezen (bv. specifieke APG-pagina of WCAG-understanding-doc).]

## Groei als UX Engineer

> Welk patroon laat deze review zien, op welke competentie wijst dat, en wat is de volgende
> concrete stap? Verbonden aan de competentieladder (Aware → Applies → Designs → Leads).

- **Patroon in deze review:** [bv. focusbeheer ontbreekt bij route-changes en modals]
- **Competentie & positie op de ladder:** [bv. Frontend craft + Interaction — je *past*
  semantiek betrouwbaar toe; volgende trede is focusbeheer *proactief ontwerpen*]
- **Volgende stappen (2-3, klein en concreet):**
  1. [een concept om te bestuderen]
  2. [een gewoonte om aan te nemen]
  3. [een klein experiment op echt werk]

## Methode & beperkingen

- **Input-type:** [react-code/figma/url/screenshot]
- **Tools gebruikt:** [bv. axe-core via Playwright, Lighthouse — of "handmatige heuristische
  evaluatie" als er geen tools draaiden]
- **Handmatige checks uitgevoerd:** [keyboard-pass / greyscale / 200%-zoom / reduced-motion /
  screen reader — of welke niet mogelijk waren]
- **Niet verifieerbaar met deze input:** [eerlijk overzicht van wat ongetoetst bleef en hoe je
  dat alsnog zou checken]
- **Standaarden:** WCAG 2.2 AA; EN 301 549 / EAA waar relevant; ARIA APG voor widgetpatronen.
