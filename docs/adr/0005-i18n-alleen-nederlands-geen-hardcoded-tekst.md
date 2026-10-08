---
title: "ADR-0005: i18n met alleen Nederlands, en geen hardcoded tekst"
date: 2026-10-02
status: geaccepteerd
---

# ADR-0005: i18n met alleen Nederlands, en geen hardcoded tekst

## Context

De app is alleen in het Nederlands. Een tweede taal staat niet op de planning. Toch
willen we geen tekst in de code: geen knopteksten, foutmeldingen of paginatitels tussen
de JSX. Waarom niet:

- Tekst die verspreid in de code staat, is lastig te vinden en te verbeteren.
- De handleidingen noemen letterlijke knopteksten. Die moeten overeenkomen met de app.
- De API stuurt later foutcodes, geen zinnen. De webapp moet die codes omzetten naar
  tekst.

## Besluit

- **Alle tekst staat in `apps/web/src/i18n/nl.json`.** We gebruiken react-i18next. Het
  bestand wordt direct bij het starten geladen, dus er is geen moment zonder tekst.
- **Herbruikbare componenten krijgen hun tekst via props.** Alleen pagina's en de layout
  roepen `t()` aan. Zo werkt een component in Storybook met elke tekst.
- **Lint dwingt het af.** `eslint-plugin-i18next` geeft een fout bij letterlijke tekst
  in JSX, ook in `aria-label`, `title`, `alt` en `placeholder`. Stories en tests vallen
  erbuiten.
- **Een test controleert het tijdens het draaien.** De test rendert de pagina met een
  vertaling waarin elke tekst met `[x]` begint. Staat er tekst zonder `[x]` op de pagina,
  dan faalt de test.
- **`<html lang="nl">`** staat in `index.html` en wordt bij het starten gezet vanuit
  i18next.
- **Geen tweede taal.** Komt die er toch, dan is het een extra JSON-bestand en een
  taalkeuze. De rest van de code hoeft niet te veranderen.

## Gevolgen

**Wat het oplevert**

- Alle tekst staat op één plek. Een tekstwijziging raakt geen code.
- De handleidingen en de app gebruiken dezelfde bron voor knopteksten.
- Hardcoded tekst valt op in lint en in de test, niet pas bij een review.

**Wat het kost**

- Een library (i18next en react-i18next) voor één taal.
- Elke tekst heeft een sleutel nodig. Dat is iets meer typewerk.
- Tests zoeken knoppen en velden via de tekst uit `nl.json`, niet via een letterlijke
  string.

## Risico's

| Risico | Maatregel |
|---|---|
| Tekst in een attribuut of plek die de lint-regel niet controleert | De `[x]`-test vindt elke zichtbare tekst en elk `aria-label` zonder vertaling, ook als lint het mist. |
| Iemand zet `eslint-disable` om de regel te omzeilen | Elke `eslint-disable` heeft een uitleg nodig, en valt op in de review. |
| Een sleutel ontbreekt in `nl.json`, en de gebruiker ziet de sleutelnaam | Tests gebruiken dezelfde sleutels. Een ontbrekende sleutel geeft een fout in de test-helper. |
| De handleiding noemt een knoptekst die niet meer bestaat | Elke change die een scherm wijzigt, werkt de handleiding bij (ADR-0001, afspraak 7). |
| De test met `[x]` wordt vergeten bij nieuwe pagina's | De test rendert via de echte routes. Nieuwe pagina's voegen we toe aan dezelfde test. |

## Controle

- `pnpm lint` faalt bij letterlijke tekst in JSX.
- De test `page-shell: Interface text from translation files` › `text in the page frame is translated` slaagt.
- De test `quality-gates: No hard-coded interface text` bewijst dat de lint-regel werkt.

## Overwogen alternatieven

- **Teksten als constanten in één TypeScript-bestand.** Geen library nodig. Maar er is
  geen lint-regel die het afdwingt, en geen vaste manier om foutcodes en variabelen in
  tekst te verwerken.
- **Geen regel, tekst gewoon in de JSX.** Het snelst om te bouwen. Maar de tekst raakt
  verspreid, en handleidingen en app lopen uit elkaar.
- **Nederlands en Engels.** Laat i18n echt in actie zien, maar kost een extra change en
  onderhoud van twee vertalingen. Geen enkele eis vraagt erom.

## Herzien als

- Er een tweede taal nodig is. Dan komen er een taalkeuze en een tweede JSON-bestand.
- Een contentbeheerder teksten wil aanpassen zonder de code te raken. Dan kan `nl.json`
  uit een CMS komen.
