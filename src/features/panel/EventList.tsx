import { getEventsForYear } from '@/data/dataService'
import { CATEGORY_LABELS } from './panelHelpers'

interface Props {
  luYearId: string
  filterStateId?: string | null
  filterPlaceId?: string | null
}

export function EventList({ luYearId, filterStateId, filterPlaceId }: Props) {
  let events = getEventsForYear(luYearId)
  if (filterStateId) {
    events = events.filter(e => e.stateIds.includes(filterStateId))
  }
  if (filterPlaceId) {
    events = events.filter(e => e.placeIds.includes(filterPlaceId))
  }

  if (events.length === 0) {
    return (
      <div style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)' }}>
        此年无《春秋》记录
      </div>
    )
  }

  return (
    <div>
      {events.map(ev => (
        <div key={ev.id} style={{ padding: 'var(--space-3) var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <span
              className="tag"
              style={{ color: getCategoryColor(ev.category), borderColor: getCategoryColor(ev.category) }}
            >
              {CATEGORY_LABELS[ev.category] ?? ev.category}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)' }}>{ev.sourceRef}</span>
          </div>
          <div className="jing-quote">{ev.jingText}</div>
          {ev.zuoComment && (
            <div className="zuo-quote" style={{ marginTop: 'var(--space-2)' }}>
              《左传》：{ev.zuoComment}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    battle:     '#c0392b',
    assembly:   '#2d6a4f',
    succession: '#6b2d6b',
    ritual:     '#c9a227',
    diplomatic: '#1a6b8a',
    disaster:   '#555',
    other:      '#3d2f10',
  }
  return map[cat] ?? '#3d2f10'
}
