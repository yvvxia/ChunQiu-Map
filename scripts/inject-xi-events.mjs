/**
 * 僖公时期事件注入（xi-1 至 xi-33）
 * 按四阶段分批：
 *   A: xi-1..xi-9   齐桓霸业后段
 *   B: xi-10..xi-18 桓公晚年与晋国动乱
 *   C: xi-19..xi-27 宋楚泓之战·晋文归国
 *   D: xi-28..xi-33 城濮·践土·殽之战
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

const events = readJSON('events.json')
const existIds = new Set(events.map(e => e.id))

/* ─────────────────────────────────────────────────────────────────────────────
   阶段 A：xi-1..xi-9  前659—前651  齐桓霸业后段
   ───────────────────────────────────────────────────────────────────────────── */
const phaseA = [
  // xi-1 前659
  {
    id: 'ev-xi1-1', luYearId: 'xi-1',
    jingText: '狄灭邢，邢人出奔。',
    zuoComment: '邢溃，邢人出奔。二月，邢迁于陈仪，以邢之亡，不救之罪，齐桓公迁邢于夷仪。',
    category: 'battle', stateIds: ['xing'],
    placeIds: ['xingguo'], personIds: [],
    sourceType: 'jing', sourceRef: '《春秋》僖公元年', certainty: 'high'
  },
  {
    id: 'ev-xi1-2', luYearId: 'xi-1',
    jingText: '夏，公会齐侯、宋公、曹伯救邢。',
    zuoComment: '齐桓公率诸侯救邢，将邢迁于夷仪，重建邢国，此为「存三国」之一。',
    category: 'assembly', stateIds: ['qi','lu','song','cao'],
    placeIds: ['xingguo'], personIds: ['qi-huangong','lu-xi'],
    sourceType: 'jing', sourceRef: '《春秋》僖公元年', certainty: 'high'
  },
  // xi-2 前658
  // ev-xi2-1 已有（贯之盟）
  {
    id: 'ev-xi2-2', luYearId: 'xi-2',
    jingText: '冬，楚人伐郑，郑告急于齐。',
    category: 'battle', stateIds: ['chu','zheng','qi'],
    placeIds: ['xinzheng','fangcheng'], personIds: ['chu-chengwang','zheng-wengong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二年', certainty: 'high'
  },
  {
    id: 'ev-xi2-3', luYearId: 'xi-2',
    jingText: '夏，诸侯城楚丘。虢灭。晋献公伐虞，虞公不听百里奚谏而假虞道，晋遂灭虢，返师灭虞。',
    zuoComment: '宫之奇谏虞公，「辅车相依，唇亡齿寒」；公不听，晋灭虢，师还，袭虞，执虞公。',
    category: 'battle', stateIds: ['jin'],
    placeIds: ['yong'], personIds: ['jin-xiangong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二年（虢虞之战）', certainty: 'high'
  },
  // xi-3 前657
  {
    id: 'ev-xi3-1', luYearId: 'xi-3',
    jingText: '齐侯与蔡姬乘舟，荡公。公惧，变色，禁之不可，公怒，归蔡姬，弗绝。蔡亦嫁其女。',
    zuoComment: '因此事，齐桓公伐蔡，蔡侯肉袒求和，转而伐楚。',
    category: 'diplomatic', stateIds: ['qi','cai'],
    placeIds: ['wanqiu'], personIds: ['qi-huangong','guan-zhong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公三年', certainty: 'medium'
  },
  // xi-4 前656
  {
    id: 'ev-xi4-1', luYearId: 'xi-4',
    jingText: '夏，诸侯伐楚，次于陉。楚屈完来盟，盟于召陵。',
    zuoComment: '管仲数楚：「尔贡包茅不入，王祭不共，无以缩酒，寡人是征。昭王南征而不复，寡人是问。」楚对曰：「贡之不入，寡君之罪也，敢不共给？昭王之不复，君其问诸水滨！」遂盟于召陵。',
    category: 'assembly', stateIds: ['qi','lu','song','chen','wei','zheng','cao','cai','chu'],
    placeIds: ['zhaoling','fangcheng'], personIds: ['qi-huangong','guan-zhong','chu-chengwang'],
    sourceType: 'jing', sourceRef: '《春秋》僖公四年（召陵之盟）', certainty: 'high'
  },
  // xi-5 前655
  // ev-xi5-1 已有（楚灭弦）
  {
    id: 'ev-xi5-2', luYearId: 'xi-5',
    jingText: '晋侯假道于虞以伐虢，灭虢，师还，袭虞，遂灭之。',
    zuoComment: '虞虢之战，百里奚（蹇叔之论亦在此后）。晋灭虞后，得百里奚，其后秦穆公以五羖大夫之价赎之为相。',
    category: 'battle', stateIds: ['jin'],
    placeIds: ['yong'], personIds: ['jin-xiangong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公五年', certainty: 'high',
    territoryChanges: [
      { placeId: 'yong', fromStateId: 'jin', toStateId: 'jin', changeType: 'annex' }
    ]
  },
  {
    id: 'ev-xi5-3', luYearId: 'xi-5',
    jingText: '秋，楚人灭弦，弦子奔黄。',
    category: 'battle', stateIds: ['chu','xuan'],
    placeIds: ['xuandu','huangdu'], personIds: ['chu-chengwang'],
    sourceType: 'jing', sourceRef: '《春秋》僖公五年', certainty: 'high',
    territoryChanges: [
      { placeId: 'xuandu', fromStateId: 'xuan', toStateId: 'chu', changeType: 'annex' }
    ]
  },
  // xi-6 前654
  {
    id: 'ev-xi6-1', luYearId: 'xi-6',
    jingText: '冬，楚人伐郑，围新城，郑申侯殉于新城。',
    category: 'battle', stateIds: ['chu','zheng'],
    placeIds: ['xinzheng'], personIds: ['chu-chengwang','zheng-wengong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公六年', certainty: 'high'
  },
  // xi-7 前653
  {
    id: 'ev-xi7-1', luYearId: 'xi-7',
    jingText: '夏，小邾子来朝。秋，公会齐侯、宋公、陈侯、卫侯、郑伯、许男、曹伯盟于宁母。',
    category: 'assembly', stateIds: ['qi','lu','song','chen','wei','zheng','cao'],
    placeIds: ['guan'], personIds: ['qi-huangong','lu-xi'],
    sourceType: 'jing', sourceRef: '《春秋》僖公七年', certainty: 'high'
  },
  // xi-8 前652
  {
    id: 'ev-xi8-1', luYearId: 'xi-8',
    jingText: '冬，楚人伐郑，围郑，諫于成周。晋里克杀奚齐。',
    zuoComment: '晋献公卒，骊姬之乱。里克杀奚齐、卓子，荀息死之。申生已死，诸公子奔散。',
    category: 'succession', stateIds: ['jin'],
    placeIds: ['jiang'], personIds: ['jin-xiangong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公八年（骊姬之乱收尾）', certainty: 'high'
  },
  // xi-9 前651
  // ev-xi9-1 已有（葵丘之会）
  {
    id: 'ev-xi9-2', luYearId: 'xi-9',
    jingText: '冬，晋里克弑其君卓子及其大夫荀息。',
    zuoComment: '晋献公卒，骊姬之子奚齐、卓子先后被弑，荀息自杀。夷吾（晋惠公）由梁入晋，秦穆公为之保驾。',
    category: 'succession', stateIds: ['jin'],
    placeIds: ['jiang'], personIds: ['jin-huigong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公九年', certainty: 'high'
  }
]

/* ─────────────────────────────────────────────────────────────────────────────
   阶段 B：xi-10..xi-18  前650—前642  桓公晚年·齐内乱·韩原之战
   ───────────────────────────────────────────────────────────────────────────── */
const phaseB = [
  // xi-10 前650
  {
    id: 'ev-xi10-1', luYearId: 'xi-10',
    jingText: '晋里克杀晋大夫丕郑父。秦人、晋人战于河曲。',
    zuoComment: '晋惠公立，诸臣多叛。秦晋韩原之战前奏，双方已有摩擦。惠公以秦力即位，却拒割河西之地，秦晋关系恶化。',
    category: 'battle', stateIds: ['jin','qin'],
    placeIds: ['hanyuan'], personIds: ['jin-huigong','qin-mugong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公十年', certainty: 'medium'
  },
  // xi-11 前649
  {
    id: 'ev-xi11-1', luYearId: 'xi-11',
    jingText: '楚人伐郑，郑人求救于诸侯，无功而返。',
    category: 'battle', stateIds: ['chu','zheng'],
    placeIds: ['xinzheng'], personIds: ['chu-chengwang','zheng-wengong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公十一年', certainty: 'medium'
  },
  // xi-12 前648
  {
    id: 'ev-xi12-1', luYearId: 'xi-12',
    jingText: '秋，楚人灭黄。',
    zuoComment: '黄为嬴姓小国，亲齐，屡次参与中原会盟。楚灭黄后，江一时孤立，中原诸国为之震动。',
    category: 'battle', stateIds: ['chu','huang'],
    placeIds: ['huangdu'], personIds: ['chu-chengwang'],
    sourceType: 'jing', sourceRef: '《春秋》僖公十二年', certainty: 'high',
    territoryChanges: [
      { placeId: 'huangdu', fromStateId: 'huang', toStateId: 'chu', changeType: 'annex' }
    ]
  },
  // xi-13 前647
  {
    id: 'ev-xi13-1', luYearId: 'xi-13',
    jingText: '冬，公如齐纳币。晋饥，请籴于秦，秦输粟于晋，史称「泛舟之役」。',
    zuoComment: '秦穆公怜晋民之苦，不以君间，运粟救晋，此为著名德政。',
    category: 'diplomatic', stateIds: ['lu','qi','jin','qin'],
    placeIds: ['linzi'], personIds: ['lu-xi','jin-huigong','qin-mugong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公十三年（泛舟之役）', certainty: 'high'
  },
  // xi-14 前646
  {
    id: 'ev-xi14-1', luYearId: 'xi-14',
    jingText: '秦饥，晋拒不輸粟，秦穆公大怒，将伐晋。',
    zuoComment: '《左传》：秦饥请籴于晋，晋不与，秦穆公将伐晋。晋大夫庆郑劝告无效，遂有韩原之战。',
    category: 'diplomatic', stateIds: ['qin','jin'],
    placeIds: ['hanyuan'], personIds: ['jin-huigong','qin-mugong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公十四年', certainty: 'medium'
  },
  // xi-15 前645
  // ev-xi15-1 已有（韩原之战）-- 这里补叙
  {
    id: 'ev-xi15-2', luYearId: 'xi-15',
    jingText: '秋，秦晋战于韩，获晋侯以归。晋侯许割河西之地，秦遂归之。',
    zuoComment: '韩原之战，晋惠公马陷泥中被俘；晋穆姬登台以为殉，秦穆公乃归晋侯，晋割河西五城予秦，太子圉质秦。',
    category: 'battle', stateIds: ['qin','jin'],
    placeIds: ['hanyuan'], personIds: ['jin-huigong','qin-mugong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公十五年（韩原之战）', certainty: 'high'
  },
  // xi-16 前644
  {
    id: 'ev-xi16-1', luYearId: 'xi-16',
    jingText: '公会齐侯、宋公、陈侯、卫侯、郑伯、许男、邢侯、曹伯盟于淮。',
    category: 'assembly', stateIds: ['qi','lu','song','chen','wei','zheng','cao'],
    placeIds: ['guan'], personIds: ['qi-huangong','lu-xi'],
    sourceType: 'jing', sourceRef: '《春秋》僖公十六年', certainty: 'medium'
  },
  // xi-17 前643
  {
    id: 'ev-xi17-1', luYearId: 'xi-17',
    jingText: '秋，齐桓公卒。公子无亏入，五公子争立，齐大乱。',
    zuoComment: '管仲既没，易牙、竖刁乱政，桓公病中诸公子争立。桓公薨，停尸六十七日不葬，蛆出于户。诸公子各率其众争位，宋人立公子昭（孝公）。',
    category: 'succession', stateIds: ['qi'],
    placeIds: ['linzi'], personIds: ['qi-huangong','qi-xiao-bai-after'],
    sourceType: 'jing', sourceRef: '《春秋》僖公十七年', certainty: 'high'
  },
  // xi-18 前642
  {
    id: 'ev-xi18-1', luYearId: 'xi-18',
    jingText: '秋，宋公、曹伯、卫人、邾人伐齐。冬，楚人伐宋，宋告急于晋，晋平二者。',
    zuoComment: '宋桓公（公子昭）即位后，借诸侯之力定齐内乱，纳齐孝公。宋由此图霸，野心渐显。',
    category: 'battle', stateIds: ['qi','song','wei','cao'],
    placeIds: ['linzi'], personIds: ['qi-xiao-bai-after','song-xianggong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公十八年', certainty: 'high'
  }
]

/* ─────────────────────────────────────────────────────────────────────────────
   阶段 C：xi-19..xi-27  前641—前633  宋楚泓·晋文归国·晋围郑
   ───────────────────────────────────────────────────────────────────────────── */
const phaseC = [
  // xi-19 前641
  {
    id: 'ev-xi19-1', luYearId: 'xi-19',
    jingText: '宋人执滕子、鄫子以用。宋人伐曹，取须句，复归之。',
    zuoComment: '宋襄公欲图霸，以蛮夷之礼行人牲，执滕鄫之君以为牲祭，鲁人深以为非。',
    category: 'ritual', stateIds: ['song','lu'],
    placeIds: ['shangqiu'], personIds: ['song-xianggong','song-mu-yi'],
    sourceType: 'jing', sourceRef: '《春秋》僖公十九年', certainty: 'high'
  },
  // xi-20 前640
  {
    id: 'ev-xi20-1', luYearId: 'xi-20',
    jingText: '宋人伐郑，楚人救郑。楚人使宋人归曹地，宋不从。',
    category: 'battle', stateIds: ['song','zheng','chu'],
    placeIds: ['xinzheng','shangqiu'], personIds: ['song-xianggong','chu-chengwang'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十年', certainty: 'high'
  },
  // xi-21 前639
  {
    id: 'ev-xi21-1', luYearId: 'xi-21',
    jingText: '宋公与楚子、陈侯、蔡侯、郑伯、许男会于盂。楚子执宋公以伐宋，诸侯请于楚，楚人归宋公。',
    zuoComment: '宋襄公召诸侯于盂，欲以「仁义」称霸，不带兵车，楚子执宋公。公子目夷先后谏无用，宋国几乱。',
    category: 'assembly', stateIds: ['song','chu','chen','cai','zheng'],
    placeIds: ['sheng','shangqiu'], personIds: ['song-xianggong','song-mu-yi','chu-chengwang'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十一年', certainty: 'high'
  },
  // xi-22 前638
  {
    id: 'ev-xi22-1', luYearId: 'xi-22',
    jingText: '冬十一月己巳朔，宋公及楚人战于泓，宋师败绩。',
    zuoComment: '楚师涉泓，宋公欲击之，目夷谏曰：「彼众我寡，击其未成列。」公不听，楚师毕济，宋公又不击，大败，宋公伤股，国人皆怨，公曰：「君子不重伤，不擒二毛。」目夷曰：「战而不胜，何若二毛为？若爱二毛，如勿战何？」',
    category: 'battle', stateIds: ['song','chu'],
    placeIds: ['hong'], personIds: ['song-xianggong','song-mu-yi','chu-chengwang'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十二年（泓之战）', certainty: 'high'
  },
  // xi-23 前637
  {
    id: 'ev-xi23-1', luYearId: 'xi-23',
    jingText: '晋公子重耳过曹、宋、郑，至楚，楚成王礼之，问曰：「公子若返晋国，何以报寡人？」公子曰：「若以君之灵，得反晋国，晋楚治兵，遇于中原，其辟君三舍。」',
    zuoComment: '重耳流亡至楚，楚王礼遇，重耳许以「退避三舍」。后城濮之战晋军果退九十里，楚子玉不退，遂大败。',
    category: 'diplomatic', stateIds: ['jin','chu'],
    placeIds: ['chengpu','ying'], personIds: ['jin-chonger','chu-chengwang'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十三年（重耳过楚）', certainty: 'high'
  },
  {
    id: 'ev-xi23-2', luYearId: 'xi-23',
    jingText: '夏，宋公兹父卒。',
    category: 'succession', stateIds: ['song'],
    placeIds: ['shangqiu'], personIds: ['song-xianggong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十三年', certainty: 'high'
  },
  // xi-24 前636
  // ev-xi24-1 已有（晋人秦人围郑）
  {
    id: 'ev-xi24-2', luYearId: 'xi-24',
    jingText: '秦穆公送重耳归晋，重耳杀晋怀公圉，即位为晋文公。',
    zuoComment: '秦穆公以兵送重耳入晋，晋人杀圉于高梁，重耳即位。此即晋文公元年。',
    category: 'succession', stateIds: ['jin','qin'],
    placeIds: ['jiang'], personIds: ['jin-chonger','jin-huaigong','qin-mugong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十四年', certainty: 'high'
  },
  {
    id: 'ev-xi24-3', luYearId: 'xi-24',
    jingText: '晋侯赏从亡者，介之推不言禄，其母从而隐。晋侯求之不得，以绵上为之田。',
    zuoComment: '介之推割股奉君、功成身退，后世「寒食节」缘起。',
    category: 'other', stateIds: ['jin'],
    placeIds: ['jiang'], personIds: ['jin-chonger'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十四年（介之推）', certainty: 'medium'
  },
  // xi-25 前635
  {
    id: 'ev-xi25-1', luYearId: 'xi-25',
    jingText: '冬，晋侯伐原，克之，以畀赵衰，赵衰辞，以赵为赵衰邑。晋侯复卫侯，迁温之狄。',
    category: 'battle', stateIds: ['jin'],
    placeIds: ['wen','jiang'], personIds: ['jin-chonger','zhao-cui'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十五年', certainty: 'medium'
  },
  {
    id: 'ev-xi25-2', luYearId: 'xi-25',
    jingText: '晋侯请隧于王，王弗许。',
    zuoComment: '晋文公欲以王礼隧葬，周王不许。晋文公虽霸，仍受周礼约束。',
    category: 'ritual', stateIds: ['jin','zhou'],
    placeIds: ['wangcheng'], personIds: ['jin-chonger'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十五年', certainty: 'medium'
  },
  // xi-26 前634
  {
    id: 'ev-xi26-1', luYearId: 'xi-26',
    jingText: '楚人灭江。公会诸侯于鲁，责楚不救江。',
    category: 'battle', stateIds: ['chu','jiang'],
    placeIds: ['jiangdu'], personIds: ['chu-chengwang'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十六年', certainty: 'high',
    territoryChanges: [
      { placeId: 'jiangdu', fromStateId: 'jiang', toStateId: 'chu', changeType: 'annex' }
    ]
  },
  {
    id: 'ev-xi26-2', luYearId: 'xi-26',
    jingText: '齐人侵我西鄙。公会宋公、陈侯、卫侯、郑伯于垂陇，谋救许。',
    category: 'battle', stateIds: ['qi','lu'],
    placeIds: ['qufu'], personIds: ['lu-xi'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十六年', certainty: 'high'
  },
  // xi-27 前633
  {
    id: 'ev-xi27-1', luYearId: 'xi-27',
    jingText: '楚人围宋，宋告急于晋，晋文公作三军，谋救宋以报旧德。',
    zuoComment: '晋文公欲救宋以报宋曾礼遇之旧恩，又欲借此图霸中原。先轸、狐偃定谋：伐曹、卫以解宋之围，使楚分兵。',
    category: 'battle', stateIds: ['chu','song','jin'],
    placeIds: ['shangqiu'], personIds: ['jin-chonger','hu-yan','xian-zhen','chu-ziyu'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十七年', certainty: 'high'
  }
]

/* ─────────────────────────────────────────────────────────────────────────────
   阶段 D：xi-28..xi-33  前632—前627  城濮·践土·殽之战
   ───────────────────────────────────────────────────────────────────────────── */
const phaseD = [
  // xi-28 已有 ev-xi28-1/2/3 — 补叙
  {
    id: 'ev-xi28-4', luYearId: 'xi-28',
    jingText: '晋侯执曹伯，分曹卫之田以与宋人。晋师三舍，楚子玉不退，遂战于城濮。',
    zuoComment: '城濮之战：晋军「退避三舍」九十里，楚子玉率军追击，晋将先轸设伏，大败楚军。子玉引以为耻，自杀。',
    category: 'battle', stateIds: ['jin','chu','song','qi','qin'],
    placeIds: ['chengpu','caodu','shangqiu'], personIds: ['jin-chonger','hu-yan','xian-zhen','chu-ziyu'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十八年（城濮之战详述）', certainty: 'high'
  },
  {
    id: 'ev-xi28-5', luYearId: 'xi-28',
    jingText: '夏，晋侯献楚俘于王。王在践土，诸侯朝焉，曰践土之盟。',
    zuoComment: '践土之盟：晋文公以诸侯朝周天子，天子命晋侯为伯（霸主），晋霸正式确立。',
    category: 'assembly', stateIds: ['jin','zhou','lu','qi','song','wei','chen','cao','zheng'],
    placeIds: ['jiantu','wangcheng'], personIds: ['jin-chonger'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十八年（践土之盟）', certainty: 'high'
  },
  // xi-29 前631
  {
    id: 'ev-xi29-1', luYearId: 'xi-29',
    jingText: '冬，晋人执虞公，以归。卫侯郑复归卫。',
    category: 'succession', stateIds: ['jin','wei'],
    placeIds: ['zhongqiu'], personIds: ['jin-chonger'],
    sourceType: 'jing', sourceRef: '《春秋》僖公二十九年', certainty: 'medium'
  },
  {
    id: 'ev-xi29-2', luYearId: 'xi-29',
    jingText: '夏，晋人败楚师于桐，晋文公主盟，郑亦来服。晋人执郑伯，郑求盟，晋许之。',
    category: 'battle', stateIds: ['jin','chu','zheng'],
    placeIds: ['chengpu'], personIds: ['jin-chonger','zheng-wengong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公二十九年', certainty: 'medium'
  },
  // xi-30 前630
  {
    id: 'ev-xi30-1', luYearId: 'xi-30',
    jingText: '晋人、秦人围郑，以其无礼于晋，且贰于楚也。郑烛之武夜见秦伯，说退秦师。',
    zuoComment: '烛之武说秦穆公：「越国以鄙远，君知其难也。若舍郑以为东道主，行李之往来，共其乏困，君亦无所害。」秦穆公听之，罢兵，并派兵戍郑，晋师亦退。',
    category: 'battle', stateIds: ['jin','qin','zheng'],
    placeIds: ['xinzheng'], personIds: ['jin-chonger','qin-mugong','zheng-wengong','zhu-zhi-wu'],
    sourceType: 'jing', sourceRef: '《春秋》僖公三十年（烛之武退秦师）', certainty: 'high'
  },
  // xi-31 前629
  {
    id: 'ev-xi31-1', luYearId: 'xi-31',
    jingText: '夏四月，四卜郊，不从，乃免牲。小邾子来朝。晋文公作三行以御戎。',
    category: 'ritual', stateIds: ['lu','jin'],
    placeIds: ['qufu'], personIds: ['lu-xi','jin-chonger'],
    sourceType: 'jing', sourceRef: '《春秋》僖公三十一年', certainty: 'medium'
  },
  {
    id: 'ev-xi31-2', luYearId: 'xi-31',
    jingText: '狄围卫，卫迁，卫侯在楚丘，告难于诸侯。',
    category: 'battle', stateIds: ['wei'],
    placeIds: ['chuqiu'], personIds: [],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公三十一年', certainty: 'medium'
  },
  // xi-32 前628
  {
    id: 'ev-xi32-1', luYearId: 'xi-32',
    jingText: '冬，晋文公薨。秦伯使蹇叔、百里奚之子袭郑，蹇叔哭之。',
    zuoComment: '秦穆公趁晋文公新丧，命孟明视等三帅袭郑；蹇叔曰：「千里而袭人，难以成功。」三帅不听，出师。',
    category: 'succession', stateIds: ['jin','qin','zheng'],
    placeIds: ['jiang','xinzheng'], personIds: ['jin-chonger','qin-mugong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公三十二年', certainty: 'high'
  },
  {
    id: 'ev-xi32-2', luYearId: 'xi-32',
    jingText: '秦灭滑，遂还。',
    zuoComment: '秦师至滑，见郑国已有备，遂灭滑国而归。',
    category: 'battle', stateIds: ['qin','hua'],
    placeIds: ['huadu'], personIds: ['qin-mugong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公三十二年', certainty: 'high',
    territoryChanges: [
      { placeId: 'huadu', fromStateId: 'hua', toStateId: 'qin', changeType: 'annex' }
    ]
  },
  // xi-33 前627
  {
    id: 'ev-xi33-1', luYearId: 'xi-33',
    jingText: '春，秦师过周北门，左右免胄而下，超乘者三百乘。王孙满曰：「秦师轻而无礼，必败。」',
    zuoComment: '秦师过周而不敬，王孙满以礼法论之，预言秦必败。秦军骄横，轻敌。',
    category: 'other', stateIds: ['qin','zhou'],
    placeIds: ['wangcheng','xiao'], personIds: ['qin-mugong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公三十三年（秦师过周）', certainty: 'high'
  },
  {
    id: 'ev-xi33-2', luYearId: 'xi-33',
    jingText: '夏四月辛巳，晋人及姜戎败秦师于殽，获百里孟明视、西乞术、白乙丙以归。',
    zuoComment: '先轸帅师，伏击于殽山两陵之间，秦军覆灭，三帅全俘。晋文姜请之，先轸怒，晋襄公从之，三帅获释。先轸深以为恨，后战死以殉。',
    category: 'battle', stateIds: ['jin','qin'],
    placeIds: ['xiao'], personIds: ['xian-zhen','qin-mugong'],
    sourceType: 'jing', sourceRef: '《春秋》僖公三十三年（殽之战）', certainty: 'high'
  },
  {
    id: 'ev-xi33-3', luYearId: 'xi-33',
    jingText: '秋，晋人释三帅，秦穆公素服郊次，以誓于众。',
    zuoComment: '秦穆公自责：「孤以未熟于谋，以辱二三子，孤之过也，是孤之罪。」发秦伯任好之誓，史称「秦誓」。',
    category: 'ritual', stateIds: ['qin'],
    placeIds: ['yong'], personIds: ['qin-mugong'],
    sourceType: 'zuozhuan', sourceRef: '《左传》僖公三十三年（秦誓）', certainty: 'high'
  }
]

// 合并所有新事件
const allNew = [...phaseA, ...phaseB, ...phaseC, ...phaseD]
const toAdd = allNew.filter(e => !existIds.has(e.id))
console.log(`新增事件 ${toAdd.length} 条（跳过已存在 ${allNew.length - toAdd.length} 条）`)
writeJSON('events.json', [...events, ...toAdd])

console.log('\n✅ 僖公事件注入完成')
