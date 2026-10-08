# Beslissingen (ADR's)

Een ADR (Architecture Decision Record) legt één beslissing vast: wat we kozen, waarom, en
wat het kost. Zo kun je later zien waarom iets zo is, ook als niemand het meer weet.

| Nr | Beslissing |
|---|---|
| [0001](0001-spec-driven-level-2-light.md) | Spec-driven development op trede 2, licht |
| [0002](0002-playwright-for-browser-tests.md) | Playwright voor browsertests, gescheiden van unit-tests |
| [0003](0003-pnpm-workspace-en-schema-zonder-build.md) | pnpm-workspace, met een schema-package zonder buildstap |
| [0004](0004-storybook-in-de-app-geen-design-system-package.md) | Storybook in de app, geen apart design-system-package |
| [0005](0005-i18n-alleen-nederlands-geen-hardcoded-tekst.md) | i18n met alleen Nederlands, en geen hardcoded tekst |
| [0006](0006-hono-met-getypeerde-client.md) | Hono voor de API, met een getypeerde client |
| [0007](0007-branches-main-en-develop.md) | Branches main en develop, met een beschermde main |

## Opbouw van een ADR

Elke ADR heeft dezelfde kopjes. De vorm is gebaseerd op het oorspronkelijke format van
Michael Nygard, aangevuld met "Controle" uit MADR en een aparte tabel met risico's.

```markdown
---
title: "ADR-NNNN: Korte titel van de beslissing"
date: JJJJ-MM-DD
status: voorgesteld | geaccepteerd | vervangen door ADR-NNNN
---

# ADR-NNNN: Korte titel van de beslissing

## Context
Wat is het probleem? Welke feiten bepalen de keuze?

## Besluit
Wat we doen. Kort en concreet.

## Gevolgen
**Wat het oplevert**
**Wat het kost**

## Risico's
| Risico | Maatregel |
|---|---|
| Wat kan er misgaan? | Wat doen we om dat te voorkomen of op te vangen? |

## Controle
Hoe zien we dat het besluit gevolgd wordt? Bij voorkeur een test, lint-regel of CI-stap.

## Overwogen alternatieven
Wat we niet kozen, en waarom niet.

## Herzien als
Wanneer we deze beslissing opnieuw bekijken.
```

Regels:

- Eén beslissing per ADR. Schrijf in het Nederlands, in korte zinnen.
- Een geaccepteerde ADR pas je niet inhoudelijk aan. Verandert de beslissing, schrijf dan
  een nieuwe ADR en zet bij de oude `status: vervangen door ADR-NNNN`.
