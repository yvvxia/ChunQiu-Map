/**
 * 庄公与闵公时期数据注入脚本
 * 执行方式：node scripts/inject-zhuang-min.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, '../src/data/sample')

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA, file), 'utf-8'))
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA, file), JSON.stringify(data, null, 2) + '\n', 'utf-8')
  console.log(`✓ ${file} 写入完毕 (${data.length} 条)`)
}

/* ================================================================
   1. STATES — 新增：纪国、邢国、遂国
   ================================================================ */
const states = readJSON('states.json')
const newStates = [
  {
    id: 'ji2',
    name: '纪',
    rank: 'hou',
    founder: '太公之裔（说法存疑）',
    clan: '姜',
    capitalId: 'jiying',
    color: '#9B7B2A',
    certainty: 'high',
    territory: [[[118.4, 37.4], [119.4, 37.4], [119.4, 36.3], [118.4, 36.3], [118.4, 37.4]]]
  },
  {
    id: 'xing',
    name: '邢',
    rank: 'hou',
    founder: '周公之后',
    clan: '姬',
    capitalId: 'xingguo',
    color: '#6B5B95',
    certainty: 'high',
    territory: [[[113.8, 37.5], [115.0, 37.5], [115.0, 36.6], [113.8, 36.6], [113.8, 37.5]]]
  },
  {
    id: 'sui',
    name: '遂',
    rank: 'nan',
    founder: '太昊后裔（风姓）',
    clan: '风',
    capitalId: 'suidu',
    color: '#7B8B6B',
    certainty: 'medium',
    territory: [[[116.4, 36.2], [117.2, 36.2], [117.2, 35.6], [116.4, 35.6], [116.4, 36.2]]]
  }
]

const existingStateIds = new Set(states.map(s => s.id))
const statesToAdd = newStates.filter(s => !existingStateIds.has(s.id))
if (statesToAdd.length) writeJSON('states.json', [...states, ...statesToAdd])
else console.log('states.json — 无新增')

/* ================================================================
   2. PLACES — 新增各会盟地、战地、都城
   ================================================================ */
const places = readJSON('places.json')
const newPlaces = [
  { id: 'jiying',    name: '纪城（纪都）',     stateId: 'ji2',  modernRef: '今山东寿光南纪台村一带',  coords: [118.70, 36.78], certainty: 'medium' },
  { id: 'xingguo',   name: '邢都',             stateId: 'xing', modernRef: '今河北邢台市区',          coords: [114.50, 37.07], certainty: 'medium' },
  { id: 'suidu',     name: '遂国都城',          stateId: 'sui',  modernRef: '今山东宁阳东北（约）',    coords: [116.78, 35.72], certainty: 'medium' },
  { id: 'ke',        name: '柯（鲁齐会盟地）',  stateId: 'qi',   modernRef: '今山东阳谷东北（约）',    coords: [115.84, 36.10], certainty: 'medium' },
  { id: 'beixing',   name: '北杏（会盟地）',    stateId: null,   modernRef: '今山东东阿南（约）',      coords: [116.18, 36.28], certainty: 'medium' },
  { id: 'juan',      name: '鄄（齐霸会盟地）',  stateId: null,   modernRef: '今山东鄄城北（约）',      coords: [115.53, 35.62], certainty: 'medium' },
  { id: 'you',       name: '幽（会盟地）',       stateId: null,   modernRef: '今山东聊城西南（约）',    coords: [115.73, 35.90], certainty: 'low'    },
  { id: 'kan',       name: '阚（鲁齐会地）',    stateId: 'lu',   modernRef: '今山东汶上西北（约）',    coords: [116.22, 35.72], certainty: 'medium' },
  { id: 'qianshi',   name: '乾时（战地）',       stateId: 'qi',   modernRef: '今山东桓台南（约）',      coords: [117.96, 36.96], certainty: 'medium' },
  { id: 'chuqiu',    name: '楚丘（卫迁都地）',  stateId: 'wei',  modernRef: '今河南滑县东（约）',      coords: [115.08, 35.57], certainty: 'medium' },
  { id: 'yanggu',    name: '阳谷（会盟地）',    stateId: 'qi',   modernRef: '今山东阳谷县',           coords: [115.79, 36.11], certainty: 'medium' },
  { id: 'zhuo',      name: '禚（会猎地）',       stateId: 'qi',   modernRef: '今山东长清南（约）',      coords: [116.74, 36.54], certainty: 'medium' },
  { id: 'yingdi',    name: '嬴（鲁齐会地）',    stateId: 'qi',   modernRef: '今山东莱芜西北（约）',    coords: [117.60, 36.32], certainty: 'medium' },
  { id: 'gao2',      name: '高（宋地）',          stateId: 'song', modernRef: '今河南杞县附近（约）',   coords: [114.85, 34.57], certainty: 'low'    },
  { id: 'sui2',      name: '随（汉北小国都）',   stateId: null,   modernRef: '今湖北随州（约）',        coords: [113.37, 31.72], certainty: 'medium' }
]

