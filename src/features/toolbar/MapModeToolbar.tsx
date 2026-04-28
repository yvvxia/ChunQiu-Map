import type { MapMode } from '@/domain/types'
import { useAppStore } from '@/store/useAppStore'
import { MODE_LABELS } from '@/features/map/mapHelpers'
import {
  Landmark,
  Network,
  ScrollText,
  Mountain,
  Flag,
  Globe2,
  User,
  MapPin,
  BarChart3,
} from 'lucide-react'

const MODES: { mode: MapMode; icon: JSX.Element }[] = [
  { mode: 'fengjian',  icon: <Landmark  size={20} strokeWidth={1.9} /> },
  { mode: 'territory', icon: <Flag      size={20} strokeWidth={1.9} /> },
  { mode: 'diplomacy', icon: <Network   size={20} strokeWidth={1.9} /> },
  { mode: 'chunqiu',   icon: <ScrollText size={20} strokeWidth={1.9} /> },
  { mode: 'terrain',   icon: <Mountain  size={20} strokeWidth={1.9} /> },
]

const PANEL_TABS = [
  { tab: 'state'  as const, icon: <Globe2   size={20} strokeWidth={1.9} />, label: '国家' },
  { tab: 'person' as const, icon: <User     size={20} strokeWidth={1.9} />, label: '人物' },
  { tab: 'place'  as const, icon: <MapPin   size={20} strokeWidth={1.9} />, label: '地点' },
  { tab: 'stats'  as const, icon: <BarChart3 size={20} strokeWidth={1.9} />, label: '统计' },
]

export function MapModeToolbar() {
  const mapMode    = useAppStore(s => s.mapMode)
  const setMapMode = useAppStore(s => s.setMapMode)
  const panelTab   = useAppStore(s => s.panelTab)
  const setPanelTab = useAppStore(s => s.setPanelTab)

  return (
    <div className="toolbar-root">
      {/* Logo */}
      <div className="toolbar-logo">春秋</div>

      {/* 地图模式 */}
      <span className="toolbar-section-label">地图</span>
      {MODES.map(({ mode, icon }) => (
        <button
          key={mode}
          className={`btn-icon btn-drawer ${mapMode === mode ? 'active' : ''}`}
          title={MODE_LABELS[mode]}
          onClick={() => setMapMode(mode)}
        >
          <span className="btn-drawer-icon">{icon}</span>
          <span className="btn-drawer-label">{MODE_LABELS[mode]}</span>
        </button>
      ))}

      {/* 面板 tab — 桌面端保留在侧栏，手机端由底部栏代替（CSS 控制显隐） */}
      <div className="toolbar-panel-section">
        <div className="divider" />
        <span className="toolbar-section-label">面板</span>
        {PANEL_TABS.map(({ tab, icon, label }) => (
          <button
            key={tab}
            className={`btn-icon btn-drawer ${panelTab === tab ? 'active' : ''}`}
            title={label}
            onClick={() => setPanelTab(tab)}
          >
            <span className="btn-drawer-icon">{icon}</span>
            <span className="btn-drawer-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
