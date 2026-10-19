---
title: "ADR-0013: Functionele stijl, leesbaar voor iedereen"
date: 2026-10-19
status: geaccepteerd
---

# ADR-0013: Functionele stijl, leesbaar voor iedereen

## Context

De code van het loket is al functioneel van opzet: regels voor het domein zijn pure
functies, data verandert niet, en API, opslag en tekst zitten aan de randen. Dat stond
alleen als stijlregel in `.claude/rules/loket-typescript.md`, niet als besluit. Die regel
verbood ook zelfgemaakte monads, zonder uitleg waarom.

Wat de keuze bepaalt:

- **Pure functies zijn makkelijk te testen.** Data erin, data eruit, geen mocks nodig.
- **Niet elke lezer kent FP.** Reviewers en andere developers moeten de code kunnen volgen
  zonder kennis van functioneel programmeren.
- **TypeScript heeft geen syntax voor monads**, zoals `do` in Haskell of `?` in Rust. Een
  keten wordt daardoor snel onleesbaar.
- **De libraries om het loket heen gooien fouten**: TanStack Query, Hono en React error
  boundaries. Aan die randen moet je dus omzetten.

Deze ADR gaat over de stijl van de code. Wanneer een bibliotheek erbij mag, ook een
FP-bibliotheek, staat in [ADR-0014](0014-dependency-alleen-met-meerwaarde.md).

## Besluit

- **We schrijven functioneel.** Regels voor het domein zijn pure functies. Data verandert
  niet (`const`, `readonly`, spread). Geen klassen, behalve `Error`-subklassen of waar een
  library erom vraagt. Functionele kern, imperatieve schil: API, opslag, logging en `t()`
  blijven aan de randen.
- **Geen point-free stijl.** Je moet altijd kunnen zien welke waarde er langskomt.
  - **Mag:** arrow-functies, zoals `items.filter((item) => item.isActive)`, en een functie
    met een naam doorgeven, zoals `items.map(toTitle)`.
  - **Mag niet:** functies aan elkaar rijgen zonder dat er een waarde in beeld komt, met
    `pipe`, `compose`, `flow` of curried helpers. Dus niet
    `pipe(filter(prop('isActive')), map(prop('title')))`.
- **Arrow-functies mogen overal**, ook voor functies met een naam en voor React-componenten.
  Binnen één bestand kies je één vorm.
- **Een kleine monad mag, als hij te volgen is.** Bijvoorbeeld een resultaattype
  `{ ok: true, value } | { ok: false, error }` met een paar helpers. Voorwaarden: duidelijke
  namen, korte uitleg in de code, een unittest per helper, alleen in de domeinlaag, en elke
  keten blijft te volgen zonder FP-kennis. Of het loket zo'n resultaattype krijgt, beslissen
  we bij `add-review-and-submit`, met echte code.

## Gevolgen

**Wat het oplevert**

- De stijl staat op één plek, met de reden erbij.
- Ruimte voor een eigen monad als die echt helpt, zonder dat de regel eerst moet wijken.
- Code die een developer zonder FP-achtergrond kan lezen en wijzigen.

**Wat het kost**

- Zonder point-free stijl is code soms iets langer.
- Een eigen monad is eigen code: uitleggen, testen en onderhouden.

## Risico's

| Risico | Maatregel |
|---|---|
| Een monad-keten wordt toch onleesbaar | De voorwaarden hierboven; een keten die niet zonder FP-kennis te volgen is, wordt een gewone `if`. |
| Twee manieren van foutafhandeling naast elkaar (throw en resultaattype) | Resultaattype alleen in de domeinlaag; aan de randen omzetten naar throw of problem details. |

## Controle

- Review van elke change: pure functies voor regels en geen point-free stijl.
- De stijlregels in `.claude/rules/loket-typescript.md` volgen deze ADR.
- Unit-tests voor elke helper van een eigen monad.

## Overwogen alternatieven

- **Monads helemaal verbieden.** Zo was het. Eenvoudig, maar zonder reden, en het sluit een
  goede oplossing bij voorbaat uit.
- **Volledig FP, in de stijl van fp-ts of Effect.** Krachtig, maar moeilijk te lezen voor
  wie het niet kent.
- **Geen vaste stijl.** Dan verschilt de code per bestand, en zijn regels moeilijker te
  testen.

## Herzien als

- TypeScript of JavaScript een syntax krijgt die monad-ketens leesbaar maakt.
- Het besluit over het resultaattype bij `add-review-and-submit` iets anders laat zien.
- Er meer developers aan het project werken en de leesbaarheid anders uitpakt.
