import { useMemo } from 'react'
import {
  getEventsForYear,
  getActiveStateIdsForYear,
  getRelationsForYear,
  getPrevLuYearId,
} from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'
import { CATEGORY_LABELS } from './panelHelpers'
import type { EventCategory } from '@/domain/types'

const CATEGORY_COLORS: Record<string, string> = {
  battle:     '#c0392b',
  assembly:   '#2d6a4f',
  succession: '#6b2d6b',
  ritual:     '#c9a227',
  diplomatic: '#1a6b8a',
  disaster:   '#777',
  other:      '#3d2f10',
}

export function YearSituationCard() {
  const currentLuYearId = useAppStore(s => s.currentLuYearId)

  const data = useMemo(() => {
    const events = getEventsForYear(currentLuYearId)
    const prevId  = getPrevLuYearId(currentLuYearId)

    // 事件分类计数
    const catCount: Record<string, number> = {}
    for (const ev of events) {
      catCount[ev.category] = (catCount[ev.category] ?? 0) + 1
    }
    const topCats = Object.entries(catCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)

    // 活跃国家数
    const activeStates = getActiveStateIdsForYear(currentLuYearId).size

    // 关系变化：本年 vs 前一年
    const curRelIds  = new Set(getRelationsForYear(currentLuYearId).map(r => r.id))
    const prevRelIds = new Set(prevId ? getRelationsForYear(prevId).map(r => r.id) : [])
    const newRels  = [...curRelIds].filter(id => !prevRelIds.has(id)).length
    const goneRels = [...prevRelIds].filter(id => !curRelIds.has(id)).length

    return { events, topCats, activeStates, newRels, goneRels }
  }, [currentLuYearId])

  if (data.events.length === 0) return null

  return (
    <div className="year-situation-card">
      <div className="year-situation-title">本年态势摘要</div>

      {/* 事件类型气泡 */}
      <div className="year-situation-cats">
        {data.topCats.map(([cat, cnt]) => (
          <span
            key={cat}
            className="year-situation-cat"
            style={{ '--cat-color': CATEGORY_COLORS[cat] ?? '#888' } as React.CSSProperties}
          >
            {CATEGORY_LABELS[cat as EventCategory] ?? cat}
            <b>{cnt}</b>
          </span>
        ))}
      </div>

      {/* 统计行 */}
      <div className="year-situation-stats">
        <span className="ys-stat">
          <span className="ys-stat-num">{data.events.length}</span>
          <span className="ys-stat-label">条经文</span>
        </span>
        <span className="ys-divider" />
        <span className="ys-stat">
          <span className="ys-stat-num">{data.activeStates}</span>
          <span className="ys-stat-label">国有载</span>
        </span>
        {(data.newRels > 0 || data.goneRels > 0) && (
          <>
            <span className="ys-divider" />
            <span className="ys-stat">
              {data.newRels > 0 && (
                <span className="ys-rel-badge ys-rel-new">+{data.newRels}关系</span>
              )}
              {data.goneRels > 0 && (
                <span className="ys-rel-badge ys-rel-gone">-{data.goneRels}关系</span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
