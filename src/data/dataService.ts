import type { ChunqiuEvent, LuYear, Person, Place, Relation, State } from '@/domain/types'
import eventsRaw from './sample/events.json'
import luYearsRaw from './sample/luYears.json'
import personsRaw from './sample/persons.json'
import placesRaw from './sample/places.json'
import relationsRaw from './sample/relations.json'
import statesRaw from './sample/states.json'

export const ALL_EVENTS = eventsRaw as ChunqiuEvent[]
const RAW_LU_YEARS = luYearsRaw as LuYear[]
export const ALL_STATES = statesRaw as State[]
export const ALL_PLACES = placesRaw as Place[]
export const ALL_PERSONS = personsRaw as Person[]
export const ALL_RELATIONS = relationsRaw as Relation[]

// 前722–前481 全轴：缺年占位
export const ALL_LU_YEARS: LuYear[] = buildExpandedLuYears(RAW_LU_YEARS)

export function getStateById(id: string): State | undefined {
  return ALL_STATES.find(s => s.id === id)
}

export function getPlaceById(id: string): Place | undefined {
  return ALL_PLACES.find(p => p.id === id)
}

export function getPersonById(id: string): Person | undefined {
  return ALL_PERSONS.find(p => p.id === id)
}

export function getLuYearById(id: string): LuYear | undefined {
  return ALL_LU_YEARS.find(y => y.id === id)
}

/** 返回给定鲁纪年的前一年 id；若已是首年则返回 null */
export function getPrevLuYearId(luYearId: string): string | null {
  const idx = ALL_LU_YEARS.findIndex(y => y.id === luYearId)
  return idx > 0 ? ALL_LU_YEARS[idx - 1].id : null
}

/** 获取某年度的所有经文事件（按经文顺序） */
export function getEventsForYear(luYearId: string): ChunqiuEvent[] {
  return ALL_EVENTS.filter(e => e.luYearId === luYearId)
}

/** 获取某年度有经文记录的国家 id 集合（春秋模式用） */
export function getActiveStateIdsForYear(luYearId: string): Set<string> {
  const events = getEventsForYear(luYearId)
  const ids = new Set<string>()
  events.forEach(ev => ev.stateIds.forEach(s => ids.add(s)))
  return ids
}

/** 获取某年度的外交关系 */
export function getRelationsForYear(luYearId: string): Relation[] {
  return ALL_RELATIONS.filter(
    r => r.activeLuYears.length === 0 || r.activeLuYears.includes(luYearId)
  )
}

/** 全文检索：国家、地点、人物 */
export function globalSearch(query: string): {
  states: State[]
  places: Place[]
  persons: Person[]
} {
  const q = query.trim().toLowerCase()
  if (!q) return { states: [], places: [], persons: [] }
  return {
    states: ALL_STATES.filter(s => s.name.includes(q)),
    places: ALL_PLACES.filter(p => p.name.includes(q)),
    persons: ALL_PERSONS.filter(p =>
      p.name.includes(q) ||
      (p.posthumous ?? '').includes(q) ||
      (p.courtesy ?? '').includes(q)
    ),
  }
}

/** 某国在某年的关系 */
export function getRelationsForStateInYear(stateId: string, luYearId: string): Relation[] {
  return getRelationsForYear(luYearId).filter(
    r => r.fromId === stateId || r.toId === stateId
  )
}

/** 获取某年度某国家相关人物 */
export function getPersonsForStateInYear(stateId: string, luYearId: string): Person[] {
  return ALL_PERSONS.filter(
    p => p.stateId === stateId && p.activeLuYears.includes(luYearId)
  )
}

/**
 * 某国在指定鲁纪年的在位君主（取 role 为 duke 且 activeLuYears 含该年者）。
 * 若同一年份有多条国君记录（如换代同年），取「active 列表中最早年份」更晚者（即位更近的君主）。
 */
export function getDukePersonForStateInYear(stateId: string, luYearId: string): Person | undefined {
  const yearOrder = new Map(ALL_LU_YEARS.map((y, i) => [y.id, i]))
  const candidates = ALL_PERSONS.filter(
    p =>
      p.stateId === stateId &&
      p.role === 'duke' &&
      p.activeLuYears.includes(luYearId)
  )
  if (candidates.length === 0) return undefined
  if (candidates.length === 1) return candidates[0]

  const startIdx = (p: Person) =>
    Math.min(...p.activeLuYears.map(y => yearOrder.get(y) ?? Infinity))

  return candidates.reduce((best, p) => (startIdx(p) > startIdx(best) ? p : best))
}

/**
 * 计算截止到 luYearId（含）时某地点的有效归属国。
 * 回放 territoryChanges 时序，返回：
 *   effectiveStateId  — 当前有效控领国（可能与 place.stateId 不同）
 *   originalStateId   — place.json 中的原始归属
 *   changedInYear     — 最近一次归属变更发生的年份 id（无变更则 null）
 *   changeType        — 最近一次变更类型（无变更则 null）
 */
