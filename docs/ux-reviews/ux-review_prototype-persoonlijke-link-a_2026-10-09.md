---
title: "UX & Accessibility Review — Prototype persoonlijke link, voorstel A"
target: "docs/prototypes/persoonlijke-link-interactive.html, voorstel A (startpagina, linkpagina in start- en later-modus, stap 1 Organisator, stub stap 2)"
input_type: "live-url (lokaal geserveerd prototype) + code"
date: "2026-10-09"
reviewer: "ux-a11y-reviewer"
wcag_target: "WCAG 2.2 AA"
standards: ["WCAG 2.2", "EN 301 549", "EAA", "WAI-ARIA APG"]
language: "nl"
lastUpdated: "2026-10-09T12:00:00Z"
---

# UX & Accessibility Review — Prototype persoonlijke link, voorstel A

> Scope: de aanvragersflow in het gestippelde app-kader van voorstel A. Dat zijn de startpagina,
> de linkpagina ("Bewaar uw persoonlijke link") in start- en later-modus, stap 1 "Organisator"
> met foutafhandeling, en de stub van stap 2. Getoetst tegen WCAG 2.2 AA, EN 301 549 en de
> WAI-ARIA APG, plus usability. Het gaat om een gemeentelijke dienst voor burgers
> (Digitoegankelijk). Buiten scope: voorstel B, de bediening van het prototype, de nog niet
> gebouwde link "Vorige stap" en de definitieve teksten.

## Samenvatting

Voorstel A staat stevig. De basis klopt:
- focus naar de `h1` bij elke schermwissel;
- een paginatitel met "Fout:";
- een foutsamenvatting volgens GOV.UK die de focus krijgt;
- foutmeldingen netjes gekoppeld met `aria-describedby`;
- een link die op 320 px gewoon afbreekt.

axe vond in vijf schermtoestanden **geen overtredingen**. Dat zegt alleen iets over het
automatisch toetsbare deel.

De twee belangrijkste problemen zag axe niet:
1. **De bevestiging "Stap 1 is opgeslagen" wordt waarschijnlijk niet voorgelezen.** Hij staat
   boven de `h1`. Hij krijgt zijn tekst terwijl hij nog verborgen is. En de focus springt
   meteen daarna naar de kop.
2. **Na het verbeteren van een veld doet de eerste muisklik op een opslaanknop niets.** De
   controle bij het verlaten van het veld haalt een foutmelding weg. Dan schuift de knop
   onder de muis vandaan.

Beide zijn klein om op te lossen. Ze horen als scenario's in `add-draft-application`.

## Conformiteit in één oogopslag

| Severity | Aantal | Voorbeeld-SC |
|---|---|---|
| blocker | 0 | — |
| critical | 0 | — |
| serious | 2 | 4.1.3 Status Messages (F-01); geen SC, wel gedrag (F-02) |
| moderate | 4 | 3.3.1 / consistentie (F-03), 1.4.10 / 1.4.4 risico (F-04) |
| minor | 6 | 1.3.1 / 4.1.2 (F-07, F-08, F-09), 2.5.8 (F-12) |

- **Getoetst niveau:** WCAG 2.2 AA, plus AAA-winst waar die goedkoop is.
- **EU-context:** van toepassing. Een gemeentelijke dienst valt onder het Besluit digitale
  toegankelijkheid overheid (EN 301 549, verwijst naar WCAG 2.1 AA). Wij toetsen strenger,
  op 2.2 AA.
- **Betrouwbaarheid van deze review:**
  - **Hoog** voor wat ik in Chromium heb gemeten (Playwright): focus, titels,
    accessibility tree, DOM-volgorde, timing van de live regions, klikgedrag, reflow en contrast.
  - **Middel** voor wat een screenreader echt zegt. Ik heb **geen** NVDA, JAWS, VoiceOver of
    Orca gebruikt. Wat wel of niet wordt voorgelezen, heb ik afgeleid uit de DOM-timing en uit
    bekend gedrag van live regions. Dat staat bij elke bevinding.
  - Alleen Chromium is getest, geen Firefox of WebKit.

## Wat goed gaat

