/**
 * 全局史实校订 —— 事件与外交关系
 *
 * 问题分类：
 * A. 事件错年 / 内容重复（xi24/xi29/xi5-1）
 * B. sourceType 错标或 jingText 混入传文叙事（zhuang30/xi8）
 * C. 地点用都城代替会战地（xiang11）
 * D. stateIds/placeIds 与文本不符（xi2-1）
 * E. territoryChange 挂在错误事件上（xi2-2）
 * F. 多事件塞进一条（zhao16）
 * G. 外交关系年份过度连续化（lu-qi ally/hostile/jin-chu enemy）
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA = path.join(__dirname, '../src/data/sample')
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf-8'))
const write = (f, d) => {
  fs.writeFileSync(path.join(DATA, f), JSON.stringify(d, null, 2) + '\n', 'utf-8')
  console.log('✓', f)
}

let events = read('events.json')
let relations = read('relations.json')

function patchEvent(id, patch) {
  const ev = events.find((e) => e.id === id)
  if (!ev) { console.warn('⚠ patchEvent: not found', id); return }
  Object.assign(ev, patch)
  console.log('  patched event', id)
}

function patchRel(id, patch) {
  const r = relations.find((x) => x.id === id)
  if (!r) { console.warn('⚠ patchRel: not found', id); return }
  Object.assign(r, patch)
  console.log('  patched relation', id)
}

// ════════════════════════════════════════════════════════
// A. 事件错年 / 重复
// ════════════════════════════════════════════════════════

// ev-xi5-1：与 ev-xi5-3 重复（均写"楚人灭弦"），且地点错用了 ying（楚都）。
// 转为首止之盟（前655年，僖公五年真实经文）——齐桓公召诸侯于首止拥立周太子郑。
patchEvent('ev-xi5-1', {
  jingText: '公会齐侯、宋公、陈侯、卫侯、郑伯、许男、曹伯于首止。',
  category: 'assembly',
  stateIds: ['lu', 'qi', 'song', 'chen', 'wei', 'zheng', 'cao'],
  placeIds: [],  // 首止地点尚未在 places.json，不用错误地点占位
  sourceType: 'jing',
  sourceRef: '《春秋》僖公五年',
  certainty: 'high',
  territoryChanges: [],
  zuoComment: '齐桓公召诸侯会于首止（今河南睢县附近），共同拥立周太子郑（即后来的周襄王），以稳定王室秩序；楚对此不满，但诸侯霸联进一步巩固。',
})

// ev-xi24-1："晋人、秦人围郑" 是烛之武退秦师事件（前630年，僖公三十年），
// 而非僖公二十四年（前636年）。ev-xi30-1 已正确记录该事件。
// 改为前636年真实经文："天王出居于郑"（周襄王被王子带逐，出居于郑）。
patchEvent('ev-xi24-1', {
  jingText: '天王出居于郑。',
  category: 'political',
  stateIds: ['zhou', 'zheng'],
  placeIds: ['xinzheng'],
  sourceType: 'jing',
  sourceRef: '《春秋》僖公二十四年',
  certainty: 'high',
  territoryChanges: [],
  zuoComment: '周惠王弟王子带勾结狄人作乱，周惠王（一说周襄王）被迫出奔居于郑，晋文公归国同年。此事彰显周室衰微，晋文公后因"尊王"出师勤王，平定王室之乱。',
})

// ev-xi29-1："晋人执虞公，以归" 属于僖公五年（xi-5）灭虢后顺道灭虞之事，
// 在僖公二十九年重现是错年。僖公二十九年（前631年）卫成公郑复归于卫是正确内容。
patchEvent('ev-xi29-1', {
  jingText: '卫侯郑复归于卫。',
  category: 'succession',
  stateIds: ['wei', 'jin'],
  placeIds: ['chengqiu'],
  sourceType: 'jing',
  sourceRef: '《春秋》僖公二十九年',
  certainty: 'high',
  zuoComment: '晋文公主盟期间，卫成公郑（曾被晋拘押）获释，经晋许可复归卫国，卫在城濮之战后局势稳定。',
})

// ════════════════════════════════════════════════════════
// B. jingText 混入传文叙事 / sourceType 错标
// ════════════════════════════════════════════════════════

// ev-zhuang30-1：jingText 直接夹带"传曰：山戎伐燕……"，应只保留经文简语，
// 传文背景移入 zuoComment。
patchEvent('ev-zhuang30-1', {
  jingText: '夏，齐人伐山戎，救燕。',
  zuoComment: '山戎南侵伐燕，燕告急于齐，齐桓公率诸侯师北伐山戎，燕庄公送齐侯出境越礼。管仲曰：「诸侯之礼，不出境。」桓公割燕所至之地与燕，此为存燕之举，彰显齐霸仁义。',
})

// ev-xi8-1：jingText 把"楚人伐郑"与"晋里克杀奚齐"混写在一起，逻辑混乱。
// 此条是 zuozhuan 源，应聚焦在晋骊姬之乱，楚伐郑背景放 zuoComment。
patchEvent('ev-xi8-1', {
  jingText: '晋里克弑奚齐。',
  category: 'succession',
  stateIds: ['jin'],
  placeIds: [],
  sourceType: 'zuozhuan',
  sourceRef: '《左传》僖公八年',
  certainty: 'high',
  zuoComment: '晋献公薨，骊姬之乱：里克趁丧杀骊姬所立奚齐，荀息殉之；随后卓子亦被杀，晋国大乱，夷吾（晋惠公）借秦力入晋。同年楚人伐郑并于成周，但两事不应并为一条。',
})

// ════════════════════════════════════════════════════════
// C. 地点用都城代替会地
// ════════════════════════════════════════════════════════

// ev-xiang11-1："晋侯会吴于柤" 地点用了 gushu（姑苏，吴国都城），
// 柤 是两国在吴楚边境的专门会地（今苏皖边境），与吴都无关。
// 暂无独立 place 条目，清除错误 placeIds。
patchEvent('ev-xiang11-1', {
  placeIds: [],
  zuoComment: '晋侯与吴子会于柤（今苏皖边境约今安徽泗县附近，具体位置尚有争议），晋通过结吴形成对楚东侧夹击态势，是晋拉拢吴国战略的重要一步。',
})

// ════════════════════════════════════════════════════════
// D. stateIds / placeIds 与文本不符
// ════════════════════════════════════════════════════════

// ev-xi2-1："齐侯、宋公、江人、黄人盟于贯"
// stateIds 挂了 lu（鲁不在贯盟经文中），placeIds 错用 linzi（齐都）和 shangqiu（宋都）。
// 贯（今山东曹县东北）暂无 place 条目，清除错误 placeIds；江黄两国补入 stateIds。
patchEvent('ev-xi2-1', {
  stateIds: ['qi', 'song', 'jiang', 'huang'],
  placeIds: [],  // 贯地未在 places.json，不用错误都城代替
  zuoComment: '齐桓公联合宋、江、黄在贯会盟，以防楚北扩之势，江黄两国为嬴姓小国，素亲齐而抗楚。',
})

// ════════════════════════════════════════════════════════
// E. territoryChange 挂在错误事件上
// ════════════════════════════════════════════════════════

// ev-xi2-2：领土变化写 yucheng（虞城）→ 晋，但虞被晋灭是僖公五年（xi-5）之事，
// 已在 ev-xi5-2 中正确记录。僖公二年（xi-2）楚伐郑没有涉及虞的归属变化。
patchEvent('ev-xi2-2', {
  territoryChanges: [],
  zuoComment: '僖公二年冬，楚人伐郑，郑告急于齐，齐不及救。此为楚北扩态势之一环，郑处于楚齐拉锯之中。虞城归晋属僖公五年事（ev-xi5-2），不在本年。',
})

// ════════════════════════════════════════════════════════
// F. 多事件塞进一条
// ════════════════════════════════════════════════════════

// ev-zhao16-1："公如晋，蔡侯为楚所胁，楚灵王大会诸侯于申" ——
// 楚灵王大会诸侯于申是昭公十二年（zhao-12）之事，已在 ev-zhao12-1 正确记载；
// 且楚灵王已于昭公十三年（zhao-13）被弃疾所杀，昭公十六年（zhao-16，前526年）
// 已是楚平王时期，无从"楚灵王大会"。此处仅保留"公如晋"作为本年实际记录。
patchEvent('ev-zhao16-1', {
  jingText: '公如晋。',
  category: 'diplomatic',
  stateIds: ['lu', 'jin'],
  placeIds: [],
  sourceType: 'jing',
  sourceRef: '《春秋》昭公十六年',
  certainty: 'high',
  zuoComment: '昭公十六年鲁侯朝晋，晋平公末年，韩宣子为政；楚灵王已死于昭公十三年，申会是昭公十二年事，不属本年。',
})

// ════════════════════════════════════════════════════════
// G. 外交关系年份过度连续化
// ════════════════════════════════════════════════════════

// rel-lu-qi-ally-zhuang：庄公九年（zhuang-9）鲁纳子纠、十年（zhuang-10）长勺之战，
// 两年实属鲁齐交战期，不应标为 ally。
const luQiAllyZhuang = relations.find((r) => r.id === 'rel-lu-qi-ally-zhuang')
if (luQiAllyZhuang) {
  luQiAllyZhuang.activeLuYears = luQiAllyZhuang.activeLuYears.filter(
    (y) => !['zhuang-9', 'zhuang-10'].includes(y),
  )
  luQiAllyZhuang.sourceRef =
    '《春秋》庄公通贯（除庄公九、十年乾时/长勺交兵期间）。庄公期间鲁齐多次会盟，柯之盟（庄13）后齐归侵地，两国盟好持续；哀姜归鲁（庄24）更以婚姻固结。'
  console.log('  patched relation rel-lu-qi-ally-zhuang (removed zhuang-9, zhuang-10)')
}

// rel-jin-chu-enemy-xi：晋楚敌对延伸到 xiang-27（向戌弭兵年），弭兵是晋楚正式停战节点，
// 该年不应再视为敌对。停在 xiang-26。
const jinChuEnemy = relations.find((r) => r.id === 'rel-jin-chu-enemy-xi')
if (jinChuEnemy) {
  jinChuEnemy.activeLuYears = jinChuEnemy.activeLuYears.filter((y) => y !== 'xiang-27')
  jinChuEnemy.sourceRef =
    '《春秋》僖公二十七至三十三年。晋楚争霸，城濮之战（僖公二十八年）晋大败楚；此后晋楚持续角力至向戌弭兵（襄公二十七年）前，故本关系止于 xiang-26。'
  console.log('  patched relation rel-jin-chu-enemy-xi (removed xiang-27)')
}

// rel-lu-qi-hostile-ai：ai-9 年齐人来归郓、讙、龟阴之田，是外交缓和/归田，
// 不应标为敌对年。敌对期保留 ai-10（齐伐鲁）和 ai-11（鲁吴联伐齐）。
const luQiHostileAi = relations.find((r) => r.id === 'rel-lu-qi-hostile-ai')
if (luQiHostileAi) {
  luQiHostileAi.activeLuYears = luQiHostileAi.activeLuYears.filter((y) => y !== 'ai-9')
  luQiHostileAi.sourceRef =
    '《春秋》哀公十年齐国书伐鲁、十一年鲁与吴联合伐齐艾陵之战（ai-9 齐归郓讙为缓和期，不计入）。'
  console.log('  patched relation rel-lu-qi-hostile-ai (removed ai-9)')
}

// ════════════════════════════════════════════════════════
// 写出
// ════════════════════════════════════════════════════════
write('events.json', events)
write('relations.json', relations)

console.log('\n=== 史实校订完成 ===')
console.log('如需验证：npm run validate:data && npm run build')
