---
title: "ADR-0012: Geen versie zonder JavaScript"
date: 2026-10-12
status: geaccepteerd
---

# ADR-0012: Geen versie zonder JavaScript

## Context

Het loket is een React-app (SPA). Zonder JavaScript ziet de bezoeker een lege pagina.
Overheidsrichtlijnen raden aan om een dienst ook zonder JavaScript te laten werken
("progressive enhancement"), want JavaScript kan mislukken: een trage verbinding, een
blokkerende extensie of een fout in een script.

Een versie zonder JavaScript betekent: pagina's op de server renderen en formulieren met
een gewone POST laten werken. Dat vraagt een andere opzet van de webapp, en ongeveer de helft
meer werk aan elk scherm.

## Besluit

- **Het loket werkt alleen met JavaScript.** Er komt geen versie zonder.
- **De toegankelijkheid wordt op andere manieren geborgd:**
  - echte HTML-elementen: `form`, `button`, `fieldset` en `legend`, labels bij elk veld;
  - eisen in de spec voor focus, foutmeldingen en statusberichten, met een test per scenario;
  - axe in elke browsertest, en een controle met het toetsenbord alleen;
  - een handmatige controle met schermlezers, vastgelegd in het toegankelijkheidsverslag.
- **Mislukt een verzoek aan de API, dan blijft het werk staan.** Een fout bij opslaan laat
  de antwoorden in het formulier en zegt dat het opslaan niet lukte.

## Gevolgen

**Wat het oplevert**

- Eén eenvoudige opzet: een statische webapp en een kleine API.
- De tijd gaat naar wat het project wil laten zien: toegankelijke formulieren in React.

**Wat het kost**

- Wie JavaScript uit heeft, of bij wie het script niet laadt, kan het loket niet gebruiken.
- Het loket voldoet niet aan de aanbeveling voor progressive enhancement.

## Risico's

| Risico | Maatregel |
|---|---|
| Het script laadt niet en de bezoeker ziet niets | Een korte `noscript`-melding is een kleine aanvulling bij de deployment. |
| Een reviewer ziet dit als gebrek aan kennis van progressive enhancement | Deze ADR legt de afweging uit. |

## Controle

- Elke browsertest draait met JavaScript; het gedrag zonder JavaScript wordt niet getest.

## Overwogen alternatieven

- **Server-side rendering met formulieren die zonder JavaScript werken** (bijvoorbeeld React
  Router in framework-modus). Beter voor robuustheid, maar een andere opzet en veel meer werk
  voor dit portfolioproject.

## Herzien als

- Het loket echte gebruikers krijgt.
- De webapp toch naar server-side rendering gaat, om een andere reden.
