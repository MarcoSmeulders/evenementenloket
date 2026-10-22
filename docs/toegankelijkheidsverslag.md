---
title: "Toegankelijkheidsverslag — Evenementenloket Kranswijk"
status: levend document
---

# Toegankelijkheidsverslag

Hier staan de controles die niet volledig te automatiseren zijn. Volgens ADR-0001 krijgt
zo'n scenario de markering `Verification: manual`. De uitkomst komt hier, per change.

Automatische controles (axe, toetsenbordtests in Playwright) staan in de tests zelf en in
CI. Dit verslag gaat over wat daarbuiten valt.

## Change `bootstrap-project` — startpagina

### Scenario `page-shell: Visible focus` › `focus indicator is visible on every interactive element`

**Datum:** 8 oktober 2026
**Pagina:** startpagina (`/`), productiebuild, venster 1280 × 800
**Uitkomst:** geslaagd. De developer heeft deze controle met Playwright, in plaats van een
ronde met de hand, geaccepteerd als afronding van het scenario.

**Hoe getest**

- Met Playwright, in echte browser-engines: Chromium en Firefox lokaal, WebKit in het
  officiële Playwright-image (Ubuntu 24.04). Op Ubuntu 26.04 start WebKit lokaal niet; zie
  [issue #1](https://github.com/MarcoSmeulders/evenementenloket/issues/1).
- Vanaf het laden van de pagina steeds op Tab gedrukt, tot de focus weer bij een eerder
  element kwam.
- Per focusstop gemeten: de stijl, dikte en kleur van de focusring, het contrast met de
  achtergrond, of het element helemaal in beeld is, en of er niets overheen ligt (het
  element bovenop het middelpunt is het element zelf).
- Per focusstop een screenshot gemaakt en bekeken.

**Resultaat**

| Stop | Element | Focusring | Contrast | In beeld | Niet bedekt | Chromium | Firefox | WebKit |
|---|---|---|---|---|---|---|---|---|
| 1 | Skiplink "Naar de inhoud" | 3px doorgetrokken, 2px afstand, `#5a2ca0` | 9,1 : 1 | ja | ja | ✓ | ✓ | ✓ |
| 2 | Home-link "Evenementenloket Gemeente Kranswijk" | 3px doorgetrokken, 2px afstand, `#5a2ca0` | 9,1 : 1 | ja | ja | ✓ | ✓ | ✓ |

WCAG 2.4.7 (Focus Visible), 2.4.11 (Focus Not Obscured, Minimum) en 1.4.11 (Non-text
Contrast, minimaal 3 : 1) zijn voor deze pagina in orde.

Na het activeren van de skiplink krijgt `main` de focus, zonder zichtbare ring. Dat is
een bewuste keuze (bevinding F-03 in de
[UX-review](ux-reviews/ux-review_startpagina_2026-10-02.md)).

**Opmerking (cosmetisch, geen WCAG-fout)**

De focusring van de skiplink loopt over de volle breedte van de pagina. In plaats van een
ring om alleen de tekst zie je een brede balk. De paginaschil zet zijn onderdelen in een
flexbox die ze uitrekt. Oplossing: `align-self: flex-start` op `.skip-link:focus`. Dit
nemen we mee in de volgende change.

**Niet getest, en waarom**

- **Safari op macOS.** WebKit in Playwright gedraagt zich als Safari, maar is niet
  hetzelfde. In echte Safari gaat Tab standaard niet langs links. Dan moet je
  "Druk op Tab om elk onderdeel op een webpagina te markeren" aanzetten, of Option+Tab
  gebruiken.
- **Een mens achter het toetsenbord.** Playwright drukt echte toetsen in een echte
  browser, maar de beoordeling van de screenshots is gedaan door Claude, niet door een
  mens. Een korte ronde met de hand in je eigen browser bevestigt het.
- **Schermlezers** (NVDA met Firefox, VoiceOver met Safari) en hoog-contrastmodus in Windows.
  Die staan als open punt in de UX-review.

## Change `add-draft-application` — melding invullen

**Status:** nog uit te voeren. Deze controles moeten met de hand, met een echte schermlezer.
Zet per regel de datum, de uitkomst en eventuele bevindingen erbij.

Automatisch al gecontroleerd (Chromium en Firefox): axe op de linkpagina, stap 1 met fouten,
stap 2, de controlepagina en de pagina voor een ongeldige link; de hele flow met alleen het
toetsenbord; focus naar de kop bij een paginawissel en naar de foutsamenvatting na een fout.

| Scenario | Hoe testen | NVDA + Firefox | VoiceOver + Safari |
|---|---|---|---|
| `Link page offers ways to keep the link` › `screen reader hears the copy confirmation` | Op de linkpagina twee keer **Kopieer link** kiezen. Beide keren moet "De link is gekopieerd." klinken. | nog te doen | nog te doen |
| `Save a step to continue later` › `screen reader hears that the step was saved` | Stap 1 invullen, **Opslaan en later verdergaan**. Eerst moet "Stap 1 is opgeslagen, kop niveau 1" klinken. | nog te doen | nog te doen |
| `Character counter` › `screen reader hears the count after a pause` | In de beschrijving typen en stoppen. Het aantal tekens klinkt één keer, niet na elke letter. | nog te doen | nog te doen |
| `Keyboard and automated checks` › `focus indicator on the form pages` | Met Tab door de linkpagina, stap 1, stap 2 en de controlepagina. Elk element heeft een zichtbare focusring die nergens achter valt. | nog te doen | — |
