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
// 地图裁剪范围（粗估）
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

// 爵位 → sort-key 里用的权重
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

export const MAJOR_STATE_IDS = new Set([
  'zhou',
  'lu',
  'qi',
  'jin',
  'chu',
  'qin',
  'wei',
  'zheng',
  'song',
  'yan',
  'wu',
  'yue',
])

export const RANK_COLORS: Record<string, string> = {
  wang:      '#c9a227',
  gong:      '#6b2d6b',
  hou:       '#3d6b8a',
  bo:        '#2d6a4f',
  zi:        '#1a6b8a',
  nan:       '#8B4513',
  barbarian: '#888888',
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

// 云雾遮罩用的环（当前未使用，保留）
export function buildCloudRingGeoJSON(bufferDeg: number): GeoJSON.FeatureCollection {
  const b = bufferDeg
  const world: GeoJSON.Position[] = [
    [-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85],
  ]
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

export function setupDem(map: maplibregl.Map) {
  if (!map.getSource('dem')) {
    map.addSource('dem', {
      type: 'raster-dem',
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 12,
    })
  }

  if (!map.getLayer('hillshade')) {
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
      firstWaterLayerId
    )
  }
}

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

    if (mode === 'chunqiu' && activeStateIds) {
      const stateMentioned = !!(effectiveStateId && activeStateIds.has(effectiveStateId))
      const placeMentioned = activePlaceIds?.has(place.id) ?? false
      const hegemonCapitalShown =
        hegemonCapitalId != null && place.id === hegemonCapitalId
      if (!stateMentioned && !placeMentioned && !hegemonCapitalShown) continue
    }

    const isCapital = state?.capitalId === place.id
    const isHegemonCapital = Boolean(hegemonId && state?.id === hegemonId && isCapital)

    const rank = state?.rank ?? 'unknown'
    const radius = isCapital ? (state?.rank === 'wang' ? 10 : 7) : 4
    const rankPriority = RANK_PRIORITY[rank] ?? 0
    const isMajorState = MAJOR_STATE_IDS.has(effectiveStateId ?? '') ? 1 : 0
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
    // MapCanvas 里处理人物定位
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
