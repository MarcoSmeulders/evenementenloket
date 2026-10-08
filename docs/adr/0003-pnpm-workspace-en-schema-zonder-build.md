---
title: "ADR-0003: pnpm-workspace, met een schema-package zonder buildstap"
date: 2026-10-02
status: geaccepteerd
---

# ADR-0003: pnpm-workspace, met een schema-package zonder buildstap

## Context

De webapp en de API moeten dezelfde regels gebruiken: welke velden er zijn, welke
waarden mogen, welke statussen bestaan. Als beide kanten die regels zelf schrijven,
lopen ze uit elkaar. Een fout zie je dan pas als de app echt draait.

## Besluit

We gebruiken één repository met een **pnpm-workspace**:

```
apps/web         React-app en Storybook
apps/api         Hono-API
packages/schema  Zod-schema's en types, gebruikt door web en API
```

- **De regels staan één keer in `packages/schema`.** Types maken we met `z.infer`,
  nooit met de hand.
- **Het schema-package heeft geen buildstap.** In `package.json` wijst `exports` direct
  naar `src/index.ts`. Vite, Vitest en `tsx` lezen TypeScript zelf.
- **De API wordt voor productie gebundeld** met esbuild tot één JavaScript-bestand. Het
  schema zit daarin. Node hoeft dus geen `.ts` te laden.

## Gevolgen

**Wat het oplevert**

- Pas je een regel aan, dan zien web en API dat meteen. Er is geen `dist/` die
  achterloopt.
- Breekt een wijziging de andere kant, dan faalt de typecheck. Je ziet het vóór de app
  draait.
- Eén `pnpm install`, één lockfile, één CI-run.

**Wat het kost**

- De API heeft een bundelstap nodig voor productie.
- Elke tool die het schema leest, moet TypeScript aankunnen.

## Risico's

| Risico | Maatregel |
|---|---|
| Een tool kan de `.ts`-export niet lezen | Terugvaloptie: het package alsnog naar `dist/` bouwen (JavaScript plus types). Dat is een kleine wijziging in één package. |
| De gebundelde API mist een dependency in productie | Het buildscript houdt alleen workspace-packages binnen de bundel. Alle andere dependencies moeten in `apps/api/package.json` staan, en pnpm dwingt dat af. |
| Iemand schrijft toch een type met de hand naast het schema | `CLAUDE.md` legt de regel vast. In reviews let je op types die niet uit `z.infer` komen. |
| Het schema-package groeit uit tot een verzamelbak | Alleen regels die web én API nodig hebben, horen erin. Wat één kant gebruikt, blijft daar. |

## Controle

- `pnpm typecheck` controleert web, API en schema samen.
- `pnpm build` bouwt de API. De gebouwde versie start met `pnpm --filter @evenementenloket/api start`.

## Overwogen alternatieven

- **Twee losse repositories** voor web en API. Dan moet het schema een gepubliceerd
  package worden, met versies. Te veel gedoe voor één project.
- **Schema-package met buildstap** (`dist/`). Werkt overal, maar je moet bouwen of een
  watcher draaien voordat een wijziging zichtbaar is. Zolang alleen deze repository het
  package gebruikt, levert dat niets op.
- **Geen gedeeld package, types kopiëren.** Snel om te beginnen, maar de twee kanten
  lopen gegarandeerd uit elkaar.

## Herzien als

- Een tweede repository het schema wil gebruiken. Dan wordt het een gebouwd en
  gepubliceerd package.
- Een tool in de keten de `.ts`-export niet ondersteunt.
