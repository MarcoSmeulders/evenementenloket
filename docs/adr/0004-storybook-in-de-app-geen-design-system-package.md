---
title: "ADR-0004: Storybook in de app, geen apart design-system-package"
date: 2026-10-02
status: geaccepteerd
---

# ADR-0004: Storybook in de app, geen apart design-system-package

## Context

De app krijgt een handvol eigen componenten: een skiplink, de paginaschil en straks
formuliervelden, een foutsamenvatting en een stapindicator. Elk component heeft meerdere
toestanden: leeg, met hint, met fout, verplicht. Die toestanden wil je los kunnen bekijken
en op toegankelijkheid kunnen controleren, zonder telkens door het hele formulier te
klikken.

In grotere projecten komen zulke componenten vaak in een apart package, een design
system. Dat loont als meerdere apps dezelfde componenten gebruiken. Hier is er één app.

## Besluit

- **Storybook draait in `apps/web`.** Stories staan naast het component
  (`SkipLink.stories.tsx`).
- **Er is geen apart package** voor componenten. Ze staan in `apps/web/src/components/`.
- **Elke toestand krijgt een story.** Bij nieuwe formuliercomponenten hoort een story per
  toestand.
- **De a11y-addon controleert elke story** met axe, in een echte browser. Omdat de story in
  een browser draait, ziet de addon ook kleurcontrast. Dat kan jest-axe in jsdom niet.
- **CI bouwt Storybook.** Een kapotte story laat de check falen.
- **Telemetrie van Storybook staat uit.**

## Gevolgen

**Wat het oplevert**

- Elke toestand van een component is los te bekijken en te controleren.
- Componenten zijn herbruikbaar gebouwd: ze krijgen hun tekst via props (ADR-0005).
- Een reviewer kan de componenten bekijken zonder de app te starten.

**Wat het kost**

- Een extra tool met eigen updates. Storybook brengt vaak grote versies uit.
- Stories moeten bijgehouden worden als een component verandert.

## Risico's

| Risico | Maatregel |
|---|---|
| Een update van Storybook breekt de stories | CI bouwt Storybook bij elke push. Een kapotte update wordt rood op `develop` en komt niet in `main` (update-routine, ADR-0008). |
| Stories lopen achter op het component | Een nieuwe toestand van een component hoort bij dezelfde change als de story. Dat staat in de taken. |
| De a11y-addon toont fouten, maar niemand kijkt | De addon staat op "error", zodat een fout opvalt. Voor elke change draaien we axe ook in de browsertests. |
| Componenten groeien naar een design system, zonder dat iemand dat besluit | Een apart package komt er pas met een nieuwe ADR, als er een tweede gebruiker is. |

## Controle

- `pnpm --filter @evenementenloket/web build-storybook` slaagt in CI.
- Elk component in `apps/web/src/components/` heeft een `*.stories.tsx`.

## Overwogen alternatieven

- **Apart package `packages/ui`.** Lijkt het meest op een echt design system, maar er is
  geen tweede gebruiker. Je krijgt een buildstap, exports en versies, zonder voordeel.
- **Geen Storybook.** Minder tools, maar toestanden zie je alleen door in de app te
  klikken. Contrast per component controleer je dan alleen met de hand.
- **Alleen jest-axe per component.** Snel en zonder browser, maar zonder kleurcontrast en
  zonder iets om naar te kijken.

## Herzien als

- Een tweede app dezelfde componenten gaat gebruiken. Dan verhuizen ze naar een eigen
  package, bijvoorbeeld `packages/ui`.
