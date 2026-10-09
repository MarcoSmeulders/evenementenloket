---
title: "Roadmap — Evenementenloket Kranswijk"
status: levend document
---

# Roadmap

Dit is de volgorde waarin het loket gebouwd wordt. Elke stap is een OpenSpec-change: eerst
een voorstel met eisen en scenario's, dan review, dan bouwen, dan archiveren. Er loopt
steeds maar één change tegelijk.

De volgorde ligt vast. De inhoud per change is een startpunt: de details komen in het
voorstel van die change. Wijkt een voorstel af van deze roadmap, dan passen we de roadmap
aan.

## Overzicht

| #   | Change                     | Wat je daarna kunt                                                                                       | Status            |
| --- | -------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | `bootstrap-project`        | Basis: paginaframe, API met health check, tests en CI                                                    | klaar (8 okt 2026) |
| 2   | `add-draft-application`    | Een melding starten, de persoonlijke link krijgen, stap 1 en 2 invullen en opslaan, later verdergaan     | volgende          |
| 3   | `add-review-and-submit`    | Antwoorden controleren en wijzigen, de melding indienen, een referentienummer en een statuspagina krijgen | gepland           |
| 4   | `add-handler-workspace`    | Als behandelaar inloggen (demo), meldingen zoeken en openen, de behandeling starten                      | gepland           |
| 5   | `add-information-request`  | Als behandelaar een vraag stellen, als aanvrager antwoorden                                              | gepland           |
| 6   | `add-decision`             | Als behandelaar goedkeuren of afwijzen met een toelichting, als aanvrager het besluit lezen              | gepland           |
| 7   | `add-demo-deployment`      | Het loket online als demo, met voorbeeldmeldingen die dagelijks terugkomen                               | gepland           |
| –   | `add-english-language`     | Vervallen: het loket is alleen Nederlands ([ADR-0005](adr/0005-i18n-alleen-nederlands-geen-hardcoded-tekst.md)) | vervallen         |
| –   | `add-accessibility-report` | Opgegaan in het [toegankelijkheidsverslag](toegankelijkheidsverslag.md), dat bij elke change groeit      | vervallen         |

De schermen staan beschreven in de handleidingen voor
[aanvragers](handleiding/aanvrager.md) en [behandelaars](handleiding/behandelaar.md). Die
zijn geschreven vóór de bouw. Elke change die een scherm verandert, werkt ze bij.

## 2. `add-draft-application` — concept invullen

**Doel:** een organisator start een melding, vult de twee stappen in en kan later verder.

Het voorstel staat in
[`openspec/changes/add-draft-application/`](../openspec/changes/add-draft-application/).
De manier waarop de link getoond wordt, is eerst als
[prototype](prototypes/persoonlijke-link-interactive.html) uitgeprobeerd en
[gereviewd](ux-reviews/ux-review_prototype-persoonlijke-link-a_2026-10-09.md).

Wat erin zit:

- Startpagina met wat je nodig hebt en de knop **Start melding**. Die maakt een concept aan.
- **Persoonlijke link.** De link bevat een geheime sleutel van 32 willekeurige bytes. De
  database bewaart alleen een hash (SHA-256). De sleutel staat in het adres van de webapp,
  maar gaat als header naar de API, dus niet in de logs van de API. Pagina's sturen geen
  `Referer` mee en worden niet geïndexeerd.
- **Linkpagina** na de start en na "Opslaan en later verdergaan", met drie manieren om de
  link te bewaren: kopiëren, naar jezelf mailen en een bladwijzer. Elk adres met een geldige
  sleutel opent het concept.
- Stap 1 **Organisator** en stap 2 **Evenement**, met het datum- en tijdveld van de browser.
- **Opslaan en verder** slaat alleen een complete stap op. **Opslaan en later verdergaan**
  slaat ook een deels ingevulde stap op, als het ingevulde formaat klopt.
