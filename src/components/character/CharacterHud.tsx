'use client'

import { Sidebar } from './Sidebar'
import { Breadcrumb } from './Breadcrumb'
import { CharacteristicsCard } from './CharacteristicsCard'
import { VitalsCard } from './VitalsCard'
import { MoralityCard } from './MoralityCard'
import { ObligationDutyCard } from './ObligationDutyCard'
import { EquipmentCard, EquipmentItem } from './EquipmentCard'
import { WeaponsCard, WeaponDisplay } from './WeaponsCard'
import { SkillsCard, SkillDisplay } from './SkillsCard'
import { TalentsCard, TalentDisplay } from './TalentsCard'
import { CriticalInjuriesCard, CriticalInjuryDisplay } from './CriticalInjuriesCard'
import { CenterHero } from './CenterHero'
import { BottomBar } from './BottomBar'

export interface CharacterHudData {
  name: string
  subtitle: string
  portraitUrl?: string
  playerName: string

  // Characteristics
  brawn: number
  agility: number
  intellect: number
  cunning: number
  willpower: number
  presence: number

  // Vitals
  woundCurrent: number
  woundThreshold: number
  strainCurrent: number
  strainThreshold: number
  soak: number
  defenseRanged: number
  defenseMelee: number

  // XP & Credits
  credits: number
  xpTotal: number
  xpAvailable: number

  // Morality
  moralityValue: number
  moralityStrength: string
  moralityWeakness: string

  // Obligation & Duty
  obligation?: { type: string; value: number }
  duty?: { type: string; value: number }

  // Skills
  combatSkills: SkillDisplay[]
  generalSkills: SkillDisplay[]
  knowledgeSkills: SkillDisplay[]

  // Equipment
  equipment: EquipmentItem[]
  encumbranceCurrent: number
  encumbranceThreshold: number

  // Weapons
  weapons: WeaponDisplay[]

  // Talents
  talents: TalentDisplay[]

  // Critical Injuries
  criticalInjuries: CriticalInjuryDisplay[]
}

interface CharacterHudProps {
  data: CharacterHudData
  activeTab?: string
  onTabChange?: (tab: string) => void
  onWoundChange?: (delta: number) => void
  onStrainChange?: (delta: number) => void
  onToggleEquipped?: (item: EquipmentItem) => void
  onToggleWeaponEquipped?: (id: string) => void
  onRollCrit?: () => void
  onHealCrit?: (id: string) => void
  onOpenTalentTree?: () => void
  onPortraitUpload?: (file: File) => void
  onPortraitDelete?: () => void
  contentOverride?: React.ReactNode
  // GM mode props
  isGmMode?: boolean
  onCharacteristicChange?: (field: string, delta: number) => void
  onSoakChange?: (delta: number) => void
  onDefenseChange?: (type: 'ranged' | 'melee', delta: number) => void
  onMoralityChange?: (delta: number) => void
  onMoralityKeyChange?: (field: string, value: string) => void
  onObligationChange?: (field: 'type' | 'value', value: string | number) => void
  onDutyChange?: (field: 'type' | 'value', value: string | number) => void
  onRemoveWeapon?: (id: string) => void
  onRemoveEquipment?: (id: string, type: 'armor' | 'gear') => void
  onRemoveTalent?: (id: string, xpCost: number) => void
  rightPanelExtra?: React.ReactNode
}

