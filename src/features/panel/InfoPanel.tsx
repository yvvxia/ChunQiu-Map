import { useAppStore } from '@/store/useAppStore'
import { StateTab } from './StateTab'
import { PersonTab } from './PersonTab'
import { PlaceTab } from './PlaceTab'
import { StatsTab } from './StatsTab'
import { EventList } from './EventList'
import { HegemonBar } from './HegemonBar'
import { YearSituationCard } from './YearSituationCard'
import { getLuYearById } from '@/data/dataService'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

const TAB_LABELS = {
  state:  '国家',
  person: '人物',
  place:  '地点',
  stats:  '统计',
}

export function InfoPanel() {
  const panelTab            = useAppStore(s => s.panelTab)
  const setPanelTab         = useAppStore(s => s.setPanelTab)
  const searchQuery         = useAppStore(s => s.searchQuery)
  const setSearchQuery      = useAppStore(s => s.setSearchQuery)
  const currentLuYearId     = useAppStore(s => s.currentLuYearId)
  const rightPanelCollapsed = useAppStore(s => s.rightPanelCollapsed)
  const toggleRightPanel    = useAppStore(s => s.toggleRightPanel)
  const mobilePanelOpen     = useAppStore(s => s.mobilePanelOpen)
  const setMobilePanelOpen  = useAppStore(s => s.setMobilePanelOpen)
  const luYear              = getLuYearById(currentLuYearId)

  const panelClass = [
    'info-panel-root',
    rightPanelCollapsed ? 'is-collapsed' : '',
    mobilePanelOpen    ? 'is-mobile-open' : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={panelClass}>
      <button
        className="panel-collapse-btn"
        onClick={toggleRightPanel}
        aria-expanded={!rightPanelCollapsed}
        aria-label={rightPanelCollapsed ? '展开面板' : '收起面板'}
        title={rightPanelCollapsed ? '展开面板' : '收起面板'}
      >
        {rightPanelCollapsed ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
      </button>

      <button
        className="panel-mobile-close-btn"
        onClick={() => setMobilePanelOpen(false)}
        aria-label="关闭面板"
      >
        <X size={17} />
      </button>

      <div className="panel-inner">
      <div
        className="panel-year-header"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-paper-dark)',
        }}
      >
        <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-vermilion)' }}>
          {luYear?.luLabel ?? '—'}
        </div>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', marginTop: 2 }}>
          {luYear?.zhouLabel}　公元前{luYear ? Math.abs(luYear.bce) : '—'}年
        </div>
      </div>

      {/* 当前霸主（独立栏位） */}
      <HegemonBar />

      {/* 本年态势摘要卡 */}
      <YearSituationCard />

      {/* 当年经文事件折叠区 */}
      {panelTab !== 'stats' && (
        <details style={{ borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <summary
            style={{
              padding: 'var(--space-2) var(--space-4)',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-ink-light)',
              listStyle: 'none',
              userSelect: 'none',
            }}
          >
            ▶ 本年《春秋》经文（点击展开）
          </summary>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <EventList luYearId={currentLuYearId} />
          </div>
        </details>
      )}

      {/* 搜索框 */}
      <div style={{ padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <input
          className="search-input"
          placeholder="检索国家、人物、地点…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Tab 标签 */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}
      >
        {(Object.keys(TAB_LABELS) as Array<keyof typeof TAB_LABELS>).map(tab => (
          <button
            key={tab}
            onClick={() => setPanelTab(tab)}
            style={{
              flex: 1,
              padding: 'var(--space-2) 0',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-serif)',
              color: panelTab === tab ? 'var(--color-vermilion)' : 'var(--color-ink-light)',
              borderBottom: panelTab === tab ? '2px solid var(--color-vermilion)' : '2px solid transparent',
              transition: 'color 0.15s',
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {panelTab === 'state'  && <StateTab />}
        {panelTab === 'person' && <PersonTab />}
        {panelTab === 'place'  && <PlaceTab />}
        {panelTab === 'stats'  && <StatsTab />}
      </div>
      </div>{/* /panel-inner */}
    </div>
  )
}
