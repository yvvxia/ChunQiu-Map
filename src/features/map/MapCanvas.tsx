import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import {
  BASE_STYLE_URL,
  HAN18_BOUNDS,
  MAP_CENTER,
  MAP_ZOOM,
  buildAllPlacesGeoJSON,
  buildRelationLinesGeoJSON,
  buildSelectedDotGeoJSON,
  ensureLayer,
  ensureSource,
  setupDem,
} from './mapHelpers'
import { MapLegend } from './MapLegend'

export function MapCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  const currentLuYearId = useAppStore(s => s.currentLuYearId)
  const mapMode = useAppStore(s => s.mapMode)
  const selectedEntityId = useAppStore(s => s.selectedEntityId)
  const selectedEntityType = useAppStore(s => s.selectedEntityType)
  const selectEntity = useAppStore(s => s.selectEntity)

  // ── 初始化地图 ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URL,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: 0,           // 初始平视；随缩放动态倾斜（见下方 zoom 事件）
      bearing: 0,
      minZoom: 3,
      maxZoom: 9.5,
      attributionControl: false,
      dragRotate: false,
      touchPitch: false,
    })
    // 在地理数据可视范围外再各扩 4° 给拖动留余量，不影响图层过滤逻辑
    map.setMaxBounds([
      [HAN18_BOUNDS.west - 4, HAN18_BOUNDS.south - 4],
      [HAN18_BOUNDS.east + 4, HAN18_BOUNDS.north + 4],
    ])

    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      // DEM 源 + hillshade 层必须在 refreshLayers 之前注册，保证 hillshade 在城市点之下
      setupDem(map)
      applyHistoricalBasemapMask(map)
      refreshLayers(map, mapMode, currentLuYearId, selectedEntityId, selectedEntityType)
      // 初始模式若为地形图，立即激活地形
      applyTerrainMode(map, mapMode === 'terrain')

      // 滚轮每格缩放幅度放大（默认太细，约 3× 加速）
      map.scrollZoom.setWheelZoomRate(1 / 150)

      // 动态俯视角：大范围平视，放大到城市级别才开始倾斜
      const updatePitch = () => {
        const ZOOM_START = 6.8   // 低于此缩放完全平视（约省/州级别）
        const ZOOM_FULL  = 8.5   // 达到此缩放时达最大倾角（约城市级别）
        const MAX_PITCH  = 46
        const z = map.getZoom()
        const t = Math.max(0, Math.min(1, (z - ZOOM_START) / (ZOOM_FULL - ZOOM_START)))
        const target = Math.round(t * MAX_PITCH)
        if (Math.abs(map.getPitch() - target) > 0.5) map.setPitch(target)
      }
      map.on('zoom', updatePitch)
      updatePitch()

      // 点击城市点
      map.on('click', 'city-circle', e => {
        const props = e.features?.[0]?.properties as Record<string, unknown> | undefined
        if (!props) return
        if (props['isCapital'] && props['stateId']) {
          // 都城 → 打开国家信息卡
          selectEntity(props['stateId'] as string, 'state')
        } else {
          // 普通城邑 → 打开地点信息卡
          selectEntity(props['id'] as string, 'place')
        }
      })

      // 光标样式
      map.on('mouseenter', 'city-circle', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'city-circle', () => {
        map.getCanvas().style.cursor = ''
      })

      // 点击空白处取消选中
      map.on('click', e => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['city-circle'] })
        if (features.length === 0) selectEntity(null, null)
      })
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── 状态变化 → 刷新图层 + 地形模式切换 ─────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return
    applyTerrainMode(map, mapMode === 'terrain')
    refreshLayers(map, mapMode, currentLuYearId, selectedEntityId, selectedEntityType)
  }, [mapMode, currentLuYearId, selectedEntityId, selectedEntityType])

  // ── 选中实体 → 地图飞到对应位置 ──────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedEntityId) return

    import('@/data/dataService').then(({ getStateById, getPlaceById, getPersonById }) => {
      let target: [number, number] | null = null

      if (selectedEntityType === 'state') {
        const state = getStateById(selectedEntityId)
        if (state?.capitalId) {
          const cap = getPlaceById(state.capitalId)
          target = cap?.coords ?? null
        }
      } else if (selectedEntityType === 'place') {
        const place = getPlaceById(selectedEntityId)
        target = place?.coords ?? null
      } else if (selectedEntityType === 'person') {
        const person = getPersonById(selectedEntityId)
        if (person?.stateId) {
          const state = getStateById(person.stateId)
          if (state?.capitalId) {
            const cap = getPlaceById(state.capitalId)
            target = cap?.coords ?? null
          }
        }
      }

      if (target) {
        map.flyTo({
          center: target,
          zoom: Math.max(map.getZoom(), 6.5),
          duration: 700,
          essential: true,
        })
      }
    })
  }, [selectedEntityId, selectedEntityType])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <MapLegend />
    </div>
  )
}

