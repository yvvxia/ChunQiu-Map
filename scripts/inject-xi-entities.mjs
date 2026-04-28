/**
 * 僖公时期实体注入：国家、地点、人物
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, '../src/data/sample')

function readJSON(f) { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf-8')) }
function writeJSON(f, d) {
  fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n', 'utf-8')
  console.log(`✓ ${f} (${d.length} 条)`)
}

/* =====================================================================
   1. STATES — 补充僖公时期相关小国
   ===================================================================== */
const states = readJSON('states.json')
const newStates = [
  {
    id: 'jiang',
    name: '江',
    rank: 'hou',
    founder: '伯益之后（嬴姓）',
    clan: '嬴',
    capitalId: 'jiangdu',
    color: '#7A5C8A',
    certainty: 'medium',
    territory: [[[113.5,32.2],[114.5,32.2],[114.5,31.4],[113.5,31.4],[113.5,32.2]]]
  },
  {
    id: 'huang',
    name: '黄',
    rank: 'hou',
    founder: '伯益之后（嬴姓）',
    clan: '嬴',
    capitalId: 'huangdu',
    color: '#A06040',
    certainty: 'medium',
    territory: [[[114.9,31.9],[115.9,31.9],[115.9,31.1],[114.9,31.1],[114.9,31.9]]]
  },
  {
    id: 'hua',
    name: '滑',
    rank: 'bo',
    founder: '姬姓小国',
    clan: '姬',
    capitalId: 'huadu',
    color: '#8080A0',
    certainty: 'medium',
    territory: [[[112.0,34.8],[113.0,34.8],[113.0,34.2],[112.0,34.2],[112.0,34.8]]]
  },
  {
    id: 'xuan',
    name: '弦',
    rank: 'nan',
    founder: '隗姓小国',
    clan: '隗',
    capitalId: 'xuandu',
    color: '#6B9070',
    certainty: 'medium',
    territory: [[[114.0,31.5],[115.0,31.5],[115.0,31.0],[114.0,31.0],[114.0,31.5]]]
  }
]

const existStateIds = new Set(states.map(s => s.id))
const statesToAdd = newStates.filter(s => !existStateIds.has(s.id))
if (statesToAdd.length) writeJSON('states.json', [...states, ...statesToAdd])
else console.log('states.json — 无新增')

/* =====================================================================
   2. PLACES — 补充僖公时期地点
   ===================================================================== */
const places = readJSON('places.json')
const newPlaces = [
  // 国都（新国家）
  { id: 'jiangdu',  name: '江国都城',         stateId: 'jiang', modernRef: '今河南正阳东南（约）', coords: [114.04, 32.00], certainty: 'medium' },
  { id: 'huangdu',  name: '黄国都城',         stateId: 'huang', modernRef: '今河南潢川西北（约）', coords: [115.06, 32.14], certainty: 'medium' },
  { id: 'huadu',    name: '滑国都城（费）',    stateId: 'hua',   modernRef: '今河南偃师东南（约）', coords: [112.70, 34.68], certainty: 'medium' },
  { id: 'xuandu',   name: '弦国都城',         stateId: 'xuan',  modernRef: '今河南潢川西（约）',   coords: [114.72, 32.04], certainty: 'medium' },
  // 会盟地、战地
  { id: 'zhaoling', name: '召陵（齐楚盟地）', stateId: null,    modernRef: '今河南漯河东（约）',   coords: [114.05, 33.57], certainty: 'medium' },
  { id: 'guan',     name: '贯（会盟地）',     stateId: null,    modernRef: '今山东曹县南（约）',   coords: [115.56, 34.83], certainty: 'medium' },
  { id: 'hong',     name: '泓（宋楚战地）',   stateId: null,    modernRef: '今河南柘城北（约）',   coords: [115.32, 34.16], certainty: 'medium' },
  { id: 'sheng',    name: '盂（宋楚会地）',   stateId: null,    modernRef: '今河南睢县东（约）',   coords: [115.13, 34.45], certainty: 'low'    },
  { id: 'lushang',  name: '鹿上（宋楚会地）', stateId: null,    modernRef: '今安徽阜阳西南（约）', coords: [115.70, 32.67], certainty: 'low'    },
  { id: 'wen',      name: '温（晋攻怀公地）', stateId: null,    modernRef: '今河南温县西（约）',   coords: [113.10, 34.92], certainty: 'medium' },
  { id: 'jiantu',   name: '践土（晋霸会盟）', stateId: null,    modernRef: '今河南原阳西南（约）', coords: [113.97, 34.91], certainty: 'medium' },
  { id: 'chengpu',  name: '城濮（晋楚大战）', stateId: null,    modernRef: '今山东鄄城临濮集（约）', coords: [115.53, 35.50], certainty: 'medium' },
  { id: 'xiao',     name: '殽（秦晋大战）',   stateId: null,    modernRef: '今河南洛宁北崤山（约）', coords: [111.55, 34.66], certainty: 'medium' },
  { id: 'caodu',    name: '曹都（曹国都城）', stateId: 'cao',   modernRef: '今山东定陶西南（约）', coords: [115.52, 35.03], certainty: 'medium' },
  { id: 'huanggao', name: '洮（鲁齐会地）',   stateId: null,    modernRef: '今山东鄄城东南（约）', coords: [115.50, 35.37], certainty: 'low'    },
  { id: 'chui2',    name: '垂陇（郑晋会地）', stateId: null,    modernRef: '今河南荥阳东南（约）', coords: [113.53, 34.80], certainty: 'low'    },
  { id: 'yanling',  name: '鄢陵（郑地）',     stateId: 'zheng', modernRef: '今河南鄢陵县（约）',  coords: [114.18, 34.12], certainty: 'medium' },
  { id: 'zhu',      name: '株林（陈地）',     stateId: 'chen',  modernRef: '今河南西华东（约）',  coords: [114.65, 33.77], certainty: 'low'    },
  { id: 'luosheng', name: '雒城（周地）',     stateId: 'zhou',  modernRef: '今河南洛阳附近',      coords: [112.45, 34.68], certainty: 'medium' },
  { id: 'fangcheng',name: '方城（楚北境）',   stateId: 'chu',   modernRef: '今河南方城北楚长城一带', coords: [113.00, 33.25], certainty: 'medium' }
]

