import { useMemo } from 'react'
import { ALL_PERSONS, getPersonById, getStateById } from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'
import { EventList } from './EventList'

export function PersonTab() {
  const currentLuYearId = useAppStore(s => s.currentLuYearId)
  const selectedEntityId = useAppStore(s => s.selectedEntityId)
  const selectedEntityType = useAppStore(s => s.selectedEntityType)
  const selectEntity = useAppStore(s => s.selectEntity)
  const searchQuery = useAppStore(s => s.searchQuery)

  const displayPersons = useMemo(() => {
    const q = searchQuery.trim()
    return ALL_PERSONS.filter(
      p =>
        p.activeLuYears.includes(currentLuYearId) &&
        (!q ||
          p.name.includes(q) ||
          (p.posthumous ?? '').includes(q) ||
          (p.courtesy ?? '').includes(q))
    )
  }, [currentLuYearId, searchQuery])

  const selectedPerson =
    selectedEntityType === 'person' && selectedEntityId
      ? getPersonById(selectedEntityId)
      : null

  if (selectedPerson) {
    const state = selectedPerson.stateId ? getStateById(selectedPerson.stateId) : null

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
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 4 }}>
            {selectedPerson.name}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', lineHeight: 1.8 }}>
            {selectedPerson.posthumous && <span>谥号：{selectedPerson.posthumous}　</span>}
            {selectedPerson.courtesy && <span>字：{selectedPerson.courtesy}　</span>}
            {state && (
              <span
                style={{ cursor: 'pointer', color: 'var(--color-sky)' }}
                onClick={() => state && selectEntity(state.id, 'state')}
              >
                所属：{state.name}国
              </span>
            )}
          </div>
        </div>
        <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600 }}>
          相关经文事件
        </div>
        <EventList luYearId={currentLuYearId} filterStateId={selectedPerson.stateId} />
      </div>
    )
  }

  if (displayPersons.length === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)' }}>
        此年无有记载之人物
      </div>
    )
  }

  return (
    <div>
      {displayPersons.map(person => {
        const state = person.stateId ? getStateById(person.stateId) : null
        return (
          <div
            key={person.id}
            className={`info-card ${selectedEntityId === person.id ? 'selected' : ''}`}
            onClick={() => selectEntity(person.id, 'person')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {state && (
                <span
                  style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: state.color, display: 'inline-block', flexShrink: 0,
                  }}
                />
              )}
              <span className="card-title">{person.name}</span>
              {state && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', marginLeft: 'auto' }}>
                  {state.name}
                </span>
              )}
            </div>
            <div className="card-sub">
              {person.posthumous ?? ''}
              {person.courtesy ? `（字${person.courtesy}）` : ''}
            </div>
          </div>
        )
      })}
    </div>
  )
}