- **Focusbeheer is consequent, en ik heb het nagemeten.** Ik heb de focus telkens ~150 ms na
  de actie gemeten:
  - "Start melding" zet de focus op `h1#heading-link`;
  - "Verder naar stap 1" zet hem op `h1#heading-stap1`;
  - "Opslaan en verder" zet hem op `h1#heading-stap2`;
  - "Verder met invullen" zet hem terug op `h1#heading-stap1`.

  De paginatitel verandert mee ("Bewaar uw persoonlijke link - …", "Stap 1 van 2: Organisator
  - …"). Dat is precies het patroon dat de change voor elke stap wil. Het staat er hier al
  schoon.
- **De foutafhandeling volgt GOV.UK, ook in de details.**
  - Bij een lege verzending krijgt `#error-summary` de focus, met een zichtbare paarse ring.
  - De titel begint met "Fout: ".
  - Elke link in de samenvatting zet de focus op het veld. Bij de radiogroep is dat de eerste
    radio, en met het toetsenbord is de focusring zichtbaar.
  - In de accessibility tree heeft "Naam contactpersoon" als beschrijving: *"De persoon die de
    gemeente kan benaderen over het evenement. Fout: Vul de naam van de contactpersoon in"*,
    plus `invalid=true`. Hint en fout zijn dus allebei gekoppeld, in de goede volgorde, met
    een verborgen "Fout:" ervoor.
  - De fieldset krijgt de fout via `aria-describedby`.
  - "(niet verplicht)" staat bij het enige optionele veld. Er staan geen sterretjes bij de
    verplichte velden.
- **Bewuste formulierkeuzes.**
  - `autocomplete="organization"`, `name`, `email` en `tel` helpen bij 1.3.5 en schelen typwerk.
  - `spellcheck="false"` op het e-mailveld.
  - De e-mailfout geeft een voorbeeld ("zoals naam@example.org", 3.3.3).
  - Na "Verder met invullen" staat de ingevulde naam er nog.
- **Kopiëren is goed opgezet.**
  - De statusregio onder "Kopieer link" staat al in de pagina vóór de klik. Daardoor wordt de
    bevestiging wel als wijziging gezien (gemeten: één mutatie met "De link is gekopieerd.",
    terwijl de regio zichtbaar was).
  - Er is een foutpad: "Kopiëren lukte niet. Selecteer de link en kopieer hem zelf."
  - De waarschuwing begint met de tekst "Let op:". Het "!"-icoon is `aria-hidden`. De
    betekenis hangt dus niet aan een icoon of kleur.
- **Contrast en klikvlakken ruim boven de norm.**
  - Foutkleur `#b3261e` op wit: 6,54:1.
  - Muted tekst: 7,19:1 op wit en 6,46:1 op `--color-surface`.
  - Witte tekst op de primaire knop: 7,69:1.
  - Focusring op wit en surface: 9,1:1 en 8,2:1.
  - Knoppen en invoervelden zijn 44 px hoog.
  - De link breekt op 320 px netjes af (6 regels, geen horizontaal scrollen).

## Bevindingen

### F-01 — "Stap 1 is opgeslagen" wordt waarschijnlijk niet voorgelezen

- **Severity:** serious · **Effort:** S · **Confidence:** high (DOM en timing gemeten),
  medium (wat een screenreader zegt)
- **Criterium:** 4.1.3 Status Messages — AA; 1.3.2 Meaningful Sequence — A |
  **Heuristiek:** Visibility of system status
- **Locatie:** `persoonlijke-link-interactive.html` r. 946-947 (linkpagina, later-modus) en
  r. 1100 (stub stap 2)
- **Bewijs:** Met een MutationObserver gemeten na een geldige "Opslaan en later verdergaan":
  1. t=1721 ms: de tekst "Stap 1 is opgeslagen." komt in de `role="status"`. Op dat moment
     zijn de regio en de section allebei `display: none`.
  2. t=1725 ms: de regio wordt zichtbaar.
  3. t=1726 ms: de focus gaat naar `h1#heading-link`.

  In de DOM staat de melding **vóór** de `h1`. Op stap 2 is het hetzelfde: de tekst komt erin
  terwijl de section nog verborgen is, en de melding staat boven de stappenindicator en de `h1`.
  Er zijn dus drie redenen waarom een screenreader hem mist:
  - een live region die tegelijk met zijn inhoud verschijnt, wordt vaak niet als "wijziging"
    gezien;
  - de focuswissel naar de kop onderbreekt of verdringt een beleefde (`polite`) melding;
  - wie vanaf de kop verder leest, komt de melding nooit tegen, want die staat erboven.

  Dit geldt ook voor `role="status"`-regio's in het algemeen: een regio die **tegelijk** met de
  inhoud zichtbaar wordt, kun je niet vertrouwen. De kopieerregio werkt wel, omdat die er al
  stond vóór de wijziging.
- **Waarom dit telt:** Een blinde aanvrager drukt op "Opslaan en later verdergaan". Ze hoort
  "Bewaar uw persoonlijke link, kop niveau 1". Dat is dezelfde kop als bij de start. Of het
  opslaan gelukt is, hoort ze niet. Juist bij "later verdergaan" wil je die zekerheid: de
  aanvrager gaat het venster sluiten.
- **Fix:** Geef de bevestiging een plek waar de focus al komt. Zet hem niet in een live region
  die tegelijk met de pagina verschijnt.
  - **Later-modus:** maak de status het onderwerp van de pagina. Zet hem in de `h1` en de titel
    (vergelijkbaar met de dialoogtitel van B):
    ```tsx
    // LinkPage, mode === 'later' (texts from nl.json via t() in the page)
    <h1 ref={headingRef} tabIndex={-1}>{t('link.later.heading')}</h1>
    {/* nl.json: "link.later.heading": "Stap 1 is opgeslagen" */}
    <p>{t('link.later.intro')}</p>
    {/* "Bewaar uw persoonlijke link. Met deze link gaat u later verder ..." */}
    ```
    Titel: "Stap 1 is opgeslagen - Evenementenloket Kranswijk".
  - **Stap 2 ("Opslaan en verder"):** zet de melding als gewone alinea **direct ná** de `h1`,
    zonder `role="status"`. Wie de kop hoort en verder leest, hoort meteen "Stap 1 is
    opgeslagen." Of laat hem weg: de stapwissel zegt het al. Als je toch een live region wilt,
    zet die regio dan leeg en blijvend in de `PageShell`, en vul hem pas ná de focuswissel.
    Dat is wel lastiger om goed te krijgen.
- **Scenario's:**
  - "Na Opslaan en later verdergaan noemen kop en titel dat de stap is opgeslagen" →
    **Playwright** (`getByRole('heading', { level: 1, name: … })` heeft focus; `toHaveTitle`).
  - "Na Opslaan en verder staat de bevestiging direct na de kop" → **Playwright** (DOM-volgorde).
  - "Een schermlezer meldt dat stap 1 is opgeslagen" → **handmatig** (NVDA + Firefox,
    VoiceOver + Safari), vastleggen in `docs/toegankelijkheidsverslag.md`.

### F-02 — Na het verbeteren van een veld doet de eerste muisklik op een knop niets

- **Severity:** serious · **Effort:** S · **Confidence:** high (Chromium, muis), medium (touch)
- **Criterium:** geen harde WCAG-fout. Het raakt wel 3.3.1 Error Identification, omdat de
  foutstatus verandert tijdens de klik. | **Heuristiek:** Visibility of system status; Error
  prevention; Recognition rather than recall ("heb ik nou geklikt?")
- **Locatie:** `@blur="revalidate()"` op `#organisatie`, `#naam` en `#email`
  (r. 1054, 1069, 1079), samen met `.field__error` boven de knoppen
- **Bewijs:** Ik heb deze stappen in Playwright gedaan:
  1. E-mail "sanne@" invullen en "Opslaan en verder" kiezen. De fout verschijnt.
  2. E-mail verbeteren naar "sanne@example.org".
  3. Met de muis op "Opslaan en later verdergaan" klikken.

  **Resultaat: er gebeurt niets.** Het scherm blijft `stap1`, de titel blijft "Fout: …". De
  knop krijgt wel de focus. Pas de **tweede** klik opent de linkpagina. Met het toetsenbord
  (Tab, Enter) werkt het wel in één keer. Wat er gebeurt: bij `mousedown` verlaat de focus het
  e-mailveld. De blur-controle haalt de foutregel weg (~31 px). De knop (44 px hoog) schuift
  omhoog. De `mouseup` valt daarna buiten de knop, dus de browser stuurt geen `click`. In de
  eerste test-run gebeurde precies dit "per ongeluk". Een echte gebruiker zal het dus ook
  tegenkomen.
- **Waarom dit telt:** Muisgebruikers denken dat de knop stuk is. Ze klikken nog eens, of geven
  het op. Het treft vooral mensen die al een fout kregen en dus al onzeker zijn. Ook mensen met
  een tremor of met weinig computerervaring. Een fout die je net verbeterd hebt, mag geen nieuw
  obstakel opleveren.
- **Fix:** Laat de foutstatus alleen veranderen bij verzenden, zoals GOV.UK. In React Hook Form:
  ```ts
  useForm<Organiser>({
    resolver: zodResolver(organiserSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit', // errors only change on the next submit: no layout shift on blur
  });
  ```
  Dit lost ook F-03 op. Wil je toch tussentijds controleren, laat dan nooit inhoud verdwijnen
  op `blur`. Reserveer bijvoorbeeld ruimte voor de foutregel. Maar dat geeft een vreemd gat
  onder elk veld. `onSubmit` is eenvoudiger en beter te testen.
- **Scenario:** "Na het verbeteren van een veld verzendt één klik op Opslaan en later
  verdergaan het formulier" → **Playwright** (`page.click` met de muis, niet `press('Enter')`,
  zodat de echte volgorde mousedown → blur → mouseup wordt nagebootst).

