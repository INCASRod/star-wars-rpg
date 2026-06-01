import { Suspense } from 'react'
import { CharacterLoader } from '@/components/ui/CharacterLoader'
import { GmShell } from './GmShell'

export default function GmDashboardPage() {
  return (
    <Suspense fallback={<CharacterLoader />}>
      <GmShell />
    </Suspense>
  )
}
