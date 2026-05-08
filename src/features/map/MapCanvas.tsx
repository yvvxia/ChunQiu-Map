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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URL,
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      minZoom: 3,
      maxZoom: 9.5,
      attributionControl: false,
      dragRotate: false,
      touchPitch: false,
    })
    map.setMaxBounds([
      [HAN18_BOUNDS.west - 4, HAN18_BOUNDS.south - 4],
      [HAN18_BOUNDS.east + 4, HAN18_BOUNDS.north + 4],
    ])

    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', () => {
      setupDem(map)
      applyHistoricalBasemapMask(map)
      refreshLayers(map, mapMode, currentLuYearId, selectedEntityId, selectedEntityType)
      applyTerrainMode(map, mapMode === 'terrain')

      map.scrollZoom.setWheelZoomRate(1 / 150)

      const updatePitch = () => {
        const ZOOM_START = 6.8
        const ZOOM_FULL  = 8.5
        const MAX_PITCH  = 46
        const z = map.getZoom()
        const t = Math.max(0, Math.min(1, (z - ZOOM_START) / (ZOOM_FULL - ZOOM_START)))
        const target = Math.round(t * MAX_PITCH)
        if (Math.abs(map.getPitch() - target) > 0.5) map.setPitch(target)
      }
      map.on('zoom', updatePitch)
      updatePitch()

      map.on('click', 'city-circle', e => {
        const props = e.features?.[0]?.properties as Record<string, unknown> | undefined
        if (!props) return
        if (props['isCapital'] && props['stateId']) {
          selectEntity(props['stateId'] as string, 'state')
        } else {
          selectEntity(props['id'] as string, 'place')
        }
      })

      map.on('mouseenter', 'city-circle', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'city-circle', () => {
        map.getCanvas().style.cursor = ''
      })

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

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return
    applyTerrainMode(map, mapMode === 'terrain')
    refreshLayers(map, mapMode, currentLuYearId, selectedEntityId, selectedEntityType)
  }, [mapMode, currentLuYearId, selectedEntityId, selectedEntityType])

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

function refreshLayers(
  map: maplibregl.Map,
  mode: string,
  luYearId: string,
  selectedEntityId: string | null,
  selectedEntityType: string | null
) {
  const cityData = buildAllPlacesGeoJSON(mode as never, luYearId)
  ensureSource(map, 'cities', cityData)

  ensureLayer(map, {
    id: 'city-circle',
    type: 'circle',
    source: 'cities',
    layout: {
      'circle-sort-key': ['get', 'displayPriority'],
    },
    paint: {
      'circle-radius': ['get', 'radius'],
      'circle-color': ['get', 'color'],
      'circle-stroke-color': '#f5efe0',
      'circle-stroke-width': 1.5,
      'circle-opacity': 0.92,
    },
  })

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

  map.setPaintProperty(
    'city-circle',
    'circle-color',
    mode === 'fengjian'
      ? ['get', 'rankColor']
      : mode === 'terrain'
        ? ['get', 'terrainColor']
        : ['get', 'color']
  )

  ensureLayer(map, {
    id: 'city-label',
    type: 'symbol',
    source: 'cities',
    filter: ['==', ['get', 'isCapital'], true],
    layout: {
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

}

function applyTerrainMode(map: maplibregl.Map, active: boolean) {
  if (!map.getSource('dem')) return

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
  const hideLayerKeywords = [
    'road', 'street', 'highway', 'motorway', 'railway', 'rail',
    'transit', 'aeroway', 'airport', 'poi', 'housenumber',
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
