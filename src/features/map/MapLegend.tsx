import { useAppStore } from '@/store/useAppStore'
import { RANK_COLORS } from '@/features/map/mapHelpers'

export function MapLegend() {
  const mapMode = useAppStore(s => s.mapMode)

  const rankItems = [
    { label: '王室', color: RANK_COLORS['wang'] },
    { label: '公',   color: RANK_COLORS['gong'] },
    { label: '侯',   color: RANK_COLORS['hou']  },
    { label: '伯',   color: RANK_COLORS['bo']   },
    { label: '子',   color: RANK_COLORS['zi']   },
    { label: '男',   color: RANK_COLORS['nan']  },
    { label: '蛮夷', color: RANK_COLORS['barbarian'] },
  ]

  const relItems = [
    { label: '盟友', color: '#2d6a4f' },
    { label: '敌对', color: '#c0392b' },
    { label: '附庸', color: '#1a6b8a' },
    { label: '朝贡', color: '#c9a227' },
    { label: '姻亲', color: '#a05070' },
  ]

  return (
    <div
      className="legend-box panel-surface"
      style={{ borderRadius: 'var(--radius-md)' }}
    >
      {mapMode === 'fengjian' && (
        <>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', marginBottom: 4, fontWeight: 600 }}>
            爵位
          </div>
          {rankItems.map(item => (
            <div key={item.label} className="legend-item">
              <span className="legend-dot" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </>
      )}

      {mapMode === 'territory' && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', lineHeight: 1.7 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>诸侯势力</div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#888', width: 10, height: 10 }} />
            <span>都城（大圆）</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: '#888', width: 6, height: 6 }} />
            <span>邑城（小圆）</span>
          </div>
        </div>
      )}


      {mapMode === 'diplomacy' && (
        <>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', marginBottom: 4, fontWeight: 600 }}>
            外交关系
          </div>
          {relItems.map(item => (
            <div key={item.label} className="legend-item">
              <span className="legend-line" style={{ background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </>
      )}

      {mapMode === 'chunqiu' && (
        <>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600, marginBottom: 4 }}>
            春秋模式
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', lineHeight: 1.7 }}>
            仅显示本年经文涉及之诸侯
            及事件标注之地
          </div>
        </>
      )}

      {mapMode === 'terrain' && (
        <>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', fontWeight: 600, marginBottom: 4 }}>
            地形图
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-ink-light)', lineHeight: 1.7 }}>
            DEM 轻度起伏（比例保真）
            <br />
            山体阴影 + 云雾边界遮罩
          </div>
          <div className="legend-item" style={{ marginTop: 6 }}>
            <span className="legend-dot" style={{ background: '#7f7160', width: 8, height: 8 }} />
            <span>城邑（地形中性色）</span>
          </div>
        </>
      )}

      {/* 通用：选中指示 */}
      <div className="divider" style={{ margin: '6px 0' }} />
      <div className="legend-item">
        <span style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          border: '2px solid #c0392b', display: 'inline-block',
        }} />
        <span>已选中</span>
      </div>
    </div>
  )
}