### F-03 — Fouten verschijnen te vroeg, en de samenvatting loopt achter

- **Severity:** moderate · **Effort:** S · **Confidence:** high
- **Criterium:** 3.3.1 Error Identification — A (de getoonde foutstatus klopt niet met de
  echte); 2.4.2 Page Titled — A (de titel zegt "Fout:" terwijl er niets meer fout is) |
  **Heuristiek:** Consistency and standards; Help users recognize, diagnose, and recover from
  errors
- **Locatie:** `revalidate()` (r. 785-787); `@change="revalidate()"` op de radio's
  (r. 1037, 1042); `summary` wordt alleen in `saveStep()` gezet (r. 801)
- **Bewijs:** Twee dingen gemeten:
  1. **Te vroeg.** Na een lege verzending kiest de aanvrager "Namens een organisatie". Het veld
     "Naam van de organisatie" verschijnt **meteen met** de fout "Vul de naam van de organisatie
     in" en `aria-invalid="true"`. De aanvrager heeft het veld nog niet eens gezien.
  2. **Achter.** Na "Sanne de Vries" invullen en het veld verlaten verdwijnt de fout bij het
     veld. De samenvatting toont nog steeds alle drie de fouten, ook "Vul de naam van de
     contactpersoon in". De titel blijft "Fout: Stap 1 van 2: Organisator".
