---
title: "Werkwijze — Evenementenloket Kranswijk"
status: levend document
---

# Werkwijze

Zo werk ik, aan de hand van één onderdeel: de **persoonlijke link**. Een aanvrager logt
niet in. Na de start krijgt die een geheime link om later verder te gaan. Elke stap
hieronder verwijst naar het echte bestand.

## Van idee tot test

1. **Besluit vastleggen.** Inloggen is voor een kleine melding een drempel. Een geheime
   link is eenvoudiger, maar wie de link kwijt is, is de toegang kwijt. Die afweging staat
   in [ADR-0009](adr/0009-geheime-link-in-plaats-van-inloggen.md).
2. **Eerst uitproberen.** Hoe toon je de link zo dat mensen hem echt bewaren? Ik maakte een
   [klikbaar prototype](prototypes/persoonlijke-link-interactive.html) met twee voorstellen:
   A, een eigen pagina, en B, een kader op stap 1. Voorstel A is gekozen.
3. **Laten reviewen.** Het prototype is getoetst aan WCAG 2.2 AA in een
   [UX-review](ux-reviews/ux-review_prototype-persoonlijke-link-a_2026-10-09.md). Twee
   voorbeelden van wat daaruit kwam:
   - **F-10:** een tweede klik op "Kopieer link" werd niet opnieuw voorgelezen.
   - **F-02 en F-03:** na het verbeteren van een veld deed de eerste klik op een knop
     niets, omdat de foutmeldingen al tijdens het klikken veranderden.
4. **Eisen en scenario's schrijven.** De bevindingen staan als eisen in het
   [voorstel](../openspec/changes/add-draft-application/proposal.md) en de
   [spec](../openspec/changes/add-draft-application/specs/draft-application/spec.md), nog
   vóór er code is. F-10 werd het scenario *copy link confirms every time*. F-02 en F-03
   werden de eis *Errors change only on submit*. Het
   [ontwerp](../openspec/changes/add-draft-application/design.md) noemt bij elke keuze het
   nummer van de bevinding.
5. **Elk scenario heeft één test met dezelfde naam.** In
   [`e2e/draft-application.spec.ts`](../e2e/draft-application.spec.ts) staat
   `test("copy link confirms every time")` in
   `describe("draft-application: Link page offers ways to keep the link")`. Zo zie je
   meteen welke test welke eis bewijst ([ADR-0001](adr/0001-spec-driven-level-2-light.md)).
6. **Wat niet te automatiseren is, test ik met de hand.** Of een schermlezer de bevestiging
   echt voorleest, kan Playwright niet horen. Zo'n scenario heet *Verification: manual* en
   de uitkomst komt in het [toegankelijkheidsverslag](toegankelijkheidsverslag.md).
7. **Afwijkingen van het plan bijhouden.** Het oorspronkelijke plan controleerde velden bij
   het verlaten. Door F-02 is dat nu "alleen bij verzenden". Dat staat in de tabel met
   afwijkingen in de [roadmap](roadmap.md#afwijkingen-van-het-oorspronkelijke-plan).
8. **Handleiding bijwerken.** De [handleiding voor aanvragers](handleiding/aanvrager.md) is
   vóór de bouw geschreven en wordt bij elke change gelijkgetrokken met de schermen.

## Vaste afspraken

- **Eén change tegelijk**, in OpenSpec: voorstel → review → bouwen → archiveren.
- **Eén beslissing per ADR**, in het Nederlands. Verandert een besluit, dan komt er een
  nieuwe ADR. Alle ADR's staan in de [lijst](adr/README.md).
- **Ideeën wachten op een beslismoment.** Wat ik overweeg maar nog niet doe, staat in
  [ideeën voor later](ideeen.md), met het moment waarop ik beslis.
- **Claude Code als assistent.** Het schrijft mee aan code, tests en documenten, en doet
  de UX-reviews. Ik beoordeel elke stap en commit zelf. De afspraken staan in
  [`CLAUDE.md`](../CLAUDE.md).

## Waar je wat vindt

| Wat                          | Waar                                               |
| ---------------------------- | -------------------------------------------------- |
| Wat er komt en in welke volgorde | [Roadmap](roadmap.md)                          |
| Waarom iets zo gebouwd is    | [ADR's](adr/README.md)                             |
| Wat er nu gebouwd wordt      | [`openspec/changes/`](../openspec/changes/)        |
| Wat er al gebouwd is         | [`openspec/specs/`](../openspec/specs/)            |
| Bewijs voor toegankelijkheid | [Toegankelijkheidsverslag](toegankelijkheidsverslag.md) en [UX-reviews](ux-reviews/) |
| Hoe het loket werkt          | Handleidingen voor [aanvragers](handleiding/aanvrager.md) en [behandelaars](handleiding/behandelaar.md) |