export function CharacterHud({
  data, activeTab, onTabChange, onWoundChange, onStrainChange, onToggleEquipped,
  onToggleWeaponEquipped, onRollCrit, onHealCrit, onOpenTalentTree, onPortraitUpload,
  onPortraitDelete, contentOverride,
  isGmMode, onCharacteristicChange, onSoakChange, onDefenseChange,
  onMoralityChange, onMoralityKeyChange, onObligationChange, onDutyChange,
  onRemoveWeapon, onRemoveEquipment, onRemoveTalent, rightPanelExtra,
}: CharacterHudProps) {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: '11% 1fr 32%',
      gridTemplateRows: 'auto 1fr',
      position: 'relative',
    }}>
      {/* Subtle radial background */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          radial-gradient(circle at 30% 40%, rgba(200,162,78,.06) 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, rgba(43,93,174,.04) 0%, transparent 50%)
        `,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Top Bar — full width ── */}
      <div style={{
        gridColumn: '1 / -1',
        display: 'grid',
        gridTemplateColumns: '11% 1fr 32%',
        borderBottom: '1px solid var(--bdr-l)',
        background: 'rgba(250,247,242,.85)',
        backdropFilter: 'blur(10px)',
        zIndex: 10,
        minHeight: 'clamp(30px, 2.4rem, 50px)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid var(--bdr-l)',
        }}>
          <span style={{
            fontFamily: 'var(--font-orbitron)',
            fontWeight: 700,
            fontSize: 'var(--font-base)',
            letterSpacing: '0.25rem',
            color: 'var(--gold-d)',
          }}>
            HOLOCRON
          </span>
        </div>
        <Breadcrumb characterName={data.name} activeTab={activeTab} />
        <div style={{ borderLeft: '1px solid var(--bdr-l)' }} />
      </div>

      {/* ── Sidebar — below top bar ── */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* ── Content Panel ── */}
      {contentOverride ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sp-md)' }}>
            {contentOverride}
          </div>
          <BottomBar
            playerName={data.playerName}
            sessionInfo="Edge of the Empire"

          />
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'clamp(220px, 16vw, 420px) 1fr',
          gridTemplateRows: '1fr auto',
          overflow: 'hidden',
          zIndex: 2,
        }}>
          {/* Left: stats column */}
          <div style={{
            padding: 'var(--sp-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sp-sm)',
            overflowY: 'auto',
          }}>
            <VitalsCard
              woundCurrent={data.woundCurrent} woundThreshold={data.woundThreshold}
              strainCurrent={data.strainCurrent} strainThreshold={data.strainThreshold}
              soak={data.soak} defenseRanged={data.defenseRanged} defenseMelee={data.defenseMelee}
              onWoundChange={onWoundChange} onStrainChange={onStrainChange}
              isGmMode={isGmMode} onSoakChange={onSoakChange} onDefenseChange={onDefenseChange}
            />
            <MoralityCard
              value={data.moralityValue}
              strength={data.moralityStrength}
              weakness={data.moralityWeakness}
              isGmMode={isGmMode}
              onMoralityChange={onMoralityChange}
              onMoralityKeyChange={onMoralityKeyChange}
            />
            <ObligationDutyCard
              obligation={data.obligation}
              duty={data.duty}
              isGmMode={isGmMode}
              onObligationChange={onObligationChange}
              onDutyChange={onDutyChange}
            />
            <WeaponsCard
              weapons={data.weapons}
              onToggleEquipped={onToggleWeaponEquipped}
              isGmMode={isGmMode}
              onRemoveWeapon={onRemoveWeapon}
            />
            <EquipmentCard
              items={data.equipment}
              encumbranceCurrent={data.encumbranceCurrent}
              encumbranceThreshold={data.encumbranceThreshold}
              onToggleEquipped={onToggleEquipped}
              isGmMode={isGmMode}
              onRemoveEquipment={onRemoveEquipment}
            />
          </div>

          {/* Right: character image & info */}
          <CenterHero
            name={data.name}
            subtitle={data.subtitle}
            portraitUrl={data.portraitUrl}
            credits={data.credits}
            xpTotal={data.xpTotal}
            xpAvailable={data.xpAvailable}
            onPortraitUpload={onPortraitUpload}
            onPortraitDelete={onPortraitDelete}
          />

          {/* Bottom bar spans both */}
          <div style={{ gridColumn: '1 / -1' }}>
            <BottomBar
              playerName={data.playerName}
              sessionInfo="Edge of the Empire"

            />
          </div>
        </div>
      )}

      {/* ── Right Panel — scrollable ── */}
      <div style={{
        padding: 'var(--sp-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-sm)',
        overflowY: 'auto',
        zIndex: 2,
        borderLeft: '1px solid var(--bdr-l)',
      }}>
        {/* Characteristics — always open */}
        <CharacteristicsCard
          brawn={data.brawn} agility={data.agility} intellect={data.intellect}
          cunning={data.cunning} willpower={data.willpower} presence={data.presence}
          isGmMode={isGmMode} onCharacteristicChange={onCharacteristicChange}
        />

        <SkillsCard title="Combat Skills" skills={data.combatSkills} animClass="ar d1" collapsible xpAvailable={data.xpAvailable} isGmMode={isGmMode} />
        <SkillsCard title="General Skills" skills={data.generalSkills} animClass="ar d2" collapsible defaultCollapsed xpAvailable={data.xpAvailable} isGmMode={isGmMode} />
        <SkillsCard title="Knowledge" skills={data.knowledgeSkills} animClass="ar d3" collapsible defaultCollapsed xpAvailable={data.xpAvailable} isGmMode={isGmMode} />
        <TalentsCard
          talents={data.talents}
          onOpenTree={onOpenTalentTree}
          collapsible defaultCollapsed
          isGmMode={isGmMode}
          onRemoveTalent={onRemoveTalent}
        />
        <CriticalInjuriesCard
          injuries={data.criticalInjuries}
          onRollCrit={onRollCrit}
          onHealCrit={onHealCrit}
          collapsible
        />
        {rightPanelExtra}
      </div>
    </div>
  )
}
