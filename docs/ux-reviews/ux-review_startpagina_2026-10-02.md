---
title: "UX & Accessibility Review — Startpagina Evenementenloket Kranswijk"
target: "Startpagina + paginaframe (SkipLink, PageShell, StartPage, Layout, tokens/base CSS, nl.json, index.html)"
input_type: "live-url + react-code"
date: "2026-10-02"
reviewer: "ux-a11y-reviewer"
wcag_target: "WCAG 2.2 AA"
standards: ["WCAG 2.2", "EN 301 549", "EAA", "WAI-ARIA APG"]
language: "nl"
lastUpdated: "2026-10-02T12:00:00Z"
---

# UX & Accessibility Review — Startpagina Evenementenloket Kranswijk

> Scope: het paginaframe (skip link, header met home-link, main, footer) en de tijdelijke
> startpagina (één kop en een intro). Getoetst tegen WCAG 2.2 AA plus usability, in de context
> van een Nederlandse gemeentelijke dienst (EN 301 549 / Digitoegankelijk). Het formulier valt
> buiten deze change. Daarom noem ik alleen wat het frame straks moet kunnen.

## Samenvatting

Het frame is goed. Ik vond **geen fouten tegen WCAG 2.2 AA** die gebruikers blokkeren. Toetsenbord,
skip link, landmarks, taal, paginatitel, focusring en contrast zijn op orde. De meeste daarvan zijn
ook aantoonbaar bewuste keuzes (tokens met vastgelegd contrast, een i18n-test die ook `aria-label`
controleert). Het belangrijkste punt is iets wat geen tool ziet: **op een telefoon met grote
tekst (200%) past het woord "Evenementenloket" niet meer in de header**. De hele pagina gaat dan
horizontaal scrollen. Pak dat als eerste op. Daarna volgen kleine verbeteringen aan de home-link
(`aria-current`, één bron voor de naam) en aan de skip link.

## Conformiteit in één oogopslag

| Severity | Aantal | Voorbeeld-SC |
|---|---|---|
| blocker | 0 | — |
| critical | 0 | — |
| serious | 0 | — |
| moderate | 1 | 1.4.4 / 1.4.10 (risico, geen harde fout) |
| minor | 8 | 2.5.3 (risico), 2.4.2, 1.4.8 (AAA), 3.1.5 (AAA) |

- **Getoetst niveau:** WCAG 2.2 AA (+ AAA-winst waar die goedkoop is).
- **EU-context:** van toepassing. Een gemeentelijke dienst valt onder het Besluit digitale
  toegankelijkheid overheid (EN 301 549, verwijst naar WCAG 2.1 AA). WCAG 2.2 AA is dus een
  strengere lat dan wettelijk nodig. Dat is goed.
- **Betrouwbaarheid van deze review:** hoog voor gedrag dat ik live heb gemeten (toetsenbord,
  focus, accessibility tree, reflow, tekstvergroting, forced colors, titel, taal). Middel voor de
  inschatting van tekst (B1) en voor risico's die pas later spelen. Ik heb **geen echte
  screenreader** (NVDA, JAWS, VoiceOver, TalkBack) gebruikt. Wat een screenreader uitspreekt, heb
  ik afgeleid uit de accessibility tree van Chromium.

## Wat goed gaat

- **Focusring als token, ruim boven de norm.** `--focus-color: #5a2ca0` op wit is **9,12:1**, op
  `--color-surface` 8,19:1. Hij is 3px dik met 2px ruimte (offset). Dat haalt 2.4.7 en 1.4.11
  ruim, en waarschijnlijk ook 2.4.13 Focus Appearance (AAA). In forced colors (Windows hoog
  contrast) neemt de browser hem netjes over met een systeemkleur. Omdat hij op
  `:focus-visible` staat, zien muisgebruikers geen ring en toetsenbordgebruikers wel.
