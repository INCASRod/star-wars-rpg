const KEYWORDS = {
  spaceship: ['spaceship','ship','starship','vessel','cruiser','frigate','destroyer','corvette','shuttle','bridge','cockpit','cargo hold','engine room','death star','star destroyer','millennium falcon'],
  warehouse: ['warehouse','storage','depot','hangar','docking','loading','facility','factory','industrial'],
  jungle:    ['jungle','forest','swamp','vegetation','endor','dagobah','felucia','yavin','trees','overgrown'],
  cave:      ['cave','cavern','underground','tunnel','mines','geonosis','mustafar','mining','subterranean'],
  desert:    ['desert','sand','dune','tatooine','jakku','arid','wasteland','mesa'],
  city:      ['city','urban','street','settlement','district','coruscant','nar shaddaa','cloud city','alley'],
  cantina:   ['cantina','bar','tavern','inn','mos eisley','spaceport','saloon','smuggler'],
  base:      ['base','outpost','military','bunker','stronghold','garrison','command center','fortress','installation'],
  ice:       ['ice','snow','frozen','hoth','tundra','glacial','blizzard'],
};

export function parsePrompt(text) {
  const lo = text.toLowerCase();
  let best = 'spaceship', bestScore = 0;

  for (const [env, kws] of Object.entries(KEYWORDS)) {
    const score = kws.reduce((s, k) => s + (lo.includes(k) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; best = env; }
  }

  let faction = 'neutral';
  if (/imperial|empire|stormtrooper|vader|palpatine|first order/.test(lo)) faction = 'imperial';
  else if (/rebel|alliance|resistance|republic|jedi/.test(lo)) faction = 'rebel';
  else if (/mandalorian|bounty hunter|hutt|crime|syndicate|pirate/.test(lo)) faction = 'criminal';

  return { envType: best, faction };
}
