import type maplibregl from 'maplibre-gl'
import type { MapMode } from '@/domain/types'
import {
  ALL_EVENTS,
  ALL_PLACES,
  ALL_RELATIONS,
  ALL_STATES,
  ALL_LU_YEARS,
  getActiveStateIdsForYear,
  getEventsForYear,
  getHegemonForYear,
  getPlaceById,
  getRelationsForYear,
  getStateById,
} from '@/data/dataService'

export const MAP_CENTER: [number, number] = [114.5, 35.5]
export const MAP_ZOOM = 5.2
// 汉地十八郡可视范围（MVP近似）：用于统一过滤地图显示
export const HAN18_BOUNDS = {
  west: 103.5,
  east: 122.8,
  south: 27.5,
  north: 40.8,
}

export const BASE_STYLE_URL =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

export const RANK_LABELS: Record<string, string> = {
  wang: '王',
  gong: '公',
  hou: '侯',
  bo: '伯',
  zi: '子',
  nan: '男',
  barbarian: '蛮夷',
  unknown: '不详',
}

/**
 * 爵位显示优先级（值越高越靠前渲染）。
 * 用于 circle-sort-key / symbol-sort-key，保证高爵位地点压在低爵位之上。
 */
export const RANK_PRIORITY: Record<string, number> = {
  wang:      7,
  gong:      6,
  hou:       5,
  bo:        4,
  zi:        3,
  nan:       2,
  barbarian: 1,
  unknown:   0,
}

/**
 * 春秋时期历史意义上的主要诸侯（核心大国），显示优先级高于次要小国。
 * 包含周天子、春秋五霸所在国及史书大量记载的诸侯。
 */
export const MAJOR_STATE_IDS = new Set([
  'zhou',   // 周天子
  'lu',     // 鲁（春秋经文视角国）
  'qi',     // 齐
  'jin',    // 晋
  'chu',    // 楚
  'qin',    // 秦
  'wei',    // 卫
  'zheng',  // 郑
  'song',   // 宋
  'yan',    // 燕
  'wu',     // 吴
  'yue',    // 越
])

/** 分封图中各爵位对应的代表色，与图例保持一致 */
export const RANK_COLORS: Record<string, string> = {
  wang:      '#c9a227', // 金色 — 天子
  gong:      '#6b2d6b', // 紫色 — 公
  hou:       '#3d6b8a', // 蓝灰 — 侯
  bo:        '#2d6a4f', // 玉青 — 伯
  zi:        '#1a6b8a', // 天碧 — 子
  nan:       '#8B4513', // 赭石 — 男
  barbarian: '#888888', // 灰   — 蛮夷
  unknown:   '#888888',
}

export const REL_LABELS: Record<string, string> = {
  ally: '盟友',
  enemy: '敌对',
  vassal: '附庸',
  suzerain: '宗主',
  marriage: '姻亲',
  tributary: '朝贡',
}

export const MODE_LABELS: Record<MapMode, string> = {
  fengjian:   '分封图',
  territory:  '诸侯势力图',
  diplomacy:  '外交图',
  chunqiu:    '春秋模式',
  terrain:    '地形图',
}

// ── 地形图辅助 ────────────────────────────────────────────────────────────────

/**
 * 构造"世界矩形减去 HAN18 缓冲区"的 GeoJSON 多边形，用于云雾遮罩。
 * bufferDeg 越大，透明孔越大，实现由内向外渐变叠加的柔化边缘。
 */
export function buildCloudRingGeoJSON(bufferDeg: number): GeoJSON.FeatureCollection {
  const b = bufferDeg
  // 外环：覆盖全球（用大范围矩形即可）
  const world: GeoJSON.Position[] = [
    [-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85],
  ]
  // 内环（洞）：HAN18 加缓冲，使用顺时针（GeoJSON 洞方向）
  const hole: GeoJSON.Position[] = [
    [HAN18_BOUNDS.west - b, HAN18_BOUNDS.south - b],
    [HAN18_BOUNDS.west - b, HAN18_BOUNDS.north + b],
    [HAN18_BOUNDS.east + b, HAN18_BOUNDS.north + b],
    [HAN18_BOUNDS.east + b, HAN18_BOUNDS.south - b],
    [HAN18_BOUNDS.west - b, HAN18_BOUNDS.south - b],
  ]
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Polygon', coordinates: [world, hole] },
      },
    ],
  }
}

/** 在 map.on('load') 中调用：注册 DEM 数据源并预建 hillshade 图层（默认隐藏）。
 *  必须在 refreshLayers 之前调用，保证图层顺序正确（hillshade 位于城市点之下）。*/
