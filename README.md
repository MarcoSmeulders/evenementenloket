# Evenementenloket Kranswijk

[![CI](https://github.com/MarcoSmeulders/evenementenloket/actions/workflows/ci.yml/badge.svg)](https://github.com/MarcoSmeulders/evenementenloket/actions/workflows/ci.yml)
[![E2E](https://github.com/MarcoSmeulders/evenementenloket/actions/workflows/e2e.yml/badge.svg)](https://github.com/MarcoSmeulders/evenementenloket/actions/workflows/e2e.yml)

Een online loket waar organisatoren een klein evenement melden bij de gemeente. Ze vullen
een korte melding in, slaan die tussendoor op, dienen haar in en volgen de status. Een
behandelaar beoordeelt de melding, vraagt zo nodig om meer informatie en neemt een besluit.

**Gemeente Kranswijk bestaat niet.** Dit is een portfolioproject van
[Marco Smeulders](https://marcosmeulders.nl). Het laat zien hoe ik werk aan
toegankelijke formulieren, React en TypeScript, en een kleine API.

## Status

In opbouw. Klaar is de basis: de projectstructuur, de toegankelijke paginaschil, de API
met een health check, tests en CI. Het melden zelf volgt in de volgende stappen. Zie
[`openspec/changes/`](openspec/changes/) voor wat er nu gebouwd wordt.

## Wat je hier kunt zien

- **Toegankelijkheid in de spec, niet achteraf.** Eisen als "focus gaat naar de
  foutsamenvatting" staan in de spec voordat er code is, en een test bewijst ze.
- **Specs gekoppeld aan tests.** Elk scenario in `openspec/specs/` heeft precies één test
  met dezelfde naam ([ADR-0001](docs/adr/0001-spec-driven-level-2-light.md)).
- **Eén bron voor de regels.** Web en API gebruiken dezelfde Zod-schema's
  ([ADR-0003](docs/adr/0003-pnpm-workspace-en-schema-zonder-build.md)).
- **Een getypeerde client.** De webapp kent de routes en antwoorden van de API. Verandert
  de API, dan faalt de typecheck van de webapp
  ([ADR-0006](docs/adr/0006-hono-met-getypeerde-client.md)).
- **Geen tekst in de code.** Alle tekst staat in één bestand. Lint en een test dwingen
  dat af ([ADR-0005](docs/adr/0005-i18n-alleen-nederlands-geen-hardcoded-tekst.md)).

## Starten

Je hebt Node 24 en pnpm nodig.

```sh
pnpm install
openspec init --tools claude   # alleen als je met Claude Code en OpenSpec werkt
pnpm dev          # start de API (poort 3001) en de webapp (http://localhost:5173)
pnpm storybook    # componenten bekijken op http://localhost:6006
```

Instellingen voor de API staan in [`apps/api/.env.example`](apps/api/.env.example).
Alles heeft een standaardwaarde. Wil je iets aanpassen, kopieer het bestand dan naar
`apps/api/.env`.

## Testen

| Commando         | Wat het doet                                                                                    | Wanneer                                                                                          |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `pnpm test`      | Unit-tests (Vitest). Geen browser of server nodig.                                              | Vaak, of `pnpm test:watch`                                                                       |
| `pnpm test:e2e`  | Browsertests (Playwright + axe) in Chromium, Firefox en WebKit. Start zelf de API en de webapp. | Met de hand, of in CI bij elke push naar `develop`                                               |
| `pnpm lint`      | ESLint, met regels voor toegankelijkheid en tegen hardcoded tekst                               | Voor elke commit                                                                                 |
| `pnpm typecheck` | TypeScript-controle van alle onderdelen                                                         | Voor elke commit                                                                                 |
| `pnpm run audit` | Controleert de packages op bekende kwetsbaarheden (high en critical)                            | Bij elke push in CI, en in de update-routine ([ADR-0008](docs/adr/0008-eigen-update-routine.md)) |

De eerste keer heb je browsers nodig voor de browsertests: `pnpm exec playwright install`.

**WebKit op Ubuntu 26.04.** De WebKit-versie van Playwright 1.63 is gebouwd voor Ubuntu 24.04
en start niet op 26.04 (`libicudata.so.74` ontbreekt). Gebruik daar `pnpm test:e2e:local`:
dezelfde tests in Chromium en Firefox. CI is vastgezet op Ubuntu 24.04 en test altijd alle
drie de browsers. Zodra een Playwright-update WebKit op 26.04
ondersteunt, vervallen deze uitzondering en de vastgezette versie in CI
([issue #1](https://github.com/MarcoSmeulders/evenementenloket/issues/1)).

In CI draaien de snelle checks en de browsertests bij elke push naar `develop`, of als je ze
start via het tabblad Actions. Na een merge in `main` draaien de snelle checks nog één keer. De release-PR naar `main` gebruikt die uitslag en draait ze
niet opnieuw ([ADR-0002](docs/adr/0002-playwright-for-browser-tests.md),
[ADR-0007](docs/adr/0007-branches-main-en-develop.md)).

## Opbouw

```
apps/web         React-app (Vite, React Router, react-i18next) en Storybook
apps/api         Hono-API, met een getypeerde client voor de webapp
packages/schema  Zod-schema's en types, gedeeld door web en API
e2e/             Browsertests
docs/            ADR's, handleidingen en rapporten
openspec/        Specs en wijzigingen
```

## Documentatie

- [Beslissingen (ADR's)](docs/adr/)
- [Handleiding voor aanvragers](docs/handleiding/aanvrager.md) (concept)
- [Handleiding voor behandelaars](docs/handleiding/behandelaar.md) (concept)
- [Toegankelijkheidsverslag](docs/toegankelijkheidsverslag.md)
- [UX-reviews](docs/ux-reviews/)
- [Ideeën voor later](docs/ideeen.md)

## Werkwijze

Elke wijziging begint als voorstel in OpenSpec, met eisen en scenario's. Pas na review
wordt het gebouwd. Ik werk met Claude Code als assistent, met eigen skills en een eigen
reviewagent. De afspraken staan in [`CLAUDE.md`](CLAUDE.md), de eigen skills en de agent in
[`.claude/`](.claude/). Ik review en commit alles zelf.

**Branches.** Ik werk op `develop`. Op `main` staat de vrijgegeven versie. Die verandert
alleen via een pull request van `develop`, en pas als de checks en de browsertests groen
zijn. GitHub dwingt dat af ([ADR-0007](docs/adr/0007-branches-main-en-develop.md)).