export function getEffectivePlaceOwnership(
  placeId: string,
  luYearId: string
): {
  effectiveStateId: string | null
  originalStateId: string | null
  changedInYear: string | null
  changeType: 'annex' | 'recover' | 'cede' | null
} {
  const place = ALL_PLACES.find(p => p.id === placeId)
  const originalStateId = place?.stateId ?? null

  const yearOrder = new Map(ALL_LU_YEARS.map((y, i) => [y.id, i]))
  const currentOrder = yearOrder.get(luYearId) ?? -1

  let effectiveStateId: string | null = originalStateId
  let changedInYear: string | null = null
  let changeType: 'annex' | 'recover' | 'cede' | null = null

  for (const event of ALL_EVENTS) {
    const order = yearOrder.get(event.luYearId) ?? Infinity
    if (order > currentOrder) continue
    for (const tc of event.territoryChanges ?? []) {
      if (tc.placeId === placeId) {
        effectiveStateId = tc.toStateId
        changedInYear = event.luYearId
        changeType = tc.changeType
      }
    }
  }

  return { effectiveStateId, originalStateId, changedInYear, changeType }
}

/**
 * 当前鲁纪年对应的霸主国 id（示意区间，便于地图金圈与侧栏展示）。
 * 无霸主区间返回 null。
 */
export function getHegemonForYear(luYearId: string): string | null {
  const idx = ALL_LU_YEARS.findIndex(y => y.id === luYearId)
  if (idx < 0) return null

  // 哀公十四年《春秋》绝笔时，吴夫差仍称霸东南；越灭吴在《左传》哀公二十二年等，晚于经绝笔年，故不以越为霸主。
  const ranges: [string, string, string][] = [
    ['zhuang-8', 'xi-17', 'qi'],
    ['xi-28', 'xuan-11', 'jin'],
    ['xuan-12', 'xuan-18', 'chu'],
    ['cheng-2', 'xiang-26', 'jin'],
    ['xiang-27', 'zhao-32', 'jin'],
    ['ding-4', 'ai-14', 'wu'],
  ]

  for (const [fromId, toId, stateId] of ranges) {
    const fi = ALL_LU_YEARS.findIndex(y => y.id === fromId)
    const ti = ALL_LU_YEARS.findIndex(y => y.id === toId)
    if (fi < 0 || ti < 0) continue
    if (idx >= fi && idx <= ti) return stateId
  }
  return null
}

function buildExpandedLuYears(existing: LuYear[]): LuYear[] {
  const byBce = new Map<number, LuYear>()
  existing.forEach((y) => byBce.set(y.bce, y))

  const regnal = [
    { duke: '隐公', idPrefix: 'yin', startBce: -722, endBce: -712 },
    { duke: '桓公', idPrefix: 'huan', startBce: -711, endBce: -694 },
    { duke: '庄公', idPrefix: 'zhuang', startBce: -693, endBce: -662 },
    { duke: '闵公', idPrefix: 'min', startBce: -661, endBce: -660 },
    { duke: '僖公', idPrefix: 'xi', startBce: -659, endBce: -627 },
    { duke: '文公', idPrefix: 'wen', startBce: -626, endBce: -609 },
    { duke: '宣公', idPrefix: 'xuan', startBce: -608, endBce: -591 },
    { duke: '成公', idPrefix: 'cheng', startBce: -590, endBce: -573 },
    { duke: '襄公', idPrefix: 'xiang', startBce: -572, endBce: -542 },
    { duke: '昭公', idPrefix: 'zhao', startBce: -541, endBce: -510 },
    { duke: '定公', idPrefix: 'ding', startBce: -509, endBce: -495 },
    { duke: '哀公', idPrefix: 'ai', startBce: -494, endBce: -481 },
  ] as const

  const expanded: LuYear[] = []
  for (let bce = -722; bce <= -481; bce += 1) {
    const exact = byBce.get(bce)
    if (exact) {
      expanded.push(exact)
      continue
    }
    const r = regnal.find((x) => bce >= x.startBce && bce <= x.endBce)
    const yearNum = r ? bce - r.startBce + 1 : 0
    expanded.push({
      id: r ? `${r.idPrefix}-${yearNum}` : `bce-${Math.abs(bce)}`,
      luLabel: r ? `${r.duke}${toChineseOrdinal(yearNum)}年` : '鲁纪年',
      luDuke: r?.duke ?? '待补',
      luYearNum: yearNum,
      zhouLabel: '周王纪年',
      bce,
    })
  }
  return expanded
}

function toChineseOrdinal(n: number): string {
  if (n <= 0) return '零'
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  if (n === 1) return '元'
  if (n < 10) return digits[n]
  if (n === 10) return '十'
  if (n < 20) return `十${digits[n % 10]}`
  if (n % 10 === 0) return `${digits[Math.floor(n / 10)]}十`
  return `${digits[Math.floor(n / 10)]}十${digits[n % 10]}`
}
