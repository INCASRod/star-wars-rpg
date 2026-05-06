import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fetchVehicles, dbRowToVehicle } from '@/lib/vehicles'
import type { Vehicle } from '@/lib/vehicles'

export interface UseVehicleLibraryResult {
  vehicleLibrary:       Vehicle[]
  vehicleLibLoaded:     boolean
  vehicleSearch:        string
  setVehicleSearch:     (v: string) => void
  silhouetteFilter:     'all' | '1' | '2' | '3' | '4' | '5+'
  setSilhouetteFilter:  (v: 'all' | '1' | '2' | '3' | '4' | '5+') => void
  filteredVehicleLib:   Vehicle[]
}

export function useVehicleLibrary(): UseVehicleLibraryResult {
  const [vehicleLibrary, setVehicleLibrary] = useState<Vehicle[]>([])
  const [vehicleLibLoaded, setVehicleLibLoaded] = useState(false)
  const [vehicleSearch, setVehicleSearch] = useState('')
  const [silhouetteFilter, setSilhouetteFilter] = useState<'all' | '1' | '2' | '3' | '4' | '5+'>('all')

  // Eager-load vehicle library on mount
  useEffect(() => {
    if (vehicleLibLoaded) return
    const supabase = createClient()
    const load = async () => {
      const [oggdude, customResult] = await Promise.all([
        fetchVehicles(),
        supabase.from('ref_vehicles').select('*').order('name'),
      ])
      const custom = (customResult.data ?? []).map(r => dbRowToVehicle(r as Record<string, unknown>))
      setVehicleLibrary([...oggdude, ...custom])
      setVehicleLibLoaded(true)
    }
    void load()
  }, []) // load once on mount — eslint-disable-line react-hooks/exhaustive-deps

  const filteredVehicleLib = useMemo(() => {
    let list = vehicleLibrary
    if (silhouetteFilter !== 'all') {
      list = list.filter(v => {
        if (silhouetteFilter === '5+') return v.silhouette >= 5
        return v.silhouette === parseInt(silhouetteFilter)
      })
    }
    if (vehicleSearch.trim()) {
      const q = vehicleSearch.toLowerCase()
      list = list.filter(v => v.name.toLowerCase().includes(q))
    }
    return list
  }, [vehicleLibrary, silhouetteFilter, vehicleSearch])

  return {
    vehicleLibrary,
    vehicleLibLoaded,
    vehicleSearch,
    setVehicleSearch,
    silhouetteFilter,
    setSilhouetteFilter,
    filteredVehicleLib,
  }
}
