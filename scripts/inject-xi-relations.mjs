/**
 * 僖公时期外交关系注入
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

function xiYears(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => `xi-${from + i}`)
}

const relations = readJSON('relations.json')
const existIds = new Set(relations.map(r => r.id))

const newRelations = [
  /* ── 齐桓霸业体系（xi-1..xi-9 为核心）───────────── */
  {
    id: 'rel-qi-chu-enemy-xi',
    fromId: 'qi', toId: 'chu', type: 'enemy',
    activeLuYears: xiYears(1, 9),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公四年：齐率诸侯伐楚，召陵之盟，管仲责楚贡茅不入；僖公五年楚灭弦进一步南扩，齐楚对峙。',
    certainty: 'high'
  },
  {
    id: 'rel-qi-lu-ally-xi-early',
    fromId: 'qi', toId: 'lu', type: 'ally',
    activeLuYears: xiYears(1, 16),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公通贯。鲁参与齐主导的多次诸侯会盟，为齐霸体系核心成员。',
    certainty: 'high'
  },
  {
    id: 'rel-qi-song-ally-xi-early',
    fromId: 'qi', toId: 'song', type: 'ally',
    activeLuYears: xiYears(1, 9),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二年：齐宋等会于贯；葵丘之会宋亦与盟，为齐霸体系成员。',
    certainty: 'high'
  },
  {
    id: 'rel-qi-wei-ally-xi-early',
    fromId: 'qi', toId: 'wei', type: 'ally',
    activeLuYears: [...xiYears(1, 16), 'min-1', 'min-2'],
    sourceType: 'jing',
    sourceRef: '《春秋》齐桓公救卫（闵公二年），此后卫为齐霸体系成员。',
    certainty: 'high'
  },
  {
    id: 'rel-qi-zheng-ally-xi-early',
    fromId: 'qi', toId: 'zheng', type: 'ally',
    activeLuYears: xiYears(1, 9),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公通贯前段，郑参与召陵之盟、葵丘之会等。',
    certainty: 'high'
  },
  {
    id: 'rel-qi-chen-ally-xi-early',
    fromId: 'qi', toId: 'chen', type: 'ally',
    activeLuYears: xiYears(1, 9),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公通贯前段，陈参与多次齐主盟会。',
    certainty: 'medium'
  },
  {
    id: 'rel-qi-cai-ally-xi-early',
    fromId: 'qi', toId: 'cai', type: 'ally',
    activeLuYears: xiYears(1, 9),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公四年：齐因蔡姬事伐蔡，后与蔡共伐楚；召陵之盟后蔡仍为齐霸体系一员。',
    certainty: 'medium'
  },
  /* ── 楚郑 / 楚宋 / 楚蔡持续扩张───────────────────── */
  {
    id: 'rel-chu-zheng-enemy-xi',
    fromId: 'chu', toId: 'zheng', type: 'enemy',
    activeLuYears: xiYears(1, 27),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二年至二十七年，楚屡次伐郑；城濮后郑转投晋。',
    certainty: 'high'
  },
  {
    id: 'rel-chu-song-enemy-xi',
    fromId: 'chu', toId: 'song', type: 'enemy',
    activeLuYears: xiYears(12, 28),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公十二年以后楚北扩，宋图霸，双方对立；泓之战（僖公二十二年）宋败。',
    certainty: 'high'
  },
  {
    id: 'rel-chu-cai-enemy-xi',
    fromId: 'chu', toId: 'cai', type: 'enemy',
    activeLuYears: xiYears(1, 28),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公通贯，楚持续压制蔡国，蔡常被迫随楚伐他国。',
    certainty: 'medium'
  },
  {
    id: 'rel-chu-huang-enemy-xi',
    fromId: 'chu', toId: 'huang', type: 'enemy',
    activeLuYears: xiYears(1, 12),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公十二年：秋，楚人灭黄。黄为嬴姓亲齐小国，被楚吞并。',
    certainty: 'high'
  },
  {
    id: 'rel-chu-jiang-enemy-xi',
    fromId: 'chu', toId: 'jiang', type: 'enemy',
    activeLuYears: xiYears(12, 26),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二十六年：楚人灭江。黄亡后江孤立无援，终被楚灭。',
    certainty: 'high'
  },
  /* ── 秦晋关系（盟→敌） ────────────────────────────── */
  {
    id: 'rel-qin-jin-ally-xi-early',
    fromId: 'qin', toId: 'jin', type: 'ally',
    activeLuYears: xiYears(5, 14),
    sourceType: 'zuozhuan',
    sourceRef: '《左传》僖公五至十四年。秦穆公送夷吾归晋即位（僖公九年），又援晋粮（泛舟之役，僖公十三年），两国盟好。',
    certainty: 'high'
  },
  {
    id: 'rel-qin-jin-enemy-xi-late',
    fromId: 'qin', toId: 'jin', type: 'enemy',
    activeLuYears: xiYears(15, 33),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公十五年：晋秦韩原之战，晋惠公被俘；此后双方时有摩擦；殽之战（僖公三十三年）彻底决裂。',
    certainty: 'high'
  },
  {
    id: 'rel-qin-jin-marriage-xi',
    fromId: 'qin', toId: 'jin', type: 'marriage',
    activeLuYears: xiYears(15, 23),
    sourceType: 'zuozhuan',
    sourceRef: '《左传》僖公十五年后晋太子圉质秦，娶秦女；重耳流亡亦娶秦女；秦晋多次联姻史称「秦晋之好」。',
    certainty: 'high'
  },
  /* ── 晋霸体系（xi-28起） ──────────────────────────── */
  {
    id: 'rel-jin-chu-enemy-xi',
    fromId: 'jin', toId: 'chu', type: 'enemy',
    activeLuYears: xiYears(27, 33),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二十七至三十三年。晋楚争霸，城濮之战（僖公二十八年）晋大败楚，晋霸确立。',
    certainty: 'high'
  },
  {
    id: 'rel-jin-zhou-ally-xi',
    fromId: 'jin', toId: 'zhou', type: 'ally',
    activeLuYears: xiYears(25, 33),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二十五年起，晋文公尊王攘夷，奉周天子，践土之盟天子命晋为伯，晋周关系密切。',
    certainty: 'high'
  },
  {
    id: 'rel-jin-lu-ally-xi',
    fromId: 'jin', toId: 'lu', type: 'ally',
    activeLuYears: xiYears(28, 33),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二十八年践土之盟，鲁参与晋主导之霸联；鲁由齐霸体系转入晋霸体系。',
    certainty: 'high'
  },
  {
    id: 'rel-jin-song-ally-xi',
    fromId: 'jin', toId: 'song', type: 'ally',
    activeLuYears: xiYears(27, 33),
    sourceType: 'zuozhuan',
    sourceRef: '《左传》僖公二十七年。晋救宋以报旧恩，宋随晋霸，参与城濮之战、践土之盟。',
    certainty: 'high'
  },
  {
    id: 'rel-jin-zheng-enemy-xi',
    fromId: 'jin', toId: 'zheng', type: 'enemy',
    activeLuYears: xiYears(24, 30),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二十四年：晋秦围郑，以郑无礼于晋且贰于楚；僖公三十年再围；郑事晋后改善。',
    certainty: 'high'
  },
  /* ── 鲁的关系转移 ────────────────────────────────── */
  {
    id: 'rel-lu-zhou-tributary-xi',
    fromId: 'lu', toId: 'zhou', type: 'tributary',
    activeLuYears: xiYears(1, 33),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公通贯，鲁奉周正朔，按礼朝贡。',
    certainty: 'high'
  },
  {
    id: 'rel-lu-qi-ally-xi-early',
    fromId: 'lu', toId: 'qi', type: 'ally',
    activeLuYears: xiYears(1, 16),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公早期，鲁随齐参与多次诸侯盟会。',
    certainty: 'high'
  },
  {
    id: 'rel-lu-jin-ally-xi-late',
    fromId: 'lu', toId: 'jin', type: 'ally',
    activeLuYears: xiYears(28, 33),
    sourceType: 'jing',
    sourceRef: '《春秋》僖公二十八年起，鲁转入晋霸体系。',
    certainty: 'high'
  }
]

const toAdd = newRelations.filter(r => !existIds.has(r.id))
console.log(`新增外交关系 ${toAdd.length} 条`)
writeJSON('relations.json', [...relations, ...toAdd])
