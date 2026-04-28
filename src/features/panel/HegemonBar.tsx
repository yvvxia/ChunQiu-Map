import { useMemo } from 'react'
import {
  getDukePersonForStateInYear,
  getHegemonForYear,
  getStateById,
} from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'

function formatRulerTitle(p: { name: string; posthumous?: string }): string {
  if (p.posthumous?.trim()) {
    if (p.name && p.name !== p.posthumous) return `${p.posthumous}（${p.name}）`
    return p.posthumous
  }
  return p.name
}

export function HegemonBar() {
  const currentLuYearId = useAppStore(s => s.currentLuYearId)

  const { stateName, color, rulerLine } = useMemo(() => {
    const sid = getHegemonForYear(currentLuYearId)
    if (!sid) {
      return { stateName: null as string | null, color: null as string | null, rulerLine: null as string | null }
    }
    const st = getStateById(sid)
    const duke = getDukePersonForStateInYear(sid, currentLuYearId)
    const rulerLine = duke ? formatRulerTitle(duke) : null
    return {
      stateName: st?.name ?? sid,
      color: st?.color ?? null,
      rulerLine,
    }
  }, [currentLuYearId])

  return (
    <div className="hegemon-bar" role="status" aria-label="当前霸主">
      <span className="hegemon-bar-label">当前霸主</span>
      {stateName ? (
        <div className="hegemon-bar-body">
          <span className="hegemon-bar-state" style={color ? { color } : undefined}>
            {stateName}国
          </span>
          {rulerLine ? (
            <span className="hegemon-bar-ruler">{rulerLine}</span>
          ) : (
            <span className="hegemon-bar-ruler hegemon-bar-ruler-missing">君主待补</span>
          )}
        </div>
      ) : (
        <span className="hegemon-bar-none">当年无示意霸主</span>
      )}
    </div>
  )
}