const existingPlaceIds = new Set(places.map(p => p.id))
const placesToAdd = newPlaces.filter(p => !existingPlaceIds.has(p.id))
if (placesToAdd.length) writeJSON('places.json', [...places, ...placesToAdd])
else console.log('places.json — 无新增')

/* ================================================================
   3. PERSONS — 扩充 activeLuYears，新增庄闵时期人物
   ================================================================ */
const persons = readJSON('persons.json')

function makeAllZhuangYears() {
  return Array.from({length:32},(_,i)=>`zhuang-${i+1}`)
}
function makeAllMinYears() { return ['min-1','min-2'] }

const personUpdates = {
  'lu-zhuang': makeAllZhuangYears(),
  'lu-min':    makeAllMinYears(),
  'qi-huangong': [
    'huan-6',
    ...Array.from({length:32},(_,i)=>`zhuang-${i+1}`),
    'min-1','min-2',
    'xi-1','xi-28'
  ],
  'guan-zhong': [
    ...Array.from({length:32},(_,i)=>`zhuang-${i+1}`),
    'min-1','min-2',
    'xi-1','xi-2','xi-3','xi-4','xi-5'
  ],
  'qi-xiangong': [
    'huan-14','huan-15','huan-16','huan-17','huan-18',
    'zhuang-1','zhuang-2','zhuang-3','zhuang-4','zhuang-5',
    'zhuang-6','zhuang-7','zhuang-8'
  ]
}
const newPersons = [
  {
    id: 'cao-mo', name: '曹沫', stateId: 'lu', role: '将',
    desc: '鲁庄公时将领。庄公十三年，柯之盟上以匕首劫持齐桓公，迫其归还侵占鲁地，为春秋著名刺客外交事件之一。',
    activeLuYears: ['zhuang-9','zhuang-10','zhuang-11','zhuang-12','zhuang-13'],
    sourceRef: '《左传》庄公十三年',
    certainty: 'high'
  },
  {
    id: 'song-mingong', name: '宋闵公捷', stateId: 'song', role: '君',
    desc: '宋国国君，名捷。庄公十二年（682 BCE），被大夫南宫万（宋万）所弑。',
    activeLuYears: ['zhuang-9','zhuang-10','zhuang-11','zhuang-12'],
    sourceRef: '《左传》庄公十二年',
    certainty: 'high'
  },
  {
    id: 'song-wan', name: '南宫万', stateId: 'song', role: '卿',
    desc: '宋国大夫，又称宋万。庄公十二年，弑宋闵公，引发宋国动乱，后出奔陈。',
    activeLuYears: ['zhuang-11','zhuang-12','zhuang-13'],
    sourceRef: '《左传》庄公十二年',
    certainty: 'high'
  },
  {
    id: 'wei-yigong', name: '卫懿公赤', stateId: 'wei', role: '君',
    desc: '卫国国君，名赤，谥懿，嗜好养鹤。闵公二年（660 BCE），狄人伐卫，卫懿公战死，卫国几灭，遗民南渡，齐桓公救之，徙卫于楚丘。',
    activeLuYears: ['zhuang-28','zhuang-29','zhuang-30','zhuang-31','zhuang-32','min-1','min-2'],
    sourceRef: '《左传》闵公二年',
    certainty: 'high'
  },
  {
    id: 'wen-jiang', name: '文姜', stateId: 'qi', role: '夫人',
    desc: '鲁桓公夫人，齐僖公之女，与兄齐襄公相交，桓公为其所害。庄公时多次与齐侯会于禚、防等地，《春秋》屡书之以示非礼。',
    activeLuYears: [
      'huan-3','huan-4','huan-5','huan-6','huan-7','huan-8',
      'huan-9','huan-10','huan-11','huan-12','huan-13','huan-14',
      'huan-15','huan-16','huan-17','huan-18',
      'zhuang-1','zhuang-2','zhuang-3','zhuang-4','zhuang-5',
      'zhuang-6','zhuang-7'
    ],
    sourceRef: '《春秋》《左传》桓庄诸年',
    certainty: 'high'
  },
  {
    id: 'qi-huan-xiaobo', name: '公子小白', stateId: 'qi', role: '公子',
    desc: '齐桓公小白，齐僖公幼子，后成为齐桓公。庄公九年与公子纠争位，抢先入国，即位为桓公，开创齐霸。（此条目专指即位前的公子小白身份）',
    activeLuYears: ['huan-18','zhuang-1','zhuang-2','zhuang-3','zhuang-4','zhuang-5','zhuang-6','zhuang-7','zhuang-8','zhuang-9'],
    sourceRef: '《左传》庄公九年',
    certainty: 'high'
  }
]

