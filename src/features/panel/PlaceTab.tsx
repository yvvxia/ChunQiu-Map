import { useMemo } from 'react'
import {
  ALL_PLACES,
  getEffectivePlaceOwnership,
  getEventsForYear,
  getPlaceById,
  getStateById,
} from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'
import { EventList } from './EventList'

const CHANGE_LABELS: Record<string, string> = {
  annex: '攻取',
  recover: '复归',
  cede: '割让',
}

export function PlaceTab() {
  const currentLuYearId = useAppStore(s => s.currentLuYearId)
  const selectedEntityId = useAppStore(s => s.selectedEntityId)
  const selectedEntityType = useAppStore(s => s.selectedEntityType)
  const selectEntity = useAppStore(s => s.selectEntity)
  const searchQuery = useAppStore(s => s.searchQuery)

  const activePlaceIds = useMemo(() => {
    const events = getEventsForYear(currentLuYearId)
    const ids = new Set<string>()
    events.forEach(e => e.placeIds.forEach(p => ids.add(p)))
    return ids
  }, [currentLuYearId])

  const displayPlaces = useMemo(() => {
    const q = searchQuery.trim()
    return ALL_PLACES.filter(
      p =>
        (activePlaceIds.has(p.id) || p.certainty === 'high') &&
        (!q || p.name.includes(q))
    )
  }, [activePlaceIds, searchQuery])

  // 详情视图
  const selectedPlace =
    selectedEntityType === 'place' && selectedEntityId
      ? getPlaceById(selectedEntityId)
      : null

  if (selectedPlace) {
    const ownership = getEffectivePlaceOwnership(selectedPlace.id, currentLuYearId)
    const effectiveState = ownership.effectiveStateId ? getStateById(ownership.effectiveStateId) : null
    const originalState = ownership.originalStateId ? getStateById(ownership.originalStateId) : null
    // 若有效归属不同于原始，说明已发生变更
    const hasTerritoryChange = ownership.effectiveStateId !== ownership.originalStateId
    // 是当前有效国的都城
    const isCapital = effectiveState?.capitalId === selectedPlace.id
    // 是否曾经是原属国的都城（已失、今已非都）
    const wasOriginalCapital = !isCapital && originalState?.capitalId === selectedPlace.id
    const isActiveYear = activePlaceIds.has(selectedPlace.id)
    const isChangedThisYear = ownership.changedInYear === currentLuYearId

    return (
      <div>
        <button
          onClick={() => selectEntity(null, null)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-gold)', fontSize: 'var(--text-sm)',
            padding: 'var(--space-3) var(--space-3)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← 返回列表
        </button>

        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
            {effectiveState && (
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: effectiveState.color, display: 'inline-block', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{selectedPlace.name}</span>
            {isCapital && (
              <span className="tag" style={{ color: 'var(--color-gold)', borderColor: 'var(--color-gold)' }}>都城</span>
            )}
            {wasOriginalCapital && (
              <span className="tag" style={{ color: 'var(--color-ink-light)', borderColor: 'var(--color-ink-light)' }}>故都</span>
            )}
            {isChangedThisYear && ownership.changeType && (
              <span className="tag" style={{ color: 'var(--color-vermilion)', borderColor: 'var(--color-vermilion)' }}>
                本年{CHANGE_LABELS[ownership.changeType] ?? '归属变更'}
              </span>
            )}
            {isActiveYear && (
              <span className="tag" style={{ color: 'var(--color-vermilion)', borderColor: 'var(--color-vermilion)' }}>本年有载</span>
            )}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', lineHeight: 1.8 }}>
            {selectedPlace.modernRef && <div>今址：{selectedPlace.modernRef}</div>}
            {effectiveState && (
              <div>
                当前隶属：
                <span
                  style={{ color: 'var(--color-sky)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => selectEntity(effectiveState.id, 'state')}
                >
                  {effectiveState.name}国
                </span>
                {isCapital && '（都城）'}
              </div>
            )}
            {hasTerritoryChange && originalState && (
              <div style={{ color: 'var(--color-ink-light)' }}>
                初始归属：
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => selectEntity(originalState.id, 'state')}
                >
                  {originalState.name}国
                </span>
                {wasOriginalCapital && '（故都）'}
              </div>
            )}
          </div>
        </div>

        {/* 同属国的其他城邑（按当前有效归属国） */}
        {effectiveState && (
          <div>
            <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600 }}>
              {effectiveState.name}国城邑
            </div>
            {ALL_PLACES
              .filter(p => {
                if (p.id === selectedPlace.id || p.certainty === 'low') return false
                const ow = getEffectivePlaceOwnership(p.id, currentLuYearId)
                return ow.effectiveStateId === effectiveState.id
              })
              .map(p => (
                <div
                  key={p.id}
                  className="info-card"
                  onClick={() => selectEntity(p.id, 'place')}
                >
                  <div className="card-title">{p.name}</div>
                  <div className="card-sub">{p.modernRef ?? ''}</div>
                </div>
              ))
            }
          </div>
        )}

        {/* 本年相关经文 */}
        {isActiveYear && (
          <>
            <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600 }}>
              本年经文
            </div>
            <EventList
              luYearId={currentLuYearId}
              filterPlaceId={selectedPlace.id}
            />
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      {displayPlaces.map(place => {
        const ownership = getEffectivePlaceOwnership(place.id, currentLuYearId)
        const effectiveState = ownership.effectiveStateId ? getStateById(ownership.effectiveStateId) : null
        const isActive = activePlaceIds.has(place.id)
        const hasTerritoryChange = ownership.effectiveStateId !== ownership.originalStateId
        return (
          <div
            key={place.id}
            className={`info-card ${selectedEntityId === place.id ? 'selected' : ''}`}
            onClick={() => selectEntity(place.id, 'place')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {effectiveState && (
                <span
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: effectiveState.color, display: 'inline-block', flexShrink: 0,
                    opacity: isActive ? 1 : 0.4,
                  }}
                />
              )}
              <span className="card-title" style={{ opacity: isActive ? 1 : 0.55 }}>{place.name}</span>
              {isActive && (
                <span className="tag" style={{ color: 'var(--color-vermilion)', borderColor: 'var(--color-vermilion)', marginLeft: 'auto' }}>
                  本年有载
                </span>
              )}
            </div>
            <div className="card-sub">
              {effectiveState
                ? hasTerritoryChange
                  ? `当前隶属：${effectiveState.name}国　`
                  : `隶属：${effectiveState.name}国　`
                : ''}
              {place.modernRef ?? ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
