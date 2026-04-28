import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dataDir = path.join(root, 'src', 'data', 'sample')

const readJson = (name) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'))

const years = readJson('luYears.json')
const states = readJson('states.json')
const places = readJson('places.json')
const persons = readJson('persons.json')
const events = readJson('events.json')
const relations = readJson('relations.json')

const regnalSpans = [
  { prefix: 'yin', startBce: -722, endBce: -712 },
  { prefix: 'huan', startBce: -711, endBce: -694 },
  { prefix: 'zhuang', startBce: -693, endBce: -662 },
  { prefix: 'min', startBce: -661, endBce: -660 },
  { prefix: 'xi', startBce: -659, endBce: -627 },
  { prefix: 'wen', startBce: -626, endBce: -609 },
  { prefix: 'xuan', startBce: -608, endBce: -591 },
  { prefix: 'cheng', startBce: -590, endBce: -573 },
  { prefix: 'xiang', startBce: -572, endBce: -542 },
  { prefix: 'zhao', startBce: -541, endBce: -510 },
  { prefix: 'ding', startBce: -509, endBce: -495 },
  { prefix: 'ai', startBce: -494, endBce: -481 },
]

function buildFullYearIds() {
  const ids = new Set(years.map((x) => x.id))
  for (const span of regnalSpans) {
    for (let bce = span.startBce; bce <= span.endBce; bce += 1) {
      const n = bce - span.startBce + 1
      ids.add(`${span.prefix}-${n}`)
    }
  }
  return ids
}

const yearIds = buildFullYearIds()
const stateIds = new Set(states.map((x) => x.id))
const placeIds = new Set(places.map((x) => x.id))
const personIds = new Set(persons.map((x) => x.id))

const errors = []
const warns = []

function required(obj, keys, label) {
  for (const k of keys) {
    if (obj[k] === undefined || obj[k] === null || obj[k] === '') {
      errors.push(`${label} 缺少必填字段: ${k}`)
    }
  }
}

function assertUnique(list, key, label) {
  const seen = new Set()
  for (const item of list) {
    if (seen.has(item[key])) {
      errors.push(`${label} 存在重复 ${key}: ${item[key]}`)
    }
    seen.add(item[key])
  }
}

assertUnique(years, 'id', 'luYears')
assertUnique(states, 'id', 'states')
assertUnique(places, 'id', 'places')
assertUnique(persons, 'id', 'persons')
assertUnique(events, 'id', 'events')
assertUnique(relations, 'id', 'relations')

for (const e of events) {
  required(e, ['id', 'luYearId', 'jingText', 'sourceType', 'sourceRef', 'certainty'], `event:${e.id}`)
  if (!yearIds.has(e.luYearId)) errors.push(`event:${e.id} 引用了不存在 luYearId: ${e.luYearId}`)
  for (const sid of e.stateIds ?? []) if (!stateIds.has(sid)) errors.push(`event:${e.id} 引用了不存在 stateId: ${sid}`)
  for (const pid of e.placeIds ?? []) if (!placeIds.has(pid)) errors.push(`event:${e.id} 引用了不存在 placeId: ${pid}`)
  for (const rid of e.personIds ?? []) if (!personIds.has(rid)) errors.push(`event:${e.id} 引用了不存在 personId: ${rid}`)
  if (!['jing', 'zuozhuan', 'other'].includes(e.sourceType)) errors.push(`event:${e.id} sourceType 非法: ${e.sourceType}`)
  if (!['high', 'medium', 'low'].includes(e.certainty)) errors.push(`event:${e.id} certainty 非法: ${e.certainty}`)
  if (e.certainty === 'medium' && e.sourceRef.length < 6) warns.push(`event:${e.id} certainty=medium 但 sourceRef 说明较短`)
  for (const c of e.territoryChanges ?? []) {
    required(c, ['placeId', 'toStateId', 'changeType'], `event:${e.id}.territoryChange`)
    if (!placeIds.has(c.placeId)) errors.push(`event:${e.id} territoryChange 引用了不存在 placeId: ${c.placeId}`)
    if (c.fromStateId && !stateIds.has(c.fromStateId)) errors.push(`event:${e.id} territoryChange fromStateId 不存在: ${c.fromStateId}`)
    if (!stateIds.has(c.toStateId)) errors.push(`event:${e.id} territoryChange toStateId 不存在: ${c.toStateId}`)
    if (!['annex', 'recover', 'cede'].includes(c.changeType)) {
      errors.push(`event:${e.id} territoryChange changeType 非法: ${c.changeType}`)
    }
  }
}