const existingPersonIds = new Set(persons.map(p => p.id))
const updatedPersons = persons.map(p => {
  if (personUpdates[p.id]) {
    return { ...p, activeLuYears: personUpdates[p.id] }
  }
  return p
})
const personsToAdd = newPersons.filter(p => !existingPersonIds.has(p.id))
writeJSON('persons.json', [...updatedPersons, ...personsToAdd])

/* ================================================================
   4. EVENTS — 注入庄公全32年 + 闵公2年事件
   ================================================================ */
const events = readJSON('events.json')

// 修正 ev-zhuang13-1 的 placeIds（北杏不是临淄）
const zhuang13fix = events.find(e => e.id === 'ev-zhuang13-1')
if (zhuang13fix && zhuang13fix.placeIds.includes('linzi')) {
  zhuang13fix.placeIds = ['beixing']
  console.log('✓ ev-zhuang13-1 placeIds 修正为 beixing')
}

const existingEventIds = new Set(events.map(e => e.id))

const newEvents = [
  /* ─── 庄公二年（692 BCE）──────────────────────── */
  {
    id: 'ev-zhuang2-1',
    luYearId: 'zhuang-2',
    jingText: '夫人姜氏会齐侯于禚。',
    zuoComment: '书，非礼也。凡诸侯之女，归宁曰来，出曰来归，夫人不书姜氏，非礼也。',
    category: 'diplomacy',
    stateIds: ['lu','qi'],
    placeIds: ['zhuo'],
    personIds: ['wen-jiang','qi-xiangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二年',
    certainty: 'high'
  },
  {
    id: 'ev-zhuang2-2',
    luYearId: 'zhuang-2',
    jingText: '冬，公子庆父帅师伐於馀丘。',
    category: 'battle',
    stateIds: ['lu'],
    placeIds: [],
    personIds: [],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二年',
    certainty: 'high'
  },
  /* ─── 庄公三年（691 BCE）──────────────────────── */
  {
    id: 'ev-zhuang3-1',
    luYearId: 'zhuang-3',
    jingText: '公会齐侯于嬴。',
    category: 'assembly',
    stateIds: ['lu','qi'],
    placeIds: ['yingdi'],
    personIds: ['lu-zhuang','qi-xiangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公三年',
    certainty: 'high'
  },
  {
    id: 'ev-zhuang3-2',
    luYearId: 'zhuang-3',
    jingText: '纪季以酅入于齐。',
    zuoComment: '纪于是乎始判。秋，公及齐侯、纪侯盟于黄。冬，纪侯来朝。',
    category: 'diplomacy',
    stateIds: ['ji2','qi'],
    placeIds: ['jiying'],
    personIds: [],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公三年',
    certainty: 'high',
    territoryChanges: [
      { placeId: 'jiying', fromStateId: 'ji2', toStateId: 'qi', changeType: 'cede' }
    ]
  },
  /* ─── 庄公四年（690 BCE）──────────────────────── */
  {
    id: 'ev-zhuang4-1',
    luYearId: 'zhuang-4',
    jingText: '纪侯大去其国。',
    zuoComment: '纪侯不能下齐，将去国，违违哉，将焉入？《诗》曰「维其深矣」，纪于是乎亡。',
    category: 'succession',
    stateIds: ['ji2','qi'],
    placeIds: ['jiying'],
    personIds: [],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公四年',
    certainty: 'high'
  },
  {
    id: 'ev-zhuang4-2',
    luYearId: 'zhuang-4',
    jingText: '夏，楚人伐申，过陉，使申侯如郑，曰：吾将伐郑，以救申，尔其无重我也。',
    category: 'battle',
    stateIds: ['chu'],
    placeIds: [],
    personIds: [],
    sourceType: 'zuo',
    sourceRef: '《左传》庄公四年',
    certainty: 'medium'
  },
  /* ─── 庄公五年（689 BCE）──────────────────────── */
  {
    id: 'ev-zhuang5-1',
    luYearId: 'zhuang-5',
    jingText: '公会齐人、宋人、陈人、蔡人伐卫。',
    category: 'battle',
    stateIds: ['lu','qi','song','chen','cai','wei'],
    placeIds: [],
    personIds: ['lu-zhuang','qi-xiangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公五年',
    certainty: 'high'
  },
  /* ─── 庄公六年（688 BCE）──────────────────────── */
  {
    id: 'ev-zhuang6-1',
    luYearId: 'zhuang-6',
    jingText: '秋，公至自伐卫。',
    category: 'other',
    stateIds: ['lu'],
    placeIds: ['qufu'],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公六年',
    certainty: 'high'
  },
  {
    id: 'ev-zhuang6-2',
    luYearId: 'zhuang-6',
    jingText: '冬，齐人来归卫俘。',
    category: 'diplomacy',
    stateIds: ['qi','wei'],
    placeIds: [],
    personIds: [],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公六年',
    certainty: 'high'
  },
  /* ─── 庄公七年（687 BCE）──────────────────────── */
  {
    id: 'ev-zhuang7-1',
    luYearId: 'zhuang-7',
    jingText: '夫人姜氏会齐侯于防。',
    category: 'diplomacy',
    stateIds: ['lu','qi'],
    placeIds: ['fang'],
    personIds: ['wen-jiang','qi-xiangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公七年',
    certainty: 'high'
  },
  /* ─── 庄公八年（686 BCE）──────────────────────── */
  {
    id: 'ev-zhuang8-1',
    luYearId: 'zhuang-8',
    jingText: '冬十有二月，齐无知弑其君诸儿。',
    zuoComment: '齐侯使连称、管至父戍葵丘。既而与无知谋，刺诸儿，无知立。公孙无知弑齐侯诸儿。无知，僖公之孙也。',
    category: 'succession',
    stateIds: ['qi'],
    placeIds: ['linzi'],
    personIds: ['qi-xiangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公八年',
    certainty: 'high'
  },
  /* ─── 庄公九年（685 BCE）──────────────────────── */
  {
    id: 'ev-zhuang9-1',
    luYearId: 'zhuang-9',
    jingText: '夏，公伐齐纳子纠。',
    zuoComment: '鲁欲纳公子纠，管仲射小白中钩，小白佯死，先入齐；鲁纳纠，迟之，齐已受小白而立之。',
    category: 'battle',
    stateIds: ['lu','qi'],
    placeIds: [],
    personIds: ['lu-zhuang','qi-huangong','guan-zhong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公九年',
    certainty: 'high'
  },
  {
    id: 'ev-zhuang9-2',
    luYearId: 'zhuang-9',
    jingText: '秋，师败绩于乾时。',
    zuoComment: '及齐师战于乾时，我师败绩。齐人取子纠杀之，召忽死之，管仲请囚，鲍叔牙请而免之，相桓公。',
    category: 'battle',
    stateIds: ['lu','qi'],
    placeIds: ['qianshi'],
    personIds: ['lu-zhuang','qi-huangong','guan-zhong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公九年',
    certainty: 'high'
  },
  /* ─── 庄公十年 已有 ev-zhuang10-1（长勺之战）─── */
  /* ─── 庄公十一年（683 BCE）─────────────────────── */
  {
    id: 'ev-zhuang11-1',
    luYearId: 'zhuang-11',
    jingText: '秋，宋大水。冬，荆入郑。',
    zuoComment: '荆，楚也。楚伐郑，为楚成王之父楚文王所发。',
    category: 'battle',
    stateIds: ['chu','zheng'],
    placeIds: ['xinzheng'],
    personIds: [],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十一年',
    certainty: 'high'
  },
  /* ─── 庄公十二年（682 BCE）─────────────────────── */
  {
    id: 'ev-zhuang12-1',
    luYearId: 'zhuang-12',
    jingText: '秋七月，宋万弑其君捷，及其大夫仇牧。',
    zuoComment: '宋万者，宋庄公之臣，尝被俘于鲁。闵公讥之，万怒杀闵公，立子游，宋人攻之，万奔陈。',
    category: 'succession',
    stateIds: ['song'],
    placeIds: ['shangqiu'],
    personIds: ['song-mingong','song-wan'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十二年',
    certainty: 'high'
  },
  /* ─── 庄公十三年 已有 ev-zhuang13-1（北杏会盟）── */
  {
    id: 'ev-zhuang13-2',
    luYearId: 'zhuang-13',
    jingText: '公会齐侯于柯。',
    zuoComment: '曹沫以匕首劫桓公于坛上，求归侵鲁之地，桓公许之。管仲曰：「不可以失信」，卒归鲁之侵地。',
    category: 'assembly',
    stateIds: ['lu','qi'],
    placeIds: ['ke'],
    personIds: ['lu-zhuang','qi-huangong','guan-zhong','cao-mo'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十三年',
    certainty: 'high'
  },
  /* ─── 庄公十四年（680 BCE）─────────────────────── */
  {
    id: 'ev-zhuang14-1',
    luYearId: 'zhuang-14',
    jingText: '诸侯为宋平，宋请见，会于阳谷。',
    zuoComment: '单伯会伐宋，列国应齐桓公之盟，合攻宋以责其不朝。宋请会，平之。',
    category: 'battle',
    stateIds: ['qi','lu','song','wei','zheng','chen','cai'],
    placeIds: ['yanggu'],
    personIds: ['qi-huangong','guan-zhong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十四年',
    certainty: 'medium'
  },
  /* ─── 庄公十五年（679 BCE）─────────────────────── */
  {
    id: 'ev-zhuang15-1',
    luYearId: 'zhuang-15',
    jingText: '春，诸侯会于鄄。',
    zuoComment: '诸侯会于鄄，宋公、陈侯、卫侯、郑伯来，齐桓公始霸。',
    category: 'assembly',
    stateIds: ['qi','lu','song','wei','zheng','chen'],
    placeIds: ['juan'],
    personIds: ['qi-huangong','guan-zhong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十五年',
    certainty: 'high'
  },
  /* ─── 庄公十六年（678 BCE）─────────────────────── */
  {
    id: 'ev-zhuang16-1',
    luYearId: 'zhuang-16',
    jingText: '春，王使召伯来赐公命。会于幽，宋人、齐人、卫人会于幽。',
    category: 'assembly',
    stateIds: ['zhou','qi','lu','song','wei'],
    placeIds: ['you'],
    personIds: ['qi-huangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十六年',
    certainty: 'high'
  },
  /* ─── 庄公十七年（677 BCE）─────────────────────── */
  {
    id: 'ev-zhuang17-1',
    luYearId: 'zhuang-17',
    jingText: '夏，齐人歼于遂。',
    zuoComment: '遂，风姓小国，亲于鲁而疏于齐。齐人乘盟会之机，歼其君臣，遂国遂亡。',
    category: 'battle',
    stateIds: ['qi','sui'],
    placeIds: ['suidu'],
    personIds: ['qi-huangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十七年',
    certainty: 'high',
    territoryChanges: [
      { placeId: 'suidu', fromStateId: 'sui', toStateId: 'qi', changeType: 'annex' }
    ]
  },
  /* ─── 庄公十八年（676 BCE）─────────────────────── */
  {
    id: 'ev-zhuang18-1',
    luYearId: 'zhuang-18',
    jingText: '秋，有蜮。冬，公追戎于济西。',
    category: 'battle',
    stateIds: ['lu'],
    placeIds: [],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十八年',
    certainty: 'high'
  },
  /* ─── 庄公十九年（675 BCE）─────────────────────── */
  {
    id: 'ev-zhuang19-1',
    luYearId: 'zhuang-19',
    jingText: '春，诸侯伐郑。宋人、齐人、邾人伐郑。',
    category: 'battle',
    stateIds: ['qi','song','zheng'],
    placeIds: ['xinzheng'],
    personIds: ['qi-huangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十九年',
    certainty: 'high'
  },
  /* ─── 庄公二十年（674 BCE）─────────────────────── */
  {
    id: 'ev-zhuang20-1',
    luYearId: 'zhuang-20',
    jingText: '夏，齐大夫来聘。冬，公及齐人狩于禚。',
    category: 'diplomacy',
    stateIds: ['lu','qi'],
    placeIds: ['zhuo'],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十年',
    certainty: 'high'
  },
  /* ─── 庄公二十一年（673 BCE）─────────────────────── */
  {
    id: 'ev-zhuang21-1',
    luYearId: 'zhuang-21',
    jingText: '夏，公如齐观社。',
    zuoComment: '非礼也，曹刿谏曰：「女贽，不过榛栗枣修；以告虔也。男贽，大者玉帛，小者禽鸟，以章物也。」',
    category: 'diplomacy',
    stateIds: ['lu','qi'],
    placeIds: ['linzi'],
    personIds: ['lu-zhuang','wen-jiang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十一年',
    certainty: 'high'
  },
  /* ─── 庄公二十二年（672 BCE）─────────────────────── */
  {
    id: 'ev-zhuang22-1',
    luYearId: 'zhuang-22',
    jingText: '公如齐纳币。',
    category: 'ritual',
    stateIds: ['lu','qi'],
    placeIds: ['linzi'],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十二年',
    certainty: 'high'
  },
  /* ─── 庄公二十三年 已有 ev-zhuang23-1 ──────────── */
  /* ─── 庄公二十四年（670 BCE）─────────────────────── */
  {
    id: 'ev-zhuang24-1',
    luYearId: 'zhuang-24',
    jingText: '夏，公如齐逆女。秋，哀姜至。公子结媵陈人之妇于鄄，遂及郕人、许人盟。',
    zuoComment: '哀姜，齐桓公之女（说法），归鲁，至于秋至国。娣娣从行，过乘丘，被攻。',
    category: 'ritual',
    stateIds: ['lu','qi'],
    placeIds: ['linzi','juan'],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十四年',
    certainty: 'high'
  },
  /* ─── 庄公二十五年（669 BCE）─────────────────────── */
  {
    id: 'ev-zhuang25-1',
    luYearId: 'zhuang-25',
    jingText: '公会齐侯、宋公、陈侯、卫侯、郑伯、许男、滑伯、滕子于幽盟。',
    category: 'assembly',
    stateIds: ['lu','qi','song','chen','wei','zheng'],
    placeIds: ['you'],
    personIds: ['lu-zhuang','qi-huangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十五年',
    certainty: 'medium'
  },
  /* ─── 庄公二十六年（668 BCE）─────────────────────── */
  {
    id: 'ev-zhuang26-1',
    luYearId: 'zhuang-26',
    jingText: '公会宋人、齐人伐徐。',
    category: 'battle',
    stateIds: ['lu','qi','song'],
    placeIds: [],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十六年',
    certainty: 'high'
  },
  /* ─── 庄公二十七年（667 BCE）─────────────────────── */
  {
    id: 'ev-zhuang27-1',
    luYearId: 'zhuang-27',
    jingText: '冬，杞伯来朝。公会齐侯、宋公、陈侯、郑伯盟于幽。',
    category: 'assembly',
    stateIds: ['lu','qi','song','chen','zheng'],
    placeIds: ['you'],
    personIds: ['lu-zhuang','qi-huangong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十七年',
    certainty: 'high'
  },
  /* ─── 庄公二十八年（666 BCE）─────────────────────── */
  {
    id: 'ev-zhuang28-1',
    luYearId: 'zhuang-28',
    jingText: '春，王三月，甲寅，齐人伐卫。',
    category: 'battle',
    stateIds: ['qi','wei'],
    placeIds: ['zhongqiu'],
    personIds: ['qi-huangong','wei-yigong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十八年',
    certainty: 'high'
  },
  /* ─── 庄公二十九年（665 BCE）─────────────────────── */
  {
    id: 'ev-zhuang29-1',
    luYearId: 'zhuang-29',
    jingText: '春，新延厩。',
    category: 'other',
    stateIds: ['lu'],
    placeIds: ['qufu'],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十九年',
    certainty: 'high'
  },
  /* ─── 庄公三十年（664 BCE）─────────────────────── */
  {
    id: 'ev-zhuang30-1',
    luYearId: 'zhuang-30',
    jingText: '夏，齐人伐山戎。传曰：山戎伐燕，燕告急于齐，齐桓公救燕。',
    zuoComment: '山戎伐燕，燕告急于齐。齐侯以诸侯之师伐山戎而还，燕庄公送齐侯出境。管仲曰：「诸侯之礼，不出境。」桓公乃割燕所至之地予燕。',
    category: 'battle',
    stateIds: ['qi','yan'],
    placeIds: ['ji'],
    personIds: ['qi-huangong','guan-zhong'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公三十年',
    certainty: 'high'
  },
  /* ─── 庄公三十一年（663 BCE）─────────────────────── */
  {
    id: 'ev-zhuang31-1',
    luYearId: 'zhuang-31',
    jingText: '夏，筑台于郎。冬，不雨。',
    zuoComment: '筑台于郎，非礼也，以示奢。左传曰：「作台无义，非礼也。」',
    category: 'other',
    stateIds: ['lu'],
    placeIds: ['lang'],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公三十一年',
    certainty: 'high'
  },
  /* ─── 庄公三十二年（662 BCE）─────────────────────── */
  {
    id: 'ev-zhuang32-1',
    luYearId: 'zhuang-32',
    jingText: '秋七月癸巳，公薨于路寝。',
    zuoComment: '庄公疾，将死，问后于叔牙。叔牙曰：「庆父材。」问于季友，友曰：「以死奉班，若不获命，请以死继之。」乃使僖叔奉子般以即位。',
    category: 'succession',
    stateIds: ['lu'],
    placeIds: ['qufu'],
    personIds: ['lu-zhuang'],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公三十二年',
    certainty: 'high'
  },
  /* ─── 闵公元年 已有 ev-min1-1 ───────────────────── */
  {
    id: 'ev-min1-2',
    luYearId: 'min-1',
    jingText: '冬，狄伐邢。',
    zuoComment: '狄人伐邢，管仲言于桓公曰：「戎狄豺狼，不可厌也；诸夏亲昵，不可弃也。宴安鸩毒，不可怀也。《诗》云：「岂不怀归，畏此简书。」齐侯不果救邢。',
    category: 'battle',
    stateIds: ['xing'],
    placeIds: ['xingguo'],
    personIds: [],
    sourceType: 'jing',
    sourceRef: '《春秋》闵公元年',
    certainty: 'high'
  },
  /* ─── 闵公二年（660 BCE）─────────────────────────── */
  {
    id: 'ev-min2-1',
    luYearId: 'min-2',
    jingText: '冬十有二月，狄入卫。卫侯毁灭。',
    zuoComment: '狄人伐卫，卫懿公好鹤，鹤有乘轩者。将战，国人受甲者皆曰：「使鹤，鹤实有禄位，余焉能战？」与狄人战于荧泽，卫师败绩，卫懿公死之。',
    category: 'battle',
    stateIds: ['wei'],
    placeIds: ['zhongqiu'],
    personIds: ['wei-yigong'],
    sourceType: 'jing',
    sourceRef: '《春秋》闵公二年',
    certainty: 'high'
  },
  {
    id: 'ev-min2-2',
    luYearId: 'min-2',
    jingText: '齐侯、宋公、曹伯城楚丘，而封卫焉。',
    zuoComment: '卫文公即位于楚丘，齐桓公以诸侯之师城楚丘而封之。遗民男女七百有三十人，益之以共、滕之民为五千人，立戴公，乃建卫国于楚丘。',
    category: 'diplomacy',
    stateIds: ['qi','song','wei','lu'],
    placeIds: ['chuqiu'],
    personIds: ['qi-huangong','guan-zhong'],
    sourceType: 'jing',
    sourceRef: '《春秋》闵公二年',
    certainty: 'high',
    territoryChanges: [
      { placeId: 'chuqiu', fromStateId: null, toStateId: 'wei', changeType: 'recover' }
    ]
  }
]

const eventsToAdd = newEvents.filter(e => !existingEventIds.has(e.id))
console.log(`新增事件 ${eventsToAdd.length} 条（已跳过已存在事件）`)
writeJSON('events.json', [...events, ...eventsToAdd])

console.log('\n✅ 庄公与闵公数据注入完成')
