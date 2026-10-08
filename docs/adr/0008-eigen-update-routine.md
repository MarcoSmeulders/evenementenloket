---
title: "ADR-0008: Eigen update-routine en dependency-audit, geen Dependabot"
date: 2026-10-08
status: geaccepteerd
---

# ADR-0008: Eigen update-routine en dependency-audit, geen Dependabot

## Context

Packages moeten bijgewerkt worden, en een bekende kwetsbaarheid in een package moet je
op tijd zien. GitHub biedt daarvoor Dependabot. Die opent zelf pull requests met updates,
en draait daarvoor een eigen workflow in Actions.

In de praktijk gaf dat ruis. Pull requests werden gesloten en opnieuw geopend, er kwamen
voorstellen voor versies die niet bij het project passen (zoals `@types/node` 26 bij Node
24), en er draaiden runs die niets met het eigen werk te maken hadden. De wens is om alle
quality gates in eigen hand te houden.

## Besluit

- **Geen Dependabot-updates.** Er is geen `.github/dependabot.yml`, en de automatische
  security updates staan uit. De updates die Dependabot al had gedaan, zijn teruggedraaid.
- **Dependabot alerts blijven aan.** Dat is alleen een melding onder Security als een
  package een bekende kwetsbaarheid heeft. Er komen geen pull requests en geen runs van.
- **`pnpm run audit` in CI.** De snelle checks (`ci.yml`) draaien bij elke push
  `pnpm audit --audit-level high`. Zit er een kwetsbaarheid met ernst *high* of *critical*
  in de packages, dan wordt CI rood. *Low* en *moderate* tellen niet mee: die geven veel
  meldingen zonder echt risico voor dit project.
- **Een vaste update-routine.** Jij werkt de packages zelf bij, op `develop`.

Let op: start de audit altijd met `pnpm run audit`. Het kale `pnpm audit` is een ingebouwd
commando van pnpm. Dat negeert het script, en daarmee het niveau *high*.

### De update-routine

Elke maand, of eerder als er een alert binnenkomt:

1. **Kijken wat er is:** `pnpm outdated -r`.
2. **Kleine updates:** `pnpm update -r`. Dat blijft binnen de versiebereiken in de
   `package.json`-bestanden.
3. **Grote updates (major) apart en bewust**, één voor één, na het lezen van de release
   notes. `@types/node` blijft op dezelfde hoofdversie als Node, nu 24 (LTS).
4. **De rest nalopen:** de versies van de actions in `.github/workflows/` (`uses: …@vN`)
   en de gitleaks-image in `ci.yml`.
5. **Lokaal alle gates draaien:**
   `pnpm lint && pnpm typecheck && pnpm test && pnpm run audit && pnpm test:e2e:local`.
6. **Committen en pushen naar `develop`.** CI en de browsertests draaien daar. Daarna gaat
   het met de volgende release naar `main`.

Een update van Playwright is ook het moment om te proberen of de vaste Ubuntu-versie weg
kan ([issue #1](https://github.com/MarcoSmeulders/evenementenloket/issues/1)).

## Gevolgen

**Wat het oplevert**

- Geen pull requests en runs die je niet zelf hebt gestart.
- Elke update is een bewuste keuze, getest op `develop` voordat hij op `main` komt.
- Een kwetsbaar package houdt CI tegen, ook zonder bot.

**Wat het kost**

- Je moet de updates zelf doen en eraan denken.
- Er is geen automatische pull request die laat zien wat er nieuw is.

## Risico's

| Risico | Maatregel |
|---|---|
| Updates blijven liggen | De vaste maand-routine. Een alert onder Security is een extra seintje. |
| Er wordt een kwetsbaarheid bekend terwijl er niet gepusht wordt | De alert meldt het. De eerstvolgende push faalt op de audit, en dan los je het op. |
| De audit faalt door een storing bij de npm-registry | Start de run opnieuw. Faalt hij dan nog, kijk dan op de statuspagina van npm. |
| Een *moderate*-melding blijkt toch belangrijk | De alerts tonen ook *moderate*. Neem die mee in de maand-routine. |

## Controle

- `ci.yml` bevat de stap `pnpm run audit`, en die is groen.
- `.github/dependabot.yml` bestaat niet.
- `gh api repos/MarcoSmeulders/evenementenloket/automated-security-fixes` geeft
  `"enabled": false`.
- `gh api repos/MarcoSmeulders/evenementenloket/vulnerability-alerts` geeft status 204,
  dus de alerts staan aan.

## Overwogen alternatieven

- **Dependabot houden.** Automatisch en gratis, maar het gaf ruis en eigen runs.
- **Renovate.** Beter in te stellen dan Dependabot, maar ook een bot die pull requests
  opent. Dat is precies wat we niet willen.
- **Alleen de alerts, zonder audit in CI.** Je ziet het probleem dan wel, maar niets houdt
  een kwetsbaar package tegen op weg naar `main`.

## Herzien als

- Updates in de praktijk maanden blijven liggen.
- Er meer developers bijkomen, en de updates dan beter automatisch voorgesteld kunnen worden.
