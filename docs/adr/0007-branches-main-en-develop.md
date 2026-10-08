---
title: "ADR-0007: Branches main en develop, met een beschermde main"
date: 2026-10-08
status: geaccepteerd
---

# ADR-0007: Branches main en develop, met een beschermde main

## Context

De repository is publiek. Reviewers kijken naar `main`, dus daar moet altijd een geteste,
werkende versie staan. Er werkt één developer aan het project, en die wil snel kunnen
werken zonder voor elke kleine stap een pull request te openen.

Op een gratis GitHub-account werken rulesets alleen in publieke repositories. Die regels
leggen we hier vast, zodat je ze kunt nagaan en zo nodig opnieuw kunt instellen.

## Besluit

### Twee vaste branches

| Branch | Rol |
|---|---|
| `develop` | Werkbranch en standaardbranch op GitHub. Je mag er direct op committen. |
| `main` | De vrijgegeven stand. Verandert alleen via een pull request van `develop`. |

```
(feature-branch --git merge-->)  develop  --pull request, merge commit-->  main
        push: checks + e2e                 checks + e2e verplicht
```

- **Werken** gebeurt op `develop`, of op een eigen branch die je met `git merge` in
  `develop` samenvoegt.
- **Een release** is een pull request van `develop` naar `main`.
- **Overal een normale merge** (merge commit). Squash en rebase staan uit in de
  instellingen van de repository.
- **Tests:** `checks` draait bij elke push en elke pull request. `e2e` draait bij elke push
  naar `develop`, bij een pull request naar `main`, en met de hand (ADR-0002).

### Regels op GitHub (rulesets)

| Ruleset | Geldt voor | Regel | Waarom |
|---|---|---|---|
| `protect-main-and-develop` | `main`, `develop` | Verwijderen blokkeren | Beide branches zijn vast. Een vergissing mag ze niet weghalen. |
| `main` | `main` | Force push blokkeren | De historie van de vrijgegeven versie verandert nooit. |
| `main` | `main` | Alleen via pull request, alleen *merge commit*, 0 goedkeuringen | Dit blokkeert directe commits op `main`. Goedkeuring van jezelf kan niet, dus 0. |
| `main` | `main` | Verplichte checks `checks` en `e2e` | Alleen code die de checks en de browsertests doorstaat, komt op `main`. |

Niemand mag de regels omzeilen (geen bypass), ook de eigenaar niet.

**Waarom `develop` geen pull request vraagt:** er is één developer. Een pull request voor
elke stap kost tijd zonder dat iemand anders meekijkt. Fouten op `develop` worden bij elke
push zichtbaar in CI, en de release-PR houdt ze tegen.

## Gevolgen

**Wat het oplevert**

- Op `main` staat alleen code die de checks en de browsertests doorstaat.
- De volledige historie blijft bewaard. Een merge commit laat zien welke commits bij één
  release horen.
- Een reviewer ziet aan de rulesets en de groene checks hoe het project bewaakt wordt.

**Wat het kost**

- Elke release vraagt een pull request.
- Alle commits van `develop` komen in de historie van `main`, ook kleine tussenstappen.

## Risico's

| Risico | Maatregel |
|---|---|
| Een rode build staat een tijd op `develop` | CI en E2E draaien bij elke push naar `develop`, dus je ziet het meteen. De release-PR naar `main` blokkeert tot alles groen is. |
| Rommelige commits komen in de historie | Commit per stap met `/loket-quick-commit`, met een duidelijk bericht. |
| Een regel wordt per ongeluk uitgezet of aangepast | Zie Controle: de rules-API laat zien wat er echt geldt. |
| `develop` en `main` lopen uit elkaar | Alleen merges van `develop` naar `main`, nooit andersom en nooit iets direct op `main`. |
| De verplichte checks krijgen een andere naam | De namen zijn de jobnamen in de workflows (`name: checks`, `name: e2e`). Verander je die, pas dan ook de ruleset aan. |

## Controle

Wat er werkelijk geldt, vraag je op met `gh`:

```sh
gh api repos/MarcoSmeulders/evenementenloket/rules/branches/main --jq '.[].type'
# non_fast_forward, pull_request, required_status_checks, deletion

gh api repos/MarcoSmeulders/evenementenloket/rules/branches/develop --jq '.[].type'
# deletion
```

De rulesets zoals ze zijn aangemaakt (`gh api -X POST repos/…/rulesets --input <bestand>`):

```json
{
  "name": "protect-main-and-develop",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["refs/heads/main", "refs/heads/develop"], "exclude": [] } },
  "rules": [{ "type": "deletion" }]
}
```

```json
{
  "name": "main",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["refs/heads/main"], "exclude": [] } },
  "rules": [
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["merge"]
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": false,
        "required_status_checks": [{ "context": "checks" }, { "context": "e2e" }]
      }
    }
  ]
}
```

## Overwogen alternatieven

- **Squash of rebase bij het mergen.** Geeft een kortere historie, maar je verliest de
  losse stappen. Squash van `develop` naar `main` laat de twee branches bovendien uit
  elkaar lopen, waardoor elke volgende release conflicten geeft.
- **Ook een pull request verplicht op `develop`.** Zinvol met meerdere developers, maar
  voor één developer alleen extra werk.
- **Geen bescherming, alleen een afspraak.** Eenvoudig, maar niets houdt een vergissing
  tegen op de branch die reviewers zien.
- **Een privé-werkrepo met een publieke spiegel.** Het proces (pull requests, issues,
  CI-runs) zou dan onzichtbaar zijn, en het doorzetten vraagt een geheim in CI.

## Herzien als

- Er een tweede developer bijkomt. Dan komt er ook op `develop` een pull-request-plicht.
- GitHub de rulesets voor gratis accounts verandert.
