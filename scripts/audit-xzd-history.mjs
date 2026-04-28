/**
 * 襄公·昭公·定公史实校订：
 * - 修正高风险错年与错误叙述
 * - 区分《春秋》经文骨架与《左传》叙事
 * - 清理重复人物与会战地点误指
 *
 * 该脚本可在 scripts/inject-xzd-full.mjs 之后重复运行。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, '../src/data/sample')

const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf-8'))
const write = (f, d) => {
  fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n', 'utf-8')
  console.log('✓', f, Array.isArray(d) ? d.length : '')
}

const ORDER = {
  yin: 1,
  huan: 2,
  zhuang: 3,
  min: 4,
  xi: 5,
  wen: 6,
  xuan: 7,
  cheng: 8,
  xiang: 9,
  zhao: 10,
  ding: 11,
  ai: 12,
}

function span(prefix, lo, hi) {
  const out = []
  for (let i = lo; i <= hi; i++) out.push(`${prefix}-${i}`)
  return out
}

function cmpLuYear(a, b) {
  const [pa, na] = a.split('-')
  const [pb, nb] = b.split('-')
  const oa = ORDER[pa] ?? 50
  const ob = ORDER[pb] ?? 50
  if (oa !== ob) return oa - ob
  return Number(na) - Number(nb)
}

function sortLuYears(arr) {
  return [...new Set(arr)].sort(cmpLuYear)
}

let states = read('states.json')
let places = read('places.json')
let persons = read('persons.json')
let relations = read('relations.json')
let events = read('events.json')

function upsertById(list, item) {
  const idx = list.findIndex((x) => x.id === item.id)
  if (idx >= 0) list[idx] = { ...list[idx], ...item }
  else list.push(item)
}

function getEvent(id) {
  const ev = events.find((e) => e.id === id)
  if (!ev) throw new Error(`missing event ${id}`)
  return ev
}

function patchEvent(id, patch) {
  Object.assign(getEvent(id), patch)
}

function setZuo(id, sourceRef = undefined) {
  const ev = getEvent(id)
  ev.sourceType = 'zuozhuan'
  ev.sourceRef = sourceRef ?? ev.sourceRef.replace('《春秋》', '《左传》')
  ev.certainty = ev.certainty === 'high' ? 'medium' : ev.certainty
}

function addEvent(event) {
  if (events.some((e) => e.id === event.id)) return
  const idx = events.findIndex((e) => e.luYearId === 'ai-3')
  if (idx >= 0) events.splice(idx, 0, event)
  else events.push(event)
}

// ── 地点/国家闭环 ────────────────────────────────────────────────────────────
upsertById(states, {
  id: 'xu-state',
  name: '许',
  rank: 'nan',
  founder: '姜姓许国',
  clan: '姜',
  capitalId: 'xu',
  color: '#9C7A3A',
  certainty: 'medium',
  territory: [
    [
      [113.3, 34.3],
      [114.2, 34.3],
      [114.2, 33.7],
      [113.3, 33.7],
      [113.3, 34.3],
    ],
  ],
})

upsertById(places, {
  id: 'pingqiu',
  name: '平丘（晋主盟会地）',
  stateId: null,
  modernRef: '今河南封丘、濮阳间（约）',
  coords: [114.63, 35.05],
  certainty: 'medium',
})
upsertById(places, {
  id: 'zuili',
  name: '槜李（吴越战地）',
  stateId: null,
  modernRef: '今浙江嘉兴西南（约）',
  coords: [120.63, 30.72],
  certainty: 'medium',
})
upsertById(places, {
  id: 'shen-chu',
  name: '申（楚会地）',
  stateId: 'chu',
  modernRef: '今河南南阳北（约）',
  coords: [112.53, 33.0],
  certainty: 'medium',
})

const xuPlace = places.find((p) => p.id === 'xu')
if (xuPlace) xuPlace.stateId = 'xu-state'

// ── 人物校订 ────────────────────────────────────────────────────────────────
persons = persons.filter((p) => p.id !== 'wu-helv-person')
for (const ev of events) {
  ev.personIds = (ev.personIds ?? []).map((id) => (id === 'wu-helv-person' ? 'wu-helv' : id))
}

const wuHelv = persons.find((p) => p.id === 'wu-helv')
if (wuHelv) {
  wuHelv.name = '姬光'
  wuHelv.posthumous = '吴王阖闾'
  wuHelv.activeLuYears = sortLuYears([...span('zhao', 27, 32), ...span('ding', 1, 14)])
}
const wuFucha = persons.find((p) => p.id === 'wu-fucha')
if (wuFucha) {
  wuFucha.activeLuYears = sortLuYears(['ding-14', 'ding-15', ...span('ai', 1, 14)])
}
const yueGujian = persons.find((p) => p.id === 'yue-gujian')
if (yueGujian) {
  yueGujian.activeLuYears = sortLuYears(['ding-13', 'ding-14', 'ding-15', ...span('ai', 1, 14)])
}
const kongzi = persons.find((p) => p.id === 'kongzi')
if (kongzi) {
  kongzi.activeLuYears = sortLuYears((kongzi.activeLuYears ?? []).filter((y) => y !== 'xiang-21'))
}

// ── 高风险事件错年/错叙述校订 ────────────────────────────────────────────────
patchEvent('ev-zhao20-1', {
  jingText: '夏，晋侯使士鞅来聘。蔡侯、许男会于平丘。',
  stateIds: ['jin', 'lu', 'cai', 'xu-state'],
  placeIds: ['pingqiu'],
  sourceType: 'jing',
  sourceRef: '《春秋》昭公二十年',
  certainty: 'medium',
})

patchEvent('ev-zhao8-1', {
  jingText: '楚师灭陈。',
  category: 'battle',
  stateIds: ['chu', 'chen'],
  placeIds: ['wanqiu'],
  sourceType: 'jing',
  sourceRef: '《春秋》昭公八年',
  certainty: 'medium',
  zuoComment: '陈内乱后，楚灵王因陈乱而灭陈，置为楚县；后楚平王立，陈复国。',
  territoryChanges: [
    { placeId: 'wanqiu', fromStateId: 'chen', toStateId: 'chu', changeType: 'annex' },
  ],
})

patchEvent('ev-zhao11-1', {
  jingText: '楚子诱蔡侯般杀之于申。楚公子弃疾帅师围蔡。',
  category: 'battle',
  stateIds: ['chu', 'cai'],
  placeIds: ['shen-chu', 'shangcai'],
  sourceType: 'jing',
  sourceRef: '《春秋》昭公十一年',
  certainty: 'medium',
  zuoComment: '楚灵王诱杀蔡灵侯，并以公子弃疾围蔡，蔡国一度入楚。',
  territoryChanges: [
    { placeId: 'shangcai', fromStateId: 'cai', toStateId: 'chu', changeType: 'annex' },
  ],
})

patchEvent('ev-zhao12-1', {
  jingText: '楚灵王大会诸侯于申。',
  category: 'assembly',
  stateIds: ['chu', 'lu', 'cai', 'chen'],
  placeIds: ['shen-chu'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》昭公十二年',
  certainty: 'medium',
  zuoComment: '楚灵王欲以申之会夸示楚威；此条为传文叙事，不作陈国 territoryChanges。',
})
delete getEvent('ev-zhao12-1').territoryChanges

patchEvent('ev-zhao13-1', {
  jingText: '楚公子弃疾杀灵王而立，是为楚平王；陈、蔡复国。',
  category: 'other',
  stateIds: ['chu', 'chen', 'cai'],
  placeIds: ['ying', 'wanqiu', 'shangcai'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》昭公十三年',
  certainty: 'medium',
  zuoComment: '楚灵王死，弃疾即位为楚平王，改弦更张，复封陈、蔡。',
  territoryChanges: [
    { placeId: 'wanqiu', fromStateId: 'chu', toStateId: 'chen', changeType: 'recover' },
    { placeId: 'shangcai', fromStateId: 'chu', toStateId: 'cai', changeType: 'recover' },
  ],
})

patchEvent('ev-zhao22-1', {
  jingText: '周景王崩，王室乱起。',
  category: 'other',
  stateIds: ['zhou'],
  placeIds: ['wangcheng'],
  sourceType: 'zuozhuan',
  sourceRef: '《春秋》《左传》昭公二十二年',
  certainty: 'medium',
  zuoComment: '周景王崩后，王子朝之乱渐起；王子朝奔楚不应并入本年经文。',
})

patchEvent('ev-zhao24-1', {
  jingText: '王子朝之乱未靖，晋人纳王于王城。',
  category: 'other',
  stateIds: ['zhou', 'jin'],
  placeIds: ['wangcheng'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》昭公二十四年',
  certainty: 'medium',
  zuoComment: '此年以周王室内乱与晋人干预为主，不再误写楚平王即位。',
})
delete getEvent('ev-zhao24-1').territoryChanges

addEvent({
  id: 'ev-zhao25-2',
  luYearId: 'zhao-25',
  jingText: '九月己亥，公孙于齐，次于阳州。',
  category: 'other',
  stateIds: ['lu', 'qi'],
  placeIds: ['linzi'],
  personIds: ['lu-zhao'],
  sourceType: 'jing',
  sourceRef: '《春秋》昭公二十五年',
  certainty: 'medium',
  zuoComment: '昭公讨季氏失败出奔齐国，鲁政由季氏把持。',
})

patchEvent('ev-zhao26-1', {
  jingText: '公在齐，齐侯将纳公。',
  category: 'other',
  stateIds: ['lu', 'qi'],
  placeIds: ['linzi'],
  personIds: ['lu-zhao'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》昭公二十六年',
  certainty: 'medium',
  zuoComment: '昭公出奔后在齐，诸侯围绕纳公归鲁反复折冲。',
})

patchEvent('ev-ding4-1', {
  jingText: '蔡侯以吴子及楚人战于柏举，楚师败绩。吴入郢。',
  category: 'battle',
  stateIds: ['cai', 'wu', 'chu'],
  placeIds: ['boju', 'ying'],
  personIds: ['wu-helv'],
  sourceType: 'jing',
  sourceRef: '《春秋》定公四年',
  certainty: 'high',
  zuoComment: '柏举之战为吴、蔡联军伐楚，楚师败绩，吴师随后入郢。',
})

patchEvent('ev-ding4-2', {
  jingText: '伍员、孙武佐吴伐楚，五战及郢。',
  category: 'battle',
  stateIds: ['wu', 'chu', 'cai'],
  placeIds: ['boju', 'ying'],
  personIds: ['wu-helv'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》定公四年',
  certainty: 'medium',
  zuoComment: '此条保留传文脉络，避免再误写楚、蔡、陈伐吴。',
})

patchEvent('ev-ding5-1', {
  jingText: '申包胥如秦乞师，秦师救楚，吴师退。',
  category: 'battle',
  stateIds: ['chu', 'qin', 'wu'],
  placeIds: ['ying'],
  personIds: [],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》定公五年',
  certainty: 'medium',
  zuoComment: '申包胥为楚昭王求秦师，不是楚平王之臣；秦救楚后，吴师退去。',
})

patchEvent('ev-ding7-1', {
  jingText: '季桓子受齐女乐，孔子去鲁。',
  category: 'other',
  stateIds: ['lu', 'qi'],
  placeIds: ['qufu'],
  personIds: ['kongzi'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》《史记》孔子世家相关叙事',
  certainty: 'medium',
  zuoComment: '此条为孔子仕鲁、去鲁的传世叙事，不再误作夹谷经文。',
})

patchEvent('ev-ding10-1', {
  jingText: '夏，公会齐侯于夹谷。',
  category: 'assembly',
  stateIds: ['lu', 'qi'],
  placeIds: ['jiagu'],
  personIds: ['lu-ding', 'kongzi'],
  sourceType: 'jing',
  sourceRef: '《春秋》定公十年',
  certainty: 'high',
  zuoComment: '夹谷之会，孔子相礼，齐归鲁侵田事由此展开。',
})

const ding8 = events.find((e) => e.id === 'ev-ding8-1')
if (ding8) {
  if (events.some((e) => e.id === 'ev-ding10-2')) {
    events = events.filter((e) => e.id !== 'ev-ding8-1')
  } else {
    Object.assign(ding8, {
      id: 'ev-ding10-2',
      luYearId: 'ding-10',
      jingText: '齐人来归郓、讙、龟阴田。',
      category: 'diplomatic',
      stateIds: ['lu', 'qi'],
      placeIds: ['yun', 'huan'],
      personIds: ['lu-ding'],
      sourceType: 'jing',
      sourceRef: '《春秋》定公十年',
      certainty: 'high',
      zuoComment: '夹谷之会后，齐归还鲁之郓、讙、龟阴田；不再误置于定公八年。',
    })
  }
}

patchEvent('ev-ding14-1', {
  jingText: '越败吴于槜李，吴子光卒。',
  category: 'battle',
  stateIds: ['wu', 'yue'],
  placeIds: ['zuili'],
  personIds: ['wu-helv', 'yue-gujian'],
  sourceType: 'jing',
  sourceRef: '《春秋》定公十四年',
  certainty: 'medium',
  zuoComment: '槜李之战，越败吴，吴王阖闾伤而卒；夫差继位。',
})

// 叙事型条目改为《左传》来源，不再伪装为经文。
for (const id of [
  'ev-xiang27-1',
  'ev-xiang29-1',
  'ev-zhao1-1',
  'ev-zhao2-1',
  'ev-zhao3-1',
  'ev-zhao4-1',
  'ev-zhao27-1',
  'ev-zhao28-1',
  'ev-zhao29-1',
  'ev-ding2-1',
  'ev-ding11-1',
]) {
  if (events.some((e) => e.id === id)) setZuo(id)
}

// ── 关系校订：删除无法用现有 RelationType 精确表达的“强同盟” ───────────────
relations = relations.filter((r) => !['rel-lu-chu-ally-zhao', 'rel-jin-chu-ally-bimbing'].includes(r.id))

const relWuYue = relations.find((r) => r.id === 'rel-wu-yue-enemy')
if (relWuYue) {
  relWuYue.activeLuYears = sortLuYears([...span('ding', 13, 15), ...span('ai', 1, 14)])
  relWuYue.sourceRef = '《春秋》定公十三、十四年及哀公时期吴越交兵；槜李、夫椒、姑苏诸役为其主线。'
}
const relLuQiDing = relations.find((r) => r.id === 'rel-lu-qi-ally-ding')
if (relLuQiDing) {
  relLuQiDing.activeLuYears = sortLuYears([...span('ding', 10, 15)])
  relLuQiDing.sourceRef = '《春秋》定公十年夹谷之会及齐人来归郓、讙、龟阴田，鲁齐关系一度缓和。'
}

write('states.json', states)
write('places.json', places)
write('persons.json', persons)
write('relations.json', relations)
write('events.json', events)
console.log('史实校订完成。')
