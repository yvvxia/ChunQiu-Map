import { useMemo } from 'react'
import { ALL_EVENTS, ALL_LU_YEARS, ALL_PERSONS, ALL_PLACES, ALL_STATES, ALL_RELATIONS } from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'
import { CATEGORY_LABELS, RANK_LABELS } from './panelHelpers'

export function StatsTab() {
  const searchQuery = useAppStore(s => s.searchQuery)
  const q = searchQuery.trim()

  const stats = useMemo(() => {
    const catCount: Record<string, number> = {}
    ALL_EVENTS.forEach(e => {
      catCount[e.category] = (catCount[e.category] ?? 0) + 1
    })
    const rankCount: Record<string, number> = {}
    ALL_STATES.forEach(s => {
      rankCount[s.rank] = (rankCount[s.rank] ?? 0) + 1
    })
    return { catCount, rankCount }
  }, [])

  if (q) {
    const states = ALL_STATES.filter(s => s.name.includes(q))
    const persons = ALL_PERSONS.filter(
      p => p.name.includes(q) || (p.posthumous ?? '').includes(q) || (p.courtesy ?? '').includes(q)
    )
    const places = ALL_PLACES.filter(p => p.name.includes(q))
    const events = ALL_EVENTS.filter(e => e.jingText.includes(q))

    return (
      <div style={{ padding: 'var(--space-3)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', marginBottom: 'var(--space-2)' }}>
          检索："{q}"
        </div>
        {states.length > 0 && (
          <Section title="国家">
            {states.map(s => (
              <div key={s.id} style={{ fontSize: 'var(--text-sm)', padding: '3px 0', color: 'var(--color-ink-mid)' }}>
                <span style={{ color: s.color }}>●</span> {s.name}（{RANK_LABELS[s.rank]}）
              </div>
            ))}
          </Section>
        )}
        {persons.length > 0 && (
          <Section title="人物">
            {persons.map(p => (
              <div key={p.id} style={{ fontSize: 'var(--text-sm)', padding: '3px 0' }}>
                {p.name}{p.posthumous ? `（${p.posthumous}）` : ''}
              </div>
            ))}
          </Section>
        )}
        {places.length > 0 && (
          <Section title="地点">
            {places.map(p => (
              <div key={p.id} style={{ fontSize: 'var(--text-sm)', padding: '3px 0' }}>
                {p.name}
              </div>
            ))}
          </Section>
        )}
        {events.length > 0 && (
          <Section title="经文">
            {events.map(e => (
              <div key={e.id} className="jing-quote" style={{ marginBottom: 'var(--space-2)' }}>
                {e.jingText}
              </div>
            ))}
          </Section>
        )}
        {states.length + persons.length + places.length + events.length === 0 && (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)' }}>无匹配结果</div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: 'var(--space-3)' }}>
      <StatRow label="样本年份" value={`${ALL_LU_YEARS.length} 个鲁纪年`} />
      <StatRow label="经文事件" value={`${ALL_EVENTS.length} 条`} />
      <StatRow label="诸侯国" value={`${ALL_STATES.length} 国`} />
      <StatRow label="历史地点" value={`${ALL_PLACES.length} 处`} />
      <StatRow label="历史人物" value={`${ALL_PERSONS.length} 人`} />
      <StatRow label="外交关系" value={`${ALL_RELATIONS.length} 条`} />

      <div className="divider" />

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
        事件类型分布
      </div>
      {Object.entries(stats.catCount).map(([cat, cnt]) => (
        <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', padding: '2px 0' }}>
          <span>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}</span>
          <span style={{ color: 'var(--color-ink-light)' }}>{cnt}</span>
        </div>
      ))}

      <div className="divider" />

      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
        分封爵位分布
      </div>
      {Object.entries(stats.rankCount).map(([rank, cnt]) => (
        <div key={rank} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', padding: '2px 0' }}>
          <span>{RANK_LABELS[rank as keyof typeof RANK_LABELS] ?? rank}</span>
          <span style={{ color: 'var(--color-ink-light)' }}>{cnt}</span>
        </div>
      ))}

      <div className="divider" />
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', lineHeight: 1.6, marginTop: 'var(--space-2)' }}>
        数据来源：《春秋》经文（以鲁国纪年为主轴），辅以《左传》传注。
        所有坐标及地理位置依据现有历史地理研究，仅标注确度较高者。
      </div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ color: 'var(--color-ink-mid)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-gold)', fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  )
}
