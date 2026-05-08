import '@/styles/theme.css'
import { MapModeToolbar } from '@/features/toolbar/MapModeToolbar'
import { MobilePanelBar } from '@/features/toolbar/MobilePanelBar'
import { MapCanvas } from '@/features/map/MapCanvas'
import { TimelineSlider } from '@/features/timeline/TimelineSlider'
import { MobileTimeline } from '@/features/timeline/MobileTimeline'
import { InfoPanel } from '@/features/panel/InfoPanel'
import { DrawerInteractionDemo } from '@/features/demo/DrawerInteractionDemo'
import { useAppStore } from '@/store/useAppStore'

export function App() {
  const showDrawerDemo = new URLSearchParams(window.location.search).get('demo') === 'drawer'

  if (showDrawerDemo) {
    return <DrawerInteractionDemo />
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 主体区域：工具栏 + 地图 + 信息面板 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <MapModeToolbar />
        {/* 地图区域 */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MapCanvas />
          <MobileBackdrop />
        </div>
        <InfoPanel />
      </div>

      <TimelineSlider />
      <MobilePanelBar />
      <MobileTimeline />
    </div>
  )
}

function MobileBackdrop() {
  const mobilePanelOpen    = useAppStore(s => s.mobilePanelOpen)
  const setMobilePanelOpen = useAppStore(s => s.setMobilePanelOpen)

  return (
    <div
      className={`mobile-backdrop${mobilePanelOpen ? ' visible' : ''}`}
      onClick={() => setMobilePanelOpen(false)}
      aria-hidden="true"
    />
  )
}