// 同一年同城归属冲突校验
const ownershipSeen = new Map()
for (const e of events) {
  for (const c of e.territoryChanges ?? []) {
    const key = `${e.luYearId}:${c.placeId}`
    const prev = ownershipSeen.get(key)
    if (prev && prev !== c.toStateId) {
      errors.push(`territoryChange 冲突: ${key} 同年出现多个归属(${prev} vs ${c.toStateId})`)
    } else {
      ownershipSeen.set(key, c.toStateId)
    }
  }
}

for (const r of relations) {
  required(r, ['id', 'fromId', 'toId', 'type', 'sourceType', 'sourceRef', 'certainty'], `relation:${r.id}`)
  if (!stateIds.has(r.fromId)) errors.push(`relation:${r.id} fromId 不存在: ${r.fromId}`)
  if (!stateIds.has(r.toId)) errors.push(`relation:${r.id} toId 不存在: ${r.toId}`)
  for (const yid of r.activeLuYears ?? []) if (!yearIds.has(yid)) errors.push(`relation:${r.id} 引用了不存在 luYearId: ${yid}`)
  if (!['high', 'medium', 'low'].includes(r.certainty)) errors.push(`relation:${r.id} certainty 非法: ${r.certainty}`)
  if (r.certainty === 'medium' && !/《/.test(r.sourceRef ?? '')) warns.push(`relation:${r.id} certainty=medium 建议补充明确文献出处`)
}

for (const p of places) {
  required(p, ['id', 'name', 'coords', 'certainty'], `place:${p.id}`)
  if (p.stateId && !stateIds.has(p.stateId)) errors.push(`place:${p.id} stateId 不存在: ${p.stateId}`)
}

for (const s of states) {
  required(s, ['id', 'name', 'rank', 'color', 'certainty'], `state:${s.id}`)
  if (s.capitalId && !placeIds.has(s.capitalId)) errors.push(`state:${s.id} capitalId 不存在: ${s.capitalId}`)
}

for (const p of persons) {
  required(p, ['id', 'name', 'role', 'activeLuYears', 'certainty'], `person:${p.id}`)
  if (p.stateId && !stateIds.has(p.stateId)) errors.push(`person:${p.id} stateId 不存在: ${p.stateId}`)
  for (const yid of p.activeLuYears ?? []) if (!yearIds.has(yid)) errors.push(`person:${p.id} 引用了不存在 luYearId: ${yid}`)
}

// 新增：覆盖率（按鲁公/按年份）统计
const eventYearCoverage = new Map()
for (const e of events) {
  eventYearCoverage.set(e.luYearId, (eventYearCoverage.get(e.luYearId) ?? 0) + 1)
}
const coverageByDuke = regnalSpans.map((span) => {
  let totalYears = 0
  let coveredYears = 0
  for (let bce = span.startBce; bce <= span.endBce; bce += 1) {
    totalYears += 1
    const id = `${span.prefix}-${bce - span.startBce + 1}`
    if (eventYearCoverage.has(id)) coveredYears += 1
  }
  return { duke: span.prefix, totalYears, coveredYears }
})
coverageByDuke.forEach((c) => {
  if (c.coveredYears === 0) {
    warns.push(`覆盖率提示: ${c.duke} 全期暂无事件（0/${c.totalYears}）`)
  }
})

// 新增：同名实体冲突检测（人物/地点）
function normalizeName(name) {
  return String(name).replace(/（.*?）/g, '').replace(/\s+/g, '').trim()
}
const placeNameToIds = new Map()
for (const p of places) {
  const k = normalizeName(p.name)
  const arr = placeNameToIds.get(k) ?? []
  arr.push(p.id)
  placeNameToIds.set(k, arr)
}
for (const [name, ids] of placeNameToIds.entries()) {
  if (ids.length > 1) warns.push(`地点同名冲突: ${name} -> ${ids.join(', ')}`)
}
const personNameToIds = new Map()
for (const p of persons) {
  const k = normalizeName(p.name)
  const arr = personNameToIds.get(k) ?? []
  arr.push(p.id)
  personNameToIds.set(k, arr)
}
for (const [name, ids] of personNameToIds.entries()) {
  if (ids.length > 1) warns.push(`人物同名冲突: ${name} -> ${ids.join(', ')}`)
}

if (warns.length) {
  console.log('\n[WARN]')
  warns.forEach((w) => console.log(`- ${w}`))
}

if (errors.length) {
  console.error('\n[ERROR]')
  errors.forEach((e) => console.error(`- ${e}`))
  process.exit(1)
}

console.log('Data validation passed.')
