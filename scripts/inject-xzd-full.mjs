/**
 * 襄公·昭公·定公全期数据导入
 * xiang-1..xiang-31 / zhao-1..zhao-32 / ding-1..ding-15
 * 策略：逐年至少一条 jing 事件；关键战役加 zuoComment；不重复已有 ID。
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
const places = read('places.json')
let persons = read('persons.json')
let relations = read('relations.json')
let events = read('events.json')

// ═══ 地点：新增若干春秋中晚期会战地 ═══
const newPlaces = [
  {
    id: 'hulao',
    name: '虎牢（晋筑关）',
    stateId: 'zheng',
    modernRef: '今河南荥阳市虎牢关一带',
    coords: [113.2, 34.88],
    certainty: 'medium',
  },
  {
    id: 'juliang',
    name: '湨梁（诸侯会地）',
    stateId: null,
    modernRef: '今河南济源东南（约）',
    coords: [112.59, 35.07],
    certainty: 'medium',
  },
  {
    id: 'zeng',
    name: '鄫（鲁地会所）',
    stateId: 'lu',
    modernRef: '今山东枣庄市峄城区北（约）',
    coords: [117.56, 34.97],
    certainty: 'medium',
  },
  {
    id: 'shaosui',
    name: '沙随（会盟地）',
    stateId: null,
    modernRef: '今河南宁陵东北（约）',
    coords: [115.43, 34.57],
    certainty: 'medium',
  },
  {
    id: 'bao',
    name: '亳（会盟地）',
    stateId: null,
    modernRef: '今河南商丘西北（约）',
    coords: [115.63, 34.55],
    certainty: 'medium',
  },
  {
    id: 'chanyuan',
    name: '澶渊（诸侯会地）',
    stateId: null,
    modernRef: '今河南濮阳西南（约）',
    coords: [114.97, 35.69],
    certainty: 'medium',
  },
  {
    id: 'qianhou',
    name: '乾侯（昭公流亡地）',
    stateId: 'jin',
    modernRef: '今河北成安东南（约）',
    coords: [114.68, 36.44],
    certainty: 'medium',
  },
  {
    id: 'boju',
    name: '柏举（吴楚大战）',
    stateId: null,
    modernRef: '今湖北麻城西北（约）',
    coords: [115.0, 31.18],
    certainty: 'medium',
  },
  {
    id: 'jiashan',
    name: '橐皋（吴鲁会地）',
    stateId: null,
    modernRef: '今安徽巢湖北（约）',
    coords: [117.63, 31.7],
    certainty: 'medium',
  },
  {
    id: 'jixia',
    name: '稷（宋地会所）',
    stateId: 'song',
    modernRef: '今山东菏泽市东南（约）',
    coords: [115.64, 35.23],
    certainty: 'medium',
  },
]
for (const p of newPlaces) {
  if (!places.some((x) => x.id === p.id)) places.push(p)
}

// ═══ 人物：新增鲁襄公、昭公；修正鲁定公 activeLuYears ═══
const newPersons = [
  {
    id: 'lu-xiang',
    name: '午',
    posthumous: '鲁襄公',
    stateId: 'lu',
    role: 'duke',
    desc: '鲁成公之子。在位期间三桓（季孙、叔孙、孟孙）势力大张，向戌弭兵后列国短暂和平。',
    activeLuYears: span('xiang', 1, 31),
    sourceRef: '《春秋》《左传》襄公',
    certainty: 'high',
  },
  {
    id: 'lu-zhao',
    name: '裯',
    posthumous: '鲁昭公',
    stateId: 'lu',
    role: 'duke',
    desc: '鲁襄公庶长子。与季平子矛盾激化，昭公二十五年出奔，流亡于齐、晋之间，死于乾侯。',
    activeLuYears: span('zhao', 1, 32),
    sourceRef: '《春秋》《左传》昭公',
    certainty: 'high',
  },
  {
    id: 'ji-wuzi',
    name: '季孙宿',
    posthumous: '季武子',
    stateId: 'lu',
    role: 'minister',
    desc: '鲁三桓之季孙氏，季武子执鲁政，主导多次诸侯盟会随行。',
    activeLuYears: sortLuYears([...span('xiang', 1, 22)]),
    sourceRef: '《春秋》《左传》襄公',
    certainty: 'high',
  },
  {
    id: 'ji-pingzi',
    name: '季孙意如',
    posthumous: '季平子',
    stateId: 'lu',
    role: 'minister',
    desc: '鲁三桓之季孙氏，昭公时执政，与昭公发生冲突导致昭公出奔。',
    activeLuYears: sortLuYears([...span('zhao', 1, 32), ...span('ding', 1, 5)]),
    sourceRef: '《春秋》《左传》昭公、定公',
    certainty: 'high',
  },
  {
    id: 'yanying',
    name: '晏婴',
    posthumous: '晏平仲',
    stateId: 'qi',
    role: 'minister',
    desc: '齐国名相，历事灵、庄、景三公，以节俭智谋著称，《晏子春秋》记其事。',
    activeLuYears: sortLuYears([...span('xiang', 20, 31), ...span('zhao', 1, 20)]),
    sourceRef: '《左传》《晏子春秋》',
    certainty: 'high',
  },
  {
    id: 'wu-yuejizi',
    name: '季札',
    posthumous: '吴季子',
    stateId: 'wu',
    role: 'minister',
    desc: '吴王寿梦四子，贤名闻于诸侯，出使列国，评论诗乐，《左传》多载其言论。',
    activeLuYears: sortLuYears([...span('xiang', 29, 31), ...span('zhao', 1, 10)]),
    sourceRef: '《左传》襄公二十九年、昭公等',
    certainty: 'high',
  },
]

// 检查 persons 里是否已有 zhao-yang（原有），若有则跳过 zhao-yang2
for (const np of newPersons) {
  if (!persons.some((p) => p.id === np.id)) {
    persons.push(np)
  }
}

// 修正 lu-ding 的 activeLuYears 为完整 ding-1..ding-15
const luDing = persons.find((p) => p.id === 'lu-ding')
if (luDing) {
  luDing.activeLuYears = sortLuYears(span('ding', 1, 15))
}

// 修正 lu-xian 类似人物若存在则更新 activeLuYears (zhao-yang 已在 persons.json)
const zhaoYang = persons.find((p) => p.id === 'zhao-yang')
if (zhaoYang) {
  zhaoYang.activeLuYears = sortLuYears([
    ...(zhaoYang.activeLuYears ?? []),
    ...span('ding', 1, 15),
  ])
}

// kongzi activeLuYears 补至定公全段
const kongzi = persons.find((p) => p.id === 'kongzi')
if (kongzi) {
  kongzi.activeLuYears = sortLuYears([
    ...(kongzi.activeLuYears ?? []),
    ...span('ding', 1, 15),
    'xiang-21', 'xiang-22',
  ])
}

// wu-helv activeLuYears 补至定公（已有 ding-13 引用）
const wuHelv = persons.find((p) => p.id === 'wu-helv')
if (wuHelv) {
  wuHelv.activeLuYears = sortLuYears([
    ...(wuHelv.activeLuYears ?? []),
    ...span('ding', 1, 15),
  ])
}

// ═══ 事件：逐年占位，已存在则跳过 ═══
function pushEvent(ev) {
  if (events.some((e) => e.id === ev.id)) return
  // 插入 ai-3-1 之前（哀公段落最前），保持年序
  const ins = events.findIndex((e) => e.luYearId === 'ai-3')
  if (ins >= 0) events.splice(ins, 0, ev)
  else events.push(ev)
}

// ─── 襄公期 xiang-1..xiang-31 ───
const xiangSpecs = [
  {
    id: 'ev-xiang1-1', luYearId: 'xiang-1',
    jingText: '仲孙蔑会吴于善道。',
    category: 'assembly',
    stateIds: ['lu', 'wu'],
    placeIds: [],
    zuoComment: '鲁大夫仲孙蔑与吴会，开鲁吴外交往来，是吴崛起后进入中原视野之始。',
  },
  {
    id: 'ev-xiang2-1', luYearId: 'xiang-2',
    jingText: '公至自晋，晋侯使韩无忌来聘。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin'],
    placeIds: ['jiang'],
  },
  // xiang-3 already exists
  {
    id: 'ev-xiang4-1', luYearId: 'xiang-4',
    jingText: '公会诸侯于鄫，以讨郑之叛。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'qi', 'song', 'wei', 'cao', 'zheng'],
    placeIds: ['zeng'],
    zuoComment: '晋召诸侯于鄫，重申盟约以压制郑之二心。',
  },
  {
    id: 'ev-xiang5-1', luYearId: 'xiang-5',
    jingText: '公会晋侯、宋公、卫侯、郑伯、曹伯、吴子、邾子于戚。城虎牢。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'zheng', 'cao', 'wu'],
    placeIds: ['hulao'],
    zuoComment: '晋率诸侯城虎牢，控制洛水以南门户，郑降晋。',
  },
  {
    id: 'ev-xiang6-1', luYearId: 'xiang-6',
    jingText: '晋栾黡帅师伐楚救陈，公率师从。',
    category: 'battle',
    stateIds: ['jin', 'lu', 'chu', 'chen'],
    placeIds: ['wanqiu'],
  },
  {
    id: 'ev-xiang7-1', luYearId: 'xiang-7',
    jingText: '公如晋。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin'],
    placeIds: ['jiang'],
  },
  {
    id: 'ev-xiang8-1', luYearId: 'xiang-8',
    jingText: '晋侯帅诸侯伐郑，楚救郑。',
    category: 'battle',
    stateIds: ['jin', 'lu', 'song', 'wei', 'zheng', 'chu'],
    placeIds: ['xinzheng'],
    zuoComment: '晋楚在郑周旋，郑再度降晋，惟楚军及时驰援，双方对峙。',
  },
  {
    id: 'ev-xiang9-1', luYearId: 'xiang-9',
    jingText: '公会晋侯、宋公、卫侯、郑伯于戚。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'zheng'],
    placeIds: [],
  },
  {
    id: 'ev-xiang10-1', luYearId: 'xiang-10',
    jingText: '公会晋侯等诸侯，伐郑，入其城。',
    category: 'battle',
    stateIds: ['jin', 'lu', 'qi', 'song', 'wei', 'cao', 'zheng'],
    placeIds: ['xinzheng'],
    zuoComment: '晋联盟诸侯大举伐郑，入郑城，郑人请和。',
  },
  // xiang-11 already exists
  {
    id: 'ev-xiang12-1', luYearId: 'xiang-12',
    jingText: '公会诸侯于安甫。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'cao', 'qi'],
    placeIds: [],
  },
  {
    id: 'ev-xiang13-1', luYearId: 'xiang-13',
    jingText: '公会晋侯等伐秦。',
    category: 'battle',
    stateIds: ['jin', 'lu', 'qi', 'song', 'wei', 'cao', 'qin'],
    placeIds: ['yong'],
    zuoComment: '晋率诸侯伐秦，为报旧恨，然至泾而还，无大功。',
  },
  {
    id: 'ev-xiang14-1', luYearId: 'xiang-14',
    jingText: '晋侯伐秦，会诸侯于雍。',
    category: 'battle',
    stateIds: ['jin', 'lu', 'qi', 'song', 'wei', 'cao', 'zheng', 'qin'],
    placeIds: ['yong'],
  },
  {
    id: 'ev-xiang15-1', luYearId: 'xiang-15',
    jingText: '刘夏逆王后于齐，晋侯使荀罃来聘。',
    category: 'diplomatic',
    stateIds: ['zhou', 'qi', 'jin', 'lu'],
    placeIds: ['linzi'],
  },
  {
    id: 'ev-xiang16-1', luYearId: 'xiang-16',
    jingText: '公会晋侯、宋公、卫侯、郑伯、曹伯、莒子、邾子、薛伯、杞伯、小邾子于湨梁。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'zheng', 'cao'],
    placeIds: ['juliang'],
    zuoComment: '湨梁之会，晋率十一国诸侯会盟，重申晋霸地位。',
  },
  {
    id: 'ev-xiang17-1', luYearId: 'xiang-17',
    jingText: '晋侯帅师伐齐，次于齐西鄙。',
    category: 'battle',
    stateIds: ['jin', 'qi'],
    placeIds: ['linzi'],
  },
  {
    id: 'ev-xiang18-1', luYearId: 'xiang-18',
    jingText: '晋侯帅师伐齐，入临淄。',
    category: 'battle',
    stateIds: ['jin', 'lu', 'qi', 'song', 'wei', 'zheng'],
    placeIds: ['linzi'],
    zuoComment: '晋会诸侯大举伐齐，深入临淄，齐请盟而罢，齐侯复入晋霸联盟。',
  },
  {
    id: 'ev-xiang19-1', luYearId: 'xiang-19',
    jingText: '公会晋侯等诸侯于澶渊。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'zheng', 'cao', 'qi'],
    placeIds: ['chanyuan'],
  },
  {
    id: 'ev-xiang20-1', luYearId: 'xiang-20',
    jingText: '卫人来媵，晋士鲂来聘。',
    category: 'diplomatic',
    stateIds: ['lu', 'wei', 'jin'],
    placeIds: ['qufu'],
  },
  {
    id: 'ev-xiang21-1', luYearId: 'xiang-21',
    jingText: '公会诸侯于商任，盟于亳。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'cao', 'zheng', 'qi'],
    placeIds: ['bao'],
    zuoComment: '诸侯盟于亳，为晋霸体系的再度确认会盟。',
  },
  {
    id: 'ev-xiang22-1', luYearId: 'xiang-22',
    jingText: '公会晋侯于沙随。',
    category: 'assembly',
    stateIds: ['lu', 'jin'],
    placeIds: ['shaosui'],
  },
  {
    id: 'ev-xiang23-1', luYearId: 'xiang-23',
    jingText: '公如晋。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin'],
    placeIds: ['jiang'],
  },
  {
    id: 'ev-xiang24-1', luYearId: 'xiang-24',
    jingText: '公会晋侯、宋公、卫侯、郑伯、曹伯于戚。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'zheng', 'cao'],
    placeIds: [],
  },
  // xiang-25 already exists
  {
    id: 'ev-xiang26-1', luYearId: 'xiang-26',
    jingText: '楚子伐吴，吴人拒之。',
    category: 'battle',
    stateIds: ['chu', 'wu'],
    placeIds: ['gushu'],
    zuoComment: '楚随围攻吴，吴军奋力拒守，吴楚对抗格局初显。',
  },
  {
    id: 'ev-xiang27-1', luYearId: 'xiang-27',
    jingText: '向戌弭兵，诸侯盟于宋。晋楚齐秦与诸侯会，息兵弭战。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'chu', 'song', 'wei', 'zheng', 'cao', 'qi'],
    placeIds: ['shangqiu'],
    zuoComment: '宋向戌奔走于晋楚之间，促成弭兵之盟：晋楚共霸，诸侯各分朝贡晋楚，列国获短暂休战。',
  },
  {
    id: 'ev-xiang28-1', luYearId: 'xiang-28',
    jingText: '公如晋，晋韩起来聘。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin'],
    placeIds: ['jiang'],
  },
  {
    id: 'ev-xiang29-1', luYearId: 'xiang-29',
    jingText: '公如楚，吴季札来聘，请观周乐。',
    category: 'diplomatic',
    stateIds: ['lu', 'chu', 'wu'],
    placeIds: ['ying'],
    zuoComment: '吴公子季札聘鲁，观周室雅乐，品评列国诗乐，诸侯叹服；公亦如楚加强外交。',
  },
  {
    id: 'ev-xiang30-1', luYearId: 'xiang-30',
    jingText: '郑伯使驷带来聘。',
    category: 'diplomatic',
    stateIds: ['lu', 'zheng'],
    placeIds: ['qufu'],
  },
  {
    id: 'ev-xiang31-1', luYearId: 'xiang-31',
    jingText: '夏六月辛巳，公薨于楚宫。',
    category: 'other',
    stateIds: ['lu'],
    placeIds: ['qufu'],
    zuoComment: '鲁襄公薨，在位三十一年，三桓权盛，是为春秋中期鲁政权力转移之缩影。',
  },
]

// ─── 昭公期 zhao-1..zhao-32 ───
const zhaoSpecs = [
  {
    id: 'ev-zhao1-1', luYearId: 'zhao-1',
    jingText: '公即位。楚公子围来聘，观兵。',
    category: 'diplomatic',
    stateIds: ['lu', 'chu'],
    placeIds: ['qufu'],
    zuoComment: '楚令尹公子围（即楚灵王）来聘，携大兵，意在夸示威势；鲁人观之惊惧。',
  },
  {
    id: 'ev-zhao2-1', luYearId: 'zhao-2',
    jingText: '晋韩宣子来聘，见鲁书，叹周礼尽在鲁。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin'],
    placeIds: ['qufu'],
    zuoComment: '韩宣子在鲁观书，见《易》、《象》与鲁春秋，赞叹「周礼尽在鲁矣」，为著名典故。',
  },
  {
    id: 'ev-zhao3-1', luYearId: 'zhao-3',
    jingText: '楚公子围弑其君麋而代立，是为楚灵王。',
    category: 'other',
    stateIds: ['chu'],
    placeIds: ['ying'],
    zuoComment: '楚令尹公子围勒死楚郏敖，自立为王，是为楚灵王，楚政由此进入更强势的扩张期。',
  },
  {
    id: 'ev-zhao4-1', luYearId: 'zhao-4',
    jingText: '公如晋。楚灵王筑章华之台。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin', 'chu'],
    placeIds: ['jiang'],
    zuoComment: '楚灵王大兴土木，修章华台，劳民，诸国侧目；公如晋，仍维持晋盟。',
  },
  {
    id: 'ev-zhao5-1', luYearId: 'zhao-5',
    jingText: '公如晋，参与晋召诸侯之盟。',
    category: 'assembly',
    stateIds: ['lu', 'jin', 'song', 'wei', 'zheng', 'cao'],
    placeIds: ['jiang'],
  },
  {
    id: 'ev-zhao6-1', luYearId: 'zhao-6',
    jingText: '楚灵王伐陈，围陈。',
    category: 'battle',
    stateIds: ['chu', 'chen'],
    placeIds: ['wanqiu'],
  },
  // zhao-7 already exists (楚人围陈)
  {
    id: 'ev-zhao8-1', luYearId: 'zhao-8',
    jingText: '宋华亥出奔楚，陈侯之弟招来奔。',
    category: 'other',
    stateIds: ['song', 'chu', 'chen'],
    placeIds: ['ying'],
  },
  {
    id: 'ev-zhao9-1', luYearId: 'zhao-9',
    jingText: '公如晋。叔弓帅师入费，克之。',
    category: 'battle',
    stateIds: ['lu', 'jin'],
    placeIds: ['jiang'],
  },
  {
    id: 'ev-zhao10-1', luYearId: 'zhao-10',
    jingText: '公会宋公于公甫。叔孙婼如齐。',
    category: 'assembly',
    stateIds: ['lu', 'song', 'qi'],
    placeIds: ['shangqiu'],
  },
  {
    id: 'ev-zhao11-1', luYearId: 'zhao-11',
    jingText: '楚灵王涉陵虐蔡，执蔡侯。蔡人灭蔡侯以求免。',
    category: 'battle',
    stateIds: ['chu', 'cai'],
    placeIds: ['shangcai'],
    zuoComment: '楚灵王执蔡侯，后围杀蔡灵侯，蔡国近于灭亡，是楚灵王穷兵黩武的标志性事件。',
  },
  {
    id: 'ev-zhao12-1', luYearId: 'zhao-12',
    jingText: '陈公子招弑其君哀公，楚灵王灭陈。',
    category: 'battle',
    stateIds: ['chen', 'chu'],
    placeIds: ['wanqiu'],
    zuoComment: '陈内乱，公子招杀君，楚借机灭陈置县，陈由此入楚版图（后复）。',
    territoryChanges: [
      { placeId: 'wanqiu', fromStateId: 'chen', toStateId: 'chu', changeType: 'annex' },
    ],
  },
  {
    id: 'ev-zhao13-1', luYearId: 'zhao-13',
    jingText: '公如晋，晋侯会诸侯。楚灵王灭蔡。',
    category: 'battle',
    stateIds: ['chu', 'cai', 'lu', 'jin'],
    placeIds: ['jiang', 'shangcai'],
    zuoComment: '楚灵王再度侵蔡并实际灭蔡，同年公如晋，晋虽会诸侯然无力制楚。',
  },
  {
    id: 'ev-zhao14-1', luYearId: 'zhao-14',
    jingText: '蔡侯朱出奔楚。',
    category: 'other',
    stateIds: ['cai', 'chu'],
    placeIds: ['ying'],
  },
  {
    id: 'ev-zhao15-1', luYearId: 'zhao-15',
    jingText: '公如晋，参与晋卫盟会。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin', 'wei'],
    placeIds: ['jiang'],
  },
  {
    id: 'ev-zhao16-1', luYearId: 'zhao-16',
    jingText: '公如晋，蔡侯为楚所胁，楚灵王大会诸侯于申。',
    category: 'assembly',
    stateIds: ['lu', 'jin', 'chu'],
    placeIds: ['jiang'],
    zuoComment: '楚灵王在申大会诸侯，欲夸示楚霸，同年晋鲁等仍有往来，晋楚共霸格局持续。',
  },
  {
    id: 'ev-zhao17-1', luYearId: 'zhao-17',
    jingText: '陈侯吴卒，郑灾，晏婴如晋。',
    category: 'other',
    stateIds: ['chen', 'zheng', 'qi', 'jin'],
    placeIds: ['wanqiu'],
    zuoComment: '陈侯去世，陈在楚压制下实际为楚所控；齐晏婴聘晋，修两国外交。',
  },
  {
    id: 'ev-zhao18-1', luYearId: 'zhao-18',
    jingText: '晋士鞅、宋乐祁帅师伐曹，曹人请盟。',
    category: 'battle',
    stateIds: ['jin', 'song', 'cao'],
    placeIds: ['tao'],
  },
  {
    id: 'ev-zhao19-1', luYearId: 'zhao-19',
    jingText: '公如晋，晋侯使子服惠伯来聘。',
    category: 'diplomatic',
    stateIds: ['lu', 'jin'],
    placeIds: ['jiang'],
  },
  // zhao-20 already exists (蔡侯许男会于平丘)
  {
    id: 'ev-zhao21-1', luYearId: 'zhao-21',
    jingText: '公会晋侯等诸侯于平丘，盟于蒲圃，晋侯方镇诸侯。',
    category: 'assembly',
    stateIds: ['jin', 'lu', 'song', 'wei', 'zheng', 'cao', 'qi'],
    placeIds: [],
    zuoComment: '晋侯会诸侯于平丘，借会兵压齐，执邾子，齐不服，晋霸渐弱。',
  },
  {
    id: 'ev-zhao22-1', luYearId: 'zhao-22',
    jingText: '周天王崩，王子朝奔楚。',
    category: 'other',
    stateIds: ['zhou', 'chu'],
    placeIds: ['wangcheng'],
    zuoComment: '周景王崩，王子朝作乱，晋定王子丐（敬王）即位，王子朝奔楚，携周典籍，史学称为「王子朝奔楚事件」。',
  },
  {
    id: 'ev-zhao23-1', luYearId: 'zhao-23',
    jingText: '吴伐州来，克之。',
    category: 'battle',
    stateIds: ['wu', 'chu'],
    placeIds: ['gushu'],
    zuoComment: '吴军攻克楚之州来（今安徽凤台），为吴深入淮水流域，扩大对楚压力。',
  },
  {
    id: 'ev-zhao24-1', luYearId: 'zhao-24',
    jingText: '楚公子弃疾弑楚灵王，自立为楚平王。',
    category: 'other',
    stateIds: ['chu'],
    placeIds: ['ying'],
    zuoComment: '楚平王弑灵王，政策由激进扩张转为修和；陈、蔡复国，楚国内政大变。',
    territoryChanges: [
      { placeId: 'wanqiu', fromStateId: 'chu', toStateId: 'chen', changeType: 'recover' },
    ],
  },
  // zhao-25 already exists (晋赵鞅帅师伐卫)
  {
    id: 'ev-zhao26-1', luYearId: 'zhao-26',
    jingText: '鲁昭公出奔，居于齐。季平子执鲁政。',
    category: 'other',
    stateIds: ['lu', 'qi'],
    placeIds: ['linzi'],
    zuoComment: '昭公因讨伐季平子失败出奔齐国，是为春秋史上著名的「君出奔」事件；此后昭公流亡辗转，终死异乡。',
  },
  {
    id: 'ev-zhao27-1', luYearId: 'zhao-27',
    jingText: '吴公子光刺杀吴王僚，自立为阖庐。',
    category: 'other',
    stateIds: ['wu'],
    placeIds: ['gushu'],
    zuoComment: '吴公子光使专诸行刺吴王僚，即位为吴王阖庐，任用伍子胥、孙武，吴由此进入最强盛期。',
  },
  {
    id: 'ev-zhao28-1', luYearId: 'zhao-28',
    jingText: '晋魏舒帅师伐无终，克之。晋杀祁盈及杨食我。',
    category: 'other',
    stateIds: ['jin'],
    placeIds: ['jiang'],
    zuoComment: '晋分祁氏、羊舌氏之田为十县，晋六卿并吞贵族领地，国内权力日益集中于卿族。',
  },
  {
    id: 'ev-zhao29-1', luYearId: 'zhao-29',
    jingText: '晋赵鞅、荀寅铸刑鼎，书范宣子之刑书。',
    category: 'other',
    stateIds: ['jin'],
    placeIds: ['jiang'],
    zuoComment: '晋铸刑鼎，孔子批评此举破坏礼制，然此是中国成文法发展的重要节点。',
  },
  {
    id: 'ev-zhao30-1', luYearId: 'zhao-30',
    jingText: '吴师伐越，越人拒之。',
    category: 'battle',
    stateIds: ['wu', 'yue'],
    placeIds: ['gushu', 'guiji'],
    zuoComment: '吴越争端加剧，吴王阖庐开始南征越国，拉开吴越长期争霸序幕。',
  },
  {
    id: 'ev-zhao31-1', luYearId: 'zhao-31',
    jingText: '公在乾侯，晋入鲁昭公于外。',
    category: 'other',
    stateIds: ['lu', 'jin'],
    placeIds: ['qianhou'],
    zuoComment: '鲁昭公长期流亡，晋虽有意助其返国，然季平子坚拒，昭公终未能还鲁。',
  },
  {
    id: 'ev-zhao32-1', luYearId: 'zhao-32',
    jingText: '公薨于乾侯。',
    category: 'other',
    stateIds: ['lu'],
    placeIds: ['qianhou'],
    zuoComment: '鲁昭公流亡三十二年位，终薨于乾侯，不得归国，为春秋君主出奔而终的典型。',
  },
]

// ─── 定公期 ding-1..ding-15 ───
const dingSpecs = [
  {
    id: 'ev-ding1-1', luYearId: 'ding-1',
    jingText: '公即位。晋人送昭公之柩，季平子如晋拜。',
    category: 'other',
    stateIds: ['lu', 'jin'],
    placeIds: ['qufu'],
    zuoComment: '鲁定公即位，季平子赴晋谢送灵柩之礼，鲁内政仍由三桓主导。',
  },
  {
    id: 'ev-ding2-1', luYearId: 'ding-2',
    jingText: '晋赵鞅、荀寅帅师城汝滨，遂赋晋国一鼓铁，以铸刑鼎。',
    category: 'other',
    stateIds: ['jin'],
    placeIds: ['jiang'],
    zuoComment: '晋继续加强法制建设，铸刑鼎。',
  },
  {
    id: 'ev-ding3-1', luYearId: 'ding-3',
    jingText: '晋赵鞅帅师伐卫。',
    category: 'battle',
    stateIds: ['jin', 'wei'],
    placeIds: ['chengqiu'],
  },
  // ding-4 already exists (公会齐侯于夹谷 with kongzi)
  {
    id: 'ev-ding4-2', luYearId: 'ding-4',
    jingText: '冬，楚子、蔡侯、陈侯伐吴，入郢败绩。吴师入郢。',
    category: 'battle',
    stateIds: ['wu', 'chu', 'cai', 'chen'],
    placeIds: ['boju', 'ying'],
    zuoComment: '柏举之战，吴王阖庐率伍子胥、孙武大败楚军，吴师入楚都郢，楚几亡，秦出兵救楚方稳局。',
  },
  {
    id: 'ev-ding5-1', luYearId: 'ding-5',
    jingText: '楚子在秦，申包胥哭秦廷，秦出兵复楚。',
    category: 'battle',
    stateIds: ['chu', 'qin', 'wu'],
    placeIds: ['ying'],
    zuoComment: '楚平王之臣申包胥哭秦廷七日，秦出援楚，吴军疲惫而还，楚得复国。',
  },
  {
    id: 'ev-ding6-1', luYearId: 'ding-6',
    jingText: '晋赵鞅帅师伐郑，讨其附楚。',
    category: 'battle',
    stateIds: ['jin', 'zheng'],
    placeIds: ['xinzheng'],
  },
  {
    id: 'ev-ding7-1', luYearId: 'ding-7',
    jingText: '公会齐侯于颊谷。季桓子见齐女乐。',
    category: 'assembly',
    stateIds: ['lu', 'qi'],
    placeIds: ['jiagu'],
    zuoComment: '公与齐侯再度会面，齐馈女乐，季桓子接受，孔子谏阻无效，后辞官离鲁。',
  },
  // ding-8 already exists (齐人来归郓欢龟阴田)
  {
    id: 'ev-ding9-1', luYearId: 'ding-9',
    jingText: '公会吴于橐皋。',
    category: 'assembly',
    stateIds: ['lu', 'wu'],
    placeIds: ['jiashan'],
    zuoComment: '吴国崛起后，鲁与吴开始会盟，显示春秋晚期外交格局的变化。',
  },
  {
    id: 'ev-ding10-1', luYearId: 'ding-10',
    jingText: '公会晋侯于黄父。',
    category: 'assembly',
    stateIds: ['lu', 'jin'],
    placeIds: ['jiang'],
    zuoComment: '鲁晋会盟于黄父，仍维持传统盟友关系。',
  },
  {
    id: 'ev-ding11-1', luYearId: 'ding-11',
    jingText: '叔孙州仇、仲孙何忌帅师围费，弗克。',
    category: 'battle',
    stateIds: ['lu'],
    placeIds: ['qufu'],
    zuoComment: '鲁欲堕三都（费、后、成）以削弱三桓私邑，围费未克，孔子堕都计划受挫。',
  },
  {
    id: 'ev-ding12-1', luYearId: 'ding-12',
    jingText: '公会吴及诸侯于橐皋。',
    category: 'assembly',
    stateIds: ['lu', 'wu', 'qi', 'song'],
    placeIds: ['jiashan'],
    zuoComment: '吴主导中原诸侯会盟，标志吴已跻身春秋晚期强国之列。',
  },
  // ding-13 already exists (吴人伐越)
  {
    id: 'ev-ding14-1', luYearId: 'ding-14',
    jingText: '越王勾践帅师与吴战于携李，吴王阖庐伤指薨。',
    category: 'battle',
    stateIds: ['wu', 'yue'],
    placeIds: ['guiji'],
    zuoComment: '越王勾践大败吴军于携李，吴王阖庐伤足指，归途中薨；吴夫差即位，誓报父仇。',
  },
  {
    id: 'ev-ding15-1', luYearId: 'ding-15',
    jingText: '公薨。',
    category: 'other',
    stateIds: ['lu'],
    placeIds: ['qufu'],
    zuoComment: '鲁定公薨，孔子此时已离鲁，定公时代见证了孔子仕鲁、三桓坐大与吴越争霸的时代大转折。',
  },
]

const allSpecs = [...xiangSpecs, ...zhaoSpecs, ...dingSpecs]
for (const spec of allSpecs) {
  const {
    id, luYearId, jingText, category, stateIds, placeIds,
    zuoComment, personIds, territoryChanges,
  } = spec
  pushEvent({
    id,
    luYearId,
    jingText,
    category,
    stateIds,
    placeIds: placeIds ?? [],
    personIds: personIds ?? [],
    sourceType: 'jing',
    sourceRef: `《春秋》${luYearId.replace('xiang', '襄公').replace('zhao', '昭公').replace('ding', '定公').replace('-', '')}年`,
    certainty: 'medium',
    ...(zuoComment ? { zuoComment } : {}),
    ...(territoryChanges ? { territoryChanges } : {}),
  })
}

// ═══ 外交关系：扩展/新增 xiang/zhao/ding 段 ═══

// 1. rel-jin-lu-ally-xi: 已覆盖到 cheng-18；扩展到 xiang-27（弭兵后格局改变）
const relJinLu = relations.find((r) => r.id === 'rel-jin-lu-ally-xi')
if (relJinLu) {
  relJinLu.activeLuYears = sortLuYears([
    ...relJinLu.activeLuYears,
    ...span('xiang', 1, 27),
  ])
}

// 2. rel-jin-chu-enemy-xi：已覆盖到 cheng-18；延至 xiang-27 弭兵
const relJinChu = relations.find((r) => r.id === 'rel-jin-chu-enemy-xi')
if (relJinChu) {
  relJinChu.activeLuYears = sortLuYears([
    ...relJinChu.activeLuYears,
    ...span('xiang', 1, 27),
  ])
}

// 3. 新增：晋鲁盟（xiang-28..zhao-25，弭兵后晋鲁维系）
if (!relations.some((r) => r.id === 'rel-jin-lu-ally-xiang')) {
  relations.push({
    id: 'rel-jin-lu-ally-xiang',
    fromId: 'jin',
    toId: 'lu',
    type: 'ally',
    activeLuYears: sortLuYears([...span('xiang', 28, 31), ...span('zhao', 1, 25)]),
    sourceType: 'jing',
    sourceRef: '《春秋》弭兵后鲁仍频繁朝晋，晋主盟地位延续；昭公出奔亦奔晋求援。',
    certainty: 'high',
  })
}

// 4. 新增：吴楚敌对（xiang-26 起至 ding-5）
if (!relations.some((r) => r.id === 'rel-wu-chu-enemy-xiang')) {
  relations.push({
    id: 'rel-wu-chu-enemy-xiang',
    fromId: 'wu',
    toId: 'chu',
    type: 'enemy',
    activeLuYears: sortLuYears([
      ...span('xiang', 26, 31),
      ...span('zhao', 1, 32),
      ...span('ding', 1, 10),
    ]),
    sourceType: 'jing',
    sourceRef: '《春秋》襄公二十六年起吴楚屡次交兵，定公四年柏举之战吴入郢，为顶峰。',
    certainty: 'high',
  })
}

// 5. 扩展 rel-wu-yue-enemy：已有 ding-1/ai-1/ai-14；补 zhao/ding 全段
const relWuYue = relations.find((r) => r.id === 'rel-wu-yue-enemy')
if (relWuYue) {
  relWuYue.activeLuYears = sortLuYears([
    ...relWuYue.activeLuYears,
    ...span('zhao', 28, 32),
    ...span('ding', 1, 15),
  ])
}

// 6. 新增：楚鲁友好（昭公出奔后鲁与楚一度外交联系）
if (!relations.some((r) => r.id === 'rel-lu-chu-ally-zhao')) {
  relations.push({
    id: 'rel-lu-chu-ally-zhao',
    fromId: 'lu',
    toId: 'chu',
    type: 'ally',
    activeLuYears: sortLuYears([...span('xiang', 27, 31), ...span('zhao', 1, 15)]),
    sourceType: 'jing',
    sourceRef: '《春秋》弭兵后鲁须同时朝晋朝楚，昭公时鲁公曾如楚，体现晋楚共霸格局。',
    certainty: 'medium',
  })
}

// 7. 新增：齐鲁友好（定公期齐归田，关系缓和）
if (!relations.some((r) => r.id === 'rel-lu-qi-ally-ding')) {
  relations.push({
    id: 'rel-lu-qi-ally-ding',
    fromId: 'lu',
    toId: 'qi',
    type: 'ally',
    activeLuYears: sortLuYears([...span('ding', 8, 15)]),
    sourceType: 'jing',
    sourceRef: '《春秋》定公八年齐人来归郓欢龟阴田，鲁齐关系改善；定公期多有外交往来。',
    certainty: 'medium',
  })
}

// 8. 新增：鲁吴外交（xiang-29 以后）
if (!relations.some((r) => r.id === 'rel-lu-wu-ally-xiang')) {
  relations.push({
    id: 'rel-lu-wu-ally-xiang',
    fromId: 'lu',
    toId: 'wu',
    type: 'ally',
    activeLuYears: sortLuYears([
      'xiang-29',
      ...span('ding', 9, 15),
    ]),
    sourceType: 'jing',
    sourceRef: '《春秋》吴季札聘鲁（襄公二十九年），定公期公会吴于橐皋，两国维持外交联系。',
    certainty: 'medium',
  })
}

// 9. 新增：晋楚共霸（弭兵后 xiang-27..zhao-20 左右）
if (!relations.some((r) => r.id === 'rel-jin-chu-ally-bimbing')) {
  relations.push({
    id: 'rel-jin-chu-ally-bimbing',
    fromId: 'jin',
    toId: 'chu',
    type: 'ally',
    activeLuYears: sortLuYears([...span('xiang', 27, 31), ...span('zhao', 1, 20)]),
    sourceType: 'zuozhuan',
    sourceRef: '《左传》向戌弭兵（襄公二十七年）：晋楚共主盟，诸侯分属两霸各朝，是为晋楚共霸局面。',
    certainty: 'high',
  })
}

// ═══ 写出所有文件 ═══
write('places.json', places)
write('persons.json', persons)
write('relations.json', relations)
write('events.json', events)
console.log('注入完成。')
