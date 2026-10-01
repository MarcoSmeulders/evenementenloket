---
title: "ADR-0001: Spec-driven development op trede 2, licht"
date: 2026-10-01
status: geaccepteerd
---

# ADR-0001: Spec-driven development op trede 2, licht

## Context

We werken met OpenSpec. Elke wijziging begint met een voorstel met eisen en scenario's
(WHEN/THEN). De developer keurt het voorstel goed. Daarna bouwen we het en archiveren we
het.

Het artikel [Spec-driven development: kies een trede en reken de prijs uit](https://marcosmeulders.nl/spec-driven-development/)
noemt drie treden:

| Trede | Wat de spec doet | Prijs |
|---|---|---|
| 1. Intentie | Zegt wat we willen en waarom | Laag |
| 2. Verifieerbaar gedrag | Bevat criteria die je kunt controleren | Hoog: schrijven en bijhouden |
| 3. Implementatie | Is zo volledig dat de code eruit volgt | Werkt niet: je beschrijft alles dubbel |

Waarom we een trede moeten kiezen:

- **Archiveren controleert niets.** `openspec archive` zet de spec bij de andere specs.
  Of de code doet wat de spec zegt, controleert het niet.
- **De tests komen er toch.** Het testplan dekt de endpoints, de flows en het
  toetsenbord al. Die tests beschrijven hetzelfde gedrag als de scenario's.
- **AI schrijft mee.** Als AI de code én de tests schrijft, testen de tests vaak alleen
  wat de code toevallig doet. In een eerder, groter AI-project was meer dan de helft van
  de commits herstelwerk.

## Besluit

We werken op **trede 2, licht**. Elk scenario is te controleren en hoort bij precies één
test. Die koppeling loopt via de naam. Scenario's blijven gewone tekst.

### Afspraken

1. **Eén scenario, één test.** De testnaam is letterlijk de titel van het scenario. Het
   `describe`-blok noemt de capability en de eis:

   ```ts
   describe('draft-application: Save per step', () => {
     test('invalid step', async () => { /* ... */ });
   });
   ```

2. **Test op het goedkoopste niveau.** Schema en API: unit-test (`*.test.ts`, Vitest).
   Focus, toetsenbord en weergave: browsertest (`e2e/**/*.spec.ts`, Playwright).
3. **Schrijf scenario's die je kunt controleren.** "Focus gaat naar de foutsamenvatting"
   kun je testen. "Het is duidelijk voor de gebruiker" niet.
4. **Handmatig is handmatig.** Wat je niet kunt automatiseren, zoals schermlezer, zoom
   en begrijpelijkheid, krijgt de regel `- **Verification:** manual`. Dat controleren we
   met de hand en leggen we vast in het toegankelijkheidsverslag. Een axe-scan zonder
   fouten telt niet als bewijs.
5. **Schrijf de test vanuit het scenario, niet vanuit de code.** Bij de review is de
   vraag: bewijst deze test dit scenario?
6. **Spec en test veranderen samen.** Verandert een scenario, dan verandert de test in
   dezelfde wijziging.
7. **Pas archiveren als alles klaar is:** taken af, CI groen, elk scenario heeft een
   slagende test of is handmatig gecontroleerd, en de handleidingen zijn bijgewerkt.

### Wanneer geen OpenSpec

Verandert het gedrag van de applicatie niet, dan maken we geen OpenSpec-wijziging aan.
Denk aan tooling, configuratie, updates van dependencies en alleen documentatie. Die
committen we direct.

### Wat staat waar

- **Specs:** wat het systeem doet en waarom.
- **Code:** alle details, zoals types, Zod-schema's, statusovergangen en styling. Die
  herhalen we niet in de specs.

## Gevolgen

**Wat het oplevert**

- De specs worden gedekt door tests. Archiveren betekent dus echt iets.
- Toegankelijkheid staat in de spec voordat er code is, en CI bewijst het. Zo is
  toegankelijkheid onderdeel van het ontwerp, en geen checklist achteraf.
- Code van AI wordt getoetst aan een scenario dat een mens heeft goedgekeurd.
- Een reviewer vindt de test bij een scenario door op de titel te zoeken.

**Wat het kost**

- Discipline in namen, en preciezer schrijven.
- Verandert een scenario, dan moet ook de test aangepast worden.
- We houden weinig scenario's: alleen gedrag dat ertoe doet.

**Wat het niet doet**

- Een groene test bewijst het scenario, niet dat de spec compleet is. Daarvoor blijft
  de review nodig.
- Handmatige scenario's zijn zo goed als het toegankelijkheidsverslag.
- Niets controleert automatisch of elk scenario een test heeft. Zie Open punten.

## Overwogen alternatieven

- **Trede 1.** Scenario's zonder koppeling met tests. Dat scheelt bijna niets, want de
  tests komen er toch. We verliezen wel de koppeling.
- **Trede 2, volledig** (bijvoorbeeld Cucumber). De koppeling wordt dan automatisch
  gecontroleerd, maar er komt een extra laag code bij. Te zwaar voor een project van
  ongeveer 3.000 regels.
- **Trede 3.** De code en de types bevatten de details al. Specs die dat herhalen,
  lopen uit de pas.

## Open punten

- **Automatische controle van de koppeling.** Een klein script in CI kan elke
  scenariotitel zoeken en falen als er geen test bij is. Dat bouwen we niet nu, maar pas
  als er genoeg specs zijn.