- **Waarom dit telt:** Een fout bij een veld dat je net te zien krijgt, voelt als een
  berisping. Bij een screenreader klinkt het als "ongeldig" bij de eerste kennismaking met het
  veld. Een samenvatting die iets anders zegt dan het formulier zelf, laat de aanvrager twijfelen
  welke van de twee klopt.
- **Fix:** Dezelfde als bij F-02: `reValidateMode: 'onSubmit'`. Samenvatting, velden en titel
  veranderen dan samen, alleen bij verzenden. Zo houdt de foutsamenvatting van GOV.UK zichzelf
  consistent.
- **Scenario's:**
  - "Een voorwaardelijk veld toont geen fout voordat opnieuw is verzonden" → **Playwright**.
  - "Foutsamenvatting, veldfouten en paginatitel veranderen alleen bij verzenden" →
    **Playwright**.

### F-04 — Op een smalle telefoon met grote tekst loopt de linkpagina vast

- **Severity:** moderate · **Effort:** S · **Confidence:** high (gemeten), medium (gewicht:
  dit gaat verder dan de harde eis)
- **Criterium:** 1.4.10 Reflow — AA en 1.4.4 Resize Text — AA. Ze halen allebei de eis zoals
  die er staat. Dit is een **risico**, geen harde fout. | **Heuristiek:** Flexibility and
  efficiency of use; inclusive design
- **Locatie:** `.link-box` (padding `var(--space-3) var(--space-4)`), `.button` (padding
  `var(--space-4)` horizontaal), `.error-summary` (padding en `ul` padding-left), allemaal in
  `rem`
- **Bewijs:**
  - **Eis gehaald.** Op 320 px met normale tekst: geen horizontale scroll op alle vijf de
    schermen, de link breekt af over 6 regels. Bij 200% tekst op 640 en 1280 px: ook niets mis.
  - **Combinatie gaat mis.** 320 px **met** 200% tekst (`html { font-size: 200% }`): de
    pagina wordt 427 px breed. De link staat in een kolom van **88 px breed, 89 regels hoog**
    (4306 px). "Kopieer link" (219 px) steekt buiten het kader. In de foutsamenvatting zijn de
    lijstitems maar 36 px breed.
  - **Oorzaak.** Alle paddings staan in `rem`, dus ze groeien mee met de tekst. Het kader van
    het prototype kost nog eens ~36 px. Maar ook zonder dat kader houd je in de app maar ~150 px
    over voor de link.
- **Waarom dit telt:** Android en iOS laten tekst tot ongeveer 200% vergroten. Een oudere
  aanvrager met slechtziendheid op een telefoon van 360 px krijgt zo een link van tientallen
  regels, die zij niet kan overzien of overtypen. Dit is de pagina waar het juist om die ene
  link gaat.
- **Fix:** Laat binnenruimte op smalle schermen niet meegroeien met de tekst, en laat knoppen
  nooit breder worden dan hun container:
  ```css
  .link-box,
  .error-summary { padding-inline: clamp(0.5rem, 3vw, var(--space-4)); }
  .error-summary ul { padding-left: 1.25em; }
  .button { max-width: 100%; padding-inline: clamp(0.75rem, 4vw, var(--space-4)); }
  @media (max-width: 30em) { .button-row .button { width: 100%; } }
  ```
  Deze regels horen in de app-CSS (tokens of de component). Het prototype hoeft niet aangepast.
