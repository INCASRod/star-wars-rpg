import { Suspense } from 'react'
import { HolocronLoader } from '@/components/ui/HolocronLoader'
import { GmShell } from './GmShell'

export default function GmDashboardPage() {
  return (
    <Suspense fallback={<HolocronLoader />}>
      <GmShell />
    </Suspense>
  )
}
