# Ideeën voor later

Dingen die ik heb overwogen maar nu nog niet doe. Elk idee krijgt een besluit (en zo nodig
een ADR) zodra het ertoe doet.

## Foutafhandeling zonder throw

**Wat:** functies met regels voor het domein geven een klein resultaat terug in plaats van
een fout te gooien: `{ ok: true, value }` of `{ ok: false, error }`. Zod doet dit al met
`safeParse`. Een fout gooien mag dan alleen nog aan de randen: in de API-route (die er een
problem details-antwoord van maakt) en in een error boundary in React.

**Waarom:** je ziet aan het type dat iets kan mislukken, en TypeScript dwingt je om die
uitkomst af te handelen. Zonder extra bibliotheken.

**Wanneer beslissen:** bij het indienen van een melding (`add-review-and-submit`). Het
opslaan van een concept gebruikt alleen `safeParse` van Zod aan de randen; een eigen
resultaattype was daar nog niet nodig.

## Mappen per feature

**Wat:** code per onderdeel bij elkaar zetten, zoals `src/features/melding/` met pagina's,
logica en tests. Gedeelde onderdelen zoals `PageShell` blijven in `src/components/`.

**Waarom:** alles van één onderdeel staat dan op één plek. Dat is makkelijker te vinden en
te wijzigen dan mappen per soort bestand.

**Besloten (change `add-draft-application`):** ja. Alles van het melden staat in
`apps/web/src/features/draft/`: pagina's, routes, de API-helpers en de hooks. Herbruikbare
componenten zoals `ErrorSummary` en `TextField` blijven in `src/components/`.

## Datumvelden met losse vakjes voor dag, maand en jaar

**Wat:** een prototype met losse velden voor dag, maand en jaar (zoals GOV.UK), naast het
datumveld van de browser dat het loket nu gebruikt.

**Waarom:** het datumveld van de browser werkt per browser anders voor schermlezers en
toetsenbord. Losse velden zijn voorspelbaarder, maar vragen meer code en meer foutmeldingen.
Twee prototypes naast elkaar laten die afweging zien op de casuspagina.

**Wanneer beslissen:** als er tijd is voor de casuspagina, of als testers moeite hebben met
het datumveld.
