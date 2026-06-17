'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FONT_DISPLAY, FONT_BODY, FS, SP, HUD, COLOR, RADIUS } from '@/lib/tokens'
import { MobileGroupStorageSheet } from './MobileGroupStorageSheet'

// ── Destiny pip sealed exceptions ──────────────────────────────────────────────
const DESTINY_LIGHT = '#0EA5E9'  /* destiny light — sealed exception */
const DESTINY_DARK  = '#A845F5'  /* destiny dark — sealed exception */
const LIGHT_IMG = '/images/factions/LightSymbol.png'
const DARK_IMG  = '/images/factions/DarkSymbol.png'

// ── Asset type badge metadata ──────────────────────────────────────────────────

const ASSET_TYPE_META: Record<string, { label: string; color: string }> = {
  strategic_asset: { label: 'STRATEGIC', color: 'var(--die-difficulty)' },
  starship:        { label: 'STARSHIP',  color: 'var(--hud-accent)' },
  vehicle:         { label: 'VEHICLE',   color: HUD.gold },
  safe_house:      { label: 'SAFE HOUSE', color: COLOR.green },
}

function getAssetTypeMeta(type: string) {
  return ASSET_TYPE_META[type] ?? {
    label: type.toUpperCase().replace(/_/g, ' '),
    color: HUD.textDim,
  }
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface MobileGroupScreenProps {
  campaignId:    string | null
  characterId:   string
  characterName: string
  destinyPool:   Array<'light' | 'dark'>
  supabase:      ReturnType<typeof createClient>
}

// ── Local types (derived from GroupSheet.tsx) ──────────────────────────────────

interface CampaignGroupData {
  contribution_rank: number
  contribution_rank_descriptions: Record<string, string>
  group_name?: string | null
}

interface CharacterDutyRow {
  id: string
  name: string
  duty_type: string | null
  duty_value: number
}

interface GroupAsset {
  id: string
  name: string
  asset_type: string
  description?: string | null
  is_group_storage: boolean
}

// ── Section sub-component ──────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontFamily:      FONT_BODY,
        fontSize:        FS.overline,
        color:           HUD.textFaint,
        letterSpacing:   '0.15em',
        textTransform:   'uppercase',
        marginBottom:    SP[1],
        paddingBottom:   SP[1],
        borderBottom:    '1px solid var(--hud-border)',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function MobileGroupScreen({
  campaignId,
  characterId,
  // characterName is accepted for interface compatibility but not used.
  destinyPool,
  supabase,
}: MobileGroupScreenProps) {
  const [campaignData, setCampaignData] = useState<CampaignGroupData | null>(null)
  const [duties, setDuties]             = useState<CharacterDutyRow[]>([])
  const [assets, setAssets]             = useState<GroupAsset[]>([])
  const [expandedAsset, setExpandedAsset]   = useState<string | null>(null)
  const [storageAsset,  setStorageAsset]    = useState<{ id: string; name: string } | null>(null)
  const [fetchError, setFetchError]         = useState<string | null>(null)

  // ── Data fetch ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!campaignId) return
    let mounted = true
    Promise.all([
      supabase
        .from('campaigns')
        .select('contribution_rank, contribution_rank_descriptions, group_name')
        .eq('id', campaignId)
        .single(),
      supabase
        .from('characters')
        .select('id, name, duty_type, duty_value, is_archived')
        .eq('campaign_id', campaignId)
        .eq('is_archived', false),
      supabase
        .from('group_assets')
        .select('id, name, asset_type, description, is_archived, is_group_storage')
        .eq('campaign_id', campaignId)
        .eq('is_archived', false),
    ]).then(([camp, duty, asset]) => {
      if (!mounted) return
      const hasError = [camp, duty, asset].some(r => r.error)
      if (hasError) {
        setFetchError('Could not load group data.')
        return
      }
      if (camp.data)  setCampaignData(camp.data as CampaignGroupData)
      if (duty.data)  setDuties(duty.data as CharacterDutyRow[])
      if (asset.data) setAssets(asset.data as GroupAsset[])
    })
    return () => { mounted = false }
  }, [campaignId, supabase])

  // ── No campaign guard ──────────────────────────────────────────────────────
  if (!campaignId) {
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: SP[4],
      }}>
        <div style={{
          fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint,
          letterSpacing: '0.08em',
        }}>
          No campaign linked.
        </div>
      </div>
    )
  }

  // ── Fetch error guard ──────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: SP[4] }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: '#E85A2A' /* wounds/danger — sealed exception */ }}>
          {fetchError}
        </div>
      </div>
    )
  }

  // ── Alliance standing derived values ───────────────────────────────────────
  const rank = campaignData?.contribution_rank ?? 0
  const descriptions = campaignData?.contribution_rank_descriptions ?? {}
  const currentRankName = descriptions[String(rank)] ?? '—'
  const nextRankName    = descriptions[String(rank + 1)] ?? null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{
      flex: 1,
      overflowY: 'auto',
      padding: `${SP[2]} ${SP[3]}`,
      display: 'flex',
      flexDirection: 'column',
      gap: SP[4],
    }}>

      {/* ── Section 1: Destiny Pool ──────────────────────────────────────────── */}
      <Section title="Destiny Pool">
        {destinyPool.length === 0 ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>
            No destiny tokens.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: SP[1], alignItems: 'center' }}>
            {destinyPool.map((side, i) => {
              const src   = side === 'light' ? LIGHT_IMG : DARK_IMG
              const color = side === 'light' ? DESTINY_LIGHT : DESTINY_DARK
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: SP[1] }}>
                  <span style={{
                    display: 'inline-block',
                    width: 16, height: 16,  /* fixed pip geometry */
                    WebkitMask: `url('${src}') center/contain no-repeat`,
                    mask:        `url('${src}') center/contain no-repeat`,
                    background:  color,
                    flexShrink:  0,
                  }} />
                  <span style={{
                    fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textDim,
                    textTransform: 'capitalize',
                  }}>
                    {side}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* ── Section 2: Group Duty ────────────────────────────────────────────── */}
      <Section title="Group Duty">
        {duties.length === 0 ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>
            No duty records.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: `${SP[1]} ${SP[2]}` }}>
            {/* Header */}
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Character
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Duty Type
            </div>
            <div style={{ fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'right' }}>
              Value
            </div>
            {/* Data rows */}
            {duties.map(row => (
              <React.Fragment key={row.id}>
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  minWidth: 0,
                }}>
                  {row.name}
                </div>
                <div style={{
                  fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  minWidth: 0,
                }}>
                  {row.duty_type ?? '—'}
                </div>
                <div style={{
                  fontFamily: FONT_DISPLAY, fontSize: FS.sm, color: HUD.gold,
                  fontWeight: 700, textAlign: 'right', flexShrink: 0,
                }}>
                  {row.duty_value}
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </Section>

      {/* ── Section 3: Alliance Standing ─────────────────────────────────────── */}
      <Section title="Alliance Standing">
        <div style={{ display: 'flex', flexDirection: 'column', gap: SP[2] }}>
          {/* Rank badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: SP[2] }}>
            <div style={{
              background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
              border: `1px solid color-mix(in srgb, var(--hud-accent) 40%, transparent)`,
              borderRadius: RADIUS.md,
              padding: `${SP[1]} ${SP[2]}`,
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: FONT_DISPLAY, fontSize: FS.label, color: 'var(--hud-accent)',
                fontWeight: 700, letterSpacing: '0.12em',
              }}>
                RANK {rank}
              </span>
            </div>
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              minWidth: 0,
            }}>
              {currentRankName}
            </div>
          </div>

          {/* Next rank preview */}
          {nextRankName && (
            <div style={{
              fontFamily: FONT_BODY, fontSize: FS.overline, color: HUD.textFaint,
              letterSpacing: '0.1em',
            }}>
              NEXT → {nextRankName}
            </div>
          )}
        </div>
      </Section>

      {/* ── Section 4: Imperial Threat (stub) ────────────────────────────────── */}
      <Section title="Imperial Threat">
        <div style={{
          background: `color-mix(in srgb, #E85A2A 5%, transparent)`,  /* wounds/danger — sealed exception */
          border: `1px solid color-mix(in srgb, #E85A2A 22%, transparent)`,  /* wounds/danger — sealed exception */
          borderRadius: RADIUS.md,
          padding: SP[2],
        }}>
          <div style={{
            fontFamily: FONT_BODY, fontSize: FS.overline,
            color: '#E85A2A', /* wounds/danger — sealed exception */
            fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            marginBottom: SP[1],
          }}>
            ⚠ Imperial Threat
          </div>
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>
            Classified — threat tracking coming in Phase 3.
          </div>
        </div>
      </Section>

      {/* ── Section 5: Group Assets ───────────────────────────────────────────── */}
      <Section title="Group Assets">
        {assets.length === 0 ? (
          <div style={{ fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textFaint }}>
            No group assets.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SP[1] }}>
            {assets.map(asset => {
              const isExpanded = expandedAsset === asset.id
              return (
                <div
                  key={asset.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedAsset(isExpanded ? null : asset.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedAsset(isExpanded ? null : asset.id) } }}
                  style={{
                    display: 'flex', flexDirection: 'column', gap: SP[1],
                    background: `color-mix(in srgb, var(--hud-border) 40%, transparent)`,
                    border: `1px solid var(--hud-border)`,
                    borderRadius: RADIUS.md,
                    padding: SP[2],
                    cursor: 'pointer',
                  }}
                >
                  {/* Asset header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: SP[1], minWidth: 0 }}>
                    <span style={{
                      fontFamily: FONT_DISPLAY, fontSize: FS.sm, color: HUD.text,
                      fontWeight: 700,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1, minWidth: 0,
                    }}>
                      {asset.name}
                    </span>
                    {(() => {
                      const meta = getAssetTypeMeta(asset.asset_type)
                      return (
                        <span style={{
                          fontFamily: FONT_DISPLAY,
                          fontSize: FS.overline,
                          color: meta.color,
                          background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${meta.color} 35%, transparent)`,
                          borderRadius: RADIUS.sm,
                          padding: `1px ${SP[1]}`, /* 1px vertical — geometry minimum */
                          textTransform: 'uppercase' as const,
                          letterSpacing: '0.1em',
                          flexShrink: 0,
                        }}>
                          {meta.label}
                        </span>
                      )
                    })()}
                    {asset.is_group_storage && (
                      <span style={{
                        fontFamily: FONT_BODY, fontSize: FS.overline,
                        color: 'var(--hud-accent)',
                        background: `color-mix(in srgb, var(--hud-accent) 15%, transparent)`,
                        border: `1px solid color-mix(in srgb, var(--hud-accent) 35%, transparent)`,
                        borderRadius: RADIUS.sm,
                        padding: `1px ${SP[1]}`, /* 1px vertical — geometry minimum */
                        flexShrink: 0, letterSpacing: '0.08em',
                      }}>
                        Storage
                      </span>
                    )}
                  </div>

                  {/* Expanded description */}
                  {isExpanded && asset.description && (
                    <div style={{
                      fontFamily: FONT_BODY, fontSize: FS.sm, color: HUD.textDim,
                      borderTop: '1px solid var(--hud-border)',
                      paddingTop: SP[1],
                      lineHeight: 1.5,
                    }}>
                      {asset.description}
                    </div>
                  )}

                  {/* Storage button — shown when expanded and asset is group storage */}
                  {isExpanded && asset.is_group_storage && (
                    <button
                      onClick={e => { e.stopPropagation(); setStorageAsset({ id: asset.id, name: asset.name }) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: SP[1],
                        marginTop: SP[1],
                        background: `color-mix(in srgb, var(--hud-accent) 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, var(--hud-accent) 30%, transparent)`,
                        borderRadius: RADIUS.sm,
                        padding: `1px ${SP[2]}`, /* 1px vertical — geometry minimum */
                        cursor: 'pointer',
                        fontFamily: FONT_BODY,
                        fontSize: FS.overline,
                        color: 'var(--hud-accent)',
                        letterSpacing: '0.08em',
                      }}
                    >
                      📦 Storage
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>

    </div>

    <MobileGroupStorageSheet
      assetId={storageAsset?.id ?? null}
      assetName={storageAsset?.name ?? ''}
      isOpen={storageAsset !== null}
      onClose={() => setStorageAsset(null)}
      takerId={characterId}
    />
  </>
  )
}