const existPlaceIds = new Set(places.map(p => p.id))
const placesToAdd = newPlaces.filter(p => !existPlaceIds.has(p.id))
if (placesToAdd.length) writeJSON('places.json', [...places, ...placesToAdd])
else console.log('places.json — 无新增')

/* =====================================================================
   3. PERSONS — 新增/更新僖公时期人物
   ===================================================================== */
const persons = readJSON('persons.json')

function xiYears(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => `xi-${from + i}`)
}
const ALL_XI = xiYears(1, 33)

// 更新已有人物的 activeLuYears
const personUpdates = {
  'qi-huangong': [
    'huan-6',
    ...Array.from({length:32},(_,i)=>`zhuang-${i+1}`),
    'min-1','min-2',
    ...xiYears(1,9), // 桓公卒于xi-9前后（前643）
    'xi-1','xi-2','xi-3','xi-4','xi-5','xi-6','xi-7','xi-8','xi-9'
  ],
  'guan-zhong': [
    ...Array.from({length:32},(_,i)=>`zhuang-${i+1}`),
    'min-1','min-2',
    'xi-1','xi-2','xi-3','xi-4','xi-5','xi-6','xi-7','xi-8','xi-9'
  ],
  'song-xianggong': [
    'min-1','min-2',
    ...ALL_XI.slice(0, 22) // 宋襄公卒于xi-22（前638）
  ],
  'jin-wengong': [
    ...xiYears(23, 33),
    'wen-1'
  ],
  'qin-mugong': [
    ...xiYears(5, 33),
    'wen-1','wen-2','wen-3','wen-4','wen-5'
  ],
  'chu-chengwang': [
    ...xiYears(1, 33),
    'wen-1'
  ]
}

