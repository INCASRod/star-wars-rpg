'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface CampaignChar {
  id: string
  name: string
  species_key: string
  career_key: string
  portrait_url?: string
  player_name?: string
}

function CharacterRow({ c, onSelect, onDelete }: { c: CampaignChar; onSelect: () => void; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onSelect}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--bdr-l)', padding: 'var(--sp-md) var(--sp-lg)',
          cursor: 'pointer', transition: '.25s', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 'var(--sp-md)',
        }}
      >
        {c.portrait_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.portrait_url} alt="" style={{
            width: '2.5rem', height: '2.5rem', objectFit: 'cover',
            borderRadius: '50%', border: '2px solid var(--gold)',
          }} />
        )}
        <div>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-base)',
            fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.1rem',
          }}>
            {c.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
            color: 'var(--txt3)', marginTop: '0.1rem',
          }}>
            {c.career_key} // {c.species_key} // {c.player_name}
          </div>
        </div>
      </button>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          style={{
            position: 'absolute', top: '0.4rem', right: '0.4rem',
            width: '1.4rem', height: '1.4rem',
            background: 'rgba(191,64,64,.12)', border: '1px solid var(--red)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'var(--font-base)', fontWeight: 700, color: 'var(--red)',
            transition: '.15s', zIndex: 2,
          }}
          title="Delete character"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const [characters, setCharacters] = useState<CampaignChar[]>([])
  const [gmPin, setGmPin] = useState('')
  const [showGmInput, setShowGmInput] = useState(false)
  const [campaignId, setCampaignId] = useState<string | null>(null)
  const [confirmChar, setConfirmChar] = useState<CampaignChar | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      // Get first campaign
      const { data: campaigns } = await supabase.from('campaigns').select('*').limit(1)
      if (!campaigns?.length) return
      setCampaignId(campaigns[0].id)

      // Get characters with player names
      const { data: chars } = await supabase
        .from('characters')
        .select('id, name, species_key, career_key, portrait_url, player_id')
        .eq('campaign_id', campaigns[0].id)

      if (chars) {
        const { data: players } = await supabase.from('players').select('id, display_name')
        const playerMap = Object.fromEntries((players || []).map(p => [p.id, p.display_name]))
        setCharacters(chars.map(c => ({
          ...c,
          player_name: playerMap[c.player_id] || 'Unknown',
        })))
      }
    }
    load()
  }, [])

  const handleDeleteCharacter = async (charId: string, charName: string) => {
    if (!confirm(`Delete ${charName}? This cannot be undone.`)) return
    const supabase = createClient()
    await supabase.from('xp_transactions').delete().eq('character_id', charId)
    await supabase.from('character_critical_injuries').delete().eq('character_id', charId)
    await supabase.from('character_gear').delete().eq('character_id', charId)
    await supabase.from('character_armor').delete().eq('character_id', charId)
    await supabase.from('character_weapons').delete().eq('character_id', charId)
    await supabase.from('character_talents').delete().eq('character_id', charId)
    await supabase.from('character_skills').delete().eq('character_id', charId)
    await supabase.from('character_specializations').delete().eq('character_id', charId)
    await supabase.from('characters').delete().eq('id', charId)
    setCharacters(prev => prev.filter(c => c.id !== charId))
  }

  const handleGmLogin = async () => {
    if (!campaignId) return
    const supabase = createClient()
    const { data } = await supabase.from('campaigns').select('gm_pin').eq('id', campaignId).single()
    if (data?.gm_pin === gmPin) {
      router.push(`/gm?campaign=${campaignId}`)
    } else {
      alert('Invalid PIN')
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--sand)', gap: 'var(--sp-xl)',
      overflow: 'hidden',
    }}>
      {/* Radial bg */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `radial-gradient(circle at 30% 40%, rgba(200,162,78,.06) 0%, transparent 50%),
          radial-gradient(circle at 70% 60%, rgba(43,93,174,.04) 0%, transparent 50%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Logo */}
      <div style={{
        fontFamily: 'var(--font-orbitron)', fontWeight: 900,
        fontSize: 'var(--font-hero)', letterSpacing: '0.5rem',
        color: 'var(--gold-d)', textShadow: '0 0 60px var(--gold-glow-s)',
        position: 'relative', zIndex: 1,
      }}>
        HOLOCRON
      </div>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-hero)',
        color: 'var(--txt3)', letterSpacing: '0.3rem',
        position: 'relative', zIndex: 1,
      }}>
        Star Wars RPG Campaign Manager
      </div>

      {/* Character list */}
      {characters.length > 0 && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 'var(--sp-sm)',
          position: 'relative', zIndex: 1, marginTop: 'var(--sp-lg)',
          width: 'clamp(280px, 30vw, 500px)',
        }}>
          <div style={{
            fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
            fontWeight: 700, letterSpacing: '0.2rem', color: 'var(--txt3)',
            textTransform: 'uppercase', marginBottom: 'var(--sp-xs)',
          }}>
            Select Character
          </div>
          {characters.map(c => (
            <CharacterRow
              key={c.id}
              c={c}
              onSelect={() => setConfirmChar(c)}
              onDelete={() => handleDeleteCharacter(c.id, c.name)}
            />
          ))}
        </div>
      )}

      {/* Create Character button */}
      {campaignId && (
        <button
          onClick={() => router.push(`/create?campaign=${campaignId}`)}
          style={{
            position: 'relative', zIndex: 1,
            background: 'var(--gold)', border: 'none',
            padding: 'var(--sp-sm) var(--sp-xl)',
            cursor: 'pointer', fontFamily: 'var(--font-orbitron)',
            fontSize: 'var(--font-sm)', fontWeight: 700, letterSpacing: '0.15rem',
            color: 'var(--white)', transition: '.25s',
          }}
        >
          CREATE NEW CHARACTER
        </button>
      )}

      {/* GM button */}
      <div style={{ position: 'relative', zIndex: 1, marginTop: 'var(--sp-md)' }}>
        {!showGmInput ? (
          <button
            onClick={() => setShowGmInput(true)}
            style={{
              background: 'rgba(255,255,255,.5)', backdropFilter: 'blur(8px)',
              border: '1px solid var(--bdr-l)', padding: 'var(--sp-sm) var(--sp-lg)',
              cursor: 'pointer', fontFamily: 'var(--font-orbitron)',
              fontSize: 'var(--font-sm)', fontWeight: 600, letterSpacing: '0.15rem',
              color: 'var(--txt2)',
            }}
          >
            GM ACCESS
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--sp-sm)', alignItems: 'center' }}>
            <input
              type="password"
              maxLength={4}
              placeholder="PIN"
              value={gmPin}
              onChange={e => setGmPin(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGmLogin()}
              style={{
                width: '5rem', padding: 'var(--sp-sm)',
                border: '1px solid var(--bdr-l)', background: 'var(--white)',
                fontFamily: 'var(--font-mono)', fontSize: 'var(--font-md)',
                textAlign: 'center', letterSpacing: '0.3rem',
              }}
              autoFocus
            />
            <button onClick={handleGmLogin} style={{
              background: 'var(--gold)', border: 'none',
              padding: 'var(--sp-sm) var(--sp-md)',
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
              fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
            }}>
              ENTER
            </button>
          </div>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 'var(--font-sm)',
        color: 'var(--txt3)', marginTop: 'var(--sp-sm)',
        position: 'relative', zIndex: 1,
      }}>
        Edge of the Empire // Age of Rebellion // Force and Destiny
      </div>

      {/* Character confirmation modal */}
      {confirmChar && (
        <div
          onClick={() => setConfirmChar(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(12px)',
              border: '1px solid var(--bdr-l)',
              padding: 'var(--sp-xl)',
              width: 'clamp(280px, 28vw, 420px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 'var(--sp-md)',
            }}
          >
            {confirmChar.portrait_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={confirmChar.portrait_url} alt="" style={{
                width: '4rem', height: '4rem', objectFit: 'cover',
                borderRadius: '50%', border: '2px solid var(--gold)',
              }} />
            )}
            <div style={{
              fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-md)',
              fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.1rem',
              textAlign: 'center',
            }}>
              {confirmChar.name}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 'var(--font-base)',
              color: 'var(--txt3)', textAlign: 'center', lineHeight: 1.6,
            }}>
              Are you <span style={{ color: 'var(--gold-d)', fontWeight: 700 }}>{confirmChar.player_name}</span>?
              <br />
              Confirm this is your character to continue.
            </div>
            <div style={{ display: 'flex', gap: 'var(--sp-sm)', marginTop: 'var(--sp-sm)', width: '100%' }}>
              <button
                onClick={() => setConfirmChar(null)}
                style={{
                  flex: 1, padding: 'var(--sp-sm)',
                  background: 'rgba(255,255,255,.5)', border: '1px solid var(--bdr-l)',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                  fontWeight: 600, color: 'var(--txt2)', cursor: 'pointer',
                  letterSpacing: '0.1rem',
                }}
              >
                CANCEL
              </button>
              <button
                onClick={() => router.push(`/character/${confirmChar.id}`)}
                style={{
                  flex: 2, padding: 'var(--sp-sm)',
                  background: 'var(--gold)', border: 'none',
                  fontFamily: 'var(--font-orbitron)', fontSize: 'var(--font-sm)',
                  fontWeight: 700, color: 'var(--white)', cursor: 'pointer',
                  letterSpacing: '0.15rem',
                }}
              >
                THAT&apos;S ME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