- Een foutsamenvatting die de focus krijgt. Fouten veranderen alleen bij verzenden.
- **Verdergaan via de link:** naar de eerste stap die nog niet af is.
- Een **controlepagina, alleen lezen**. Wijzigen en indienen komen in change 3.
- Een link **Vorige stap**, en bij elke paginawissel gaat de focus naar de kop.
- Opslag in SQLite via `node:sqlite`, met JSON per stap.

Niet in deze change: de links "Wijzig", het indienen en het referentienummer (change 3).
Een prototype met losse velden voor dag, maand en jaar blijft een idee voor de casuspagina.

## 3. `add-review-and-submit` — controleren en indienen

**Doel:** de aanvrager controleert alles en dient de melding in.

- Een controlepagina met alle antwoorden per onderdeel en een link **Wijzig**. Na het
  opslaan kom je terug op de controlepagina. Niets hoeft dubbel ingevuld te worden (WCAG
  3.3.7).
- De API controleert de hele melding en zet de status van concept naar ingediend.
- Pas bij het indienen krijgt de melding een referentienummer (zoals `EVT-2026-0042`). Zo
  blijft de reeks doorlopend, zonder gaten van concepten die nooit zijn ingediend.
- Een bevestiging met het referentienummer, de link naar de status en wat er nu gebeurt.
- Na het indienen kan niemand de antwoorden nog wijzigen. Probeert iemand het toch, dan
  antwoordt de API met 409.
- Een eenvoudige statuspagina.
- De regels voor statusovergangen staan één keer in `packages/schema`. De API dwingt ze af.
  De webapp gebruikt ze om te bepalen welke knoppen zichtbaar zijn.

## 4. `add-handler-workspace` — werkplek voor behandelaars

**Doel:** een behandelaar ziet de ingediende meldingen en start de behandeling.

- Een demo-login zonder wachtwoord, op elke pagina duidelijk gemarkeerd als demo. Echt
  inloggen valt buiten het project.
- De sessie loopt via een ondertekende cookie. De sleutel daarvoor is het eerste echte
  geheim: verplicht in productie, willekeurig per start in ontwikkeling.
- Zonder sessie antwoordt de API met 401.
- Een lijst met meldingen (zonder concepten), te filteren op status. Het filter staat in
  het adres. Het aantal resultaten wordt voorgelezen.
- Een detailpagina met de melding en de tijdlijn.
- **Behandeling starten**. Een overgang die niet mag, geeft 409 en verandert niets.

Open beslissing: wat er gebeurt als twee behandelaars tegelijk dezelfde melding wijzigen.
Voorstel uit het oorspronkelijke plan: een versiecontrole die 409 geeft bij verouderde
gegevens.

## 5. `add-information-request` — aanvullende informatie

**Doel:** de behandelaar stelt een vraag en de aanvrager antwoordt.

- De behandelaar stelt een vraag (verplicht, maximaal 1.000 tekens) bij een melding die in
  behandeling is.
- De aanvrager ziet de vraag op de statuspagina en antwoordt met tekst (maximaal 2.000
  tekens). De melding gaat terug naar in behandeling.
- Vraag en antwoord staan in de tijdlijn, voor beide kanten.
- De antwoorden in de melding zelf blijven op slot.

## 6. `add-decision` — besluit

**Doel:** de behandelaar neemt een besluit en de aanvrager leest het.

- Goedkeuren of afwijzen, met een verplichte toelichting (maximaal 2.000 tekens).
- De statuspagina van de aanvrager toont het besluit en de toelichting bovenaan, met de
  volledige tijdlijn eronder.

## 7. `add-demo-deployment` — online demo

**Doel:** het loket draait als openbare demo.

- Dockerfiles en docker-compose. Docker hoeft eerst alleen lokaal te werken.
- Een banner die vraagt geen echte gegevens in te vullen.
- Voorbeeldmeldingen in elke status, minstens één keer per dag teruggezet.
- Security headers.

