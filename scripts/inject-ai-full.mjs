/**
 * 鲁哀公全期数据导入
 * ai-1..ai-14（前 494—前 481）
 * 策略：以《春秋》经文为骨架，《左传》叙事单独 sourceType: "zuozhuan"；
 *       对已有 ev-ai3-1、ev-ai11-1、ev-ai13-1、ev-ai14-1 用 patchEvent 校正。
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
  yin: 1, huan: 2, zhuang: 3, min: 4, xi: 5,
  wen: 6, xuan: 7, cheng: 8, xiang: 9, zhao: 10, ding: 11, ai: 12,
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
let places = read('places.json')
let persons = read('persons.json')
let relations = read('relations.json')
let events = read('events.json')

// ═══ 地点：补夫椒、大野（获麟地）、艾陵 ═══
const newPlaces = [
  {
    id: 'fujiao',
    name: '夫椒（吴越大战地）',
    stateId: null,
    modernRef: '今江苏苏州市西南太湖中洞庭山一带（约）',
    coords: [120.3, 31.12],
    certainty: 'medium',
  },
  {
    id: 'daye',
    name: '大野（西狩获麟地）',
    stateId: 'lu',
    modernRef: '今山东巨野县一带（大野泽）',
    coords: [116.07, 35.4],
    certainty: 'medium',
  },
  {
    id: 'aili',
    name: '艾陵（吴败齐地）',
    stateId: null,
    modernRef: '今山东莱芜市西北（约）',
    coords: [117.68, 36.2],
    certainty: 'medium',
  },
]
for (const p of newPlaces) {
  if (!places.some((x) => x.id === p.id)) places.push(p)
}

// ═══ 人物：补鲁哀公、田恒（田常）、范蠡 ═══
const newPersons = [
  {
    id: 'lu-ai',
    name: '蒋',
    posthumous: '鲁哀公',
    stateId: 'lu',
    role: 'duke',
    desc: '鲁定公之子。在位期间三桓专政，孔子晚年返鲁；哀公十四年西狩获麟，《春秋》绝笔于此。',
    activeLuYears: span('ai', 1, 14),
    sourceRef: '《春秋》哀公',
    certainty: 'high',
  },
  {
    id: 'tian-heng',
    name: '陈恒',
    courtesy: '田成子',
    stateId: 'qi',
    role: 'minister',
    desc: '齐大夫，田氏（陈氏）首领，哀公十四年弑齐简公，田氏代齐之祸首，史称"陈成子"或"田成子"。',
    activeLuYears: sortLuYears([...span('ai', 10, 14)]),
    sourceRef: '《春秋》哀公十四年、《史记·田敬仲完世家》',
    certainty: 'high',
  },
  {
    id: 'fan-li',
    name: '范蠡',
    stateId: 'yue',
    role: 'minister',
    desc: '越国大夫，勾践谋臣，辅助勾践卧薪尝胆、击败吴国；灭吴后功成身退，史称"陶朱公"。',
    activeLuYears: sortLuYears([...span('ai', 1, 14)]),
    sourceRef: '《左传》哀公、《史记·越王勾践世家》',
    certainty: 'medium',
  },
]
for (const np of newPersons) {
  if (!persons.some((p) => p.id === np.id)) persons.push(np)
}

// kongzi activeLuYears 确保覆盖 ai-1..ai-14
const kongzi = persons.find((p) => p.id === 'kongzi')
if (kongzi) {
  kongzi.activeLuYears = sortLuYears([
    ...(kongzi.activeLuYears ?? []),
    ...span('ai', 1, 14),
  ])
}

// wu-fucha 已覆盖 ai-1..ai-14，确认无需修改
// yue-gujian 已覆盖 ai-1..ai-14，确认无需修改

// ═══ 事件工具函数 ═══

/** 在哀公段落之前插入新事件（若 id 已存在则跳过） */
function pushEvent(ev) {
  if (events.some((e) => e.id === ev.id)) return
  // 插入策略：找到同年最后一个事件之后；否则找到 ai-14 之前
  const sameYear = events.findIndex((e) => e.luYearId === ev.luYearId)
  if (sameYear >= 0) {
    // 插在同年第一个事件之前
    events.splice(sameYear, 0, ev)
  } else {
    // 找到 ai-14 事件作为锚点，在其之前按年序插入
    const anchor = events.findIndex((e) => e.luYearId === 'ai-14')
    if (anchor >= 0) events.splice(anchor, 0, ev)
    else events.push(ev)
  }
}

