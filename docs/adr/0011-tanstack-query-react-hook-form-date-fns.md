---
title: "ADR-0011: TanStack Query, React Hook Form en date-fns"
date: 2026-10-12
status: geaccepteerd
---

# ADR-0011: TanStack Query, React Hook Form en date-fns

## Context

Met `add-draft-application` krijgt het loket zijn eerste formulier en zijn eerste gegevens
van de server. Er zijn drie soorten werk:

- **Servergegevens:** het concept ophalen, opslaan, en de nieuwe versie op elke pagina
  tonen.
- **Formulierstate:** waarden, fouten, vragen die alleen soms verschijnen, en de keuze
  tussen "Opslaan en verder" en "Opslaan en later verdergaan".
- **Datums en tijden:** controleren of een datum bestaat, en of een begin in Kranswijk in
  de toekomst ligt, ook rond de overgang naar zomer- en wintertijd.

De projectregels: geen Redux, geen FP-bibliotheken, en elke runtime-dependency moet zich
bewijzen.

## Besluit

- **TanStack Query voor servergegevens.** Eén cache voor het concept. De loader van React
  Router vult die cache vóór de pagina rendert (`ensureQueryData`), de pagina's lezen eruit,
  en na het opslaan zet de app het nieuwe concept direct in de cache.
- **React Hook Form met `@hookform/resolvers` voor formulieren.** De velden worden met
  dezelfde Zod-schema's gecontroleerd als in de API. Per verzending kiest de knop het schema:
  concept of compleet. Fouten veranderen alleen bij verzenden (`mode` en `reValidateMode`
  `onSubmit`), en de focus gaat naar de foutsamenvatting, niet naar het eerste veld
  (`shouldFocusError: false`).
- **date-fns met `@date-fns/tz` voor datums en tijden**, in `packages/schema`. Eén bestand,
  `dateTimeUtils.ts`, gebruikt ze; de rest van de code kent alleen dat bestand.

## Gevolgen

**Wat het oplevert**

- Geen eigen code voor cache, laadstatus, formulierstate en tijdzones.
- Bekende bibliotheken: een reviewer of nieuwe ontwikkelaar herkent de patronen.
- Fouten van de server zien er hetzelfde uit als fouten in de browser (`setError`).

**Wat het kost**

- Vijf runtime-dependencies erbij (drie in de webapp, twee in het schema-package).
- Twee manieren om data te laden die samen moeten werken: de loader van React Router en
  TanStack Query.
- React Hook Form en de resolver zijn generiek getypeerd; het wisselen van schema per
  verzending vraagt één cast.

## Risico's

| Risico | Maatregel |
|---|---|
| React Hook Form zet de focus op het eerste foute veld en pakt die af van de foutsamenvatting | `shouldFocusError: false`; browsertest "invalid step" controleert de focus. |
| Een blur-controle laat een knop verspringen, waardoor een klik mist | Alleen controleren bij verzenden; browsertest "one click submits after correcting a field". |
| Een update van een van de bibliotheken breekt iets | `pnpm run audit` en de update-routine (ADR-0008); de browsertests dekken het gedrag. |
| De bundel van de webapp groeit | date-fns importeert per functie; alleen wat gebruikt wordt, komt in de bundel. |

## Controle

- Browsertests voor de foutsamenvatting, het moment van controleren en het opslaan.
- Unit-tests voor de schema's, inclusief een test rond de overgang naar zomertijd.

## Overwogen alternatieven

- **Alleen loaders en actions van React Router, zonder TanStack Query.** Eén dependency
  minder en past bij de router. De developer koos TanStack Query, zoals in het oorspronkelijke
  plan.
- **Een eigen formulierhook in plaats van React Hook Form.** Geen dependency, maar ongeveer
  100 regels eigen code voor iets wat een bekende bibliotheek al doet.
- **`Intl` met eigen offset-code in plaats van date-fns.** Geen dependency, maar de randgevallen
  rond zomer- en wintertijd zijn dan voor eigen rekening.
- **`Temporal`.** De nette oplossing voor datums, maar niet standaard beschikbaar in Node 24.

## Herzien als

- `Temporal` standaard in Node en de browsers zit: dan kunnen date-fns en `@date-fns/tz`
  eruit.
- Het formulier zo klein blijft dat React Hook Form meer kost dan het oplevert.