- De webserver logt geen paden onder `/aanvraag/`, want daar staat de persoonlijke link in.
- Een grens aan het aantal concepten dat iemand kan aanmaken.

Open beslissingen: waar de demo draait, en hoe lang een concept bewaard blijft. De
configuratie van de eigen servers komt niet in deze repository.

## Afwijkingen van het oorspronkelijke plan

Het plan van 1 oktober 2026 is het startpunt. Dit is sindsdien anders besloten:

| Oorspronkelijk plan                         | Nu                                                                  | ADR                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Fastify voor de API                         | Hono, met een getypeerde client voor de webapp                      | [ADR-0006](adr/0006-hono-met-getypeerde-client.md)                                                        |
| Nederlands en Engels                        | Alleen Nederlands                                                   | [ADR-0005](adr/0005-i18n-alleen-nederlands-geen-hardcoded-tekst.md)                                       |
| Dependabot                                  | Eigen update-routine met een audit in CI                            | [ADR-0008](adr/0008-eigen-update-routine.md)                                                              |
| CI bij elke push en pull request            | Bij elke push naar `develop`; de release-PR hergebruikt de uitslag | [ADR-0002](adr/0002-playwright-for-browser-tests.md), [ADR-0007](adr/0007-branches-main-en-develop.md) |
| `pnpm test:browser`                         | `pnpm test:e2e`                                                     | [ADR-0002](adr/0002-playwright-for-browser-tests.md)                                                      |
| ADR's en documentatie in het Engels         | In het Nederlands; code en OpenSpec in het Engels                   | —                                                                                                         |
| Een aparte change voor het toegankelijkheidsverslag | Het verslag groeit bij elke change                          | [ADR-0001](adr/0001-spec-driven-level-2-light.md)                                                         |
| Drie mogelijke namen voor de gemeente       | Gemeente Kranswijk                                                  | —                                                                                                         |
| SQLite met `better-sqlite3`                 | `node:sqlite`, ingebouwd in Node 24: geen extra dependency          | ADR-0010 (change 2)                                                                                       |
| Referentienummer bij het aanmaken           | Bij het indienen (change 3)                                         | —                                                                                                         |
| Een stap met fouten wordt niet opgeslagen   | "Opslaan en later verdergaan" bewaart ook een deels ingevulde stap  | ADR-0010 (change 2)                                                                                       |
| Velden opnieuw controleren bij het verlaten | Alleen bij verzenden: een verspringende foutregel liet klikken missen | —                                                                                                       |
| `PATCH /api/my-application`                 | `PUT /api/my-application/steps/:step`, per stap                     | —                                                                                                         |

## Grootte

Het budget is ongeveer 3.000 regels TypeScript, zonder tests. Na de bootstrap zijn er
ongeveer 450 gebruikt. Een grove verdeling als richtlijn, geen eis:

| Change                    | Schatting |
| ------------------------- | --------- |
| `add-draft-application`   | ~900      |
| `add-review-and-submit`   | ~400      |
| `add-handler-workspace`   | ~500      |
| `add-information-request` | ~250      |
| `add-decision`            | ~200      |
| `add-demo-deployment`     | ~150      |

Past een change niet in het budget, dan stelt het voorstel eerst voor wat eruit gaat.

## Nog te schrijven ADR's

Elk bij de change waar het speelt:

- ADR-0009: een geheime link in plaats van inloggen voor aanvragers (link kwijt is toegang
  kwijt). Change 2.
- ADR-0010: opslag met `node:sqlite`, JSON per stap, en een schema voor een concept en voor
  een complete stap. Change 2.
- ADR-0011: TanStack Query en React Hook Form. Change 2.
- ADR-0012: geen versie zonder JavaScript, en hoe de toegankelijkheid toch goed blijft.
  Change 2.
- Een demo-login voor behandelaars; echt inloggen valt buiten het project. Change 4.