/** 对已有事件做字段覆盖（仅覆盖传入字段） */
function patchEvent(id, patch) {
  const ev = events.find((e) => e.id === id)
  if (!ev) { console.warn('patchEvent: not found', id); return }
  Object.assign(ev, patch)
  console.log('  patched', id)
}

// ═══ 校正已有错误事件 ═══

// ev-ai3-1: "齐侯、卫侯、郑伯盟于黄池" 是历史错误
// 哀公三年（前 492）实际经文：桓宫、僖宫灾（鲁国宗庙火灾）
patchEvent('ev-ai3-1', {
  jingText: '桓宫、僖宫灾。',
  category: 'other',
  stateIds: ['lu'],
  placeIds: ['qufu'],
  personIds: [],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公三年',
  certainty: 'high',
  zuoComment: '哀公三年夏，鲁国桓公、僖公宗庙失火，是为宫廷大灾，左传记孔子在外期间鲁国内政失序。',
})

// ev-ai11-1: "吴子会诸侯于黄池" 是黄池之会，年份应为 ai-13 而非 ai-11
// 哀公十一年（前 484）实际为艾陵之战：吴大败齐师
patchEvent('ev-ai11-1', {
  luYearId: 'ai-11',
  jingText: '公会吴伐齐，战于艾，吴败齐师。',
  category: 'battle',
  stateIds: ['lu', 'wu', 'qi'],
  placeIds: ['aili'],
  personIds: ['wu-fucha'],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公十一年',
  certainty: 'high',
  zuoComment: '艾陵之战：吴王夫差联合鲁国大败齐师于艾陵（今山东莱芜），斩获甲首八万，是吴北上争霸的顶峰。冉有率鲁军以步战之法立功。',
})

// ev-ai13-1: 越人伐吴 内容大致正确，但 placeIds 调整（越军趁虚攻吴都姑苏）
patchEvent('ev-ai13-1', {
  jingText: '越人入吴。',
  placeIds: ['gushu'],
  zuoComment: '哀公十三年，夫差在黄池与晋争盟之际，越王勾践趁虚率兵直入吴都，斩吴太子友，形势逆转。',
})

// ev-ai14-1: 西狩获麟 placeId 改为 daye（大野泽）而非曲阜
patchEvent('ev-ai14-1', {
  placeIds: ['daye'],
  zuoComment: '哀公十四年春，西狩于大野（今山东巨野）获麟，孔子感伤以为不祥，《春秋》记至此绝笔。是为孔子见麟绝笔处，春秋时代之终。',
})

// ═══ 新增事件：ai-1..ai-14 完整覆盖 ═══

// ai-1: 哀公即位（经文）+ 夫椒之战（传文）
pushEvent({
  id: 'ev-ai1-1',
  luYearId: 'ai-1',
  jingText: '元年春王正月，公即位。',
  category: 'political',
  stateIds: ['lu'],
  placeIds: ['qufu'],
  personIds: ['lu-ai'],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公元年',
  certainty: 'high',
})