- **De skip link werkt in alle drie de engines.** In Chromium, Firefox en WebKit is "Naar de
  inhoud" de eerste tabstop, wordt hij zichtbaar bij focus en zet Enter de focus echt op `<main>`
  (`tabIndex={-1}` plus expliciete `focus()`). Het commentaar in `SkipLink.tsx` laat zien dat je
  weet waarom: niet elke browser verplaatst de focus bij een fragment-link. Hij is verborgen met
  `transform` en niet met `display:none`, dus screenreaders vinden hem gewoon.
- **Structuur en metadata zijn compleet.** In de accessibility tree staan de skip link, `banner`,
  `main` (met één `h1`) en `contentinfo`, in de volgorde die je ook ziet. `lang="nl"` staat
  statisch in `index.html` en wordt in `main.tsx` nog eens gezet. De titel zet de pagina vóór de
  dienst ("Een evenement melden - Evenementenloket Kranswijk"). Dat is de goede volgorde voor
  wie veel tabbladen open heeft of een screenreader gebruikt.
- **Ontwerpkeuzes die je kunt aantonen.** De contrastratio's staan bij de tokens in
  `tokens.css`. Ik heb ze nagerekend en ze kloppen (tekst 14,8:1, muted 7,19:1 / 6,46:1, primary
  7,69:1). Lettergroottes staan in `rem`, er worden geen externe fonts geladen, en klikvlakken zijn
  ruim (home-link 208×54 px, skip link 171×43 px, ver boven de 24×24 van 2.5.8). De test in
  `Layout.test.tsx` die elke tekst én elk `aria-label` controleert op vertaling is sterk. Zo'n
  test voorkomt een hele klasse fouten voordat ze ontstaan.

## Bevindingen

### F-01 — Merknaam past niet bij grote tekst op een telefoon

- **Severity:** moderate · **Effort:** S · **Confidence:** high (gedrag gemeten), medium (WCAG-indeling)
- **Criterium:** 1.4.4 Resize Text — AA en 1.4.10 Reflow — AA (risico, geen harde fout) |
  **Heuristiek:** Flexibility and efficiency of use; inclusive design
- **Locatie:** `apps/web/src/components/PageShell/PageShell.css` — `.page-shell__home-link`,
  `.page-shell__service`
- **Bewijs:** ik heb alleen de tekst vergroot (`html { font-size: 200% }`, net als de
  tekstgrootte-instelling van Android of de browser). Bij 360, 375 en 414 px breed wordt
  `document.scrollWidth` dan **448 px**. De oorzaak is alleen `.page-shell__service`
  ("Evenementenloket", 44px vet), die niet kan afbreken. Daardoor scrolt de hele pagina
  horizontaal. De groene lijn onder de header en het grijze vlak van de footer houden op bij de
  rand van het scherm, terwijl de merknaam doorloopt. Bij 150% gaat het alleen op 320 px mis
  (336 px). Gewone paginazoom (400% op 1280 px, dus 320 CSS-px) en tekst op 200% op desktop gaan
  wel goed: geen horizontaal scrollen.
- **Waarom dit telt:** mensen met een visuele beperking zetten hun tekst vaak groter op hun
  telefoon, en dat is precies de doelgroep van 1.4.4. Formeel mag scrollen bij 1.4.4. Maar
  scrollen in twee richtingen is voor deze lezers de meest vermoeiende vorm van lezen, en
  1.4.10 bestaat juist om dat te voorkomen. Nederlandse samenstellingen ("Evenementenloket",
  straks ook "Evenementenvergunning") zijn lange woorden zonder spatie. Die breken alleen af als
  je de browser dat toestaat.
- **Fix:**
  ```css
  .page-shell__home-link {
    max-width: 100%;
  }

  .page-shell__service {
    /* Let long Dutch compounds wrap instead of pushing the page wider */
    overflow-wrap: anywhere;
    hyphens: auto; /* uses lang="nl": "Evenementen-loket" where the browser has a Dutch dictionary */
  }
  ```
  Leg dit vast in een test: een Playwright-check die bij 360 px en `font-size: 200%` controleert
  dat `scrollWidth <= clientWidth`. Zet `overflow-wrap: anywhere` eventueel ook op `h1`, voor
  langere koppen in de formulierstappen.