- **Scenario's:**
  - "De linkpagina scrollt niet horizontaal op 320 px" → **Playwright**
    (`scrollWidth <= innerWidth`).
  - "… ook bij 200% tekst op 320 px" → **Playwright** als extra, of **handmatig** (Android
    lettergrootte maximaal).

### F-05 — "Opslaan en later verdergaan" werkt alleen als de stap compleet is

- **Severity:** moderate · **Effort:** M · **Confidence:** medium (ontwerpafweging, geen meting)
- **Criterium:** geen SC; raakt 3.3.4 Error Prevention (AA, eigenlijk voor juridische en
  financiële gegevens) in de geest | **Heuristiek:** User control and freedom
- **Locatie:** `saveStep()`: beide knoppen valideren volledig (r. 797-806)
- **Bewijs:** Een lege stap 1 met "Opslaan en later verdergaan" geeft de foutsamenvatting, en
  er wordt niets opgeslagen. Dit is een bewuste keuze. Op stap 1 valt het mee, want die velden
  kent iedereen. Op stap 2 komen datum en tijd. Dat zijn precies de gegevens die iemand nog niet
  weet als hij wil stoppen.
- **Waarom dit telt:** "Later verdergaan" is de uitweg voor iemand die iets moet navragen. Als
  die uitweg vraagt dat alles al klopt, is er geen uitweg. De aanvrager sluit het venster en is
  het werk kwijt. Dat raakt vooral mensen die meer tijd nodig hebben (cognitieve beperking,
  taal).
- **Fix (voorstel, niet bindend):** Laat "Opslaan en later verdergaan" alleen het **formaat**
  controleren van wat is ingevuld (bijvoorbeeld een ongeldig e-mailadres). Lege verplichte velden
  mogen dan blijven. De volledige controle doe je bij "Opslaan en verder" en op de
  controlepagina. In Zod kan dat met twee schema's uit `packages/schema`: een `draft` met
  `.partial()` en een `complete`. Leg de keuze vast in de design van de change.
- **Scenario:** "Opslaan en later verdergaan met een lege verplichte vraag slaat het concept
  op" → **Playwright**. Alleen als je de keuze aanpast.

### F-06 — Het vangnet voor de link is dun

- **Severity:** moderate · **Effort:** S-M · **Confidence:** medium
- **Criterium:** geen SC | **Heuristiek:** Error prevention; Help users recover from errors
- **Locatie:** linkpagina (r. 949-976)
- **Bewijs:**
  - De link is de enige sleutel, en de gemeente kan hem niet opnieuw sturen. De aanvrager heeft
    twee manieren om hem te bewaren: kopiëren en een bladwijzer.
  - Het token (`_Q_NL3Gbh7YHOiVPFcjABOm90VmaA78o1D7x76yIGaI`) is niet over te schrijven: het
    mengt hoofd- en kleine letters en heeft tekens die op elkaar lijken (`l`/`I`/`1`, `O`/`0`).
  - De waarschuwing "Let op: … kwijtgeraakte link" staat pas ná de bladwijzertip, los van het
    linkkader.
  - De bladwijzertip ("het adres in de adresbalk is uw link") klopt alleen als de route van de
    linkpagina zelf de melding opent.
- **Waarom dit telt:** Wie de link kwijt is, begint opnieuw. Mensen zonder vaste klembordroutine
  (veel ouderen, telefoongebruikers) hebben niets aan "kopieer". Ze moeten de link ergens neer
  kunnen zetten waar ze hem terugvinden.
- **Fix:**
  - Zet de waarschuwing direct onder of in het linkkader, vóór de bladwijzertip. Dan staan oorzaak
    en gevolg bij elkaar.
  - Overweeg een derde manier die geen server nodig heeft: een `mailto:`-link "Mail de link naar
    uzelf", met de link in de body. De gemeente bewaart dan niets. Het gaat via de eigen
    mailapp van de aanvrager.
  - Leg als requirement vast dat **elke** URL onder `/aanvraag/<token>/` (ook die van de
    linkpagina) het concept opent. Dan is de bladwijzertip altijd waar.
  - Zet `Referrer-Policy: no-referrer`, zodat het token niet via de `Referer`-header naar
    andere sites lekt. Dat is geen UX-punt, maar wel nodig om "iedereen met de link" waar te
    maken.
- **Scenario's:**
  - "Een bladwijzer van de linkpagina opent het concept" → **Playwright**.
  - "De mailknop bevat de persoonlijke link" → **Playwright** (`href` controleren).

