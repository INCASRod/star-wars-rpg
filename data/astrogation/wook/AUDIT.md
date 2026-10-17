# Wookieepedia lanes: audit (Step 0)

Source: Wookieepedia hyperlane articles through the MediaWiki API (CC BY-SA 3.0; URLs and revision ids in `raw/SOURCES.md` and `routes.json`).
Positions: the DK named planets (`systems.json`, precision "dot"). Nothing else is plotted. Matching is exact or alias (redirect) only.

**Deviation from the prompt:** the category "Hyperspace routes" does not exist on Wookieepedia. The crawl used `Hyperlanes`, `Super-hyperroutes` and `Hyperlanes by region` plus every subcategory (depth 3): 33 categories, 389 articles.

## Routes
- Articles / routes found: 389 (canon 124, Legends 265, unflagged 0)
- With an infobox: 351; lead/section links only: 38
- Routes with >= 2 matched stops: 163 (canon 72, Legends 91)
- Matched stops per route: min 0, median 1, max 30; over routes with >= 2: min 2, median 3, max 30
- Stop provenance (matched stops): infobox 776, lead 52, section 12; matched by display 449, title 391

## DK planets on a route
- On at least one route: 342 of 704 (49%). On none: 362.

## Seed check (`private/major_routes_wookieepedia.json`, the five majors)

The seed lists stops from the 6,752-system JSON; only 704 of those worlds have a DK dot, so most seed stops cannot match. The last two columns separate the two cases.

| Route | Edition | Stops now | Seed stops | In both | Seed stop WITH a DK dot, not matched | Seed stop with no DK dot |
|---|---|---|---|---|---|---|
| Perlemian Trade Route | canon | 13 | 17 | 5 | Brentaal, Carida, Corulag, Ossus | 8 |
| Perlemian Trade Route | legends | 15 | 17 | 6 | Brentaal, Carida, Felucia | 8 |
| Corellian Run | canon | 16 | 45 | 13 | Arkanis, Wrea | 30 |
| Corellian Run | legends | 17 | 45 | 13 | Allanteen, Tinnel | 30 |
| Corellian Trade Spine | canon | 17 | 8 | 4 | Devaron | 3 |
| Corellian Trade Spine | legends | 11 | 8 | 4 | Devaron | 3 |
| Rimma Trade Route | canon | 13 | 6 | 3 | Abregado, Dagobah | 1 |
| Rimma Trade Route | legends | 12 | 6 | 2 | Abregado, Dagobah, Kal'Shebbol | 1 |
| Hydian Way | canon | 30 | 17 | 7 | Brentaal, Derra, Imynusoph, Polis Massa, Rendili, Subterrel, Taris | 3 |
| Hydian Way | legends | 23 | 17 | 9 | Brentaal, Derra, Polis Massa, Rendili, Subterrel | 3 |

## Unmatched Wookieepedia names (top 50 by number of routes naming them)

Infobox stop fields only (endpoints, transitpoints, otherobjects, stellar): 1429 distinct unmatched names. Counting lead and section links as well there are 2737, but those are mostly generic links ("planet", "hyperspace route", region names), so they are not ranked.

| Routes | Name |
|---|---|
| 4 | Feriae Junction/Legends |
| 4 | Etti IV/Legends |
| 4 | Dac/Legends |
| 4 | Coruscant system |
| 4 | Abregado-rae/Legends |
| 3 | Xorth |
| 3 | Vergill system/Legends |
| 3 | Tython/Legends |
| 3 | Tallaan |
| 3 | Metellos/Legends |
| 3 | Maw Nebulae |
| 3 | Korriban/Legends |
| 3 | Kassido |
| 3 | Junkfort system |
| 3 | Junkfort Station |
| 3 | Estaria/Legends |
| 3 | Enarc/Legends |
| 3 | Enarc |
| 3 | Dravione |
| 3 | Derellium |
| 3 | Darkknell/Legends |
| 3 | Clak'dor VII/Legends |
| 3 | Cerea/Legends |
| 3 | Cerea |
| 3 | Caluula/Legends |
| 3 | Brentaal IV/Legends |
| 3 | Brentaal IV |
| 3 | Annaj/Legends |
| 2 | Zerm/Legends |
| 2 | Ylesia/Legends |
| 2 | Yitabo/Legends |
| 2 | Y'Toub system/Legends |
| 2 | Wukkar/Legends |
| 2 | Wakeelmui |
| 2 | Vuma/Legends |
| 2 | Vor Deo |
| 2 | Vicondor/Legends |
| 2 | Veron/Legends |
| 2 | Velga Prime |
| 2 | Vasch |
| 2 | Varl/Legends |
| 2 | Vandyne |
| 2 | Vaal/Legends |
| 2 | Ulmatra/Legends |
| 2 | Ulicia |
| 2 | Twith |
| 2 | Trindello/Legends |
| 2 | Torina |
| 2 | Tinallis |
| 2 | Tierell |

