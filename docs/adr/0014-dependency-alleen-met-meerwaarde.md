---
title: "ADR-0014: Een dependency alleen als hij meerwaarde heeft"
date: 2026-10-19
status: geaccepteerd
---

# ADR-0014: Een dependency alleen als hij meerwaarde heeft

## Context

Elke runtime-dependency kost iets: updates, audits ([ADR-0008](0008-eigen-update-routine.md)),
een grotere bundel en code die je niet zelf in de hand hebt. Tegelijk lost een goede
bibliotheek een probleem beter op dan eigen code.

De regel "elke nieuwe runtime-dependency krijgt een korte reden" stond al in `CLAUDE.md`,
maar zonder besluit erachter. Daarnaast stonden er losse verboden: geen Redux en geen
FP-bibliotheken. Die verboden hebben niets met een programmeerstijl te maken. Ze zeggen
alleen dat het loket die bibliotheken nu niet nodig heeft. Dat hoort bij één algemene
regel, niet bij een lijst met namen.

## Besluit

- **Een runtime-dependency komt er pas als hij meerwaarde heeft.** Dat is zo als alle drie
  waar zijn:
  1. hij lost een echt probleem in deze code op, nu en niet "misschien later";
  2. eigen code of wat het platform al biedt (Node, de browser, React) zou groter,
     foutgevoeliger of moeilijker te onderhouden zijn;
  3. de code blijft leesbaar voor wie de bibliotheek niet kent.
- **De afweging staat op papier**, in het ontwerp van de change of in een ADR: welk
  probleem, welke alternatieven, en waarom deze. Zonder afweging geen dependency.
- **Dev-dependencies** (tests, lint, build) vallen hier niet onder. Daar is de reden in de
  change genoeg.

### Voorbeelden van de afweging

| Bibliotheek | Uitkomst | Waarom |
|---|---|---|
| TanStack Query, React Hook Form, date-fns | wel | Cache, formulierstate en zomer- en wintertijd zijn foutgevoelig om zelf te bouwen ([ADR-0011](0011-tanstack-query-react-hook-form-date-fns.md)). |
| `better-sqlite3` | niet | `node:sqlite` zit al in Node 24 ([ADR-0010](0010-opslag-node-sqlite-json-per-stap.md)). |
| Redux | nu niet | Er is geen gedeelde state die een store nodig heeft. Servergegevens staan in TanStack Query, formulieren in React Hook Form, en de stand van de pagina in het adres. Is een reducer nodig, dan is er `useReducer` van React: hetzelfde patroon, zonder dependency. |
| FP-bibliotheken (Ramda, purify-ts, ts-pattern) | nu niet | Gewone `map`, `filter` en `if` volstaan. Een kleine eigen monad mag volgens [ADR-0013](0013-functionele-stijl-leesbaar-zonder-point-free.md). Komt er een probleem dat zo'n bibliotheek beter oplost, dan geldt de afweging hierboven. |

"Nu niet" is geen verbod. Het betekent: de afweging valt nu negatief uit.

## Gevolgen

**Wat het oplevert**

- Weinig dependencies, dus minder updates en minder risico in de audit.
- Elke dependency heeft een zichtbare reden. Een reviewer ziet dat elke keuze bewust is.
- Geen lijst met verboden namen die veroudert.

**Wat het kost**

- Elke nieuwe dependency vraagt een paar zinnen uitleg.
- "Meerwaarde" is een oordeel. Twee mensen kunnen het anders zien.
- Soms schrijf je iets zelf wat een bibliotheek ook had gekund.

## Risico's

| Risico | Maatregel |
|---|---|
| Een dependency komt erin zonder afweging | Review van elke change: een nieuwe regel onder `dependencies` in een `package.json` vraagt een reden in het ontwerp of een ADR. |
| Eigen code wordt groter dan de bibliotheek die het had kunnen vervangen | Criterium 2 werkt ook andersom: groeit eigen code uit tot zo'n probleem, dan opnieuw afwegen. |
| De afweging wordt een formaliteit | Het ontwerp noemt minstens één alternatief, ook als dat "zelf schrijven" is. |

## Controle

- Review van elke change die een `package.json` wijzigt.
- `pnpm run audit` in CI ([ADR-0008](0008-eigen-update-routine.md)) voor wat er al in zit.

## Overwogen alternatieven

- **Een lijst met verboden bibliotheken.** Zo was het (geen Redux, geen FP-bibliotheken).
  Duidelijk, maar zonder reden, en elke nieuwe bibliotheek valt erbuiten.
- **Vrij kiezen, zonder afweging.** Snel, maar dan groeit het aantal dependencies zonder dat
  iemand weet waarom.
- **Helemaal geen runtime-dependencies.** Zuiver, maar dan bouw je zelf wat bekende
  bibliotheken beter doen, zoals tijdzones.

## Herzien als

- Er state ontstaat die op veel plekken gedeeld en gewijzigd wordt.
- Er meer developers aan het project werken en de afweging per dependency te traag wordt.