### F-07 — De foutsamenvatting heeft een naam die niet telt

- **Severity:** minor · **Effort:** S · **Confidence:** medium (axe "needs review"; effect per
  screenreader niet getest)
- **Criterium:** 4.1.2 Name, Role, Value — A (best practice) | **APG/GOV.UK:** error summary
- **Locatie:** `div#error-summary` met `aria-labelledby` en zonder rol (r. 989-995)
- **Bewijs:** axe meldt `aria-prohibited-attr` als *incomplete* op `#error-summary`. Een `div`
  zonder rol is `generic`, en daar mag geen naam op. Chromium geeft hem toch de naam "Er is
  een probleem", maar screenreaders hoeven die niet te gebruiken.
- **Waarom dit telt:** Bij focus hoort de aanvrager in het beste geval de inhoud. In het
  slechtste geval hoort hij alleen "klikbaar". De naam "Er is een probleem" is wat je wilt
  laten horen.
- **Fix:** Volg de markup van GOV.UK Frontend. Haal `aria-labelledby` weg en zet een
  `role="alert"` om de inhoud heen:
  ```tsx
  <div className="error-summary" ref={summaryRef} tabIndex={-1}>
    <div role="alert">
      <h2>{title}</h2>
      <ul>{/* links to fields */}</ul>
    </div>
  </div>
  ```
  `ErrorSummary` krijgt `title` en de foutteksten via props (ADR-0005).
- **Scenario:** "De foutsamenvatting krijgt de focus en heeft de kop Er is een probleem" →
  **Playwright**; het voorlezen → **handmatig**.

### F-08 — `aria-labelledby` op de alinea met de link doet niets

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** 1.3.1 Info and Relationships — A (best practice); 4.1.2 — A
- **Locatie:** `<p class="link-box__url" aria-labelledby="link-label-a">` (r. 959)
- **Bewijs:** axe meldt `aria-prohibited-attr` als *incomplete*. De rol `paragraph` mag geen
  naam hebben. De accessibility tree toont twee losse alinea's: "Uw persoonlijke link" en de URL.
- **Waarom dit telt:** Het kwaad is klein, want het label staat er direct boven. Maar ARIA die
  stil genegeerd wordt, geeft schijnzekerheid: wie de code leest, denkt dat de koppeling er is.
- **Fix:** Haal `aria-labelledby` weg. De volgorde label → URL is genoeg.
- **Scenario:** gaat mee met een axe-check per pagina in `e2e/` → **Playwright** (axe zonder
  *incomplete* op `aria-prohibited-attr`).

### F-09 — De stappenindicator spreekt de kop tegen en staat in een `nav` zonder links

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** 1.3.1 Info and Relationships — A (best practice); 3.2.4 Consistent
  Identification — AA (in de geest) | **Heuristiek:** Consistency and standards
- **Locatie:** `nav[aria-label="Stappen"] ol.steps` (r. 981-987, 1101-1107) en de `h1`
  "Stap 1 van 2"
- **Bewijs:** De kop zegt "Stap 1 van **2**". De indicator toont **drie** items (1. Organisator,
  2. Evenement, 3. Controleren). Ook zit de lijst in een `navigation`-landmark zonder één link.
  Een screenreader kondigt "navigatie Stappen" aan, en er valt niets te navigeren.
- **Waarom dit telt:** "Hoe ver ben ik?" is een kernvraag in een formulier. Twee verschillende
  antwoorden kosten vertrouwen. Een landmark zonder navigatie vervuilt de lijst met landmarks.
- **Fix:**
  - Kies één telling. Bijvoorbeeld "Stap 1 van 3", als controleren een stap is. Of laat
    "Controleren" weg uit de indicator.
  - Vervang `<nav>` door een gewone `<ol aria-label="Stappen">`. `aria-current="step"` mag
    blijven.
  - Overweeg de indicator helemaal weg te laten. GOV.UK raadt hem af: de caption in de `h1` doet
    het werk al.
- **Scenario:** "Kop en stappenindicator noemen hetzelfde aantal stappen" → **Playwright**.

### F-10 — Een tweede klik op "Kopieer link" wordt niet opnieuw gemeld

- **Severity:** minor · **Effort:** S · **Confidence:** high (DOM), medium (screenreader)
- **Criterium:** 4.1.3 Status Messages — AA | **Heuristiek:** Visibility of system status
- **Locatie:** `copyLink()` (r. 829-836)
- **Bewijs:** Twee klikken achter elkaar geven één DOM-mutatie. De tekst is hetzelfde, dus er
  verandert niets dat een live region kan melden. De melding blijft ook staan tot de aanvrager
  de pagina verlaat.
