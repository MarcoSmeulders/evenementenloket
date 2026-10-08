# Werken met AI in dit project

Ik bouw dit project met [Claude Code](https://claude.com/claude-code) als assistent. Dit
document legt uit hoe: wat de AI doet, wat ik doe, en welke afspraken en hulpmiddelen
ervoor zorgen dat ik de controle houd.

## De verdeling

| De AI doet | Ik doe |
|---|---|
| Voorstellen uitwerken in OpenSpec: eisen, scenario's, ontwerp, taken | Elk voorstel reviewen en goedkeuren vóór er code komt |
| Code en tests schrijven volgens het goedgekeurde voorstel | De diff lezen, en beslissen wat erin gaat |
| Tests draaien, fouten zoeken, opties met voor- en nadelen geven | Kiezen tussen opties, zoals Hono of Fastify |
| ADR's en documentatie opstellen | ADR's lezen en aanpassen tot ze mijn besluit weergeven |
| UX- en toegankelijkheidsreviews uitvoeren | Bepalen welke bevindingen we oplossen, en wat bewust zo blijft |
| | Committen en pushen. Altijd zelf, na review. |

## De werkwijze per wijziging

```
voorstel (AI)  -->  review (ik)  -->  bouwen + tests (AI)  -->  review diff (ik)  -->  commit (ik)
                        |                                            |
                        +-- bijsturen, vragen stellen                +-- UX-review per change
```

1. **Voorstel.** Elke wijziging in gedrag begint als OpenSpec-voorstel: waarom, wat, eisen
   met scenario's, ontwerp en taken. De AI werkt het uit, ik review het.
2. **Bouwen.** De AI bouwt taak voor taak. Elke taak noemt de test of controle die bewijst
   dat hij klaar is.
3. **Bewijzen.** Elk scenario heeft precies één test met dezelfde naam
   ([ADR-0001](adr/0001-spec-driven-level-2-light.md)). De test wordt geschreven vanuit het
   scenario dat ik heb goedgekeurd, niet vanuit de code. Zo toetst een test niet alleen
   wat de AI toevallig gebouwd heeft.
4. **Reviewen.** Per change draait de UX-reviewer (zie hieronder). Ik lees de diff en
   commit zelf.
5. **Archiveren.** Als alles klaar is, archiveert OpenSpec de change. De eisen komen dan in
   de levende specs terecht.

## OpenSpec en ADR's: twee soorten vastleggen

Werken met AI gaat snel. Daardoor is het extra belangrijk om vast te leggen *wat* we
bouwen en *waarom*. Dat doen we op twee plekken, elk met een eigen doel.

| | OpenSpec | ADR's |
|---|---|---|
| **Legt vast** | Wat het systeem doet: eisen en scenario's | Waarom we iets zo bouwen: een technische of inhoudelijke keuze |
| **Voorbeeld** | "Focus gaat naar de foutsamenvatting als een stap fouten heeft" | "We gebruiken Hono, omdat de webapp dan een getypeerde client krijgt" |
| **Waar** | [`openspec/`](../openspec/) | [`docs/adr/`](adr/) |
| **Taal** | Engels, want scenariotitels zijn ook testnamen | Nederlands |
| **Verandert** | Met elke change die gedrag aanpast | Niet. Een nieuwe keuze krijgt een nieuwe ADR. |
| **Bewijs** | Elk scenario heeft een test | Elke ADR heeft een kopje "Controle" |

### OpenSpec: van voorstel naar levende spec

```
openspec/changes/<naam>/        openspec/changes/archive/       openspec/specs/
  proposal.md   waarom    --->    de change zoals hij    --->     wat het systeem nu
  design.md     hoe               gebouwd is, met datum           doet (alle eisen bij
  specs/        eisen                                             elkaar)
  tasks.md      taken
```

- **Een change** is een map met vier bestanden: het voorstel (waarom), het ontwerp (hoe),
  de eisen met scenario's, en de taken. De AI stelt ze op met `/opsx:propose`. Ik review
  ze vóór er code komt.
- **Bouwen** gebeurt met `/opsx:apply`. De AI werkt de taken af en vinkt ze af. Verandert
  er onderweg iets aan het ontwerp, dan past de AI eerst het voorstel aan. Zo bleef het
  voorstel kloppen toen we halverwege van Fastify naar Hono gingen.
- **Archiveren** met `/opsx:archive` zet de eisen in `openspec/specs/`. Daar staat wat
  het systeem nu doet. In het archief zie je hoe het zo gekomen is.
- **Niet alles is een change.** Tooling, configuratie en alleen documentatie gaan direct.
  Zie de drempel in [ADR-0001](adr/0001-spec-driven-level-2-light.md).

Waarom dit helpt bij AI: de spec is een afspraak die ik heb goedgekeurd. De AI bouwt
daartegen, en de tests bewijzen het. Zonder spec is de enige maatstaf wat de AI zelf
bedacht heeft.

### ADR's: de keuzes en hun prijs

Een ADR (Architecture Decision Record) beschrijft één keuze. Alle ADR's hebben dezelfde
kopjes: Context, Besluit, Gevolgen, Risico's, Controle, Overwogen alternatieven en Herzien
als. Het [overzicht en de vaste opbouw](adr/README.md) staan bij de ADR's.

- **De AI schrijft een eerste versie** op basis van ons gesprek: welke opties er waren,
  wat we kozen en waarom.
- **Ik lees en pas aan** tot de ADR mijn besluit weergeeft. Soms leidt dat tot een andere
  keuze. De afweging tussen Fastify en Hono staat daarom eerlijk in
  [ADR-0006](adr/0006-hono-met-getypeerde-client.md), inclusief waarom het eerste advies
  anders was.
- **Risico's krijgen een maatregel**, en **Controle** zegt hoe je ziet dat de keuze gevolgd
  wordt. Bij voorkeur is dat een test, een lint-regel of een stap in CI, geen goed
  voornemen.
- **Een ADR verandert niet achteraf.** Wordt een keuze herzien, dan komt er een nieuwe ADR
  die de oude vervangt.

Waarom dit helpt bij AI: een AI-sessie begint elke keer opnieuw. De ADR's en
[`CLAUDE.md`](../CLAUDE.md) zorgen dat eerdere keuzes niet stilletjes worden teruggedraaid.

## Eigen hulpmiddelen in de repository

Mijn eigen hulpmiddelen staan in [`.claude/`](../.claude/), zodat je kunt zien hoe ze werken.
Ze beginnen allemaal met `loket-`. Alleen die staan in git. De standaardbestanden van
OpenSpec maak je zelf aan met `openspec init --tools claude`. Zo komen er ook geen lokale
instellingen per ongeluk in de repository.

### `/loket-ux-reviewer`: review op toegankelijkheid en UX

Een eigen agent die een scherm, component of live URL beoordeelt tegen WCAG 2.2 AA,
EN 301 549 en de WAI-ARIA APG. Hij schrijft een rapport in het Nederlands naar
[`docs/ux-reviews/`](ux-reviews/), met per bevinding de ernst, de moeite en hoe zeker hij
is.

- **Hij past nooit iets aan.** Twee bewakingsscripts in `.claude/scripts/` (`loket-ux-validate-*.sh`) zorgen
  daarvoor. Het ene blokkeert commando's die iets wijzigen, het andere staat schrijven
  alleen toe in `docs/ux-reviews/`.
- **Hij is eerlijk over zijn grenzen.** Een schone axe-scan noemt hij geen bewijs. Wat hij
  niet kan testen, zoals een echte schermlezer, staat apart in het rapport.
- **Voorbeeld:** de [review van de startpagina](ux-reviews/ux-review_startpagina_2026-10-02.md)
  vond negen kleinere punten. Vijf zijn opgelost, elk met een nieuwe test. Bij de rest staat
  waarom ze bewust zo blijven of later komen.

### `/loket-quick-commit`: committen met controles

Maakt een commit met een duidelijke boodschap, maar controleert eerst wat er meegaat. Dit
is een publieke repository, dus de skill staget nooit `.env`-bestanden. Bij onverwachte
bestanden, zoals `node_modules` of build-uitvoer, stopt hij en vraagt hij wat te doen.
Ik start deze skill zelf, na het lezen van de diff.

### `CLAUDE.md`: de regels van het project

[`CLAUDE.md`](../CLAUDE.md) legt de afspraken vast die elke sessie meekrijgt. Denk aan
taalgebruik, geen tekst in de code, één test per scenario, en de regels voor een publieke
repository: geen geheimen, geen echte persoonsgegevens, geen infrastructuurdetails.

### `.claude/rules/`: stijlregels per soort bestand

Regels die alleen gelden voor bepaalde bestanden staan apart, zodat `CLAUDE.md` kort blijft.
Claude laadt ze pas als hij met zo'n bestand werkt.

- `loket-typescript.md`: namen (`is`/`has` voor booleans, `create`/`make` voor functies),
  `function` voor benoemde functies, en een functionele stijl zonder extra bibliotheken.
- `loket-schema.md`: hoe Zod-schema's en hun types heten, en gemerkte ID's (`EventId`) die
  je niet per ongeluk kunt verwisselen.

Ideeën die ik nog niet toepas staan in [Ideeën voor later](ideeen.md).

## Wat ik geleerd heb

- **Een spec alleen is niet genoeg.** In een eerder, groter AI-project ging meer dan de helft
  van de commits naar herstelwerk. Daarom koppel ik hier elk scenario aan een test, en
  review ik de spec vóór er code komt.
- **De AI stelt voor, ik kies.** Het eerste advies was Fastify voor de API. Toen ik vroeg
  naar een getypeerde client, bleek Hono beter te passen. De afweging staat in
  [ADR-0006](adr/0006-hono-met-getypeerde-client.md).
- **Eerst de oorzaak, dan de oplossing.** Een AI lost graag snel iets op. Soms is dat het
  verkeerde: een melding van de editor bleek een ontbrekende `tsconfig.json`, niet een
  ontbrekend package. Vragen "waarom gebeurt dit?" voordat iets wordt aangepast, scheelt
  werk.
- **Bewakingsregels werken beter dan afspraken.** Dat de UX-reviewer niets aanpast, is
  geen belofte maar een script dat het blokkeert.

## Wat er níet in de git-historie staat

Commits bevatten geen regel als "Co-authored-by: AI". Ik review en commit alles zelf, en
ben verantwoordelijk voor wat erin staat. Dit document is de plek waar ik open ben over
het gebruik van AI.
