'use client'

import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/card'
import type { MapProps, MapMarker } from './Map'

const LeafletMap = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <Card className="w-full h-full min-h-[300px] flex items-center justify-center bg-muted">
      <p className="text-muted-foreground animate-pulse">Térkép betöltése...</p>
    </Card>
  ),
})

export default function DynamicMap(props: MapProps) {
  return <LeafletMap {...props} />
}

export type { MapMarker }
