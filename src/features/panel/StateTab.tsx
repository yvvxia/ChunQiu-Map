import { useMemo } from 'react'
import {
  ALL_STATES,
  getActiveStateIdsForYear,
  getPersonsForStateInYear,
  getRelationsForStateInYear,
  getStateById,
  getPlaceById,
  getPrevLuYearId,
} from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'
import { RANK_LABELS, REL_LABELS } from './panelHelpers'
import { EventList } from './EventList'

export function StateTab() {
  const currentLuYearId = useAppStore(s => s.currentLuYearId)
  const selectedEntityId = useAppStore(s => s.selectedEntityId)
  const selectedEntityType = useAppStore(s => s.selectedEntityType)
  const selectEntity = useAppStore(s => s.selectEntity)
  const searchQuery = useAppStore(s => s.searchQuery)

  const activeIds = useMemo(
    () => getActiveStateIdsForYear(currentLuYearId),
    [currentLuYearId]
  )

  const displayStates = useMemo(() => {
    const q = searchQuery.trim()
    return ALL_STATES.filter(
      s =>
        (!q || s.name.includes(q)) &&
        (activeIds.has(s.id) || s.certainty === 'high')
    )
  }, [activeIds, searchQuery])

  const selectedState =
    selectedEntityType === 'state' && selectedEntityId
      ? getStateById(selectedEntityId)
      : null

  if (selectedState) {
    const capital = selectedState.capitalId ? getPlaceById(selectedState.capitalId) : null
    const relations = getRelationsForStateInYear(selectedState.id, currentLuYearId)
    const persons = getPersonsForStateInYear(selectedState.id, currentLuYearId)

    // 关系年度变化
    const prevYearId = getPrevLuYearId(currentLuYearId)
    const prevRelIds = new Set(
      prevYearId
        ? getRelationsForStateInYear(selectedState.id, prevYearId).map(r => r.id)
        : []
    )
    const curRelIds = new Set(relations.map(r => r.id))
    // 本年终止的关系（前年有、今年没有）
    const endedRels = prevYearId
      ? getRelationsForStateInYear(selectedState.id, prevYearId).filter(r => !curRelIds.has(r.id))
      : []

    return (
      <div>
        {/* Back button */}
        <button
          onClick={() => selectEntity(null, null)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-gold)',
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-3) var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          ← 返回列表
        </button>

        {/* 国名与等级 */}
        <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: selectedState.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{selectedState.name}国</span>
            <span className="tag" style={{ color: 'var(--color-gold)', borderColor: 'var(--color-gold)' }}>
              {RANK_LABELS[selectedState.rank]}爵
            </span>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', lineHeight: 1.8 }}>
            {selectedState.clan && <span>姓：{selectedState.clan}姓　</span>}
            {selectedState.founder && <span>始封：{selectedState.founder}　</span>}
            {capital && (
              <span>
                都城：
                <span
                  style={{ color: 'var(--color-sky)', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => selectEntity(capital.id, 'place')}
                >
                  {capital.name}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* 人物 */}
        {persons.length > 0 && (
          <div>
            <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600 }}>
              当年活跃人物
            </div>
            {persons.map(p => (
              <div
                key={p.id}
                className="info-card"
                onClick={() => selectEntity(p.id, 'person')}
              >
                <div className="card-title">{p.name}</div>
                <div className="card-sub">{p.posthumous ?? ''}{p.courtesy ? `（字${p.courtesy}）` : ''}</div>
              </div>
            ))}
          </div>
        )}

        {/* 关系 */}
        {(relations.length > 0 || endedRels.length > 0) && (
          <div>
            <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600 }}>
              外交关系
              {prevYearId && (
                <span style={{ marginLeft: 6, fontWeight: 400, color: 'var(--color-ink-light)', opacity: 0.7 }}>
                  （含本年变化）
                </span>
              )}
            </div>
            {relations.map(rel => {
              const peerId = rel.fromId === selectedState.id ? rel.toId : rel.fromId
              const peer = getStateById(peerId)
              const isNew = !prevRelIds.has(rel.id)
              return (
                <div
                  key={rel.id}
                  className="info-card"
                  onClick={() => peer && selectEntity(peer.id, 'state')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span className="card-title">{peer?.name ?? peerId}</span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                      {isNew && (
                        <span className="rel-change-badge rel-change-new">新建</span>
                      )}
                      <span className="tag" style={{ color: getRelColor(rel.type), borderColor: getRelColor(rel.type) }}>
                        {REL_LABELS[rel.type]}
                      </span>
                    </div>
                  </div>
                  <div className="card-sub">{rel.sourceRef}</div>
                </div>
              )
            })}
            {endedRels.map(rel => {
              const peerId = rel.fromId === selectedState.id ? rel.toId : rel.fromId
              const peer = getStateById(peerId)
              return (
                <div
                  key={`ended-${rel.id}`}
                  className="info-card info-card-ended"
                  style={{ opacity: 0.55 }}
                  onClick={() => peer && selectEntity(peer.id, 'state')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span className="card-title" style={{ textDecoration: 'line-through' }}>{peer?.name ?? peerId}</span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                      <span className="rel-change-badge rel-change-ended">本年终止</span>
                      <span className="tag" style={{ color: getRelColor(rel.type), borderColor: getRelColor(rel.type) }}>
                        {REL_LABELS[rel.type]}
                      </span>
                    </div>
                  </div>
                  <div className="card-sub">{rel.sourceRef}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* 相关经文事件 */}
        <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600 }}>
          本年经文
        </div>
        <EventList luYearId={currentLuYearId} filterStateId={selectedState.id} />
      </div>
    )
  }

  return (
    <div>
      {displayStates.map(state => {
        const isActive = activeIds.has(state.id)
        return (
          <div
            key={state.id}
            className={`info-card ${selectedEntityId === state.id ? 'selected' : ''}`}
            onClick={() => selectEntity(state.id, 'state')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: state.color,
                  display: 'inline-block',
                  flexShrink: 0,
                  opacity: isActive ? 1 : 0.45,
                }}
              />
              <span className="card-title" style={{ opacity: isActive ? 1 : 0.55 }}>{state.name}</span>
              <span className="tag" style={{ color: 'var(--color-ink-light)', borderColor: 'var(--color-border-strong)', marginLeft: 'auto' }}>
                {RANK_LABELS[state.rank]}
              </span>
            </div>
            {isActive && (
              <div className="card-sub" style={{ marginTop: 2 }}>
                本年有《春秋》记录
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function getRelColor(type: string): string {
  const m: Record<string, string> = {
    ally: '#2d6a4f', enemy: '#c0392b', vassal: '#1a6b8a',
    suzerain: '#c9a227', marriage: '#a05070', tributary: '#c9a227',
  }
  return m[type] ?? '#888'
}
