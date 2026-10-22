---
title: "ADR-0010: Opslag met node:sqlite, JSON per stap en een bewaartermijn van 30 dagen"
date: 2026-10-12
status: geaccepteerd
---

# ADR-0010: Opslag met node:sqlite, JSON per stap en een bewaartermijn van 30 dagen

## Context

Een concept moet op de server bewaard worden. Een stap kan leeg zijn, deels ingevuld
("Opslaan en later verdergaan") of compleet ("Opslaan en verder"). De regels voor de
velden staan in Zod-schema's in `packages/schema`, gedeeld door web en API (ADR-0003).
Het project is klein, draait als demo op één server, en elke dependency moet zich
bewijzen. Een concept bevat persoonsgegevens: naam, e-mailadres, soms een telefoonnummer.

## Besluit

- **SQLite via de ingebouwde module `node:sqlite`.** Geen databaseserver en geen extra
  package. Alle toegang loopt via één interface, `ApplicationRepository`.
- **Eén tabel `applications`, met per stap een JSON-kolom.** Een stap is `NULL` (leeg) of
  JSON die door het concept-schema van die stap is gekomen.
- **Twee schema's per stap.** Het concept-schema controleert alleen het formaat van wat is
  ingevuld. Het complete schema eist ook de verplichte velden en de regels tussen velden
  (zoals "einde na begin").
- **"Compleet" wordt niet opgeslagen.** Of een stap af is, volgt altijd uit het complete
  schema. Er is dus geen vlag die uit de pas kan lopen.
- **Bij lezen gaat de JSON opnieuw door het schema.** Past oude data niet meer, dan telt
  de stap als leeg. Migraties zijn niet nodig, want de demo wordt regelmatig gewist.
- **Bewaartermijn van 30 dagen.** Een concept dat 30 dagen niet is opgeslagen, wordt
  verwijderd. Alleen opslaan start de termijn opnieuw, openen niet. De API ruimt op bij het
  starten en daarna elke 24 uur. Tussen twee opruimrondes weigert de API een verlopen
  concept al, alsof de link onbekend is. De termijn is dus precies 30 dagen. Hij is één constante (`DRAFT_RETENTION_DAYS`), en de
  linkpagina noemt hem.
- **Unit-tests gebruiken een database in het geheugen** (`:memory:`), dus geen bestand.

## Gevolgen

**Wat het oplevert**

- Geen extra runtime-dependency en geen native build, ook later in Docker niet.
- Het Zod-schema is de enige beschrijving van de velden. Een veld erbij is alleen een
  schemawijziging.
- Persoonsgegevens blijven niet langer staan dan nodig.

**Wat het kost**

- Zoeken op een veld in de JSON (bijvoorbeeld voor de lijst van behandelaars) gaat met
  `json_extract` of in TypeScript, niet met een gewone kolom.
- Een aanvrager die 30 dagen niets opslaat, is het concept kwijt.

## Risico's

| Risico | Maatregel |
|---|---|
| `node:sqlite` is nog niet als stabiel gemarkeerd in Node 24 | Alle toegang via `ApplicationRepository`. Overstappen op `better-sqlite3` raakt één bestand. |
| Een deels opgeslagen stap bevat data die later niet meer klopt (een begindatum die voorbij is) | "Compleet" wordt altijd opnieuw bepaald; de fout komt bij de volgende "Opslaan en verder". |
| Een verlopen concept staat nog tot 24 uur in de database, tot de volgende opruimronde | De API weigert het al bij het openen. Acceptabel voor een demo. |
| De tabel groeit door concepten die nooit worden afgemaakt | De bewaartermijn ruimt ze op. |

## Controle

- Repository-tests op een database in het geheugen.
- API-tests: "draft not saved for more than 30 days is deleted" en "draft saved within 30
  days is kept".
- `pnpm test` maakt geen databasebestand aan.

## Overwogen alternatieven

- **`better-sqlite3`.** Volwassen en bijna dezelfde API, maar een native dependency die bij
  installatie gebouwd of gedownload wordt.
- **Een kolom per veld.** Makkelijker zoeken, maar een extra vertaling tussen schema en
  kolommen, en een migratie bij elk nieuw veld.
- **De bewaartermijn pas bij de deployment regelen.** Dan zou een concept tot die tijd voor
  altijd blijven staan, en de linkpagina geen termijn noemen.

## Herzien als

- `node:sqlite` problemen geeft of uit Node verdwijnt.
- Behandelaars vaak op velden moeten zoeken of filteren.
- Het loket echte persoonsgegevens krijgt: dan hoort de termijn bij een echte
  bewaarafspraak.
