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

**Wanneer beslissen:** bij de eerste wijziging met echte domeinregels, zoals het indienen
van een melding.

## Mappen per feature

**Wat:** code per onderdeel bij elkaar zetten, zoals `src/features/melding/` met pagina's,
logica en tests. Gedeelde onderdelen zoals `PageShell` blijven in `src/components/`.

**Waarom:** alles van één onderdeel staat dan op één plek. Dat is makkelijker te vinden en
te wijzigen dan mappen per soort bestand.

**Wanneer beslissen:** zodra er een tweede onderdeel naast de startpagina komt.
