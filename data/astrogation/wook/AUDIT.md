# Wookieepedia lanes: audit (Step 0)

Source: Wookieepedia hyperlane articles through the MediaWiki API (CC BY-SA 3.0; URLs and revision ids in `raw/SOURCES.md` and `routes.json`).
Positions: the DK named planets (`systems.json`, precision "dot") plus, from C4, route-stop planets with no named dot (`c4_planets.json`: snapped to an unnamed DK dot, or the SWGalacticMap catalogue position; never a cell centre). Matching is exact or alias (redirect) only.

**Deviation from the prompt:** the category "Hyperspace routes" does not exist on Wookieepedia. The crawl used `Hyperlanes`, `Super-hyperroutes` and `Hyperlanes by region` plus every subcategory (depth 3): 33 categories, 389 articles.

## Routes
- Articles found: 389 (canon 124, Legends 265); distinct routes after canon-first selection: 310
- Edition used among routes with >= 2 matched stops: canon 88, Legends 137
- Routes with >= 2 matched stops: 225
- Matched stops per route: min 0, median 3.0, max 40; over routes with >= 2: min 2, median 4, max 40
- Stop provenance (matched stops): infobox 1121, lead 132, section 18; matched by display 370, title 786, title+suffix 65, display+suffix 50

## DK planets on a route
- On at least one route: 865 of 1237 (70%). On none: 372.

## Seed check (`private/major_routes_wookieepedia.json`, the five majors)

The seed lists stops from the 6,752-system JSON; only 704 of those worlds have a DK dot, so most seed stops cannot match. The last two columns separate the two cases.

| Route | Edition | Stops now | Seed stops | In both | Seed stop WITH a DK dot, not matched | Seed stop with no DK dot |
|---|---|---|---|---|---|---|
| Perlemian Trade Route | canon | 20 | 17 | 7 | Brentaal, Carida, Corulag, Estaria, Ossus | 5 |
| Corellian Run | canon | 25 | 45 | 21 | Arkanis, Leria Kerlsil, Lolnar, Perma, Rehemsa, Rydonni Prime, Sedratis, Vuma, Wrea, Wukkar, Xorth | 13 |
| Corellian Trade Spine | canon | 40 | 8 | 6 | Devaron | 1 |
| Rimma Trade Route | canon | 16 | 6 | 4 | Abregado, Dagobah | 0 |
| Hydian Way | canon | 40 | 17 | 8 | Alderaan, Brentaal, Caamas, Derra, Polis Massa, Rendili, Subterrel, Taris | 1 |

## Unmatched Wookieepedia names (top 50 by number of routes naming them)

Infobox stop fields only (endpoints, transitpoints, otherobjects, stellar): 751 distinct unmatched names. Counting lead and section links as well there are 1928, but those are mostly generic links ("planet", "hyperspace route", region names), so they are not ranked.

| Routes | Name |
|---|---|
| 4 | Feriae Junction/Legends |
| 4 | Etti IV/Legends |
| 4 | Abregado-rae/Legends |
| 3 | Tython/Legends |
| 3 | Maw Nebulae |
| 3 | Junkfort system |
| 3 | Junkfort Station |
| 3 | Brentaal IV/Legends |
| 3 | Brentaal IV |
| 2 | Yitabo/Legends |
| 2 | Y'Toub system/Legends |
| 2 | Velga Prime |
| 2 | Trindello/Legends |
| 2 | Tierell |
| 2 | Telos IV |
| 2 | Takodana |
| 2 | Star system/Legends |
| 2 | Sespe system/Legends |
| 2 | Sanctuary/Legends |
| 2 | Rorak 4 |
| 2 | Ropagi II |
| 2 | Qiilura/Legends |
| 2 | Primus Goluud/Legends |
| 2 | Plagen |
| 2 | Pinoora |
| 2 | Pii system/Legends |
| 2 | Perlemian Trade Route/Legends |
| 2 | Paqualis III/Legends |
| 2 | Oslumpex V/Legends |
| 2 | Oseon VII |
| 2 | Ord Gimmel/Legends |
| 2 | Ord Cestus/Legends |
| 2 | Nwarcol Point |
| 2 | Norkronia system/Legends |
| 2 | Nimat system/Legends |
| 2 | Nar Hekka |
| 2 | Mev system/Legends |
| 2 | Merkat |
| 2 | Lythos system/Legends |
| 2 | Lekua V |
| 2 | Lazerian IV |
| 2 | Krylon |
| 2 | Krann |
| 2 | Kamino system/Legends |
| 2 | Kalla VII |
| 2 | Kailor V |
| 2 | Junkfort Station/Legends |
| 2 | Jovan III |
| 2 | Jerrist VI |
| 2 | Itani Nebula/Legends |

## Suffix rule (C2 decision 1)

