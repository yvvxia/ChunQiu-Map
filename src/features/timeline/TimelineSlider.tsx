import { useCallback, useMemo } from 'react'
import { ALL_LU_YEARS } from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'

export function TimelineSlider() {
  const currentLuYearId = useAppStore(s => s.currentLuYearId)
  const setLuYear = useAppStore(s => s.setLuYear)

  const years = ALL_LU_YEARS
  const currentIndex = useMemo(
    () => years.findIndex(y => y.id === currentLuYearId),
    [currentLuYearId, years]
  )
  const currentYear = years[currentIndex]

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = parseInt(e.target.value, 10)
      setLuYear(years[idx].id)
    },
    [years, setLuYear]
  )

  const bceLabel = currentYear
    ? `公元前 ${Math.abs(currentYear.bce)} 年`
    : ''
  const anchorYears = useMemo(
    () =>
      years.filter((_, i) => i % 20 === 0 || i === years.length - 1).map((y) => ({
        id: y.id,
        bce: y.bce,
        index: years.findIndex((v) => v.id === y.id),
      })),
    [years]
  )

  return (
    <div
      className="timeline-root"
      style={{
        height: 'var(--timeline-h)',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-2)',
        padding: '0 var(--space-6)',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* 年份标签 */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'baseline' }}>
        <span
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-vermilion)',
            letterSpacing: '0.05em',
          }}
        >
          {currentYear?.luLabel ?? '—'}
        </span>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-light)' }}>
          {currentYear?.zhouLabel}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)' }}>
          {bceLabel}
        </span>
      </div>

      {/* 滑轨 */}
      <div style={{ width: '100%', position: 'relative' }}>
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={currentIndex < 0 ? 0 : currentIndex}
          onChange={handleChange}
          style={{
            width: '100%',
            accentColor: 'var(--color-vermilion)',
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            marginTop: 2,
            height: 14,
            pointerEvents: 'none',
          }}
        >
          {anchorYears.map((a) => (
            <span
              key={a.id}
              style={{
                position: 'absolute',
                left: `${(a.index / Math.max(1, years.length - 1)) * 100}%`,
                width: 1,
                height: 10,
                background: 'var(--color-border-strong)',
                transform: 'translateX(-0.5px)',
              }}
            />
          ))}
        </div>
        {/* 首尾标注 */}
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-ink-light)',
            marginTop: 14,
          }}
        >
          <span>{years[0]?.luLabel}</span>
          <span>春秋完整年轴（前{Math.abs(years[0].bce)}—前{Math.abs(years[years.length - 1].bce)}，共 {years.length} 年）</span>
          <span>{years[years.length - 1]?.luLabel}</span>
        </div>
      </div>
    </div>
  )
}
