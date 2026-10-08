---
title: "ADR-0006: Hono voor de API, met een getypeerde client"
date: 2026-10-02
status: geaccepteerd
---

# ADR-0006: Hono voor de API, met een getypeerde client

## Context

De webapp roept de API aan. Zonder afspraak schrijf je in de webapp zelf de URL's en de
vorm van de antwoorden. Verandert de API, dan merk je dat pas als de app draait, of
erger: als een gebruiker het merkt.

We keken naar twee frameworks voor de API: Fastify en Hono. Beide zijn klein, snel en
goed te testen zonder server. Het verschil zit in wat ze meeleveren.

Eerst leek Fastify de betere keuze, omdat logging met het weglakken van credentials daar
al ingebouwd is. Bij het bouwen bleek dat met Hono ongeveer 20 regels te kosten: pino
plus een kleine middleware. Dat nadeel was dus kleiner dan gedacht. De getypeerde client
van Hono levert daarentegen iets op wat Fastify niet heeft, en wat we met een test kunnen
bewijzen.

Dit is ook een portfolioproject van een frontend developer. Een getypeerde koppeling
tussen webapp en API laat zien dat de grens tussen frontend en backend bewaakt wordt met
types. Dat past beter bij het doel dan een backendframework dat vooral in grote
Node-backends wordt gebruikt.

## Besluit

- **De API gebruikt Hono.** Op Node draait hij via `@hono/node-server`.
- **De webapp gebruikt de getypeerde client van Hono** (`hc`), in
  `apps/web/src/api/client.ts`. Die kent alle routes, invoer en antwoorden van de API.
- **De webapp importeert alleen het type** (`import type { AppType }`). Er komt geen
  API-code in de browser.
- **Routes worden aan elkaar geschakeld** (`app.get(...).get(...)`). Alleen dan komen ze
  in `AppType` terecht.
- **Logging met pino**, omdat Hono geen gestructureerde logger heeft. Eén regel per
  request, met `authorization` en `cookie` weggelakt.
- **Tests** roepen de app aan met `app.request()` of met de getypeerde testclient. Er
  draait geen server.

## Gevolgen

**Wat het oplevert**

- Verandert een route of antwoord in de API, dan faalt de typecheck van de webapp. Je
  ziet het vóórdat iets draait.
- De webapp heeft geen losse URL's en geen zelfgeschreven types voor antwoorden.
- Een reviewer ziet in één bestand hoe web en API aan elkaar vastzitten.

**Wat het kost**

- Pino moet er apart bij, met een eigen middleware voor de request-log.
- Routes moeten geschakeld blijven. Een losse `app.get(...)` werkt wel, maar valt buiten
  de types.
- De webapp heeft de API als dev-dependency nodig, alleen voor het type.

## Risico's

| Risico | Maatregel |
|---|---|
| Een route wordt los geschreven en valt buiten `AppType` | De regel staat in `CLAUDE.md`. Een route die de webapp gebruikt maar niet in `AppType` staat, geeft een typefout in de webapp. |
| Types zeggen niets over wat er echt binnenkomt | Waar het telt, controleert de webapp het antwoord ook met het Zod-schema uit `packages/schema`. |
| Bij veel routes wordt de typecheck traag | Het project heeft maar een paar routes. Wordt het traag, dan kunnen routes per onderdeel een eigen client krijgen. |
| Hono is jonger dan Fastify, met minder kant-en-klare uitbreidingen | We gebruiken alleen de kern, de Node-adapter en straks de Zod-validator. Die zijn stabiel en worden actief onderhouden. |
| API-code belandt toch in de browser-bundel | Alleen `import type` uit `@evenementenloket/api`. De build is gecontroleerd op API-code. |
| Pino-redactie mist een nieuw gevoelig veld | Nieuwe gevoelige headers of velden komen in de `redact`-lijst, en de test voor logs wordt uitgebreid. |

## Controle

- De typetest `typed API client` › `health response type comes from the API` in
  `apps/web` faalt als het antwoord van de API verandert. Dat is getest door het antwoord
  tijdelijk te wijzigen.
- De test `api-operations: Health check` › `health check responds` roept de API aan via de
  getypeerde testclient.
- `pnpm typecheck` controleert web en API samen.

## Overwogen alternatieven

- **Fastify.** Volwassen en veel gebruikt, met pino en redactie ingebouwd. Maar geen
  getypeerde client. Die moet je zelf maken of met een extra tool genereren. De sterke
  punten van Fastify (een groot ecosysteem met plugins, ingebouwde validatie en
  serialisatie) tellen vooral bij een grote API met veel routes en teams. Hier gaat het om
  ongeveer zes routes. Fastify zou de betere keuze zijn als de API zelfstandig meerdere
  clients moet bedienen, of als het project vooral backendwerk moet laten zien.
- **Fastify met een gegenereerde client** (OpenAPI). Werkt, maar voegt een
  generatiestap en een OpenAPI-specificatie toe. Te veel voor een paar routes.
- **tRPC.** Heel sterke typekoppeling, maar dan is het geen gewone REST-API meer. De API
  moet ook zonder deze webapp te begrijpen zijn.
- **Geen client, `fetch` met eigen types.** Het eenvoudigst, maar types en API lopen
  ongemerkt uit elkaar.

## Herzien als

- Er een andere client komt die de API gebruikt, zoals een mobiele app. Dan is een
  OpenAPI-specificatie nodig, en die kan Hono ook leveren.
- De typecheck merkbaar traag wordt door het aantal routes.
