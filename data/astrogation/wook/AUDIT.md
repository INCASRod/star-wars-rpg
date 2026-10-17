# Wookieepedia lanes: audit (Step 0)

Source: Wookieepedia hyperlane articles through the MediaWiki API (CC BY-SA 3.0; URLs and revision ids in `raw/SOURCES.md` and `routes.json`).
Positions: the DK named planets (`systems.json`, precision "dot"). Nothing else is plotted. Matching is exact or alias (redirect) only.

**Deviation from the prompt:** the category "Hyperspace routes" does not exist on Wookieepedia. The crawl used `Hyperlanes`, `Super-hyperroutes` and `Hyperlanes by region` plus every subcategory (depth 3): 33 categories, 389 articles.

## Routes
- Articles found: 389 (canon 124, Legends 265); distinct routes after canon-first selection: 310
- Edition used among routes with >= 2 matched stops: canon 79, Legends 44
- Routes with >= 2 matched stops: 123
- Matched stops per route: min 0, median 1.0, max 31; over routes with >= 2: min 2, median 3, max 31
- Stop provenance (matched stops): infobox 558, lead 49, section 11; matched by display 191, title+suffix 49, display+suffix 11, title 367

## DK planets on a route
- On at least one route: 336 of 704 (48%). On none: 368.

## Seed check (`private/major_routes_wookieepedia.json`, the five majors)

The seed lists stops from the 6,752-system JSON; only 704 of those worlds have a DK dot, so most seed stops cannot match. The last two columns separate the two cases.

| Route | Edition | Stops now | Seed stops | In both | Seed stop WITH a DK dot, not matched | Seed stop with no DK dot |
|---|---|---|---|---|---|---|
| Perlemian Trade Route | canon | 13 | 17 | 5 | Brentaal, Carida, Corulag, Ossus | 8 |
| Corellian Run | canon | 16 | 45 | 13 | Arkanis, Wrea | 30 |
| Corellian Trade Spine | canon | 17 | 8 | 4 | Devaron | 3 |
| Rimma Trade Route | canon | 13 | 6 | 3 | Abregado, Dagobah | 1 |
| Hydian Way | canon | 31 | 17 | 8 | Brentaal, Derra, Polis Massa, Rendili, Subterrel, Taris | 3 |

## Unmatched Wookieepedia names (top 50 by number of routes naming them)

Infobox stop fields only (endpoints, transitpoints, otherobjects, stellar): 1375 distinct unmatched names. Counting lead and section links as well there are 2644, but those are mostly generic links ("planet", "hyperspace route", region names), so they are not ranked.

| Routes | Name |
|---|---|
| 4 | Feriae Junction/Legends |
| 4 | Etti IV/Legends |
| 4 | Abregado-rae/Legends |
| 3 | Xorth |
| 3 | Vergill system/Legends |
| 3 | Tython/Legends |
| 3 | Tallaan |
| 3 | Metellos/Legends |
| 3 | Maw Nebulae |
| 3 | Kassido |
| 3 | Junkfort system |
| 3 | Junkfort Station |
| 3 | Estaria/Legends |
| 3 | Enarc/Legends |
| 3 | Enarc |
| 3 | Dravione |
| 3 | Derellium |
| 3 | Darkknell/Legends |
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
| 2 | Teth/Legends |
| 2 | Teth |
| 2 | Terr'skiar |
| 2 | Tenupe |

## Suffix rule (C2 decision 1)

Stripping `/Legends`, ` system`, ` (planet)`, ` (system)` before the exact/redirect match added 60 stop memberships on 50 DK planets in the selected routes. Examples: Mon Cala (4), Moraband (3), Oseon (3), Chandrila (2), Clak'dor (2), Coruscant (2), Anoat (1), Bespin (1), Leritor (1), Nexus Ortai (1), Dressel (1), Lannik (1), Tangrene (1), Abregado (1), Malastare (1), Vondarc (1), Farstine (1), Skynara (1), Svivren (1), Rorak (1), Kitel Phard (1), Zardossa Stix (1), Bardotta (1), Giju (1), Kashyyyk (1).

## Suspicious hops (> 600 px between consecutive ordered stops)

9 routes:

- Overic Griplink (canon, 4 stops): Coruscant to Quermia 1295 px
- Unidentified hyperlane (canon, 2 stops): Eiram to Hetzal 1235 px
- Daragon Trail (legends, 2 stops): Empress Teta to Moraband 1170 px
- Kessel Run (canon, 3 stops): Savareen to Kessel 1058 px
- Rycar's Run (legends, 5 stops): Kashyyyk to Kiffex 915 px; Kiffex to Tatooine 943 px
- Askar Trace (legends, 5 stops): Utapau to Leritor 868 px
- Sanctuary Pipeline (canon, 2 stops): Endor to Sullust 742 px
- Silvestri Trace (legends, 2 stops): Sullust to Endor 742 px
- Burke's Trailing (canon, 4 stops): Ord Mantell to Jedha 701 px

## Connectivity (all routes, canon + Legends)
- Edges: 423 (85 on majors). Planets with a lane: 321. Components: 5; largest 311 planets (97% of planets with a lane); next [3, 3, 2, 2].

| Pair | Connected | Hops (major hops) | Routes used |
|---|---|---|---|
| Coruscant - Corellia | yes | 1 (1) | Corellian Run |
| Coruscant - Fedalle | yes | 11 (11) | Corellian Run, Hydian Way |
| Coruscant - Ord Mantell | yes | 24 (21) | Corellian Run, Hydian Way, Celanon Spur |
| Ryloth - Arkanis | yes | 2 (1) | Corellian Run, Old Corellian Run |
| Kessel - Formos | yes | 2 (0) | Pabol Sleheyron |
| Ryloth - Tatooine | yes | 1 (0) | Corellian Skip Run |

Rodrigo's checks (what the data says, nothing forced):
- Coruscant - Corellia: 1 hop(s), 1 on a major, 100% major; via Coruscant > Corellia; routes Corellian Run.
- Coruscant - Fedalle: 11 hop(s), 11 on a major, 100% major; via Coruscant > Corellia > Tinnel > Loronar > Byblos > Abednedo > Denon > Candovant > Korbori > Suntilla > Exodeen > Fedalle; routes Corellian Run, Hydian Way.
- Coruscant - Ord Mantell: 24 hop(s), 21 on a major, 87% major; via Coruscant > Corellia > Tinnel > Loronar > Byblos > Abednedo > Denon > Candovant > Korbori > Suntilla > Exodeen > Fedalle > Skako > Uviuy Exen > Hevurion > Bogden > Mikkia > Corsin > Otor's Hub > Bandomeer > Botajef > Celanon > Ajan Kloss > Aleen > Ord Mantell; routes Corellian Run, Hydian Way, Celanon Spur.
- Ryloth - Arkanis: 2 hop(s), 1 on a major, 50% major; via Ryloth > Christophsis > Arkanis; routes Corellian Run, Old Corellian Run.
- Kessel - Formos: 2 hop(s), 0 on a major, 0% major; via Kessel > Honoghr > Formos; routes Pabol Sleheyron.
- Ryloth - Tatooine: 1 hop(s), 0 on a major, 0% major; via Ryloth > Tatooine; routes Corellian Skip Run.
