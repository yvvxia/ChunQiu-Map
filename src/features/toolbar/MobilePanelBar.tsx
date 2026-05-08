import { useAppStore } from '@/store/useAppStore'
import { Globe2, User, MapPin, BarChart3 } from 'lucide-react'

const PANEL_TABS = [
  { tab: 'state'  as const, icon: <Globe2    size={22} strokeWidth={1.8} />, label: '国家' },
  { tab: 'person' as const, icon: <User      size={22} strokeWidth={1.8} />, label: '人物' },
  { tab: 'place'  as const, icon: <MapPin    size={22} strokeWidth={1.8} />, label: '地点' },
  { tab: 'stats'  as const, icon: <BarChart3 size={22} strokeWidth={1.8} />, label: '统计' },
]

export function MobilePanelBar() {
  const panelTab          = useAppStore(s => s.panelTab)
  const setPanelTab       = useAppStore(s => s.setPanelTab)
  const setMobilePanelOpen = useAppStore(s => s.setMobilePanelOpen)

  return (
    <nav className="mobile-panel-bar" aria-label="面板导航">
      {PANEL_TABS.map(({ tab, icon, label }) => (
        <button
          key={tab}
          className={`mobile-panel-tab${panelTab === tab ? ' active' : ''}`}
          onClick={() => {
            setPanelTab(tab)
            setMobilePanelOpen(true)
          }}
          aria-label={label}
        >
          {icon}
          <span className="mobile-panel-tab-label">{label}</span>
        </button>
      ))}
    </nav>
  )
}