### F-02 — De zichtbare skip link schuift over de merknaam heen

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** geen harde fout (2.4.11 gaat over het element mét focus, en dat is zelf
  zichtbaar) | **Heuristiek:** Aesthetic and minimalist design; Consistency
- **Locatie:** `apps/web/src/components/SkipLink/SkipLink.css`
- **Bewijs:** na de eerste Tab staat "Naar de inhoud" (wit vlak op `top/left: 0.5rem`) over
  "Evenementen…" heen. Je ziet dan "Naar de inhoud **oket**". Het witte vlak valt weg tegen de
  witte header. Alleen de paarse focusring scheidt de twee.
- **Waarom dit telt:** de eerste indruk van een toetsenbordgebruiker is nu een half verborgen
  logo met een losse "oket" ernaast. Dat ziet eruit als een fout en kost even denkwerk. Het gaat
  om ziende toetsenbordgebruikers, bijvoorbeeld mensen met een motorische beperking.
- **Fix:** laat de skip link bij focus ruimte innemen boven de header, zodat hij niets bedekt. Of
  geef hem een duidelijk eigen vlak, zodat je ziet dat het een laag erboven is:
  ```css
  .skip-link:focus {
    position: static;   /* takes up space above the header instead of covering it */
    display: inline-block;
    margin: var(--space-2);
    transform: none;
  }
  ```
  Dat de pagina even verspringt bij focus is hier acceptabel. Het gebeurt alleen voor wie tabt,
  en alleen bovenaan de pagina.

### F-03 — Na de skip link zie je niet waar de focus is

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** grensgeval rond 2.4.7 Focus Visible — AA (`<main>` is geen bedieningselement,
  dus formeel geen fout) | **Heuristiek:** Visibility of system status
- **Locatie:** `PageShell.css` — `.page-shell__main:focus { outline: none; }`
- **Bewijs:** na Enter op de skip link is `document.activeElement` `<main>` en matcht
  `:focus-visible`. De outline staat bewust uit. Op deze korte pagina scrolt er niets, dus je
  ziet **geen enkel verschil** tussen vóór en na Enter (screenshot vergeleken).
- **Waarom dit telt:** een ziende toetsenbordgebruiker drukt op Enter en ziet niets gebeuren. Is
  het gelukt? Pas bij de volgende Tab merkt hij het. Dit is een bewuste en verdedigbare keuze
  (GOV.UK doet het ook zo), want een ring rond het hele main-vlak oogt als een fout. Toch is het
  goed om dit bewust te beslissen.
- **Fix (keuze):** (a) laat het zo en noteer de afweging in de component-docs. Of (b) laat de
  skip link naar de `h1` wijzen in plaats van naar `<main>`, en geef die bij focus een zichtbare
  ring. Dat helpt ook bij focus na een route-wissel (zie "Wat het frame straks moet kunnen"):
  ```css
  .page-shell__main h1:focus-visible {
    outline: var(--focus-width) solid var(--focus-color);
    outline-offset: var(--focus-offset);
  }
  ```

### F-04 — De naam van de home-link staat twee keer in nl.json

- **Severity:** minor · **Effort:** S · **Confidence:** medium (risico voor later, nu correct)
- **Criterium:** 2.5.3 Label in Name — A | **Heuristiek:** Consistency and standards
- **Locatie:** `PageShell.tsx` (`aria-label={text.homeLink}`); `nl.json` `app.homeLink`,
  `app.service`, `app.municipality`
