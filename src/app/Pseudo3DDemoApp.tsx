import { useMemo, useState } from 'react'
import { ALL_LU_YEARS, getEventsForYear } from '@/data/dataService'
import { Pseudo3DMapCanvas } from '@/features/map/Pseudo3DMapCanvas'
import '@/styles/theme.css'

type DemoMode = 'chunqiu' | 'diplomacy' | 'fengjian'

export function Pseudo3DDemoApp() {
  const [yearId, setYearId] = useState('yin-1')
  const [mode, setMode] = useState<DemoMode>('chunqiu')

  const idx = useMemo(() => ALL_LU_YEARS.findIndex((y) => y.id === yearId), [yearId])
  const y = ALL_LU_YEARS[idx]
  const events = getEventsForYear(yearId)

  return (
    <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateRows: '1fr auto', background: '#0b1220' }}>
      <div style={{ position: 'relative' }}>
        <Pseudo3DMapCanvas yearId={yearId} mode={mode} />
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            right: 12,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            pointerEvents: 'none',
          }}
        >
          <div className="panel-surface" style={{ padding: '8px 12px', borderRadius: 8, pointerEvents: 'auto' }}>
            <div style={{ fontWeight: 700, color: '#e2e8f0' }}>伪3D Demo（EU风格实验）</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>固定俯视角，不可旋转，仅平移缩放</div>
          </div>
          <div className="panel-surface" style={{ padding: '8px 10px', borderRadius: 8, pointerEvents: 'auto' }}>
            <label style={{ color: '#e2e8f0', fontSize: 12, marginRight: 8 }}>模式</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as DemoMode)}>
              <option value="chunqiu">春秋模式</option>
              <option value="diplomacy">外交关系</option>
              <option value="fengjian">分封爵位</option>
            </select>
          </div>
        </div>
      </div>

      <div className="panel-surface" style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12 }}>
        <div>
          <div style={{ color: '#e2e8f0', fontWeight: 700 }}>{y?.luLabel} · {y?.zhouLabel} · 公元前{Math.abs(y?.bce ?? 0)}年</div>
          <div style={{ color: '#94a3b8', fontSize: 12 }}>本年经文事件：{events.length} 条</div>
        </div>
        <input
          type="range"
          min={0}
          max={ALL_LU_YEARS.length - 1}
          value={Math.max(0, idx)}
          onChange={(e) => setYearId(ALL_LU_YEARS[Number(e.target.value)]?.id ?? 'yin-1')}
          style={{ width: 420 }}
        />
        <a href="/" style={{ color: '#93c5fd', alignSelf: 'center' }}>返回当前正式版</a>
      </div>
    </div>
  )
}
