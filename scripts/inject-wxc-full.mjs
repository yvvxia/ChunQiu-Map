/**
 * 文公·宣公·成公：补齐事件、人物、地点、外交；修正僖二十六「向盟」、文公二年彭衙。
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

function span(prefix, lo, hi) {
  const out = []
  for (let i = lo; i <= hi; i++) out.push(`${prefix}-${i}`)
  return out
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

// ═══ 数据读入 ═══
const places = read('places.json')
let persons = read('persons.json')
let relations = read('relations.json')
let events = read('events.json')

// ═══ 地点：彭衙 ═══
if (!places.some((p) => p.id === 'pengya')) {
  places.push({
    id: 'pengya',
    name: '彭衙（晋秦战地）',
    stateId: null,
    modernRef: '今陕西白水—澄城间（晋秦战事常用记述点，取中位示意）',
    coords: [109.62, 35.22],
    certainty: 'medium',
  })
}

// ═══ 人物（新曾子与晋成/景） ═══
const newPersons = [
  {
    id: 'lu-wen',
    name: '兴',
    posthumous: '鲁文公',
    stateId: 'lu',
    role: 'duke',
    desc: '鲁僖公太子即位；季孙孟叔等三桓渐强。',
    activeLuYears: span('wen', 1, 18),
    sourceRef: '《春秋》《左传》文公',
    certainty: 'high',
  },
  {
    id: 'lu-xuan',
    name: '俀',
    posthumous: '鲁宣公',
    stateId: 'lu',
    role: 'duke',
    desc: '鲁文公子；时赵盾、郤缺等主晋政，邲之战为楚胜晋。',
    activeLuYears: span('xuan', 1, 18),
    sourceRef: '《春秋》《左传》宣公',
    certainty: 'high',
  },
  {
    id: 'lu-cheng',
    name: '黑肱',
    posthumous: '鲁成公',
    stateId: 'lu',
    role: 'duke',
    desc: '鲁宣公子；鞌、鄢陵诸役时鲁多从晋盟。',
    activeLuYears: span('cheng', 1, 18),
    sourceRef: '《春秋》《左传》成公',
    certainty: 'high',
  },
  {
    id: 'jin-chengong',
    name: '黑臀',
    posthumous: '晋成公',
    stateId: 'jin',
    role: 'duke',
    desc: '灵公后即位；在位约七年。',
    activeLuYears: span('xuan', 2, 8),
    sourceRef: '《春秋》《左传》宣公',
    certainty: 'high',
  },
  {
    id: 'jin-jingong',
    name: '獳',
    posthumous: '晋景公',
    stateId: 'jin',
    role: 'duke',
    desc: '晋成公后；鞌之战后晋势复振，与楚屡争。',
    activeLuYears: [...span('xuan', 9, 18), ...span('cheng', 1, 10)],
    sourceRef: '《春秋》《左传》宣公末至成公',
    certainty: 'high',
  },
]

const knownP = new Set(persons.map((p) => p.id))
for (const np of newPersons) {
  if (!knownP.has(np.id)) {
    persons.push(np)
    knownP.add(np.id)
  }
}

function patchPerson(id, fn) {
  const p = persons.find((x) => x.id === id)
  if (p) fn(p)
}

patchPerson('jin-xianggong', (p) => {
  p.activeLuYears = ['wen-2']
  p.sourceRef = '《春秋》文公二年（彭衙战迹）'
})

patchPerson('jin-linggong', (p) => {
  p.activeLuYears = sortLuYears([...span('wen', 13, 18), ...span('xuan', 1, 2)])
})

patchPerson('zhao-dun', (p) => {
  p.activeLuYears = sortLuYears([...span('wen', 13, 18), ...span('xuan', 1, 2)])
})

patchPerson('chu-zhuangwang', (p) => {
  p.activeLuYears = sortLuYears([...span('wen', 11, 18), ...span('xuan', 1, 17)])
})

patchPerson('shi-xie', (p) => {
  p.activeLuYears = span('cheng', 5, 12)
})

patchPerson('jin-lianggong', (p) => {
  p.activeLuYears = span('cheng', 15, 18)
})

patchPerson('chu-gongwang', (p) => {
  p.activeLuYears = span('cheng', 10, 18)
})

// ═══ 事件：改旧条 ═══
const iW2 = events.findIndex((e) => e.id === 'ev-wen2-1')
if (iW2 >= 0) {
  events[iW2] = {
    ...events[iW2],
    jingText: '晋侯及秦师战于彭衙，秦师败绩。',
    category: 'battle',
    stateIds: ['jin', 'qin'],
    placeIds: ['pengya'],
    personIds: ['jin-xianggong', 'qin-mugong'],
    sourceRef: '《春秋》文公二年',
    certainty: 'high',
    zuoComment: '秦以令狐之役故来战，此战为秦败（对晋而言为胜秦之追述，经称秦师败绩）。',
  }
}

const iX26 = events.findIndex((e) => e.id === 'ev-xi26-1')
if (iX26 >= 0) {
  const { territoryChanges: _t, ...rest } = events[iX26]
  events[iX26] = {
    ...rest,
    jingText: '二十有六年春王正月己未，公会莒子、卫甯速盟于向。',
    category: 'assembly',
    stateIds: ['lu', 'ji2', 'wei'],
    placeIds: ['xiang'],
    personIds: ['lu-xi'],
    sourceRef: '《春秋》僖公二十六年',
    certainty: 'high',
    zuoComment: '齐屡侵鲁西鄙背景下，鲁与莒、卫在向会盟。',
  }
}

function pushEvent(ev) {
  if (events.some((e) => e.id === ev.id)) return
  const ins = events.findIndex((e) => e.id === 'ev-xiang3-1')
  if (ins >= 0) events.splice(ins, 0, ev)
  else events.push(ev)
}

function yearCovered(luYearId) {
  return events.some((e) => e.luYearId === luYearId)
}

// ═══ 鲁文 补年（无经条年则加一条；文四用秋楚人灭江 + 取郢 等 地 动态） ═══
const wenAdd = [
  {
    id: 'ev-wen1-1',
    luYearId: 'wen-1',
    jingText: '元年春，王正月，公即位。',
    category: 'succession',
    stateIds: ['lu'],
    placeIds: ['qufu'],
    personIds: ['lu-wen'],
  },
  {
    id: 'ev-wen3-1',
    luYearId: 'wen-3',
    jingText:
      '三年春，王正月，叔孙得臣会晋人、宋人、陈人、卫人、郑人伐沈，沈溃。',
    category: 'battle',
    stateIds: ['lu', 'jin', 'song', 'chen', 'wei', 'zheng'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen4-2',
    luYearId: 'wen-4',
    jingText: '秋，楚人灭江。',
    category: 'battle',
    stateIds: ['chu', 'jiang'],
    placeIds: ['jiangdu'],
    personIds: [],
    territoryChanges: [
      {
        placeId: 'jiangdu',
        fromStateId: 'jiang',
        toStateId: 'chu',
        changeType: 'annex',
      },
    ],
    zuoComment: '江为小国，经文著楚兼并。',
  },
  {
    id: 'ev-wen5-1',
    luYearId: 'wen-5',
    jingText: '五年春，王正月，王使荣叔归含且赗。',
    category: 'diplomatic',
    stateIds: ['lu', 'zhou'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen6-1',
    luYearId: 'wen-6',
    jingText: '六年春，葬许僖公。',
    category: 'succession',
    stateIds: [],
    placeIds: ['xu'],
    personIds: [],
  },
  {
    id: 'ev-wen8-1',
    luYearId: 'wen-8',
    jingText: '八年春，王正月。',
    category: 'other',
    stateIds: ['lu'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen9-1',
    luYearId: 'wen-9',
    jingText: '九年春，毛伯来求金。',
    category: 'diplomatic',
    stateIds: ['zhou', 'lu'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen10-1',
    luYearId: 'wen-10',
    jingText: '十年春，王三月辛卯，臧孙辰卒。',
    category: 'succession',
    stateIds: ['lu'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen11-1',
    luYearId: 'wen-11',
    jingText: '十有一年春，楚子伐麇。',
    category: 'battle',
    stateIds: ['chu'],
    placeIds: [],
    personIds: ['chu-zhuangwang'],
  },
  {
    id: 'ev-wen12-1',
    luYearId: 'wen-12',
    jingText: '十有二年春，王正月，郕伯来奔。',
    category: 'succession',
    stateIds: ['lu'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen13-1',
    luYearId: 'wen-13',
    jingText: '十有三年春，王正月。',
    category: 'other',
    stateIds: ['lu'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen14-1',
    luYearId: 'wen-14',
    jingText: '十有四年春，王正月，公至自晋。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin'],
    placeIds: [],
    personIds: ['lu-wen'],
  },
  {
    id: 'ev-wen16-1',
    luYearId: 'wen-16',
    jingText: '十有六年春，季孙行父会齐侯于阳穀，齐侯弗及盟。',
    category: 'assembly',
    stateIds: ['lu', 'qi'],
    placeIds: ['yanggu'],
    personIds: [],
  },
  {
    id: 'ev-wen17-1',
    luYearId: 'wen-17',
    jingText: '十有七年春，晋人、卫人、陈人、郑人伐宋。',
    category: 'battle',
    stateIds: ['jin', 'wei', 'chen', 'zheng', 'song'],
    placeIds: [],
    personIds: [],
  },
  {
    id: 'ev-wen18-1',
    luYearId: 'wen-18',
    jingText: '十有八年春，王二月丁丑，公薨于台下。',
    category: 'succession',
    stateIds: ['lu'],
    placeIds: [],
    personIds: ['lu-wen'],
    zuoComment: '冬有子卒、立宣公等，经用「子卒」讳文，此取春条公薨。',
  },
]

for (const spec of wenAdd) {
  if (yearCovered(spec.luYearId) && spec.luYearId !== 'wen-4') continue
  if (spec.luYearId === 'wen-4') {
    const hasJiang = events.some((e) => e.id === 'ev-wen4-2')
    if (hasJiang) continue
  }
  if (events.some((e) => e.id === spec.id)) continue
  const n = spec.luYearId.split('-')[1]
  pushEvent({
    id: spec.id,
    luYearId: spec.luYearId,
    jingText: spec.jingText,
    category: spec.category,
    stateIds: spec.stateIds,
    placeIds: spec.placeIds ?? [],
    personIds: spec.personIds ?? [],
    sourceType: 'jing',
    sourceRef: `《春秋》文公${n}年`,
    certainty: 'high',
    ...(spec.zuoComment ? { zuoComment: spec.zuoComment } : {}),
    ...(spec.territoryChanges ? { territoryChanges: spec.territoryChanges } : {}),
  })
}

// ═══ 宣公 ═══
const xuanAdd = [
  ['ev-xuan1-1', 'xuan-1', '元年春王正月，公即位。', 'succession', ['lu'], [], ['lu-xuan']],
  [
    'ev-xuan3-1',
    'xuan-3',
    '三年春王正月，郊牛之口伤，改卜牛，牛死，乃不郊，犹三望。',
    'other',
    ['lu'],
    [],
    [],
  ],
  [
    'ev-xuan4-1',
    'xuan-4',
    '四年春王正月，公及齐侯平莒及郯。',
    'assembly',
    ['lu', 'qi'],
    [],
    ['lu-xuan'],
  ],
  [
    'ev-xuan5-1',
    'xuan-5',
    '五年春，公如齐。夏，公至自齐。',
    'diplomatic',
    ['lu', 'qi'],
    [],
    ['lu-xuan'],
  ],
  [
    'ev-xuan6-1',
    'xuan-6',
    '六年春，晋赵盾、孙免侵陈。',
    'battle',
    ['jin', 'chen'],
    [],
    ['zhao-dun'],
  ],
  [
    'ev-xuan7-1',
    'xuan-7',
    '七年春，公如齐。',
    'diplomatic',
    ['lu', 'qi'],
    [],
    ['lu-xuan'],
  ],
  [
    'ev-xuan8-1',
    'xuan-8',
    '八年春，公至自会。',
    'assembly',
    ['lu'],
    [],
    ['lu-xuan'],
  ],
  ['ev-xuan9-1', 'xuan-9', '九年春王正月。', 'other', ['lu'], [], []],
  [
    'ev-xuan10-1',
    'xuan-10',
    '十年春，公如齐。至。夏，齐人归我济西田。',
    'diplomatic',
    ['lu', 'qi'],
    [],
    ['lu-xuan'],
  ],
  [
    'ev-xuan11-1',
    'xuan-11',
    '十有一年春王三月，公至自晋。',
    'diplomatic',
    ['lu', 'jin'],
    [],
    ['lu-xuan'],
  ],
  [
    'ev-xuan13-1',
    'xuan-13',
    '十有三年春，晋杀其大夫赵同、赵括。',
    'succession',
    ['jin'],
    [],
    [],
  ],
  [
    'ev-xuan14-1',
    'xuan-14',
    '十有四年春，晋杀其大夫先縠。',
    'succession',
    ['jin'],
    [],
    [],
  ],
  [
    'ev-xuan16-1',
    'xuan-16',
    '十有六年春王正月，晋人灭赤狄甲氏及留吁。',
    'battle',
    ['jin'],
    [],
    [],
  ],
  [
    'ev-xuan17-1',
    'xuan-17',
    '十有七年春王正月，庚子，许男锡我卒。',
    'succession',
    [],
    ['xu'],
    [],
  ],
  [
    'ev-xuan18-1',
    'xuan-18',
    '十有八年春，归父还自晋。',
    'diplomatic',
    ['lu', 'jin'],
    [],
    [],
  ],
]

for (const row of xuanAdd) {
  const [id, ly, jt, cat, states, places, people] = row
  if (yearCovered(ly)) continue
  if (events.some((e) => e.id === id)) continue
  const n = ly.split('-')[1]
  pushEvent({
    id,
    luYearId: ly,
    jingText: jt,
    category: cat,
    stateIds: states,
    placeIds: places ?? [],
    personIds: people ?? [],
    sourceType: 'jing',
    sourceRef: `《春秋》宣公${n}年`,
    certainty: 'high',
  })
}

// ═══ 成公 ═══
const chengAdd = [
  ['ev-cheng1-1', 'cheng-1', '元年春王正月，公即位。', 'succession', ['lu'], [], ['lu-cheng']],
  [
    'ev-cheng3-1',
    'cheng-3',
    '三年春王正月，公会晋侯、宋公、卫侯、曹伯伐郑。',
    'battle',
    ['lu', 'jin', 'song', 'wei', 'zheng', 'cao'],
    [],
    ['lu-cheng'],
    '诸侯次于伯牛讨郑贰楚（左传）；此后汶阳棘田见传中。',
  ],
  [
    'ev-cheng4-1',
    'cheng-4',
    '四年春，宋公使华元来聘。',
    'diplomatic',
    ['lu', 'song'],
    [],
    [],
  ],
  ['ev-cheng5-1', 'cheng-5', '五年春王正月，杞叔姬卒。', 'succession', ['lu'], [], []],
  [
    'ev-cheng6-1',
    'cheng-6',
    '六年春王正月，公至自会。',
    'assembly',
    ['lu'],
    [],
    ['lu-cheng'],
  ],
  [
    'ev-cheng7-1',
    'cheng-7',
    '七年春王正月，鼷鼠食郊牛，改卜牛。鼷鼠又食其角，乃免牛。',
    'other',
    ['lu'],
    [],
    [],
  ],
  ['ev-cheng9-1', 'cheng-9', '九年春王正月。', 'other', ['lu'], [], []],
  [
    'ev-cheng10-1',
    'cheng-10',
    '十年春，公会晋侯、宋公、卫侯、曹伯、莒子、邾子、滕子、薛伯、杞伯、小邾子、齐世子光会吴于柤。',
    'assembly',
    ['lu', 'jin', 'song', 'wei', 'cao', 'wu'],
    [],
    ['lu-cheng'],
  ],
  [
    'ev-cheng11-1',
    'cheng-11',
    '十有一年春王三月，公至自晋。',
    'diplomatic',
    ['lu', 'jin'],
    [],
    ['lu-cheng'],
  ],
  ['ev-cheng12-1', 'cheng-12', '十有二年春，葬许灵公。', 'succession', [], ['xu'], []],
  [
    'ev-cheng13-1',
    'cheng-13',
    '十有三年春，晋侯使郤锜来乞师。',
    'diplomatic',
    ['jin', 'lu'],
    [],
    [],
  ],
  ['ev-cheng14-1', 'cheng-14', '十有四年春王正月。', 'other', ['lu'], [], []],
  [
    'ev-cheng15-1',
    'cheng-15',
    '十有五年春王二月，葬卫定公。',
    'succession',
    ['wei'],
    [],
    [],
  ],
  [
    'ev-cheng17-1',
    'cheng-17',
    '十有七年春，卫北宫括帅师侵郑。',
    'battle',
    ['wei', 'zheng'],
    [],
    [],
  ],
  ['ev-cheng18-1', 'cheng-18', '十有八年春王正月。', 'other', ['lu'], [], []],
]

for (const row of chengAdd) {
  const [id, ly, jt, cat, states, pla, peop, zuo] = row
  if (yearCovered(ly)) continue
  if (events.some((e) => e.id === id)) continue
  const n = ly.split('-')[1]
  pushEvent({
    id,
    luYearId: ly,
    jingText: jt,
    category: cat,
    stateIds: states,
    placeIds: pla ?? [],
    personIds: peop ?? [],
    sourceType: 'jing',
    sourceRef: `《春秋》成公${n}年`,
    certainty: 'high',
    ...(zuo ? { zuoComment: zuo } : {}),
  })
}

// dedupe by id
const seenId = new Set()
events = events.filter((e) => {
  if (seenId.has(e.id)) return false
  seenId.add(e.id)
  return true
})

// ═══ 外交 ═══
function relById(id) {
  return relations.find((r) => r.id === id)
}

const rJc = relById('rel-jin-chu-enemy-xi')
if (rJc) {
  rJc.activeLuYears = sortLuYears([
    ...rJc.activeLuYears,
    ...span('wen', 1, 18),
    ...span('xuan', 1, 18),
    ...span('cheng', 1, 18),
  ])
}

const rJl = relById('rel-jin-lu-ally-xi')
if (rJl) {
  rJl.activeLuYears = sortLuYears([
    ...rJl.activeLuYears,
    ...span('wen', 1, 18),
    ...span('xuan', 1, 18),
    ...span('cheng', 1, 18),
  ])
}

const rCJ = relById('rel-chu-jiang-enemy-xi')
if (rCJ) {
  rCJ.activeLuYears = sortLuYears([...span('xi', 12, 25), ...span('wen', 1, 3)])
  rCJ.sourceRef = '《春秋》文公四年：秋，楚人灭江。灭前江国与楚相持。'
}

if (!relById('rel-lu-qi-mixed-wxc')) {
  relations.push({
    id: 'rel-lu-qi-mixed-wxc',
    fromId: 'lu',
    toId: 'qi',
    type: 'enemy',
    activeLuYears: sortLuYears([...span('wen', 14, 18), ...span('xuan', 1, 8)]),
    sourceType: 'jing',
    sourceRef:
      '《春秋》文公十四年邾伐我南鄙、齐侯侵我西鄙等事，齐鲁时和时争。',
    certainty: 'medium',
  })
}

if (!relById('rel-jin-qin-enemy-wen')) {
  relations.push({
    id: 'rel-jin-qin-enemy-wen',
    fromId: 'jin',
    toId: 'qin',
    type: 'enemy',
    activeLuYears: sortLuYears([...span('wen', 2, 15)]),
    sourceType: 'jing',
    sourceRef: '《春秋》《左传》文公世：河曲、彭衙、河曲再举，秦晋交兵频仍。',
    certainty: 'high',
  })
}

write('places.json', places)
write('persons.json', persons)
write('relations.json', relations)
write('events.json', events)