pushEvent({
  id: 'ev-ai1-2',
  luYearId: 'ai-1',
  jingText: '（左传）吴伐越，败越王勾践于夫椒，越栖会稽。',
  category: 'battle',
  stateIds: ['wu', 'yue'],
  placeIds: ['fujiao'],
  personIds: ['wu-fucha', 'yue-gujian'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》哀公元年',
  certainty: 'high',
  zuoComment: '吴王夫差大败越王勾践于夫椒（太湖），越军残部退守会稽山。此役奠定吴国北上争霸之基础。',
})

// ai-2: 越降服于吴（左传补叙）
pushEvent({
  id: 'ev-ai2-1',
  luYearId: 'ai-2',
  jingText: '（左传）越王勾践请盟于吴，以臣妾服事吴王。',
  category: 'diplomatic',
  stateIds: ['yue', 'wu'],
  placeIds: ['guiji'],
  personIds: ['yue-gujian', 'wu-fucha', 'fan-li'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》哀公元年续、《史记·越王勾践世家》',
  certainty: 'high',
  zuoComment: '越王勾践被围于会稽，遣文种赂吴太宰伯嚭，求和称臣，吴王夫差接受议和，勾践夫妇入吴为奴，卧薪尝胆之始。范蠡随侍。',
})

// ai-3: ev-ai3-1 已 patch 为宫廷火灾

// ai-4: 诸侯外交（传文）— 哀公四年鲁与周边诸侯交涉
pushEvent({
  id: 'ev-ai4-1',
  luYearId: 'ai-4',
  jingText: '公如晋，至河乃复。',
  category: 'diplomatic',
  stateIds: ['lu', 'jin'],
  placeIds: [],
  personIds: ['lu-ai'],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公四年',
  certainty: 'medium',
  zuoComment: '鲁哀公欲朝晋，至河而返，左传记晋国内乱影响诸侯朝觐。',
})

// ai-5: 城成郛（经文 — 鲁修外城）
pushEvent({
  id: 'ev-ai5-1',
  luYearId: 'ai-5',
  jingText: '城成郛。',
  category: 'political',
  stateIds: ['lu'],
  placeIds: [],
  personIds: [],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公五年',
  certainty: 'high',
  zuoComment: '鲁修筑成邑外城（郛），以应对外部威胁，三桓主导。',
})

// ai-6: 楚昭王薨（经文 — 楚王去世于军中）
pushEvent({
  id: 'ev-ai6-1',
  luYearId: 'ai-6',
  jingText: '楚子轸卒。',
  category: 'political',
  stateIds: ['chu'],
  placeIds: [],
  personIds: [],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公六年',
  certainty: 'high',
  zuoComment: '楚昭王（熊轸）率师救陈，卒于军中（城父），楚惠王继立。左传记孔子在陈闻讯，感叹楚王仁义。',
})

// ai-7: 吴征百牢、公如吴（经文）
pushEvent({
  id: 'ev-ai7-1',
  luYearId: 'ai-7',
  jingText: '公会吴于鄫。',
  category: 'assembly',
  stateIds: ['lu', 'wu'],
  placeIds: ['zeng'],
  personIds: ['lu-ai', 'wu-fucha'],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公七年',
  certainty: 'high',
  zuoComment: '吴王夫差征鲁百牢之礼（天子礼），鲁子贡力争礼制，公以五十牢应之。吴以武力为后盾，强迫鲁就范，显吴国霸业之盛。',
})

// ai-8: 吴伐陈（经文）
pushEvent({
  id: 'ev-ai8-1',
  luYearId: 'ai-8',
  jingText: '吴伐陈。',
  category: 'battle',
  stateIds: ['wu', 'chen'],
  placeIds: ['wanqiu'],
  personIds: ['wu-fucha'],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公八年',
  certainty: 'high',
  zuoComment: '吴进逼陈国，楚救陈，吴楚相持。陈为吴楚争夺之地，楚昭王卒后楚势暂衰，吴得以深入。',
})

// ai-9: 齐人来归郓、欢、龟阴之田（经文 — 重要外交/领土事件）
pushEvent({
  id: 'ev-ai9-1',
  luYearId: 'ai-9',
  jingText: '齐人来归郓、讙、龟阴之田。',
  category: 'diplomatic',
  stateIds: ['qi', 'lu'],
  placeIds: ['yun'],
  personIds: [],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公九年',
  certainty: 'high',
  zuoComment: '齐国归还昔日从鲁夺取的郓、讙、龟阴三地，此系齐鲁两国关系暂时缓和之举，与吴国北上施压齐国有关。',
  territoryChanges: [
    {
      changeType: 'recover',
      fromStateId: 'qi',
      toStateId: 'lu',
      placeId: 'yun',
      note: '齐归还郓地于鲁（哀公九年）',
    },
  ],
})

// ai-10: 齐国书伐鲁（经文）
pushEvent({
  id: 'ev-ai10-1',
  luYearId: 'ai-10',
  jingText: '齐国书帅师伐我。',
  category: 'battle',
  stateIds: ['qi', 'lu'],
  placeIds: ['lang'],
  personIds: [],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公十年',
  certainty: 'high',
  zuoComment: '齐大夫国书率师侵鲁，季孙等组织抵御，鲁借助吴国军事威慑方得喘息。',
})

// ai-11: ev-ai11-1 已 patch 为艾陵之战

// ai-12: 公会吴于橐皋（经文）
pushEvent({
  id: 'ev-ai12-1',
  luYearId: 'ai-12',
  jingText: '公会吴于橐皋。',
  category: 'assembly',
  stateIds: ['lu', 'wu'],
  placeIds: ['jiashan'],
  personIds: ['lu-ai', 'wu-fucha'],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公十二年',
  certainty: 'high',
  zuoComment: '鲁哀公在橐皋（今安徽巢湖附近）与吴王夫差会盟，吴为黄池之会布局，拉拢诸侯。',
})

// ai-13: 黄池之会（经文）— ev-ai13-1 已 patch 为越入吴
pushEvent({
  id: 'ev-ai13-2',
  luYearId: 'ai-13',
  jingText: '公会晋侯及吴子于黄池。',
  category: 'assembly',
  stateIds: ['lu', 'jin', 'wu'],
  placeIds: ['huangchi'],
  personIds: ['wu-fucha'],
  sourceType: 'jing',
  sourceRef: '《春秋》哀公十三年',
  certainty: 'high',
  zuoComment: '黄池之会，吴王夫差与晋定公争夺盟主之位，终以晋先歃血、吴次之而成盟。此为吴国霸业顶峰；然越王勾践同时袭击吴都，形势急转。',
})

// ai-14: ev-ai14-1 已 patch 为 daye 地点；再加田常弑君（传文）
pushEvent({
  id: 'ev-ai14-2',
  luYearId: 'ai-14',
  jingText: '（左传）齐陈恒弑其君壬于舒州。',
  category: 'political',
  stateIds: ['qi'],
  placeIds: ['linzi'],
  personIds: ['tian-heng'],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》哀公十四年、《春秋》哀公十四年',
  certainty: 'high',
  zuoComment: '哀公十四年，齐大夫陈恒（田成子）弑齐简公，自立为相，田氏代齐之局已定。孔子请哀公讨陈恒，不果，此亦为春秋礼崩乐坏之极点。',
})

// ═══ 外交关系 ═══

// 鲁吴外交同盟（哀公七年~十三年）
const relLuWuAlly = {
  id: 'rel-lu-wu-ally-ai',
  fromId: 'lu',
  toId: 'wu',
  type: 'ally',
  activeLuYears: sortLuYears([...span('ai', 7, 13)]),
  sourceType: 'jing',
  sourceRef: '《春秋》哀公七年公会吴于鄫、十一年联合伐齐、十二年橐皋会盟等',
  certainty: 'medium',
}
if (!relations.some((r) => r.id === relLuWuAlly.id)) {
  relations.push(relLuWuAlly)
}

// 鲁齐摩擦（哀公九年~十一年）
const relLuQiHostile = {
  id: 'rel-lu-qi-hostile-ai',
  fromId: 'lu',
  toId: 'qi',
  type: 'enemy',
  activeLuYears: sortLuYears([...span('ai', 9, 11)]),
  sourceType: 'jing',
  sourceRef: '《春秋》哀公十年齐国书伐鲁、十一年鲁与吴联合伐齐',
  certainty: 'high',
}
if (!relations.some((r) => r.id === relLuQiHostile.id)) {
  relations.push(relLuQiHostile)
}

// ═══ 写出 ═══
write('places.json', places)
write('persons.json', persons)
write('relations.json', relations)
write('events.json', events)

console.log('\n=== ai 全期注入完成 ===')
console.log('ai 事件数:', events.filter((e) => e.luYearId?.startsWith('ai-')).length)
console.log('需手动验证: npm run validate:data && npm run build')
