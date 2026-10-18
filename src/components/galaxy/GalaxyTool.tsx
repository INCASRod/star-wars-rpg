'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  difficulty, loadGalaxy, plan, travelTime,
  type DifficultyResult, type Endpoint, type Galaxy, type Plan, type RouteResult,
} from '@/lib/astrogation'
import { CoursePanel, type Pick } from './CoursePanel'
import { GalaxyMap, type MapPin, type RouteStyle } from './GalaxyMap'
import { RouteCard, StopList } from './RouteCard'
import styles from './galaxy.module.css'

interface Props { campaignId: string | null }

type Which = 'lane' | 'hop'

interface Evaluated { route: RouteResult; diff: DifficultyResult; time: ReturnType<typeof travelTime> }

export function GalaxyTool({ campaignId }: Props) {
  const supabase = useMemo(() => createClient(), [])
  const [galaxy, setGalaxy] = useState<Galaxy | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pins, setPins] = useState<MapPin[]>([])
  const [origin, setOrigin] = useState<Pick | null>(null)
  const [dest, setDest] = useState<Pick | null>(null)
  const [hyperdrive, setHyperdrive] = useState(1)
  // The chosen card belongs to one plan; a new trip falls back to the lane route.
  const [choice, setChoice] = useState<{ plan: Plan | null; which: Which }>({ plan: null, which: 'lane' })
  const [pinMode, setPinMode] = useState(false)
  // Origin held as the campaign's current location (campaign_nav_state). Loaded with the pins so Origin is pre-filled on first paint.
  const [hold, setHold] = useState(false)
  const [navLoaded, setNavLoaded] = useState(false)
  const [navError, setNavError] = useState<string | null>(null)

  useEffect(() => {
    let live = true
    loadGalaxy(supabase).then(g => live && setGalaxy(g)).catch(e => live && setError(String(e?.message ?? e)))
    return () => { live = false }
  }, [supabase])

  useEffect(() => {
    if (!campaignId) return
    let live = true
    Promise.all([
      supabase.from('campaign_nav_pins').select('id,name,x,y').eq('campaign_id', campaignId),
      supabase.from('campaign_nav_state').select('current_system_id,current_pin_id').eq('campaign_id', campaignId).maybeSingle(),
    ]).then(([pinRes, navRes]) => {
      if (!live) return
      if (pinRes.error) setError(pinRes.error.message)
      const loaded = (pinRes.data ?? []) as MapPin[]
      setPins(loaded)
      const held = navRes.data
      if (held?.current_system_id) {
        setOrigin({ kind: 'sys', id: held.current_system_id })
        setHold(true)
      } else if (held?.current_pin_id && loaded.some(p => p.id === held.current_pin_id)) {
        setOrigin({ kind: 'pin', id: held.current_pin_id })
        setHold(true)
      } else if (held?.current_pin_id) {
        // held pin no longer exists: clear the hold silently
        supabase.from('campaign_nav_state').update({ current_pin_id: null }).eq('campaign_id', campaignId).then(() => {})
      }
      setNavLoaded(true)
    })
    return () => { live = false }
  }, [supabase, campaignId])

  const byId = useMemo(() => new Map((galaxy?.graph.nodes ?? []).map(n => [n.id, n])), [galaxy])
  const pinById = useMemo(() => new Map(pins.map(p => [p.id, p])), [pins])

  const nameOf = useCallback((p: Pick | null) => {
    if (!p) return ''
    return p.kind === 'sys' ? byId.get(p.id)?.name ?? '' : pinById.get(p.id)?.name ?? ''
  }, [byId, pinById])

  const endpoint = useCallback((p: Pick): Endpoint | null => {
    if (p.kind === 'sys') return byId.has(p.id) ? { id: p.id } : null
    const pin = pinById.get(p.id)
    return pin ? { pin: { x: pin.x, y: pin.y }, name: pin.name } : null
  }, [byId, pinById])

  const result = useMemo<Plan | null>(() => {
    if (!galaxy || !origin || !dest) return null
    const a = endpoint(origin)
    const b = endpoint(dest)
    if (!a || !b) return null
    return plan(galaxy.graph, a, b)
  }, [galaxy, origin, dest, endpoint])

  // Hyperdrive class only multiplies time, so it never re-plans.
  const evaluate = useCallback((route: RouteResult): Evaluated => ({
    route,
    diff: difficulty(route, galaxy?.hazards ?? []),
    time: travelTime(route, hyperdrive),
  }), [galaxy, hyperdrive])

  const lane = useMemo(() => (result ? evaluate(result.primary) : null), [result, evaluate])
  const hop = useMemo(() => (result?.shortcut ? evaluate(result.shortcut) : null), [result, evaluate])

  const which: Which = choice.plan === result ? choice.which : 'lane'
  const setWhich = (w: Which) => setChoice({ plan: result, which: w })
  const shown = which === 'hop' && hop ? hop : lane
  const routeStyle: RouteStyle = which === 'hop' && hop ? 'hop' : 'lane'

  // Optimistic: the caller has already updated the UI; a failed save reverts the tickbox and shows an inline message.
  const saveHold = async (p: Pick | null, revertTo: boolean) => {
    if (!campaignId) return
    const { error: err } = await supabase.from('campaign_nav_state').upsert({
      campaign_id: campaignId,
      current_system_id: p?.kind === 'sys' ? p.id : null,
      current_pin_id: p?.kind === 'pin' ? p.id : null,
      updated_at: new Date().toISOString(),
    })
    if (err) { setHold(revertTo); setNavError('Could not save the current location.') }
    else setNavError(null)
  }

  /** Every Origin change goes through here so a held location follows it. */
  const changeOrigin = (p: Pick | null) => {
    setOrigin(p)
    if (!hold) return
    if (!p) setHold(false)
    saveHold(p, false)
  }
  const toggleHold = (on: boolean) => {
    setHold(on)
    saveHold(on ? origin : null, !on)
  }
  const arrived = () => {
    if (!dest) return
    setOrigin(dest)
    setDest(null)
    setHold(true)
    saveHold(dest, false)
  }

  const pickPlanet = (id: string) => {
    if (pinMode) return
    const p: Pick = { kind: 'sys', id }
    if (!origin || (origin && dest)) { changeOrigin(p); setDest(null) }
    else setDest(p)
  }
  const pickPin = (id: string) => {
    const p: Pick = { kind: 'pin', id }
    if (!origin || (origin && dest)) { changeOrigin(p); setDest(null) }
    else setDest(p)
  }

  const dropPin = async (x: number, y: number) => {
    if (!campaignId) return
    const name = `Uncharted pin ${pins.length + 1}`
    const { data, error: err } = await supabase.from('campaign_nav_pins').insert({ campaign_id: campaignId, name, x, y }).select('id,name,x,y').single()
    if (err || !data) { setError(err?.message ?? 'Could not save pin'); return }
    setPins(ps => [...ps, data as MapPin])
    setPinMode(false)
  }

  const renamePin = async (id: string, name: string) => {
    const { error: err } = await supabase.from('campaign_nav_pins').update({ name }).eq('id', id)
    if (err) { setError(err.message); return }
    setPins(ps => ps.map(p => (p.id === id ? { ...p, name } : p)))
  }

  const deletePin = async (id: string) => {
    const { error: err } = await supabase.from('campaign_nav_pins').delete().eq('id', id)
    if (err) { setError(err.message); return }
    setPins(ps => ps.filter(p => p.id !== id))
    if (origin?.kind === 'pin' && origin.id === id) { setOrigin(null); setHold(false) }
    if (dest?.kind === 'pin' && dest.id === id) setDest(null)
  }

  const swap = () => {
    setOrigin(dest)
    setDest(origin)
    if (hold) {
      if (!dest) setHold(false)
      saveHold(dest, false)
    }
  }

  const current = useMemo(() => {
    if (!hold || !origin) return null
    return origin.kind === 'sys' ? byId.get(origin.id) ?? null : pinById.get(origin.id) ?? null
  }, [hold, origin, byId, pinById])

  return (
    <div className={styles.app} data-theme="gm-imperial" data-testid="galaxy-root">
      <header className={styles.top}>
        <h1>Galaxy</h1>
        <span className={styles.tag}>Astrogation · GM</span>
        <span className={styles.spacer} />
        <div className={styles.legend}>
          <span><i className={styles.lgMajor} />Major lane</span>
          <span><i className={styles.lgMinor} />Minor lane</span>
          <span><i className={styles.lgOff} />Off-lane</span>
          <span><i className={styles.lgHop} />Hop route</span>
        </div>
      </header>

      <aside className={styles.side}>
        {galaxy && (navLoaded || !campaignId) ? (
          <>
            <CoursePanel
              nodes={galaxy.graph.nodes}
              pins={pins}
              origin={origin}
              dest={dest}
              hyperdrive={hyperdrive}
              pinMode={pinMode}
              canPin={!!campaignId}
              nameOf={nameOf}
              onOrigin={changeOrigin}
              onDest={setDest}
              onSwap={swap}
              onHyperdrive={setHyperdrive}
              holdCurrent={hold}
              canHold={!!campaignId}
              onHoldCurrent={toggleHold}
              navError={navError}
              onTogglePinMode={() => setPinMode(m => !m)}
              onRenamePin={renamePin}
              onDeletePin={deletePin}
            />
            <div className={styles.res} aria-live="polite">
              {error && <div className={styles.empty}>{error}</div>}
              {!lane && <div className={styles.empty}>Pick an origin and a destination to plot a course.</div>}
              {lane && (
                <>
                  <RouteCard title="Lane route" route={lane.route} diff={lane.diff} time={lane.time} selected={which === 'lane'} onSelect={() => setWhich('lane')} onArrived={arrived} />
                  {hop && (
                    <RouteCard title="Hop route" risky route={hop.route} diff={hop.diff} time={hop.time} selected={which === 'hop'} onSelect={() => setWhich('hop')} onArrived={arrived} />
                  )}
                  {shown && <StopList route={shown.route} hop={routeStyle === 'hop'} />}
                </>
              )}
            </div>
          </>
        ) : (
          <div className={styles.loading}>{error ?? 'Loading the galaxy…'}</div>
        )}
      </aside>

      {galaxy ? (
        <GalaxyMap
          graph={galaxy.graph}
          hazards={galaxy.hazards}
          pins={pins}
          route={shown?.route ?? null}
          routeStyle={routeStyle}
          pinMode={pinMode}
          current={current}
          onPlanet={pickPlanet}
          onPin={pickPin}
          onDropPin={dropPin}
        />
      ) : (
        <div className={styles.map} />
      )}
    </div>
  )
}
