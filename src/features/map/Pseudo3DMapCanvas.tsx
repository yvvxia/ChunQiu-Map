import { useEffect, useMemo, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { ALL_PLACES, ALL_RELATIONS, ALL_STATES, getEventsForYear } from '@/data/dataService'
import { isInHan18Approx } from '@/features/map/mapHelpers'
import type { MapMode } from '@/domain/types'

type DemoMode = Extract<MapMode, 'chunqiu' | 'diplomacy' | 'fengjian'>

interface Props {
  yearId: string
  mode: DemoMode
}

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'

const REL_COLORS: Record<string, string> = {
  ally: '#6bd49f',
  enemy: '#ff6b6b',
  vassal: '#63b3ed',
  suzerain: '#f6ad55',
  marriage: '#d6bcfa',
  tributary: '#f6ad55',
}

export function Pseudo3DMapCanvas({ yearId, mode }: Props) {
  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  const { activeStateIds, activePlaceIds } = useMemo(() => {
    const stateIds = new Set<string>()
    const placeIds = new Set<string>()
    getEventsForYear(yearId).forEach((e) => {
      e.stateIds.forEach((sid) => stateIds.add(sid))
      e.placeIds?.forEach((pid) => placeIds.add(pid))
    })
    return { activeStateIds: stateIds, activePlaceIds: placeIds }
  }, [yearId])

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapEl.current,
      style: STYLE_URL,
      center: [113.5, 34.8],
      zoom: 4.8,
      pitch: 48,
      bearing: 0,
      minZoom: 3.5,
      maxZoom: 7.5,
      attributionControl: false,
      dragRotate: false,
      touchPitch: false,
    })

    map.touchZoomRotate.disableRotation()
    map.keyboard.disableRotation()
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      if (!map.getSource('dem')) {
        map.addSource('dem', {
          type: 'raster-dem',
          tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
          tileSize: 256,
          maxzoom: 12,
        })
      }

      map.setTerrain({ source: 'dem', exaggeration: 0.7 })
      if (!map.getLayer('hillshade')) {
        map.addLayer({
          id: 'hillshade',
          type: 'hillshade',
          source: 'dem',
          paint: {
            'hillshade-exaggeration': 0.5,
            'hillshade-shadow-color': '#0f1720',
            'hillshade-highlight-color': '#7f8ea3',
          },
        })
      }

      if (!map.getSource('cities')) {
        map.addSource('cities', {
          type: 'geojson',
          data: makeCitiesGeoJSON(mode, activeStateIds, activePlaceIds),
        })
      }
      if (!map.getLayer('city-dot')) {
        map.addLayer({
          id: 'city-dot',
          type: 'circle',
          source: 'cities',
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': ['get', 'color'],
            'circle-stroke-color': '#f8fafc',
            'circle-stroke-width': 1.2,
            'circle-opacity': 0.9,
          },
        })
      }
      if (!map.getLayer('city-label')) {
        map.addLayer({
          id: 'city-label',
          type: 'symbol',
          source: 'cities',
          filter: ['==', ['get', 'isCapital'], true],
          layout: {
            'text-field': ['get', 'stateName'],
            'text-size': 11,
            'text-anchor': 'top',
            'text-offset': [0, 1.1],
            'text-font': ['Open Sans Bold'],
          },
          paint: {
            'text-color': '#f8fafc',
            'text-halo-color': '#101826',
            'text-halo-width': 1.1,
          },
        })
      }

      if (!map.getSource('relations')) {
        map.addSource('relations', {
          type: 'geojson',
          data: makeRelationsGeoJSON(yearId, mode),
        })
      }
      if (!map.getLayer('relation-line')) {
        map.addLayer({
          id: 'relation-line',
          type: 'line',
          source: 'relations',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 1.6,
            'line-opacity': 0.7,
            'line-dasharray': [2.6, 2.2],
          },
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
            visibility: mode === 'diplomacy' ? 'visible' : 'none',
          },
        })
      }
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [yearId, mode, activeStateIds, activePlaceIds])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.loaded()) return
    const citySrc = map.getSource('cities') as maplibregl.GeoJSONSource | undefined
    citySrc?.setData(makeCitiesGeoJSON(mode, activeStateIds, activePlaceIds))
    const relSrc = map.getSource('relations') as maplibregl.GeoJSONSource | undefined
    relSrc?.setData(makeRelationsGeoJSON(yearId, mode))
    map.setLayoutProperty('relation-line', 'visibility', mode === 'diplomacy' ? 'visible' : 'none')
  }, [yearId, mode, activeStateIds, activePlaceIds])

  return <div ref={mapEl} style={{ width: '100%', height: '100%' }} />
}

function makeCitiesGeoJSON(mode: DemoMode, activeStateIds: Set<string>, activePlaceIds: Set<string>): GeoJSON.FeatureCollection {
  const rankColors: Record<string, string> = {
    wang: '#f6ad55',
    gong: '#c084fc',
    hou: '#60a5fa',
    bo: '#34d399',
    zi: '#22d3ee',
    nan: '#fb7185',
    unknown: '#94a3b8',
    barbarian: '#6b7280',
  }

  const features = ALL_PLACES
    .map((p) => {
      if (p.certainty === 'low') return null
      if (!isInHan18Approx(p.coords)) return null
      const s = p.stateId ? ALL_STATES.find((x) => x.id === p.stateId) : undefined
      if (mode === 'chunqiu') {
        const stateMentioned = !!(p.stateId && activeStateIds.has(p.stateId))
        const placeMentioned = activePlaceIds.has(p.id)
        if (!stateMentioned && !placeMentioned) return null
      }
      const isCapital = s?.capitalId === p.id
      return {
        type: 'Feature',
        properties: {
          id: p.id,
          stateName: s?.name ?? '',
          color: mode === 'fengjian' ? rankColors[s?.rank ?? 'unknown'] : (s?.color ?? '#94a3b8'),
          radius: isCapital ? 7 : 4,
          isCapital,
        },
        geometry: { type: 'Point', coordinates: p.coords },
      } as GeoJSON.Feature
    })
    .filter(Boolean) as GeoJSON.Feature[]

  return { type: 'FeatureCollection', features }
}

function makeRelationsGeoJSON(yearId: string, mode: DemoMode): GeoJSON.FeatureCollection {
  if (mode !== 'diplomacy') return { type: 'FeatureCollection', features: [] }
  const active = ALL_RELATIONS.filter((r) => r.activeLuYears.length === 0 || r.activeLuYears.includes(yearId))
  const capMap = new Map<string, [number, number]>()
  ALL_STATES.forEach((s) => {
    const cap = s.capitalId ? ALL_PLACES.find((p) => p.id === s.capitalId) : undefined
    if (cap) capMap.set(s.id, cap.coords)
  })

  const features = active
    .map((r) => {
      const from = capMap.get(r.fromId)
      const to = capMap.get(r.toId)
      if (!from || !to) return null
      return {
        type: 'Feature',
        properties: { color: REL_COLORS[r.type] ?? '#94a3b8' },
        geometry: { type: 'LineString', coordinates: [from, to] },
      } as GeoJSON.Feature
    })
    .filter(Boolean) as GeoJSON.Feature[]

  return { type: 'FeatureCollection', features }
}