## Near-misses (NOT applied)

Infobox targets that equal a DK name once `/Legends`, ` system`, ` (planet)` or ` (system)` is stripped. The prompt allows exact or redirect matches only, so none of these are in `routes.json`. 41 DK planets would gain 49 route memberships if Rodrigo approves a suffix rule. Examples: Bardotta, Borleias, Botor, Byblos, Chardaan, Coruscant, Daalang, Dantooine, Dressel, Duro, Empress Teta, Eriadu, Farstine, Giju, Imynusoph, Kashyyyk, Kessel, Kitel Phard, Lannik, Leritor, Malachor, Malastare, N'zoth, Nexus Ortai, Obroa-skai, Oseon, Rishi, Rorak, Rothana, Saleucami, Sharlissia, Skynara, Svivren, Taanab, Tangrene, Trellen, Umbara, Virgillia, Vondarc, Zardossa Stix.

## Suspicious hops (> 600 px between consecutive ordered stops)

8 routes:

- Overic Griplink (canon, 4 stops): Coruscant to Quermia 1295 px
- Kessel Run (canon, 3 stops): Savareen to Kessel 1058 px
- Rycar's Run (legends, 5 stops): Kashyyyk to Kiffex 915 px; Kiffex to Tatooine 943 px
- Askar Trace (legends, 4 stops): Utapau to Leritor 868 px
- Sanctuary Pipeline (canon, 2 stops): Endor to Sullust 742 px
- Sanctuary Pipeline (legends, 2 stops): Endor to Sullust 742 px
- Silvestri Trace (legends, 2 stops): Sullust to Endor 742 px
- Burke's Trailing (canon, 4 stops): Ord Mantell to Jedha 701 px

## Connectivity (all routes, canon + Legends)
- Edges: 591 (157 on majors). Planets with a lane: 328. Components: 3; largest 323 planets (98% of planets with a lane); next [3, 2].

| Pair | Connected | Hops (major hops) | Routes used |
|---|---|---|---|
| Coruscant - Corellia | yes | 1 (1) | Corellian Run |
| Coruscant - Fedalle | yes | 7 (7) | Corellian Run, Hydian Way |
| Coruscant - Ord Mantell | yes | 16 (13) | Corellian Run, Hydian Way, Braxant Run, Celanon Spur |
| Ryloth - Arkanis | yes | 1 (1) | Corellian Run |
| Kessel - Formos | yes | 1 (0) | Kessel Run |
| Ryloth - Tatooine | yes | 1 (0) | Corellian Skip Run |

Rodrigo's checks (what the data says, nothing forced):
- Coruscant - Corellia: 1 hop(s), 1 on a major, 100% major; via Coruscant > Corellia; routes Corellian Run.
- Coruscant - Fedalle: 7 hop(s), 7 on a major, 100% major; via Coruscant > Corellia > Nubia > Loronar > Byblos > Denon > Exodeen > Fedalle; routes Corellian Run, Hydian Way.
- Coruscant - Ord Mantell: 16 hop(s), 13 on a major, 81% major; via Coruscant > Corellia > Nubia > Loronar > Byblos > Denon > Exodeen > Fedalle > Skako > Uviuy Exen > Bogden > Corsin > Otor's Hub > Bandomeer > Agamar > Ithor > Ord Mantell; routes Corellian Run, Hydian Way, Braxant Run, Celanon Spur.
- Ryloth - Arkanis: 1 hop(s), 1 on a major, 100% major; via Ryloth > Arkanis; routes Corellian Run.
- Kessel - Formos: 1 hop(s), 0 on a major, 0% major; via Kessel > Formos; routes Kessel Run.
- Ryloth - Tatooine: 1 hop(s), 0 on a major, 0% major; via Ryloth > Tatooine; routes Corellian Skip Run.
