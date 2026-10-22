---
title: "ADR-0009: Een geheime link in plaats van inloggen voor aanvragers"
date: 2026-10-12
status: geaccepteerd
---

# ADR-0009: Een geheime link in plaats van inloggen voor aanvragers

## Context

Een organisator moet een melding kunnen opslaan en later verder kunnen. Daarvoor moet het
loket weten welke melding bij wie hoort. Echte overheidsloketten gebruiken DigiD of
eHerkenning. Dat kan hier niet: het project is een demo, en het mag niets nabootsen van
echte inlogmiddelen. Een eigen account met wachtwoord kost veel werk (registreren,
wachtwoord vergeten, e-mail versturen) en heeft weinig met het doel van het project te
maken.

## Besluit

- **Elke melding heeft een geheime link.** De link bevat een sleutel van 32 willekeurige
  bytes (256 bits), als 43 tekens base64url: `/aanvraag/<sleutel>/...`.
- **De database bewaart alleen een hash** (SHA-256) van de sleutel. De sleutel zelf komt
  maar één keer terug: in het antwoord dat het concept aanmaakt.
- **De webapp stuurt de sleutel als `Authorization: Bearer`-header naar de API.** Zo staat
  hij nooit in een API-pad, en haalt de logging hem weg (zie de eis "No credentials in
  logs").
- **De link lekt zo min mogelijk.** Alle pagina's sturen geen `Referer` mee
  (`no-referrer`), en pagina's onder `/aanvraag/` worden niet geïndexeerd (`noindex`).
- **Een onbekende en een kapotte sleutel geven hetzelfde antwoord** (404). Een buitenstaander
  kan dus niet zien of een melding bestaat.
- **Link kwijt is toegang kwijt.** De gemeente kan de link niet opnieuw sturen, want ze
  heeft geen e-mailadres dat ze mag gebruiken en kent de sleutel niet. De linkpagina helpt
  de link te bewaren: kopiëren, naar jezelf mailen en een bladwijzer.

## Gevolgen

**Wat het oplevert**

- Geen account, geen wachtwoord, geen e-mailverkeer. De aanvrager kan meteen beginnen.
- Een kleine API: één header en één opzoeking op hash.
- Een gelekte database opent geen meldingen.

**Wat het kost**

- Wie de link kwijt is, moet opnieuw beginnen.
- Iedereen met de link kan de melding zien en wijzigen. De link moet dus als een sleutel
  behandeld worden.
- De sleutel staat in het webadres, en dus in de browsergeschiedenis en in de logs van de
  webserver die de webapp levert.

## Risico's

| Risico | Maatregel |
|---|---|
| De sleutel komt in de logs van de webserver | Bij de deployment (`add-demo-deployment`) logt de webserver geen paden onder `/aanvraag/`. |
| De sleutel lekt via de `Referer`-header naar een andere site | `<meta name="referrer" content="no-referrer">` voor de hele app. |
| Iemand raadt een sleutel | 256 bits: raden is niet haalbaar. |
| De aanvrager raakt de link kwijt | Kopieer-, mail- en bladwijzermogelijkheid, en een waarschuwing in hetzelfde blok als de link. |

## Controle

- API-tests: "database holds no token", "request without a token", "unknown or malformed
  token".
- Browsertest: "referrer and indexing are blocked".

## Overwogen alternatieven

- **DigiD of eHerkenning nabootsen.** Mag niet: het project bootst geen echte
  overheidsdiensten na.
- **Account met wachtwoord.** Veel werk en extra persoonsgegevens, zonder dat het iets
  toevoegt aan wat het project wil laten zien.
- **Een inloglink per e-mail (magic link).** Vraagt e-mail versturen, en dat valt buiten
  het project.
- **De sleutel in het fragment (`#`) van het adres.** Dan komt hij nooit in de logs van de
  webserver. Maar elke link en navigatie moet het fragment dan bewaren, en het botst met
  links als `#veld` in de foutsamenvatting.

## Herzien als

- Het loket echte gebruikers krijgt en een echt inlogmiddel nodig heeft.
- Aanvragers vaak hun link kwijtraken en daar een hersteloptie voor nodig is.
