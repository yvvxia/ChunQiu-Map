import { useCallback, useMemo } from 'react'
import { ALL_LU_YEARS } from '@/data/dataService'
import { useAppStore } from '@/store/useAppStore'

/**
 * 手机端专用时间轴：
 * - 顶部徽章显示当前年份（CSS display:none 在桌面端）
 * - 右侧竖向滑轨（rotate 实现，桌面端同样隐藏）
 */
export function MobileTimeline() {
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

  return (
    <>
      {/* 年份顶部徽章 */}
      <div className="mobile-year-badge" aria-live="polite">
        <span className="mobile-year-label">{currentYear?.luLabel ?? '—'}</span>
        <span className="mobile-year-sub">
          {currentYear?.zhouLabel}　前{currentYear ? Math.abs(currentYear.bce) : '—'}年
        </span>
      </div>

      {/* 右侧竖向滑轨 */}
      <div className="mobile-timeline-wrap">
        <input
          type="range"
          className="mobile-timeline-input"
          orient="vertical"
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
