/**
 * 庄公与闵公时期外交关系注入脚本
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

// 生成 zhuang-1 到 zhuang-32 的年份数组
function zhuangYears(from = 1, to = 32) {
  return Array.from({ length: to - from + 1 }, (_, i) => `zhuang-${from + i}`)
}
const ALL_ZHUANG = zhuangYears()
const ALL_MIN    = ['min-1', 'min-2']

const relations = readJSON('relations.json')
const existingIds = new Set(relations.map(r => r.id))

const newRelations = [
  /* ─── 鲁齐同盟（庄公全期 + 闵公）─────────────────── */
  {
    id: 'rel-lu-qi-ally-zhuang',
    fromId: 'lu',
    toId: 'qi',
    type: 'ally',
    activeLuYears: [...ALL_ZHUANG, ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公通贯。庄公期间鲁齐多次会盟，柯之盟（庄13）后齐归侵地，两国盟好持续，哀姜归鲁（庄24）更以婚姻固结同盟。',
    certainty: 'high'
  },
  /* ─── 鲁齐婚姻（庄22 哀姜纳币，庄24 哀姜至）──────── */
  {
    id: 'rel-lu-qi-marriage-zhuang',
    fromId: 'lu',
    toId: 'qi',
    type: 'marriage',
    activeLuYears: [...zhuangYears(22, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公二十二年：公如齐纳币；二十四年：哀姜至。',
    certainty: 'high'
  },
  /* ─── 齐宋盟好（北杏会盟 庄13后）──────────────────── */
  {
    id: 'rel-qi-song-ally-zhuang',
    fromId: 'qi',
    toId: 'song',
    type: 'ally',
    activeLuYears: [...zhuangYears(13, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十三年：会于北杏（宋人在列）；北杏会盟后宋入齐桓公霸联，伐宋之役（庄14）后宋服。',
    certainty: 'high'
  },
  /* ─── 齐卫盟好（庄13后）──────────────────────────── */
  {
    id: 'rel-qi-wei-ally-zhuang',
    fromId: 'qi',
    toId: 'wei',
    type: 'ally',
    activeLuYears: [...zhuangYears(13, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十三年：会于北杏，卫人参与；闵公二年：齐桓公救卫于楚丘。',
    certainty: 'high'
  },
  /* ─── 齐陈盟好（庄13后）──────────────────────────── */
  {
    id: 'rel-qi-chen-ally-zhuang',
    fromId: 'qi',
    toId: 'chen',
    type: 'ally',
    activeLuYears: [...zhuangYears(13, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十三年：会于北杏，陈人在列；陈为齐霸体系成员。',
    certainty: 'medium'
  },
  /* ─── 齐郑盟好（庄13后，郑陆续归附）───────────────── */
  {
    id: 'rel-qi-zheng-ally-zhuang',
    fromId: 'qi',
    toId: 'zheng',
    type: 'ally',
    activeLuYears: [...zhuangYears(14, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十五年：鄄之会，郑伯参会，归附齐霸。',
    certainty: 'high'
  },
  /* ─── 齐燕盟好（庄30 齐救燕后）────────────────────── */
  {
    id: 'rel-qi-yan-ally-zhuang',
    fromId: 'qi',
    toId: 'yan',
    type: 'ally',
    activeLuYears: [...zhuangYears(30, 32), ...ALL_MIN],
    sourceType: 'zuozhuan',
    sourceRef: '《左传》庄公三十年：山戎伐燕，齐桓公救燕，并割燕所至之地与燕，燕感德归附。',
    certainty: 'high'
  },
  /* ─── 楚郑敌对（庄11起，荆入郑后）─────────────────── */
  {
    id: 'rel-chu-zheng-enemy-zhuang',
    fromId: 'chu',
    toId: 'zheng',
    type: 'enemy',
    activeLuYears: [...zhuangYears(11, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十一年：荆入郑；楚文王伐郑，两国持续摩擦，郑逐渐归附齐霸以抗楚。',
    certainty: 'high'
  },
  /* ─── 楚蔡敌对（庄10 荆入蔡后）────────────────────── */
  {
    id: 'rel-chu-cai-enemy-zhuang',
    fromId: 'chu',
    toId: 'cai',
    type: 'enemy',
    activeLuYears: [...zhuangYears(10, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十年：秋，荆入蔡；楚对蔡采取压迫政策，持续整个庄闵时期。',
    certainty: 'high'
  },
  /* ─── 楚宋敌对（楚向北扩张，宋为路障）─────────────── */
  {
    id: 'rel-chu-song-enemy-zhuang',
    fromId: 'chu',
    toId: 'song',
    type: 'enemy',
    activeLuYears: [...zhuangYears(10, 32), ...ALL_MIN],
    sourceType: 'zuozhuan',
    sourceRef: '《左传》庄公通贯。楚北扩与宋多次冲突，宋为中原壁垒；僖公时城濮之战前形势延续于此。',
    certainty: 'medium'
  },
  /* ─── 齐纪敌对（庄1-4，齐兼并纪）──────────────────── */
  {
    id: 'rel-qi-ji-enemy-zhuang',
    fromId: 'qi',
    toId: 'ji2',
    type: 'enemy',
    activeLuYears: zhuangYears(1, 4),
    sourceType: 'jing',
    sourceRef: '《春秋》庄公三年：纪季以酅入于齐；四年：纪侯大去其国。齐出于世仇（哀公被烹）三世伐纪，终灭之。',
    certainty: 'high'
  },
  /* ─── 鲁纪盟好（庄1-4，鲁与纪有旧谊）──────────────── */
  {
    id: 'rel-lu-ji-ally-zhuang',
    fromId: 'lu',
    toId: 'ji2',
    type: 'ally',
    activeLuYears: zhuangYears(1, 4),
    sourceType: 'jing',
    sourceRef: '《春秋》隐公二年起鲁纪多次会盟，庄公时期鲁保持与纪的外交，直至纪灭。',
    certainty: 'medium'
  },
  /* ─── 鲁周朝贡（庄公时期）──────────────────────────── */
  {
    id: 'rel-lu-zhou-tributary-zhuang',
    fromId: 'lu',
    toId: 'zhou',
    type: 'tributary',
    activeLuYears: ALL_ZHUANG,
    sourceType: 'jing',
    sourceRef: '《春秋》庄公时期周王数度使人来聘（庄16年王使召伯赐命），鲁奉周正朔，按礼朝贡。',
    certainty: 'high'
  },
  /* ─── 邢受狄侵扰（闵1-2）─────────────────────────── */
  {
    id: 'rel-qi-xing-ally-min',
    fromId: 'qi',
    toId: 'xing',
    type: 'ally',
    activeLuYears: ALL_MIN,
    sourceType: 'zuozhuan',
    sourceRef: '《左传》闵公元年：狄伐邢，管仲建议桓公援邢；齐先后救邢、救卫，是为「存三国」之一。',
    certainty: 'medium'
  },
  /* ─── 齐救卫（闵2）──────────────────────────────── */
  {
    id: 'rel-qi-wei-rescue-min',
    fromId: 'qi',
    toId: 'wei',
    type: 'ally',
    activeLuYears: ['min-2'],
    sourceType: 'jing',
    sourceRef: '《春秋》闵公二年：齐侯、宋公、曹伯城楚丘而封卫焉，《左传》详述齐桓公救卫经过。',
    certainty: 'high'
  },
  /* ─── 鲁宋时战时和（庄9-12 前有冲突）──────────────── */
  {
    id: 'rel-lu-song-neutral-zhuang-early',
    fromId: 'lu',
    toId: 'song',
    type: 'enemy',
    activeLuYears: zhuangYears(9, 14),
    sourceType: 'jing',
    sourceRef: '《春秋》庄公九年：宋人伐我；十年：宋人伐我入鄙；鲁宋庄公前期有持续敌对。',
    certainty: 'high'
  },
  /* ─── 鲁宋盟好（庄13后，共服齐霸）─────────────────── */
  {
    id: 'rel-lu-song-ally-zhuang-late',
    fromId: 'lu',
    toId: 'song',
    type: 'ally',
    activeLuYears: [...zhuangYears(15, 32), ...ALL_MIN],
    sourceType: 'jing',
    sourceRef: '《春秋》庄公十五年鄄之会后，宋入齐霸体系，鲁宋同为盟国，敌对结束。',
    certainty: 'medium'
  }
]

const toAdd = newRelations.filter(r => !existingIds.has(r.id))
console.log(`新增外交关系 ${toAdd.length} 条`)
writeJSON('relations.json', [...relations, ...toAdd])