- **Waarom dit telt:** Wie twijfelt en nog eens drukt, hoort niets en denkt dat de tweede poging
  mislukte.
- **Fix:** Maak de regio eerst leeg en zet de tekst een tik later terug. Of laat de melding na
  een paar seconden verdwijnen. Doe dat niet te snel: 2.2.1 Timing Adjustable.
  ```ts
  setCopyMessage('');
  queueMicrotask(() => setCopyMessage(t('link.copied')));
  ```
- **Scenario:** "Kopieer link meldt elke keer dat de link is gekopieerd" → **Playwright**
  (tekst wisselt), voorlezen **handmatig**.

### F-11 — "Verder met invullen" gaat terug naar een stap die al af is

- **Severity:** minor · **Effort:** S · **Confidence:** medium
- **Criterium:** geen SC | **Heuristiek:** Match between system and the real world; User
  control and freedom
- **Locatie:** `go('stap1')` in de knop van de linkpagina (r. 974-975)
- **Bewijs:** "Opslaan en later verdergaan" slaagt alleen als stap 1 klopt. "Verder met
  invullen" brengt de aanvrager toch terug naar stap 1. Daar moet ze opnieuw op "Opslaan en
  verder" drukken. Ook zijn "Verder naar stap 1" en "Verder met invullen" `<button>`s, terwijl
  ze alleen navigeren.
- **Waarom dit telt:** "Verder" belooft vooruitgang. Terugkomen bij dezelfde vragen voelt alsof
  het opslaan niet gelukt is. Dat maakt de twijfel uit F-01 groter.
- **Fix:**
  - Laat "Verder met invullen" naar dezelfde plek gaan als de persoonlijke link bij hervatten.
    Bijvoorbeeld de eerste stap die nog niet af is. Leg die regel één keer vast en gebruik hem
    op beide plekken.
  - Maak het in React Router een `<Link>` met knopstijl. Dan werken "open in nieuw tabblad" en
    de Terug-knop van de browser zoals verwacht.
- **Scenario:** "Verder met invullen opent dezelfde stap als de persoonlijke link" →
  **Playwright**.

### F-12 — Radio's halen 24 px precies, het klikvlak kan ruimer

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** 2.5.8 Target Size (Minimum) — AA: **gehaald**; 2.5.5 Target Size (Enhanced)
  — AAA: niet gehaald
- **Locatie:** `.radio input` (24×24) en het label (24 px hoog) in een rij van 44 px
- **Bewijs:** Gemeten: `soort-particulier` 24×24, label 84×24; `soort-organisatie` 24×24, label
  195×24. Boven en onder in de rij van 44 px reageert niets op een klik.
- **Waarom dit telt:** Op een telefoon, of met een trillende hand, mis je net de rand. Het label
  helpt, maar alleen over de hoogte van één regel tekst.
- **Fix:** Laat het label de rij vullen:
  `.radio label { flex: 1; min-height: 2.75rem; display: flex; align-items: center; }`.
- **Scenario:** niet nodig als apart scenario. Neem het mee in de Storybook-story van het
  radioveld.

## Prioritering

**Quick wins (eerst doen — hoge impact, lage moeite):**
1. **F-02 + F-03** — één regel (`reValidateMode: 'onSubmit'`) lost een kapotte klik, te vroege
   fouten en een achterlopende samenvatting tegelijk op.
2. **F-01** — de bevestiging in kop en titel zetten is een tekstwijziging. Zonder dit weet
   een screenreadergebruiker niet of "later verdergaan" gelukt is.
3. **F-04** — een paar CSS-regels met `clamp()`. Dan is de belangrijkste pagina ook leesbaar
   op een telefoon met grote tekst.

**Strategisch (plannen, beslissen in de design van de change):**
1. **F-05** — mag "later verdergaan" onvolledige gegevens bewaren? Op stap 2 weegt dit zwaarder.
2. **F-06** — vangnet voor de link (mailto, plek van de waarschuwing, elke token-URL hervat).
3. **F-11** — één regel voor "waar ga ik verder", gedeeld door de knop en de link.

**Polish (als er tijd is):**
1. F-07, F-08, F-09, F-10, F-12.

> Waarom deze volgorde: F-02 en F-01 raken het moment waarop de aanvrager het meest onzeker is,
> namelijk net na een fout of net voor het sluiten van het venster. Ze kosten weinig. F-05 en
> F-06 zijn productkeuzes. Die horen in het OpenSpec-design, niet in een snelle fix. De minors
> zijn markup-hygiëne. Ze worden vanzelf gevangen als je de axe-check met *incomplete*-items in
> `e2e/` opneemt.