export function setupDem(map: maplibregl.Map) {
  if (!map.getSource('dem')) {
    map.addSource('dem', {
      type: 'raster-dem',
      // Terrarium 编码高程瓦片，免费公开，适合全球中低精度地形
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 12,
    })
  }

  if (!map.getLayer('hillshade')) {
    // 找到底图中第一个含 "water" 的图层，把 hillshade 插在它之前。
    // 这样水体（海、湖）会渲染在 hillshade 之上，海面不再出现地形阴影。
    const styleLayers = map.getStyle().layers ?? []
    const firstWaterLayerId = styleLayers.find(
      l => l.id.toLowerCase().includes('water')
    )?.id

    map.addLayer(
      {
        id: 'hillshade',
        type: 'hillshade',
        source: 'dem',
        layout: { visibility: 'none' },
        paint: {
          'hillshade-exaggeration': 0.55,
          'hillshade-shadow-color': '#7a6040',
          'hillshade-highlight-color': '#f6edd8',
          'hillshade-accent-color': '#9a7b50',
          'hillshade-illumination-direction': 330,
        },
      } as maplibregl.LayerSpecification,
      firstWaterLayerId   // beforeId：hillshade 落在水体层之下
    )
  }
}

// ── 所有城市点（替代原来的多边形领土）────────────────────────────────────────
export function buildAllPlacesGeoJSON(
  mode: MapMode,
  luYearId: string
): GeoJSON.FeatureCollection {
  const yearOrder = new Map(ALL_LU_YEARS.map((y, i) => [y.id, i]))
  const currentOrder = yearOrder.get(luYearId) ?? -1
  const ownershipByPlace = new Map<
    string,
    { stateId: string; changeType: 'annex' | 'recover' | 'cede'; changedYear: string }
  >()
  for (const event of ALL_EVENTS) {
    const order = yearOrder.get(event.luYearId) ?? Infinity
    if (order > currentOrder) continue
    for (const change of event.territoryChanges ?? []) {
      ownershipByPlace.set(change.placeId, {
        stateId: change.toStateId,
        changeType: change.changeType,
        changedYear: event.luYearId,
      })
    }
  }

  const activeStateIds =
    mode === 'chunqiu' ? getActiveStateIdsForYear(luYearId) : null
  // 春秋模式：当年事件直接引用的地点 id（用于无主国地点的保底显示）
  const activePlaceIds: Set<string> | null =
    mode === 'chunqiu'
      ? new Set(getEventsForYear(luYearId).flatMap(e => e.placeIds ?? []))
      : null

  const hegemonId = getHegemonForYear(luYearId)
  const hegemonCapitalId =
    hegemonId != null
      ? ALL_STATES.find(s => s.id === hegemonId)?.capitalId ?? null
      : null

  const features: GeoJSON.Feature[] = []
  for (const place of ALL_PLACES) {
    if (place.certainty === 'low') continue
    if (!isInHan18Approx(place.coords)) continue

    const ownership = ownershipByPlace.get(place.id)
    const effectiveStateId = ownership?.stateId ?? place.stateId
    const state = effectiveStateId ? ALL_STATES.find(s => s.id === effectiveStateId) : null

    // 仅春秋模式按“当年经文活跃态”过滤；其他模式展示全部可见地点（受汉地范围约束）。
    if (mode === 'chunqiu' && activeStateIds) {
      // 本年经文涉及该城有效归属国
      const stateMentioned = !!(effectiveStateId && activeStateIds.has(effectiveStateId))
      // 本年事件的 placeIds 明确列出该点
      const placeMentioned = activePlaceIds?.has(place.id) ?? false
      // 霸主都城：即使本年经文未点名该国，仍显示以便金圈标记
      const hegemonCapitalShown =
        hegemonCapitalId != null && place.id === hegemonCapitalId
      if (!stateMentioned && !placeMentioned && !hegemonCapitalShown) continue
    }

    const isCapital = state?.capitalId === place.id
    const isHegemonCapital = Boolean(hegemonId && state?.id === hegemonId && isCapital)

    const rank = state?.rank ?? 'unknown'
    // 圆点大小：天子都城 > 诸侯都城 > 普通城邑
    const radius = isCapital ? (state?.rank === 'wang' ? 10 : 7) : 4
    // 爵位数字权重（0–7）
    const rankPriority = RANK_PRIORITY[rank] ?? 0
    // 主要大国权重（1 = 大国，0 = 小国）
    const isMajorState = MAJOR_STATE_IDS.has(effectiveStateId ?? '') ? 1 : 0
    // 统一排序键（三级优先：大城 > 主要国 > 高爵位）
    // radius(4/7/10) × 100 留足两位给后两级；isMajor × 10 留足一位给 rankPriority(0–7)
    const displayPriority = radius * 100 + isMajorState * 10 + rankPriority

    features.push({
      type: 'Feature',
      properties: {
        id: place.id,
        name: place.name,
        stateId: effectiveStateId ?? '',
        stateName: state?.name ?? '',
        color: state?.color ?? '#888888',
        terrainColor: isCapital ? '#9a8871' : '#7f7160',
        rank,
        rankPriority,
        displayPriority,
        // 分封图中使用爵位代表色；其他模式使用国家自身颜色
        rankColor: RANK_COLORS[rank] ?? '#888888',
        isCapital: isCapital,
        isHegemonCapital,
        certainty: place.certainty,
        isTerritoryChanged: ownership?.changedYear === luYearId,
        territoryChangeType: ownership?.changeType ?? '',
        radius,
      },
      geometry: { type: 'Point', coordinates: place.coords },
    })
  }
  return { type: 'FeatureCollection', features }
}