Stripping `/Legends`, ` system`, ` (planet)`, ` (system)` before the exact/redirect match added 115 stop memberships on 99 DK planets in the selected routes. Examples: Mon Cala (4), Moraband (3), Vergill (3), Oseon (3), Senex (2), Relephon (2), Chandrila (2), Terephon (2), Rynmar (2), Clak'dor (2), Coruscant (2), Drearia (1), Anoat (1), Bespin (1), Leritor (1), Lanos (1), Nexus Ortai (1), Bresnia (1), Galboron (1), Dressel (1), Lannik (1), Vandyne (1), Tangrene (1), Abregado (1), Keeara Major (1).

## Suspicious hops (> 600 px between consecutive ordered stops)

13 routes:

- Leisure Corridor (legends, 2 stops): Coruscant to Ebiwaan 1458 px
- Overic Griplink (canon, 4 stops): Coruscant to Quermia 1295 px
- Unidentified hyperlane (canon, 2 stops): Eiram to Hetzal 1235 px
- Daragon Trail (legends, 2 stops): Empress Teta to Moraband 1170 px
- Nexus Route (legends, 7 stops): Lola Sayu to Coruscant 1127 px
- Kessel Run (canon, 3 stops): Savareen to Kessel 1058 px
- Rycar's Run (legends, 5 stops): Kashyyyk to Kiffex 915 px; Kiffex to Tatooine 943 px
- Askar Trace (legends, 8 stops): Utapau to Leritor 868 px
- Tintel–Azna hyperspace route (legends, 2 stops): Tintel to Azna 761 px
- Sanctuary Pipeline (canon, 3 stops): Sullust to Endor 742 px
- Silvestri Trace (legends, 2 stops): Sullust to Endor 742 px
- Burke's Trailing (canon, 4 stops): Ord Mantell to Jedha 701 px
- Metellos-Ilum hyperspace route (canon, 2 stops): Ilum to Metellos 666 px

## Connectivity (all routes, canon + Legends)
- Edges: 998 (136 on majors). Planets with a lane: 845. Components: 26; largest 735 planets (87% of planets with a lane); next [13, 13, 13, 10, 6].

| Pair | Connected | Hops (major hops) | Routes used |
|---|---|---|---|
| Coruscant - Corellia | yes | 2 (2) | Corellian Run |
| Coruscant - Fedalle | yes | 14 (14) | Corellian Run, Hydian Way |
| Coruscant - Ord Mantell | yes | 29 (26) | Corellian Run, Hydian Way, Celanon Spur |
| Ryloth - Arkanis | yes | 2 (1) | Corellian Run, Old Corellian Run |
| Kessel - Formos | yes | 2 (0) | Kessel Run, Pabol Sleheyron |
| Ryloth - Tatooine | yes | 1 (0) | Corellian Skip Run |

Rodrigo's checks (what the data says, nothing forced):
- Coruscant - Corellia: 2 hop(s), 2 on a major, 100% major; via Coruscant > Ixtlar > Corellia; routes Corellian Run.
- Coruscant - Fedalle: 14 hop(s), 14 on a major, 100% major; via Coruscant > Ixtlar > Corellia > Tinnel > Loronar > Byblos > Abednedo > Iseno > Denon > Candovant > Korbori > Suntilla > Exodeen > Bellassa > Fedalle; routes Corellian Run, Hydian Way.
- Coruscant - Ord Mantell: 29 hop(s), 26 on a major, 89% major; via Coruscant > Ixtlar > Corellia > Tinnel > Loronar > Byblos > Abednedo > Iseno > Denon > Candovant > Korbori > Suntilla > Exodeen > Bellassa > Fedalle > Skako > Uviuy Exen > Champala > Drearia > Hevurion > Bogden > Mikkia > Corsin > Otor's Hub > Bandomeer > Botajef > Celanon > Ajan Kloss > Aleen > Ord Mantell; routes Corellian Run, Hydian Way, Celanon Spur.
- Ryloth - Arkanis: 2 hop(s), 1 on a major, 50% major; via Ryloth > Christophsis > Arkanis; routes Corellian Run, Old Corellian Run.
- Kessel - Formos: 2 hop(s), 0 on a major, 0% major; via Kessel > Oba Diah > Formos; routes Kessel Run, Pabol Sleheyron.
- Ryloth - Tatooine: 1 hop(s), 0 on a major, 0% major; via Ryloth > Tatooine; routes Corellian Skip Run.

## C4 before / after (route planets added: 533, of which on a selected lane: 516)

| | Before (C3) | After (C4) |
|---|---|---|
| Graph nodes | 704 | 1220 |
| Routes with >= 2 stops | 123 | 225 |
| Edges | 423 | 998 |
| Planets with a lane | 321 | 845 |
| Components | 5 | 26 |
| Largest component (planets) | 311 | 735 |

New suspicious hops (> 600 px, not in the C3 list): 5
- Coruscant to Ebiwaan, 1458 px (Leisure Corridor)
- Lola Sayu to Coruscant, 1127 px (Nexus Route)
- Tintel to Azna, 761 px (Tintel–Azna hyperspace route)
- Sullust to Endor, 742 px (Sanctuary Pipeline)
- Ilum to Metellos, 666 px (Metellos-Ilum hyperspace route)