const newPersons = [
  {
    id: 'lu-xi', name: '申', posthumous: '鲁僖公', stateId: 'lu', role: 'duke',
    desc: '鲁庄公之子，闵公同母兄（一说异母）。在位三十三年，任内经历齐桓霸业、晋文兴起，多次参与诸侯盟会。',
    activeLuYears: ALL_XI, sourceRef: '《春秋》僖公', certainty: 'high'
  },
  {
    id: 'jin-huigong', name: '夷吾', posthumous: '晋惠公', stateId: 'jin', role: 'duke',
    desc: '晋献公子，重耳之弟。借秦穆公之力归国即位，后反秦，韩原之战（僖公十五年）被俘，割地求和。',
    activeLuYears: xiYears(9, 16), sourceRef: '《左传》僖公九至十六年', certainty: 'high'
  },
  {
    id: 'jin-huaigong', name: '圉', posthumous: '晋怀公', stateId: 'jin', role: 'duke',
    desc: '晋惠公之子，质秦时娶秦女，后逃归即位，被晋文公重耳所杀。',
    activeLuYears: xiYears(17, 24), sourceRef: '《左传》僖公十七至二十四年', certainty: 'high'
  },
  {
    id: 'zhao-cui', name: '赵衰', stateId: 'jin', role: 'minister',
    desc: '字子余，晋文公重要随臣之一，随重耳流亡十九年，归晋后为卿。',
    activeLuYears: xiYears(23, 33), sourceRef: '《左传》僖公二十三年以后', certainty: 'high'
  },
  {
    id: 'hu-yan', name: '狐偃', stateId: 'jin', role: 'minister',
    desc: '字子犯，重耳舅父，随重耳流亡，城濮之战参与筹谋，「退避三舍」典故源出于此。',
    activeLuYears: xiYears(23, 33), sourceRef: '《左传》僖公二十三年以后', certainty: 'high'
  },
  {
    id: 'xian-zhen', name: '先轸', stateId: 'jin', role: 'general',
    desc: '晋文公时名将，城濮之战主帅，大败楚军，奠定晋霸基础；后殽之战主谋，擒秦三帅。',
    activeLuYears: xiYears(28, 33), sourceRef: '《左传》僖公二十八至三十三年', certainty: 'high'
  },
  {
    id: 'chu-ziyu', name: '成得臣', courtesy: '子玉', stateId: 'chu', role: 'general',
    desc: '楚成王名将，城濮之战楚军主帅，以「不肯退避」之名著称；战败后楚王逼其自杀。',
    activeLuYears: xiYears(26, 28), sourceRef: '《左传》僖公二十六至二十八年', certainty: 'high'
  },
  {
    id: 'zheng-wengong', name: '捷', posthumous: '郑文公', stateId: 'zheng', role: 'duke',
    desc: '郑历公之子，在位长达四十多年。城濮之战时支持楚国，战后被晋逼迫；僖公二十四年晋秦围郑，烛之武说退秦军。',
    activeLuYears: xiYears(1, 33), sourceRef: '《春秋》僖公', certainty: 'high'
  },
  {
    id: 'zhu-zhi-wu', name: '烛之武', stateId: 'zheng', role: 'other',
    desc: '郑国大夫，年老出使，僖公三十年夜见秦穆公，以利弊说退秦军，使郑国免于灭亡，为先秦外交辞令的经典代表。',
    activeLuYears: ['xi-30'], sourceRef: '《左传》僖公三十年', certainty: 'high'
  },
  {
    id: 'song-mu-yi', name: '目夷', courtesy: '子鱼', stateId: 'song', role: 'minister',
    desc: '宋公庶兄，博学多谋，泓之战前力劝宋襄公趁楚军未渡河进攻，宋襄公不听，大败，目夷论败因脍炙人口。',
    activeLuYears: xiYears(12, 25), sourceRef: '《左传》僖公二十二年', certainty: 'high'
  },
  {
    id: 'qi-xiao-bai-after', name: '齐孝公昭', posthumous: '齐孝公', stateId: 'qi', role: 'duke',
    desc: '齐桓公之子，桓公死后经内乱，由宋拥立，即位为孝公。管仲、桓公死后齐霸衰落。',
    activeLuYears: xiYears(17, 22), sourceRef: '《春秋》僖公十七年后', certainty: 'high'
  },
  {
    id: 'jin-xiangong', name: '诡诸', posthumous: '晋献公', stateId: 'jin', role: 'duke',
    desc: '晋国君，灭虞虢，并州吞耿，大国之基由此奠定；骊姬之乱后诸公子出奔，申生死，重耳奔翟。',
    activeLuYears: xiYears(1, 9), sourceRef: '《左传》僖公二至九年', certainty: 'high'
  },
  {
    id: 'jin-chonger', name: '重耳', posthumous: '晋文公', stateId: 'jin', role: 'duke',
    desc: '晋献公子，骊姬之乱后流亡十九年，经翟、卫、齐、曹、宋、郑、楚、秦，终借秦穆公之力归晋即位，创晋霸大业。城濮之战大败楚军，称雄中原。',
    activeLuYears: [...xiYears(13, 33), 'wen-1'],
    sourceRef: '《左传》僖公十三年至文公元年', certainty: 'high'
  }
]

// 对已有人物去重更新
const existPersonIds = new Set(persons.map(p => p.id))
const updatedPersons = persons.map(p => {
  if (personUpdates[p.id]) {
    // 去重
    const merged = [...new Set(personUpdates[p.id])]
    return { ...p, activeLuYears: merged }
  }
  return p
})
const personsToAdd = newPersons.filter(p => !existPersonIds.has(p.id))
writeJSON('persons.json', [...updatedPersons, ...personsToAdd])

console.log('\n✅ 僖公实体注入完成')