// ── 选中高亮点（当前选中的国家都城 或 地点）─────────────────────────────────
export function buildSelectedDotGeoJSON(
  selectedEntityId: string | null,
  selectedEntityType: string | null
): GeoJSON.FeatureCollection {
  if (!selectedEntityId) return { type: 'FeatureCollection', features: [] }

  let coords: [number, number] | null = null
  let color = '#c0392b'

  if (selectedEntityType === 'place') {
    const place = getPlaceById(selectedEntityId)
    if (place) {
      coords = place.coords
      const state = place.stateId ? getStateById(place.stateId) : null
      color = state?.color ?? '#c0392b'
    }
  } else if (selectedEntityType === 'state') {
    const state = getStateById(selectedEntityId)
    if (state?.capitalId) {
      const place = getPlaceById(state.capitalId)
      if (place) {
        coords = place.coords
        color = state.color
      }
    }
  } else if (selectedEntityType === 'person') {
    // 人物 → 定位到所属国都城
    // (passed from MapCanvas which does the person->state->capital lookup)
  }

  if (!coords) return { type: 'FeatureCollection', features: [] }

  return {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: { color },
      geometry: { type: 'Point', coordinates: coords },
    }],
  }
}

// ── 外交关系连线 ──────────────────────────────────────────────────────────────
export function buildRelationLinesGeoJSON(
  luYearId: string,
  focusStateId: string | null
): GeoJSON.FeatureCollection {
  const relations = focusStateId
    ? ALL_RELATIONS.filter(
        r =>
          (r.activeLuYears.length === 0 || r.activeLuYears.includes(luYearId)) &&
          (r.fromId === focusStateId || r.toId === focusStateId)
      )
    : getRelationsForYear(luYearId)

  const stateCapCoords: Record<string, [number, number]> = {}
  for (const state of ALL_STATES) {
    if (!state.capitalId) continue
    const place = ALL_PLACES.find(p => p.id === state.capitalId)
    if (place && isInHan18Approx(place.coords)) stateCapCoords[state.id] = place.coords
  }

  const REL_COLORS: Record<string, string> = {
    ally: '#2d6a4f',
    enemy: '#c0392b',
    vassal: '#1a6b8a',
    suzerain: '#c9a227',
    marriage: '#a05070',
    tributary: '#c9a227',
  }

  const features: GeoJSON.Feature[] = []
  for (const rel of relations) {
    const from = stateCapCoords[rel.fromId]
    const to = stateCapCoords[rel.toId]
    if (!from || !to) continue
    features.push({
      type: 'Feature',
      properties: {
        id: rel.id,
        type: rel.type,
        color: REL_COLORS[rel.type] ?? '#888',
        fromId: rel.fromId,
        toId: rel.toId,
      },
      geometry: { type: 'LineString', coordinates: [from, to] },
    })
  }
  return { type: 'FeatureCollection', features }
}

export function isInHan18Approx(coords: [number, number]): boolean {
  const [lng, lat] = coords
  return (
    lng >= HAN18_BOUNDS.west &&
    lng <= HAN18_BOUNDS.east &&
    lat >= HAN18_BOUNDS.south &&
    lat <= HAN18_BOUNDS.north
  )
}

// ── 图层注册 / 更新 helper ────────────────────────────────────────────────────
export function ensureSource(
  map: maplibregl.Map,
  id: string,
  data: GeoJSON.FeatureCollection
) {
  const src = map.getSource(id) as maplibregl.GeoJSONSource | undefined
  if (src) {
    src.setData(data)
  } else {
    map.addSource(id, { type: 'geojson', data })
  }
}

export function ensureLayer(
  map: maplibregl.Map,
  layer: maplibregl.LayerSpecification
) {
  if (!map.getLayer(layer.id)) {
    map.addLayer(layer)
  }
}