## Voorstel voor scenario's (add-draft-application)

| # | Scenario (titel = testtitel) | Bron | Verificatie |
|---|---|---|---|
| 1 | Na Opslaan en later verdergaan noemen kop en titel dat de stap is opgeslagen | F-01 | Playwright |
| 2 | Na Opslaan en verder staat de bevestiging direct na de kop | F-01 | Playwright |
| 3 | Een schermlezer meldt dat stap 1 is opgeslagen | F-01 | manual (NVDA, VoiceOver) |
| 4 | Na het verbeteren van een veld verzendt één klik het formulier | F-02 | Playwright (muisklik) |
| 5 | Een voorwaardelijk veld toont geen fout voordat opnieuw is verzonden | F-03 | Playwright |
| 6 | Foutsamenvatting, veldfouten en paginatitel veranderen alleen bij verzenden | F-03 | Playwright |
| 7 | De linkpagina scrollt niet horizontaal op 320 px | F-04 | Playwright |
| 8 | Een bladwijzer van de linkpagina opent het concept | F-06 | Playwright |
| 9 | De foutsamenvatting krijgt de focus en heeft de kop Er is een probleem | F-07 | Playwright; voorlezen manual |
| 10 | Kop en stappenindicator noemen hetzelfde aantal stappen | F-09 | Playwright |
| 11 | Kopieer link meldt elke keer dat de link is gekopieerd | F-10 | Playwright; voorlezen manual |
| 12 | Verder met invullen opent dezelfde stap als de persoonlijke link | F-11 | Playwright |

Het gedrag dat nu al goed is, verdient ook een scenario. Anders gaat het stil kapot:
- "Bij elke stapwissel krijgt de `h1` de focus en verandert de titel";
- "Een link in de foutsamenvatting zet de focus op het veld";
- "Kopieer link zet de link op het klembord en meldt dat".

Alle drie zijn met Playwright te automatiseren.

## Methode & beperkingen

- **Input-type:** live (lokaal geserveerd prototype, `python3 -m http.server` op
  `127.0.0.1`) plus de broncode van het HTML-bestand en de JSON-data.
- **Tools gebruikt:**
  - Playwright 1.63 (Chromium) met `@axe-core/playwright` 4.13. Tags: `wcag2a`, `wcag2aa`,
    `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`, beperkt tot `.proto__frame`.
  - Vijf toestanden gescand: startpagina, linkpagina (start), stap 1 leeg, stap 1 met fouten,
    linkpagina (later), stap 2.
  - Uitkomst: **0 overtredingen**. Twee keer *incomplete* `aria-prohibited-attr` (F-07, F-08).
    Dat dekt ongeveer een derde van wat telt. De rest van deze review is handwerk.
- **Handmatige en gescripte checks:**
  - Toetsenbord: tabvolgorde, skip link → `main`, Enter op knoppen en op links in de
    samenvatting.
  - `document.activeElement` ~150 ms na elke actie.
  - Paginatitels, Playwright `ariaSnapshot`, en de volledige AX-tree via CDP (namen,
    beschrijvingen, `invalid`).
  - Een `MutationObserver` op `[role=status]` met de `display` van regio en section, plus een
    `focusin`-log.
  - Muisklik tegenover toetsenbord na een correctie bij blur.
  - Kopiëren: klembord gelezen, en het foutpad nagebootst.
  - Klikvlakken gemeten.
  - Reflow: 320 px bij 100%, 640 en 1280 px bij 200% tekst, en 320 px bij 200% tekst.
  - Contrast van de tokenparen nagerekend.
- **Niet verifieerbaar met deze input:**
  - **Echte screenreader-uitvoer.** Of "Stap 1 is opgeslagen" en "De link is gekopieerd"
    worden voorgelezen, is afgeleid, niet gehoord. Controleer dit met NVDA + Firefox en
    VoiceOver + Safari.
  - **Firefox en WebKit.** Niet gedraaid.
  - **Touch.** Of F-02 ook bij een tik optreedt, is niet getest. Dat hangt af van hoe de
    browser na een tik de klik aan een element koppelt. Controleer dit op een echte telefoon.
  - **Browserzoom.** De 200%-test gebruikte `html { font-size: 200% }`, geen echte zoom of
    OS-lettergrootte.
  - **Echte routes.** De bladwijzer, de Terug-knop van de browser en hervatten via de link
    bestaan nog niet. Die horen bij de echte React Router-routes.
- **Standaarden:** WCAG 2.2 AA; EN 301 549 / Besluit digitale toegankelijkheid overheid;
  WAI-ARIA APG en het GOV.UK Design System (error summary, conditionele vragen, stappen).
