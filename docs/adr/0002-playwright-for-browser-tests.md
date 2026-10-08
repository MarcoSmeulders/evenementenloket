---
title: "ADR-0002: Playwright voor browsertests, gescheiden van unit-tests"
date: 2026-10-01
status: geaccepteerd
---

# ADR-0002: Playwright voor browsertests, gescheiden van unit-tests

> **Aangevuld door [ADR-0007](0007-branches-main-en-develop.md):** de browsertests draaien
> ook bij elke push naar `develop`, en wijzigingen komen via `develop` op `main`.

## Context

Veel van wat dit project moet laten zien, werkt alleen in een echte browser. Denk aan
focus die naar een foutmelding gaat, de hele flow met alleen het toetsenbord, zichtbare
focus, kleurcontrast en de paginatitel. Volgens ADR-0001 krijgt elk scenario een test.
Veel van die tests moeten dus in een browser draaien.

Er zijn twee soorten tests:

- **Unit-tests** zijn klaar in seconden. Ze hebben geen server of browser nodig. Die
  willen we vaak draaien.
- **Browsertests** starten de app en de API en besturen een echte browser. Dat duurt
  minuten. Die willen we niet bij elke push draaien.

We keken naar Selenium, Cypress en Playwright. Met alle drie is ervaring.

## Besluit

### Playwright

Browsertests gebruiken **Playwright** met **`@axe-core/playwright`**. Waarom:

1. **Het zoekt elementen zoals een schermlezer.** `getByRole` en `getByLabel` vinden een
   knop via zijn naam. Heeft de knop geen toegankelijke naam, dan faalt de test. De test
   controleert dus ook toegankelijkheid. Bij Selenium zoek je meestal op ID of CSS, en
   dan merk je dat niet.
2. **Toetsenbord en focus werken echt.** `toBeFocused()` en `keyboard.press('Tab')`
   gebruiken echte invoer. Playwright wacht zelf tot een element klaar is, dus je hoeft
   geen wachttijden in te bouwen. Cypress doet toetsenbordinvoer standaard na, en dat is
   zwakker bewijs.
3. **Drie browsers.** Chromium, Firefox en WebKit. WebKit gedraagt zich als Safari. Dat
   helpt bij het testen met VoiceOver.
4. **Het start alles zelf.** Playwright start de app en de API. Elke test begint schoon.
5. **Fouten in CI zijn te onderzoeken.** Faalt een test, dan krijg je per stap een
   momentopname van de pagina, het netwerk en de console.

axe draait mee als extra controle. Het bewijs voor een scenario komt van de eigen
controles in de test (ADR-0001).

### Unit-tests en browsertests apart

| | Unit-tests | Browsertests |
|---|---|---|
| Commando | `pnpm test` (of `pnpm test:watch`) | `pnpm test:e2e` |
| Bestanden | `*.test.ts(x)` naast de code | `e2e/**/*.spec.ts` |
| Tools | Vitest, Testing Library, `app.request()` van Hono | Playwright, `@axe-core/playwright` |
| Nodig | Niets. Database in het geheugen. | Start zelf app en API |
| Lokaal | Wanneer je wilt | Alleen als je ze zelf start |
| CI | `ci.yml`: bij elke push en pull request | `e2e.yml`: via de knop, bij elke push naar `develop` en bij een pull request naar `main` |

- Vitest kijkt nooit in `e2e/`. Playwright kijkt alleen in `e2e/`.
- `ci.yml` doet lint, typecheck, unit-tests en build. Je weet dus snel of een push goed is.
- `e2e.yml` is een aparte workflow. Hij draait bij elke push naar `develop` en bij elke pull
  request naar `main`. Zo komt er niets ongetest in `main`.
- Faalt een browsertest, dan bewaart CI het rapport om te downloaden.
- Geen van beide workflows heeft wachtwoorden of sleutels nodig.
- In de instellingen van GitHub stellen we in dat mergen naar `main` pas kan als beide
  workflows groen zijn.

## Gevolgen

**Wat het oplevert**

- Browsertests controleren ook namen, focus en toetsenbord. Dat bewijst de
  toegankelijkheidsscenario's uit ADR-0001.
- Unit-tests blijven snel, dus je draait ze vaak.
- Wijzigingen gaan via `develop` en een pull request naar `main` (ADR-0007). De checks laten
  zien hoe er gewerkt wordt.

**Wat het kost**

- Browsers installeren is de traagste stap in CI. Een run duurt een paar minuten.
- Het cv noemt Cypress en Selenium, niet Playwright. Deze ADR legt uit waarom het hier
  toch Playwright is.

## Risico's

| Risico | Maatregel |
|---|---|
| Een push breekt een browsertest, en je merkt het pas later | De pull request naar `main` draait de browsertests altijd. Branch protection blokkeert mergen bij rood. |
| Browsertests falen af en toe zonder echte fout (flaky) | Playwright wacht zelf op elementen. In CI één herhaling, en de trace laat zien wat er gebeurde. Een flaky test lossen we op, we zetten hem niet uit. |
| Branch protection staat niet aan, en de afspraak geldt alleen op papier | Het instellen is een taak in de eerste change. Je controleert het met een test-pull-request die rood is. |
| De CI-run wordt te traag door drie browsers | Er zijn nu weinig tests. Wordt het te traag, dan draait WebKit alleen nog bij een pull request. |
| Een update van Playwright verandert gedrag | Dependabot opent er een pull request voor, en de browsertests draaien daarop. |

## Controle

- `ci.yml` en `e2e.yml` staan als verplichte checks op `main`.
- `pnpm test` draait zonder server. Probeer het met niets anders aan.
- De bestandsnamen volgen de tabel: `*.test.ts(x)` of `e2e/**/*.spec.ts`.

## Overwogen alternatieven

- **Cypress.** Bekend, met een fijne interactieve runner. Maar toetsenbordinvoer wordt
  nagedaan, WebKit werkt beperkt, en twee servers starten vraagt meer werk.
- **Selenium.** Bekend en volwassen. Maar je moet zelf wachttijden regelen, aparte
  drivers installeren, en het zoekt niet standaard via rol en naam.
- **Browsertests bij elke push.** Simpel, maar elke push wordt trager. De pull request
  naar `main` geeft al de zekerheid die we nodig hebben.
- **Alleen jest-axe.** Draait zonder echte browser, dus geen kleuren, focus of
  toetsenbord. Juist dat moet dit project laten zien. Per component controleren we
  tijdens het bouwen met de a11y-addon van Storybook.

## Herzien als

- Een browsertest-run langer duurt dan ongeveer 10 minuten.
- Er vaak fouten in `main` komen die een browsertest bij een push had gevonden.
