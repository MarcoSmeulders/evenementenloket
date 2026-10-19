# @evenementenloket/schema

De gedeelde regels en types van het evenementenloket. De webapp en de API gebruiken
allebei deze package. Zo controleren ze een melding met precies dezelfde regels, en
hebben ze dezelfde types (ADR-0003).

Er is geen build-stap. De apps importeren de TypeScript-bestanden direct, altijd via de
naam van de package:

```ts
import { organiserSchema, type DraftResponse } from "@evenementenloket/schema";
```

Importeer dus nooit een bestand diep uit `src/`. Wat buiten deze package nodig is, staat in
`src/index.ts`.

## Hoe de import werkt

`@evenementenloket/schema` is geen alias, maar een gewone packagenaam die pnpm naar deze
map laat wijzen:

1. **De naam** staat in `package.json` van deze package. `@evenementenloket` is een
   eigen scope, geen organisatie op npmjs.com. Door `"private": true` kan de package niet
   gepubliceerd worden.
2. **De workspace:** `pnpm-workspace.yaml` in de hoofdmap neemt alles onder `apps/*` en
   `packages/*` op.
3. **De dependency:** de apps vragen `"@evenementenloket/schema": "workspace:*"`. Dat
   betekent: neem de package uit deze workspace, niet uit het register.
4. **De link:** `pnpm install` maakt een symlink in `node_modules` van elke app naar deze
   map. Een import vindt de package dus zoals elke andere package.

`"exports": { ".": "./src/index.ts" }` wijst direct naar de TypeScript-bron, zonder
`dist/`. TypeScript (`moduleResolution: "bundler"`), Vite, Vitest, `tsx` en esbuild kunnen
dat lezen. Omdat alleen `"."` is vrijgegeven, werkt een diepe import zoals
`@evenementenloket/schema/src/api/draft` niet. Zo blijft `src/index.ts` de enige ingang.

## Indeling

```
src/
  api/              wat tussen web en API over de lijn gaat
    draft.ts        token, id, stapnamen, het opslagverzoek en de antwoorden
    fieldError.ts   veldfouten als codes, en makeFieldErrors
    problemDetail.ts  foutantwoorden (RFC 9457)
    health.ts       antwoord van de health check
  domain/           wat een geldige melding is
    organiser.ts    stap 1: de organisator
    event.ts        stap 2: het evenement
    fieldUtils.ts   bouwstenen voor velden (tekst, keuze, verplicht of niet)
    testUtils.ts    alleen voor de tests
  dateTimeUtils.ts  datum en tijd in Kranswijk (zomer- en wintertijd)
  index.ts          alles wat de apps mogen gebruiken
```

- **`api/`** beschrijft de vorm van verzoeken en antwoorden. Het mag `domain/` importeren.
- **`domain/`** beschrijft de gegevens en de regels van een melding, los van het scherm
  en van HTTP. Het importeert niets uit `api/`, behalve de testhulp.
- **In de hoofdmap** staan gewone functies, zonder schema's, die beide mappen gebruiken.

## Afspraken

- **Types komen uit het schema** (`z.infer`), nooit met de hand geschreven. Een schema
  heet `xxxSchema` en zijn type `Xxx`.
- **IDs en het token zijn branded.** Een gewone `string` wordt pas een `AccessToken` als
  hij door het schema is gecontroleerd.
- **Fouten zijn codes, geen tekst.** Elke regel geeft een code uit `FIELD_ERROR_CODES`,
  zoals `required` of `end_before_start`. De webapp vertaalt die code in `nl.json`
  (ADR-0005). Er staat dus geen Nederlandse foutmelding in deze package.
- **Elke stap heeft twee schema's:**
  - het concept (`organiserDraftSchema`): niets is verplicht, maar wat is ingevuld moet
    de goede vorm hebben. Dit hoort bij "Opslaan en later verdergaan";
  - het complete schema (`organiserSchema`): ook de verplichte velden en de regels tussen
    velden. Dit hoort bij "Opslaan en verder", en bepaalt of een stap af is.
- **Regels die van de tijd afhangen, krijgen de tijd mee.** `makeEventSchema(now)`
  controleert "begin in de toekomst" ten opzichte van `now`. Zo kan een test een vaste tijd
  gebruiken.
- **Namen van bestanden:** camelCase. Een bestand met schema's heet naar zijn onderwerp,
  in het enkelvoud. `Utils` is alleen voor bestanden met hulpfuncties zonder eigen
  schema's. De volledige stijlregels staan in `.claude/rules/loket-schema.md` en
  `loket-typescript.md`.

## Een veld toevoegen aan een stap

1. Voeg het veld toe aan het concept en aan het complete schema in `domain/`. Gebruik een
   bouwsteen uit `fieldUtils.ts`.
2. Heeft het veld een nieuwe soort fout, voeg dan een code toe aan `FIELD_ERROR_CODES` en
   de tekst in `apps/web/src/i18n/nl.json`.
3. Schrijf de test naast het schema (`event.test.ts`). Hoort de regel bij een scenario,
   dan heet de test zoals het scenario (ADR-0001).
4. Draai `pnpm lint && pnpm typecheck && pnpm test`. De typecheck laat zien waar de web-
   en API-code het nieuwe veld nog missen.

## Tests

`pnpm test` in de hoofdmap draait ook deze tests. Ze hebben geen browser, server of
netwerk nodig.