- **Bewijs:** zichtbare tekst: "Evenementenloket Gemeente Kranswijk". Toegankelijke naam:
  "Evenementenloket Gemeente Kranswijk, naar de startpagina". Dat is **nu goed**: de naam begint
  met de zichtbare tekst, in dezelfde volgorde. Maar het zijn drie losse strings. Pas je
  `app.service` aan (bijvoorbeeld naar "Evenementen­loket Kranswijk") en vergeet je
  `app.homeLink`, dan is 2.5.3 stilletjes stuk. Geen test vangt dat. Daarnaast vertalen
  vertaalfuncties in browsers `aria-label` vaak niet. Een anderstalige screenreadergebruiker
  hoort dan een Nederlandse naam bij een vertaalde pagina.
- **Waarom dit telt:** iemand die met spraakbesturing werkt, zegt wat hij ziet ("klik
  Evenementenloket"). Dat werkt alleen als de toegankelijke naam de zichtbare tekst bevat.
- **Fix:** laat de naam opbouwen uit dezelfde bronnen:
  ```json
  "homeLink": "{{service}} {{municipality}}, naar de startpagina"
  ```
  ```tsx
  homeLink: t('app.homeLink', { service: t('app.service'), municipality: t('app.municipality') }),
  ```
  Nog robuuster: geen `aria-label`, maar de toevoeging ", naar de startpagina" als visueel
  verborgen `<span>` in de link (tekst via een prop). Dan bestaat de naam altijd uit de zichtbare
  tekst plus iets erachter, en wordt hij ook vertaald.

### F-05 — Home-link meldt niet dat je al op de startpagina bent

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** best practice bij 1.3.1 Info and Relationships / 2.4.8 Location (AAA) |
  **Heuristiek:** Visibility of system status
- **Locatie:** `PageShell.tsx` — `<Link to="/">`
- **Bewijs:** op `/` heeft de link geen `aria-current`. Een screenreader zegt "link,
  Evenementenloket … naar de startpagina", terwijl je daar al bent.
- **Waarom dit telt:** een screenreadergebruiker kan de link activeren en dan niets zien
  veranderen. Straks, in een formulier met meerdere stappen, is "waar ben ik" juist de vraag die
  de interface moet beantwoorden.
- **Fix:** gebruik `NavLink` van React Router met `end`. Die zet zelf `aria-current="page"`
  als de route actief is:
  ```tsx
  <NavLink className="page-shell__home-link" to="/" end aria-label={text.homeLink}>
  ```

### F-06 — Zonder JavaScript: lege pagina zonder titel

- **Severity:** minor · **Effort:** S–M · **Confidence:** high
- **Criterium:** 2.4.2 Page Titled — A (tijdens het laden) | **Heuristiek:** Help users recognize,
  diagnose, and recover from errors
- **Locatie:** `apps/web/index.html`
- **Bewijs:** met JS uitgeschakeld is `document.title` `""` en is de body leeg. Hetzelfde zie je
  kort tijdens het laden of als het script faalt (trage verbinding, script geblokkeerd): het
  tabblad toont alleen de URL.
- **Waarom dit telt:** een lege witte pagina zonder titel zegt niets over wat er misging. Een
  screenreader meldt alleen "127.0.0.1". Na het renderen is 2.4.2 wél in orde. Dit gaat alleen
  over de terugvalsituatie.
- **Fix:** zet bij de build een vaste titel en een `<noscript>`-melding in `index.html`, met
  tekst uit `nl.json` zodat ADR 0005 blijft kloppen. Bijvoorbeeld via een kleine Vite-plugin met
  `transformIndexHtml` die `app.pageTitle`-varianten en een nieuwe sleutel `noscript` invult.
  Hardcoded tekst in `index.html` zou de regel "geen hardcoded tekst" breken. Doe het dus via de
  build.

### F-07 — Introtekst: "straks" is vaag, en de eerste zin is lang

- **Severity:** minor · **Effort:** S · **Confidence:** medium
- **Criterium:** 3.1.5 Reading Level — AAA (B1 als projectdoel) | **Heuristiek:** Match between
  system and the real world; Visibility of system status
- **Locatie:** `nl.json` — `start.intro`
- **Bewijs:** "Organiseert u een klein evenement in Kranswijk, zoals een buurtfeest, markt of
  sportdag? Hier meldt u het straks bij de gemeente." De woorden zijn B1 en de kop "Een
  evenement melden" is helder en actiegericht. Maar "straks" kun je lezen als "zo meteen, op
  deze pagina" of als "later, nog niet". De bezoeker kan nu niets doen. De vraagzin bevat
  bovendien twee ideeën (wie het betreft + voorbeelden).
- **Waarom dit telt:** lezers met minder taalvaardigheid, of met dyslexie of een cognitieve
  beperking, gaan zoeken naar een knop die er niet is. Eén idee per zin is de eenvoudigste
  B1-regel.
- **Fix (tijdelijke tekst, tot het formulier er is):**
  > Organiseert u een klein evenement in Kranswijk? Bijvoorbeeld een buurtfeest, markt of
  > sportdag. Dat meldt u hier bij de gemeente. Het formulier is nog niet klaar.

### F-08 — Footer is niet te onderscheiden in forced colors

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** geen harde fout (raakt aan 1.3.1 / 1.4.11) | **Heuristiek:** Aesthetic and
  minimalist design; inclusive design
- **Locatie:** `PageShell.css` — `.page-shell__footer`
- **Bewijs:** met `forced-colors: active` blijft de rand onder de header zichtbaar (die is een
  `border`). Het grijze vlak van de footer (een `background`) verdwijnt. De disclaimer staat dan
  los tussen de andere tekst.
- **Waarom dit telt:** gebruikers van Windows hoog contrast (vaak slechtziend, of gevoelig voor
  licht) zien niet meer dat de disclaimer een aparte zone is. Juist "Vul geen echte gegevens in"
  moet opvallen.
- **Fix:** een transparante rand wordt in forced colors zichtbaar, en kost verder niets:
  ```css
  .page-shell__footer {
    border-top: 1px solid transparent;
  }
  ```

### F-09 — Regels zijn aan de lange kant

- **Severity:** minor · **Effort:** S · **Confidence:** high
- **Criterium:** 1.4.8 Visual Presentation — AAA (max. 80 tekens) | **Heuristiek:** cognitive load
- **Locatie:** `tokens.css` `--content-max-width: 45rem` op `p` (body 1.125rem)
- **Bewijs:** op 1280 px is de eerste regel van de intro 78 tekens. Met smallere letters of
  kortere woorden kom je boven de 80. De norm voor goed lezen is 50 tot 75 tekens.
- **Waarom dit telt:** bij lange regels vinden lezers moeilijker het begin van de volgende regel
  terug. Dat speelt vooral bij dyslexie, en straks bij uitlegteksten in het formulier.
- **Fix:** begrens alinea's op tekens in plaats van rem, en laat de layoutbreedte zoals hij is:
  ```css
  p { max-width: 65ch; }
  ```

## Prioritering

**Quick wins (eerst doen, veel effect voor weinig werk):**
1. **F-01**: de enige bevinding die lezers echt hindert, en de fix is twee CSS-regels plus één
   test.
2. **F-04 + F-05**: dezelfde regel code (de home-link). Doe ze samen. Zo blijft 2.5.3 ook
   later goed.
3. **F-08**: één regel CSS.

**Strategisch (plannen, vóór het formulier):**
1. **F-03**: beslis waar focus "landt" (main of `h1`). Dezelfde keuze bepaalt straks de focus na
   elke stapwissel in het formulier.
2. **F-06**: een build-stap die `index.html` uit `nl.json` vult. Klein, maar het raakt de
   build-setup.

**Polish (als er tijd is):**
1. **F-02**, **F-07**, **F-09**

> Waarom deze volgorde: F-01 is het enige punt waarbij een echte groep gebruikers nu werk moet
> verzetten om de pagina te lezen. F-04 en F-05 zijn goedkoop en voorkomen een stille regressie.
> F-03 hoort bij een ontwerpkeuze die het formulier straks erft, en is dus belangrijker dan zijn
> severity doet vermoeden.

## Wat het frame straks moet kunnen (geen bevindingen)

Het formulier valt buiten deze change. Deze eisen komen dan op het frame af:

- **Focus en melding bij route-wissel (2.4.3, 4.1.3).** React Router verplaatst de focus niet.
  Na elke navigatie moet de focus naar de nieuwe `h1` (of `main`), en moet de nieuwe titel
  hoorbaar zijn. Bouw dit één keer in `Layout` (bijvoorbeeld een `useEffect` op
  `location.pathname`), en niet per pagina. De keuze bij F-03 hoort hier bij.
- **Sticky elementen (2.4.11 Focus Not Obscured).** Als er een vaste header of stappenbalk komt,
  zet dan `scroll-padding-top` zodat gefocuste velden er niet onder verdwijnen.
- **Focusring op lichtgrijze vlakken en invoervelden.** De ring haalt 8,19:1 op
  `--color-surface`. Let op de randen van invoervelden: die moeten zelf 3:1 halen (1.4.11).
  `--color-text-muted` (7,19:1) is daarvoor een veilige kandidaat.
- **Lange samenstellingen in koppen en labels.** De les uit F-01 geldt ook voor labels als
  "Evenementenvergunningaanvraag".

## Verdieping

### 1. Toegankelijke naam en zichtbaar label: twee bronnen van waarheid

**Het mentale model.** Elk interactief element heeft één *accessible name*. De browser berekent
die in een vaste volgorde: `aria-labelledby` gaat voor `aria-label`, en die gaat voor de inhoud
van het element. Zodra je `aria-label` zet, **vervangt** dat de zichtbare tekst helemaal. Er komt
niets bij. Bij je home-link negeert de screenreader dus de twee `<span>`s en leest alleen het
label. Dat gaat nu goed, omdat je het label met de hand gelijk hebt gemaakt aan de zichtbare
tekst.

**De misvatting.** "Een `aria-label` is een extra uitleg voor screenreaders." Nee, het is een
*vervanging*. Daarom is 2.5.3 Label in Name er: spraakbesturing (Dragon, Voice Control) zoekt op
de *naam*, maar de gebruiker zegt wat hij *ziet*. Wijken die af, dan werkt "klik
Evenementenloket" niet meer.

**Hoe je dit breder toepast.** Liever *toevoegen aan* zichtbare tekst dan die *vervangen*. Dat
kan met een visueel verborgen span in de link, of met `aria-describedby` voor extra uitleg. Moet
je toch `aria-label` gebruiken, bouw het dan uit dezelfde vertaalsleutels als de zichtbare tekst
(F-04). Dan kan het niet uit elkaar lopen. Dit wordt belangrijk bij het formulier: knoppen als
"Volgende" met `aria-label="Naar stap 3: locatie"` breken 2.5.3 als het zichtbare woord niet
vooraan in de naam staat.

**Verder lezen:** W3C, *Understanding SC 2.5.3: Label in Name*
(https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).

### 2. Tekst vergroten is niet hetzelfde als zoomen

**Het mentale model.** Er zijn twee manieren om iets groter te maken. *Paginazoom* (Ctrl +)
vergroot alles en maakt het scherm in CSS-pixels smaller: 400% op 1280 px wordt 320 CSS-px. Dat
toetst 1.4.10, en je layout haalt dat. *Alleen tekst vergroten* (Android-tekstgrootte, de
lettergrootte-instelling van Firefox, `html { font-size }`) laat de breedte gelijk en maakt
alleen de letters groter. Dat toetst 1.4.4. Bij een smal scherm plus grote letters komen beide
samen, en dan valt één niet-afbreekbaar woord buiten het scherm.

**De misvatting.** "Mijn layout is responsive en haalt 320 px, dus grote tekst gaat ook goed."
Responsive gaat over *breedte*. Tekstvergroting gaat over *de verhouding tussen tekst en
breedte*. Nederlands maakt dit erger dan Engels, omdat samenstellingen één lang woord zijn.
"Evenementenloket" op 44px is ongeveer 400px breed.

**Hoe je dit breder toepast.** Neem in je checklist en je Playwright-tests een derde
combinatie op naast "320 px" en "200% zoom": **360 px breed + `font-size: 200%`**, en controleer
`scrollWidth <= clientWidth`. Gebruik `overflow-wrap: anywhere` op elke plek waar een lang woord
of een gebruikersinvoer (e-mail, naam van het evenement) kan staan. Gebruik `hyphens: auto` waar
`lang="nl"` mooie afbrekingen geeft.

**Verder lezen:** W3C, *Understanding SC 1.4.4: Resize Text*, vooral het stuk over
tekstvergroting zonder paginazoom
(https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).

## Groei als UX Engineer

- **Patroon in deze review:** de basis is opvallend sterk en bewust (tokens met contrast,
  i18n-test, skip link die in alle browsers werkt). De bevindingen zitten allemaal in de
  *randgevallen*: een andere manier van vergroten (F-01), een andere kleurmodus (F-08), de
  laadfase (F-06), en twee strings die hetzelfde moeten zeggen (F-04). Het frame werkt goed op
  het hoofdpad. De groei zit in het systematisch langslopen van de omstandigheden waarin
  gebruikers het écht bekijken.
- **Competentie & positie op de ladder:**
  - *Accessibility & inclusive design*: **Designs**. Je neemt verdedigbare beslissingen en legt
    ze vast. De volgende trede is je "omgevingsmatrix" (zoom, tekstgrootte, forced colors,
    reduced motion, geen JS) zo vast te leggen dat anderen hem automatisch meenemen.
  - *Design systems*: **Applies → Designs**. De i18n-test is een goed voorbeeld van een contract
    afdwingen. F-04 laat zien dat het contract ook moet gaan over *de relatie tussen strings*,
    niet alleen over hun bestaan.
  - *Frontend craft (focusbeheer)*: **Applies**. De skip link is goed gebouwd. De volgende stap
    is focus *ontwerpen* voor een SPA met meerdere stappen, vóórdat het formulier er is.
- **Volgende stappen (klein en concreet, in deze volgorde):**
  1. **Gewoonte:** voeg aan je Storybook- of Playwright-routine per component drie modi toe:
     360 px + 200% tekst, `forcedColors: 'active'` en `javaScriptEnabled: false` (alleen voor de
     shell). Dit is één `test.describe` met drie projecten. Ik heb ze voor deze review met de
     hand gedraaid.
  2. **Concept:** lees de *Understanding*-pagina van 2.5.3 (zie Verdieping). Ga daarna na of
     elk `aria-label` in de codebase de zichtbare tekst *vervangt* of *aanvult*.
  3. **Experiment:** schrijf vóór de eerste formulierstap een kort ADR "Focus bij navigatie".
     Waar landt de focus (h1 of main), hoe wordt de nieuwe titel gemeld, en wat gebeurt er bij
     terug-navigatie? Toets het daarna met NVDA of VoiceOver op twee routes. Dan is F-03 ook
     meteen beslist.

## Methode & beperkingen

- **Input-type:** live URL (productiebuild op `http://127.0.0.1:5173/`) plus broncode.
- **Tools gebruikt:** Playwright 1.63 (Chromium, Firefox, WebKit) met eigen read-only checks,
  en `@axe-core/playwright` 4.13 met tags `wcag2a/aa`, `wcag21a/aa`, `wcag22aa` en
  `best-practice`: **0 violations, 0 incomplete, 29 passes**. Een schone axe-run zegt niet dat
  de pagina toegankelijk is. Axe vindt zo'n 30 tot 40% van de problemen, en geen van de
  bevindingen hierboven komt uit axe.
- **Handmatige checks uitgevoerd:**
  - toetsenbordpas in drie engines (tabvolgorde, zichtbaarheid van de focus, gedrag van de skip
    link, Shift+Tab)
  - accessibility tree (rollen, namen, landmarks, koppen) en 2.5.3 voor de home-link
  - reflow op 320×256 en 320×640 (geen horizontaal scrollen)
  - alleen tekst op 150% en 200% bij 320, 360, 375, 414 en 1280 px
  - tekstafstand (1.4.12, bookmarklet-waarden) op 320 px: geen afgekapte tekst
  - forced colors (Chromium-emulatie)
  - `prefers-color-scheme: dark` (geen donker thema; geen WCAG-eis)
  - JavaScript uit
  - contrast nagerekend uit de tokens
  - klikvlakken gemeten
  - B1-beoordeling van alle teksten in `nl.json`
- **Niet verifieerbaar met deze input:**
  - **Echte screenreader-uitvoer** (NVDA/JAWS/VoiceOver/TalkBack). Wat er uitgesproken wordt
    heb ik afgeleid uit de accessibility tree. Een korte check met NVDA + Firefox en VoiceOver +
    Safari blijft nodig.
  - **Spraakbesturing** (Dragon / Voice Control) voor de home-link. In theorie is het correct
    (F-04), maar niet getest.
  - **Echte telefoon** met Android-tekstgrootte of iOS Dynamic Type. Ik heb dat nagebootst met
    `font-size` op `html`.
  - **Echte Windows-modus voor hoog contrast.** Alleen de Chromium-emulatie is getest.
  - Afbreken met `hyphens: auto` voor Nederlands verschilt per browser en platform. Test de fix
    van F-01 in Firefox en Safari.
- **Standaarden:** WCAG 2.2 AA; EN 301 549 / EAA waar relevant; ARIA APG voor widgetpatronen.

## Opvolging (2026-10-02)

Wat er met elke bevinding is gedaan, binnen de change `bootstrap-project`.

| # | Status | Wat er gedaan is |
|---|---|---|
| F-01 | Opgelost | `overflow-wrap: anywhere` en `hyphens: auto` op de dienstnaam en op `h1`; `max-width: 100%` op de home-link. Nieuwe browsertest `start page with large text on a phone` (360 px, tekst 200%) slaagt in Chromium, Firefox en WebKit. De test vond ook de kop "Een evenement melden" als oorzaak. |
| F-02 | Opgelost | De skiplink neemt bij focus ruimte in boven de header en bedekt de naam niet meer (gemeten: onderkant skiplink 51 px, bovenkant home-link 67 px). |
| F-03 | Bewust zo gelaten | Geen focusring om `main`: een ring om de hele inhoud oogt als een fout. Bij de stappenflow verplaatsen we de focus naar de `h1` bij elke nieuwe pagina; dan krijgt de `h1` een zichtbare focus. |
| F-04 | Opgelost | Geen `aria-label` meer. De naam is de zichtbare tekst plus een verborgen hint (`app.homeLinkHint`). Zo begint de naam altijd met wat je ziet. Nieuwe browsertest `home link on the start page`. |
| F-05 | Opgelost | `NavLink` met `end`: op `/` staat `aria-current="page"`. Getest in dezelfde browsertest. |
| F-06 | Later | Een titel en `<noscript>`-melding uit `nl.json` via de build. Dit hoort bij de ADR over "geen fallback zonder JavaScript", die nog geschreven wordt. |
| F-07 | Opgelost | Nieuwe introtekst, één idee per zin: "Organiseert u een klein evenement in Kranswijk? Bijvoorbeeld een buurtfeest, markt of sportdag. Dat meldt u hier bij de gemeente. Het formulier is nog niet klaar." |
| F-08 | Later | Footer in forced-colours-modus. Oppakken in de change voor de demo-omgeving, samen met de demobanner. |
| F-09 | Geaccepteerd | Regellengte rond 78 tekens is een AAA-eis (1.4.8), geen AA-eis. |

Nog te doen met de hand (zie "Niet verifieerbaar"): een korte controle met NVDA + Firefox en
VoiceOver + Safari, en het afbreken van lange woorden in Safari op een echte telefoon.
