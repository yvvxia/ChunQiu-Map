import { useCallback, useMemo, useRef, useEffect } from 'react'
import { ALL_LU_YEARS } from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'

export function MobileTimeline() {
  const currentLuYearId = useAppStore(s => s.currentLuYearId)
  const setLuYear = useAppStore(s => s.setLuYear)
  const sliderRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    sliderRef.current?.setAttribute('orient', 'vertical')
  }, [])

  return (
    <>
      <div className="mobile-year-badge" aria-live="polite">
        <span className="mobile-year-label">{currentYear?.luLabel ?? '—'}</span>
        <span className="mobile-year-sub">
          {currentYear?.zhouLabel}　前{currentYear ? Math.abs(currentYear.bce) : '—'}年
        </span>
      </div>

      <div className="mobile-timeline-wrap">
        <input
          ref={sliderRef}
          type="range"
          className="mobile-timeline-input"
          min={0}
          max={years.length - 1}
          value={currentIndex < 0 ? 0 : currentIndex}
          onChange={handleChange}
          aria-label="年份滑轨"
        />
      </div>
    </>
  )
}