// ── 图层刷新（纯函数，map.on('load') 和状态变化共用）────────────────────────
function refreshLayers(
  map: maplibregl.Map,
  mode: string,
  luYearId: string,
  selectedEntityId: string | null,
  selectedEntityType: string | null
) {
  // ── 1. 所有城市点 ────────────────────────────────────────────────────────
  const cityData = buildAllPlacesGeoJSON(mode as never, luYearId)
  ensureSource(map, 'cities', cityData)

  ensureLayer(map, {
    id: 'city-circle',
    type: 'circle',
    source: 'cities',
    layout: {
      // 值越大越靠上渲染：大城 > 小城，同类城下高爵位 > 低爵位
      'circle-sort-key': ['get', 'displayPriority'],
    },
    paint: {
      'circle-radius': ['get', 'radius'],
      'circle-color': ['get', 'color'],    // 初始用国家色，后面按模式覆盖
      'circle-stroke-color': '#f5efe0',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.92,
    },
  })

  // 本年城邑归属发生变化（吞占/收复/割让）的高亮环
  ensureLayer(map, {
    id: 'city-change-ring',
    type: 'circle',
    source: 'cities',
    filter: ['==', ['get', 'isTerritoryChanged'], true],
    paint: {
      'circle-radius': ['+', ['get', 'radius'], 5],
      'circle-color': 'transparent',
      'circle-stroke-color': [
        'match',
        ['get', 'territoryChangeType'],
        'annex', '#c0392b',
        'recover', '#2d6a4f',
        'cede', '#1a6b8a',
        '#c9a227',
      ],
      'circle-stroke-width': 2.2,
      'circle-stroke-opacity': 0.95,
    },
  })
  map.setLayoutProperty(
    'city-change-ring',
    'visibility',
    mode === 'territory' || mode === 'chunqiu' ? 'visible' : 'none'
  )

  // 分封图：爵位代表色；地形图：地形中性色；其他模式：国家颜色
  map.setPaintProperty(
    'city-circle',
    'circle-color',
    mode === 'fengjian'
      ? ['get', 'rankColor']
      : mode === 'terrain'
        ? ['get', 'terrainColor']
        : ['get', 'color']
  )

  // 国名标签（仅都城处显示），分封图中标签颜色也切换为爵位色
  ensureLayer(map, {
    id: 'city-label',
    type: 'symbol',
    source: 'cities',
    filter: ['==', ['get', 'isCapital'], true],
    layout: {
      // 与 city-circle 一致：高优先级标签在冲突时胜出
      'symbol-sort-key': ['get', 'displayPriority'],
      'text-field': ['get', 'stateName'],
      'text-font': ['Noto Sans CJK JP Regular', 'Open Sans Regular'],
      'text-size': ['case', ['==', ['get', 'rank'], 'wang'], 13, 11],
      'text-offset': [0, 1.2],
      'text-anchor': 'top',
      'text-allow-overlap': false,
      'text-ignore-placement': false,
    },
    paint: {
      'text-color': ['get', 'color'],
      'text-halo-color': '#f5efe0',
      'text-halo-width': 1.4,
    },
  })
  map.setPaintProperty(
    'city-label',
    'text-color',
    mode === 'fengjian'
      ? ['get', 'rankColor']
      : mode === 'terrain'
        ? '#5a4020'
        : ['get', 'color']
  )

  // ── 1d. 霸主都城金色双环（插在 city-circle 之下，避免遮挡城市点）──────────
  if (!map.getLayer('hegemon-ring-outer')) {
    map.addLayer(
      {
        id: 'hegemon-ring-outer',
        type: 'circle',
        source: 'cities',
        filter: ['==', ['get', 'isHegemonCapital'], true],
        paint: {
          'circle-radius': 20,
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': 'rgba(201,162,39,0.38)',
          'circle-stroke-width': 6,
          'circle-opacity': 0,
          'circle-blur': 0.35,
        },
      } as maplibregl.LayerSpecification,
      'city-circle',
    )
  }
  if (!map.getLayer('hegemon-ring-inner')) {
    map.addLayer(
      {
        id: 'hegemon-ring-inner',
        type: 'circle',
        source: 'cities',
        filter: ['==', ['get', 'isHegemonCapital'], true],
        paint: {
          'circle-radius': 13,
          'circle-color': 'rgba(0,0,0,0)',
          'circle-stroke-color': 'rgba(201,162,39,0.9)',
          'circle-stroke-width': 2.2,
          'circle-opacity': 0,
          'circle-stroke-opacity': 0.92,
        },
      } as maplibregl.LayerSpecification,
      'city-circle',
    )
  }

  // ── 2. 选中高亮环（朱砂外圈） ────────────────────────────────────────────
  const selData = buildSelectedDotGeoJSON(selectedEntityId, selectedEntityType)
  ensureSource(map, 'selected-dot', selData)
  ensureLayer(map, {
    id: 'selected-dot-ring',
    type: 'circle',
    source: 'selected-dot',
    paint: {
      'circle-radius': 14,
      'circle-color': 'transparent',
      'circle-stroke-color': '#c0392b',
      'circle-stroke-width': 2.5,
      'circle-opacity': 0,
      'circle-stroke-opacity': 0.9,
    },
  })

  // ── 3. 外交关系连线 ───────────────────────────────────────────────────────
  const showRelLines =
    mode === 'diplomacy' ||
    (Boolean(selectedEntityId) && selectedEntityType === 'state')
  const focusId =
    mode === 'diplomacy' ? null : (selectedEntityType === 'state' ? selectedEntityId : null)
  const relData = buildRelationLinesGeoJSON(luYearId, focusId)
  ensureSource(map, 'relations', relData)
  ensureLayer(map, {
    id: 'relation-line',
    type: 'line',
    source: 'relations',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 1.5,
      'line-dasharray': [3, 2],
      'line-opacity': 0.78,
    },
  })
  map.setLayoutProperty('relation-line', 'visibility', showRelLines ? 'visible' : 'none')

  // 云雾遮罩已按产品要求移除
}

