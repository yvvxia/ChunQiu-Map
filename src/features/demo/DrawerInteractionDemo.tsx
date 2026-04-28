import { useMemo, useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Globe2,
  Landmark,
  MapPin,
  Network,
  ScrollText,
  User,
  BarChart3,
} from 'lucide-react'

const modeItems = [
  { id: 'fengjian', label: '封建格局', icon: <Landmark size={20} strokeWidth={1.9} /> },
  { id: 'territory', label: '领土归属', icon: <Flag size={20} strokeWidth={1.9} /> },
  { id: 'diplomacy', label: '外交网络', icon: <Network size={20} strokeWidth={1.9} /> },
  { id: 'chunqiu', label: '春秋经文', icon: <ScrollText size={20} strokeWidth={1.9} /> },
]

const tabItems = [
  { id: 'state', label: '国家', icon: <Globe2 size={20} strokeWidth={1.9} /> },
  { id: 'person', label: '人物', icon: <User size={20} strokeWidth={1.9} /> },
  { id: 'place', label: '地点', icon: <MapPin size={20} strokeWidth={1.9} /> },
  { id: 'stats', label: '统计', icon: <BarChart3 size={20} strokeWidth={1.9} /> },
]

export function DrawerInteractionDemo() {
  const [activeMode, setActiveMode] = useState('fengjian')
  const [activeTab, setActiveTab] = useState('state')
  const [rightCollapsed, setRightCollapsed] = useState(false)

  const panelTitle = useMemo(() => {
    const hit = tabItems.find((x) => x.id === activeTab)
    return hit?.label ?? '国家'
  }, [activeTab])

  return (
    <div className="demo-drawer-root">
      <aside className="demo-drawer-left">
        <div className="demo-drawer-logo">春秋</div>
        <div className="demo-drawer-caption">地图</div>
        {modeItems.map((item) => (
          <button
            key={item.id}
            className={`btn-icon demo-drawer-item ${activeMode === item.id ? 'active' : ''}`}
            onClick={() => setActiveMode(item.id)}
            title={item.label}
          >
            <span className="demo-drawer-item-icon">{item.icon}</span>
            <span className="demo-drawer-item-label">{item.label}</span>
          </button>
        ))}

        <div className="divider" style={{ margin: 'var(--space-2) 8px' }} />

        <div className="demo-drawer-caption">面板</div>
        {tabItems.map((item) => (
          <button
            key={item.id}
            className={`btn-icon demo-drawer-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
          >
            <span className="demo-drawer-item-icon">{item.icon}</span>
            <span className="demo-drawer-item-label">{item.label}</span>
          </button>
        ))}
      </aside>

      <main className="demo-drawer-center">
        <div className="demo-drawer-center-card">
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 6 }}>抽屉交互 Demo</div>
          <div style={{ color: 'var(--color-ink-light)', lineHeight: 1.8 }}>
            左侧：鼠标悬浮自动展开，离开自动收起。<br />
            右侧：点击按钮收起/展开。<br />
            两侧都使用 width + opacity + transform 的动态过渡。
          </div>
        </div>
      </main>

      <aside className={`demo-drawer-right ${rightCollapsed ? 'is-collapsed' : ''}`}>
        <button
          className="demo-drawer-toggle"
          onClick={() => setRightCollapsed((v) => !v)}
          aria-expanded={!rightCollapsed}
          aria-label={rightCollapsed ? '展开右侧面板' : '收起右侧面板'}
          title={rightCollapsed ? '展开右侧面板' : '收起右侧面板'}
        >
          {rightCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="demo-drawer-panel-content">
          <div style={{ fontSize: 'var(--text-lg)', color: 'var(--color-vermilion)', fontWeight: 700 }}>
            {panelTitle}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', marginTop: 4 }}>
            这是独立 Demo 区域，不影响现有侧栏设置。
          </div>
          <div className="demo-drawer-fake-list">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="demo-drawer-fake-item">
                示例内容 {i + 1}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
