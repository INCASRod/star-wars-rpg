import { DicePoolBuilder }  from '@/components/wireframe/DicePoolBuilder'
import { TalentsPanel }     from '@/components/wireframe/TalentsPanel'
import { DerivedStatsPanel } from '@/components/wireframe/DerivedStatsPanel'
import { DiceFeed }         from '@/components/wireframe/DiceFeed'

const MELEE_CONFIG = {
  characteristicName: 'Brawn',
  characteristicVal:  3,
  skillName:          'Melee',
  skillRank:          1,
  weaponMode:         'Melee' as const,
  weaponName:         'Vibro-Knife',
}

export default function WireframePage() {
  return (
    <div className="min-h-screen bg-gray-200 font-mono">

      {/* ── Page header ── */}
      <div className="border-b-2 border-gray-400 bg-white" style={{ padding: 'var(--space-3) var(--space-6)' }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div>
            <div className="uppercase text-gray-400" style={{ fontSize: 'var(--text-overline)', letterSpacing: '0.3em', marginBottom: 'var(--space-1)' }}>
              WIREFRAME PROTOTYPE · Age of Rebellion RPG
            </div>
            <h1 className="font-bold text-gray-800" style={{ fontSize: 'var(--text-h3)' }}>
              Character Sheet — UI Components
            </h1>
            <div className="text-gray-500" style={{ fontSize: 'var(--text-caption)', marginTop: 'var(--space-1)' }}>
              Kira Voss · Human · Rebel Soldier · Monochrome wireframe — no colors · All sizes fluid via CSS clamp()
            </div>
          </div>
          <div className="border border-gray-300 text-gray-500" style={{ padding: 'var(--space-2)', fontSize: 'var(--text-caption)', lineHeight: 1.5 }}>
            <div className="font-bold text-gray-600" style={{ marginBottom: '2px' }}>Placeholder Character</div>
            <div>BR 3 · AG 3 · INT 2 · CUN 2 · WIL 2 · PR 3</div>
            <div>Armor: Heavy Clothing (+1 Soak)</div>
            <div>Talents: Toughened ×2, Enduring, Grit, Dodge, Quick Strike ×2…</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col" style={{ maxWidth: '90rem', margin: '0 auto', padding: 'var(--space-4)', gap: 'var(--space-4)' }}>

        {/* ── 1 · Derived stats ── */}
        <Section label="1 · Derived Stats with Source Breakdown">
          <DerivedStatsPanel />
        </Section>

        {/* ── 2+4 · Dice pools + feed ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3" style={{ gap: 'var(--space-4)' }}>
          <Section label="2a · Dice Pool Builder — Ranged Weapon">
            <DicePoolBuilder />
          </Section>
          <Section label="2b · Dice Pool Builder — Melee Weapon">
            <DicePoolBuilder config={MELEE_CONFIG} />
          </Section>
          <Section label="4 · Shared Dice Feed">
            <DiceFeed />
          </Section>
        </div>

        {/* ── 3 · Talents ── */}
        <Section label="3 · Talents Quick-Reference Panel">
          <TalentsPanel />
        </Section>

        {/* ── Notes ── */}
        <div className="border border-dashed border-gray-400" style={{ padding: 'var(--space-3)' }}>
          <div className="uppercase text-gray-400" style={{ fontSize: 'var(--text-overline)', letterSpacing: '0.2em', marginBottom: 'var(--space-1)' }}>
            Wireframe Notes
          </div>
          <ul className="text-gray-500 flex flex-col" style={{ fontSize: 'var(--text-caption)', gap: '3px', listStyle: 'none', padding: 0 }}>
            <li>→ All font sizes use CSS <code>clamp()</code> tokens from design-rules.md — no hardcoded px</li>
            <li>→ All spacing uses <code>--space-*</code> fluid tokens — scales across 1280px → 2560px</li>
            <li>→ Range band buttons dynamically update the purple dice count</li>
            <li>→ Wounds and Strain trackers are interactive — try the +/− buttons</li>
            <li>→ Talents panel: 5 tabs, Out of Turn has dashed border treatment and reaction banner</li>
            <li>→ Dice feed: Copy button writes roll summary to clipboard · All/Mine filter</li>
            <li>→ Components are self-contained — replace placeholder constants with live data props</li>
          </ul>
        </div>

      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="uppercase text-gray-500 font-bold font-mono" style={{ fontSize: 'var(--text-overline)', letterSpacing: '0.2em', marginBottom: 'var(--space-1)' }}>
        {label}
      </div>
      {children}
    </section>
  )
}