/**
 * 切换地形 3D 模式：开启时激活 DEM 地形起伏 + hillshade 山体阴影，关闭时恢复平面。
 * exaggeration 设为 0.35 — 起伏可感知但不夸张，地形比例准确。
 */
function applyTerrainMode(map: maplibregl.Map, active: boolean) {
  if (!map.getSource('dem')) return  // DEM 未就绪（不应发生，但防御性检查）

  if (active) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(map as any).setTerrain({ source: 'dem', exaggeration: 0.35 })
    map.setLayoutProperty('hillshade', 'visibility', 'visible')
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(map as any).setTerrain(null)
    if (map.getLayer('hillshade')) {
      map.setLayoutProperty('hillshade', 'visibility', 'none')
    }
  }
}

function applyHistoricalBasemapMask(map: maplibregl.Map) {
  // 关闭现代道路/POI/交通标签，保留地形、水系、国土轮廓，降低“现代地图违和感”。
  const hideLayerKeywords = [
    'road', 'street', 'highway', 'motorway', 'railway', 'rail',
    'transit', 'aeroway', 'airport', 'poi', 'housenumber',
    // 行政区划与现代聚落层（省/市/区县边界及城市点）
    'admin', 'boundary', 'province', 'district', 'county',
    'settlement', 'city', 'town', 'village',
  ]
  const hideLabelKeywords = ['place_label', 'poi_label', 'road_label']

  const style = map.getStyle()
  for (const layer of style.layers ?? []) {
    const id = layer.id.toLowerCase()
    const isSymbol = layer.type === 'symbol'
    const shouldHide =
      hideLayerKeywords.some((k) => id.includes(k)) ||
      hideLabelKeywords.some((k) => id.includes(k)) ||
      (isSymbol && id.includes('label') && !id.includes('water'))
    if (shouldHide) {
      map.setLayoutProperty(layer.id, 'visibility', 'none')
    }
  }
}
