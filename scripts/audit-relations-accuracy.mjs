/**
 * 外交关系准确性审校脚本
 * 修正：
 * 1. 删除重复 lu->zhou tributary（保留 rel-lu-zhou-tributary 全程版本，删两个冗余期段版本）
 * 2. 删除错误 chu->zhou tributary（楚自立为王，拒绝朝贡周天子）
 * 3. 修正 chen->zhou tributary 年份：陈在赵公八年被楚灭，关系应在赵公七年截止
 * 4. 补充宣公期楚郑敌对延续（宣公1-11年）、楚郑归附（宣公12年后）
 * 5. 补充宣公期楚围宋事件对应外交关系
 * 6. 补充成公期齐晋敌对（鞌之战 cheng-2）、齐鲁敌对
 * 7. 修正 qin->zhou tributary：秦在襄/昭/定/哀时期已基本独立，缩短至宣公末年
 * 8. 修正 zheng->zhou tributary：繻葛之战（yin-11后/huan-5）后郑周交恶，现有数据结束于 yin-11，不清晰，完善备注
 */

import { readFileSync, writeFileSync } from 'fs';

const REL_PATH = 'src/data/sample/relations.json';
let relations = JSON.parse(readFileSync(REL_PATH, 'utf8'));

// 生成年份序列
const PERIOD_LENGTHS = [
  ['yin', 11], ['huan', 18], ['zhuang', 32], ['min', 2], ['xi', 33],
  ['wen', 18], ['xuan', 18], ['cheng', 18], ['xiang', 31], ['zhao', 32],
  ['ding', 15], ['ai', 14],
];
const ALL_YEARS = [];
for (const [name, max] of PERIOD_LENGTHS) {
  for (let i = 1; i <= max; i++) ALL_YEARS.push(`${name}-${i}`);
}
function span(from, to) {
  const fi = ALL_YEARS.indexOf(from);
  const ti = ALL_YEARS.indexOf(to);
  if (fi < 0 || ti < 0) throw new Error(`Bad span: ${from}..${to}`);
  return ALL_YEARS.slice(fi, ti + 1);
}

// ── 工具 ──────────────────────────────────────────────────
function findRel(id) {
  return relations.find(r => r.id === id);
}
function removeRel(id) {
  const idx = relations.findIndex(r => r.id === id);
  if (idx < 0) { console.warn(`  WARN: ${id} not found, skipping remove`); return; }
  relations.splice(idx, 1);
  console.log(`  [-] removed: ${id}`);
}
function addRel(obj) {
  if (relations.find(r => r.id === obj.id)) {
    console.warn(`  WARN: ${obj.id} already exists, skipping add`);
    return;
  }
  relations.push(obj);
  console.log(`  [+] added: ${obj.id} (${obj.fromId}->${obj.toId} ${obj.type})`);
}
function patchRel(id, patch) {
  const r = findRel(id);
  if (!r) { console.warn(`  WARN: ${id} not found`); return; }
  Object.assign(r, patch);
  console.log(`  [~] patched: ${id}`);
}

// ═══════════════════════════════════════════════════
// 1. 删除重复 lu->zhou tributary
//    rel-lu-zhou-tributary （全程）是正确版本，其余两个是历史遗留重复
// ═══════════════════════════════════════════════════
console.log('\n=== 1. 清除重复 lu->zhou tributary ===');
removeRel('rel-lu-zhou-tributary-zhuang');
removeRel('rel-lu-zhou-tributary-xi');

// ═══════════════════════════════════════════════════
// 2. 删除错误 chu->zhou tributary
//    楚武王（前704年，约鲁桓公8年）自立为王，整个春秋期楚绝不奉周正朔
//    管仲质问楚"尔贡包茅不入"（僖公4年）恰好证明楚【拒绝】朝贡而非有tribute关系
// ═══════════════════════════════════════════════════
console.log('\n=== 2. 删除错误 chu->zhou tributary ===');
removeRel('rel-chu-zhou-tributary');

// ═══════════════════════════════════════════════════
// 3. 修正 chen->zhou tributary 年份
//    陈在昭公8年（公元前534年）被楚灭，故朝贡关系应在昭公7年截止
// ═══════════════════════════════════════════════════
console.log('\n=== 3. 修正 chen->zhou tributary 年份 ===');
patchRel('rel-chen-zhou-tributary', {
  activeLuYears: span('yin-1', 'zhao-7'),
  sourceRef: '《春秋》隐公至昭公七年，陈为妫姓，舜裔，周初胡公满受封，奉周朝正朔；昭公八年楚灭陈，陈亡，朝贡关系终止。',
  certainty: 'medium',
});

// ═══════════════════════════════════════════════════
// 4. 修正 qin->zhou tributary 年份
//    秦在春秋中期尚奉周正朔（秦穆公曾护送周天子），但进入春秋晚期后日益独立
//    昭公时秦、晋反复争霸，秦已脱离周室轨道，故截至成公末年
// ═══════════════════════════════════════════════════
console.log('\n=== 4. 修正 qin->zhou tributary 年份（截至成公末）===');
patchRel('rel-qin-zhou-tributary', {
  activeLuYears: span('yin-1', 'cheng-18'),
  sourceRef: '秦非子因牧马有功受周孝王封于秦，春秋中期秦仍奉周正朔；《春秋》僖公时秦穆公曾派兵护送周天子。成公后秦晋持续争霸，秦日益脱离周室轨道，朝贡关系趋于名义。',
  certainty: 'low',
});

// ═══════════════════════════════════════════════════
// 5. 完善 zheng->zhou tributary 备注
//    繻葛之战（周桓王伐郑被射伤）在鲁桓公5年（前707年）发生，现有数据到 yin-11 为止
//    yin-11 = 鲁隐公11年 = 约前712年，与历史略有出入；繻葛在 huan-5 附近
//    保留现有年份，更新 sourceRef 说明
// ═══════════════════════════════════════════════════
console.log('\n=== 5. 完善 zheng->zhou tributary 备注 ===');
patchRel('rel-zheng-zhou-tributary', {
  activeLuYears: span('yin-1', 'huan-5'),
  sourceRef: '《春秋》隐公时郑庄公兼任周卿士，郑与周关系密切；桓公五年（前707年）繻葛之战，周桓王率诸侯伐郑，郑射伤桓王，郑周关系彻底破裂，朝贡终止。',
});

// ═══════════════════════════════════════════════════
// 6. 延伸楚郑敌对至宣公11年（邲之战前）
//    《春秋》宣公期：楚持续压迫郑，郑在宣公12年邲之战后彻底臣服楚
// ═══════════════════════════════════════════════════
console.log('\n=== 6. 延伸 chu->zheng 敌对至宣公11年 ===');
patchRel('rel-chu-zheng-enemy-xi', {
  activeLuYears: span('xi-23', 'xuan-11'),
  sourceRef: '《春秋》僖公至宣公十一年：楚持续北进，郑居中原抵抗楚压迫，并寻晋保护；宣公12年邲之战后郑彻底向楚臣服。',
  certainty: 'high',
});

// ═══════════════════════════════════════════════════
// 7. 添加楚郑归附关系（宣公12年邲之战后至成公末期）
//    邲之战后郑向楚服，但成公期晋反复伐郑，两者关系动荡，故以盟好表示基本倾向
// ═══════════════════════════════════════════════════
console.log('\n=== 7. 添加 chu-zheng ally（宣公12年后）===');
addRel({
  id: 'rel-chu-zheng-ally-xuan-cheng',
  fromId: 'chu',
  toId: 'zheng',
  type: 'ally',
  activeLuYears: span('xuan-12', 'cheng-18'),
  certainty: 'medium',
  sourceType: 'zuozhuan',
  sourceRef: '《春秋》宣公十二年邲之战，楚庄王大败晋师，郑立即向楚臣服（《左传》：楚王许郑之服）；此后成公期郑总体依附楚，但晋反复伐郑，关系时有波折，大体以楚郑盟好为主。',
});

// ═══════════════════════════════════════════════════
// 8. 延伸楚宋敌对至宣公15年（楚围宋事件）
//    宣公14年楚因宋杀楚使申舟而围宋，宣公15年九月宋乃议和
// ═══════════════════════════════════════════════════
console.log('\n=== 8. 延伸 chu->song 敌对至宣公15年 ===');
patchRel('rel-chu-song-enemy-xi', {
  activeLuYears: span('xi-24', 'xuan-15'),
  sourceRef: '《春秋》僖公至宣公十五年：楚多次压迫宋，城濮之战（僖28年）后楚宋关系缓和，但宣公14年楚因宋弑楚使申舟而大举围宋，历时九月（宣公15年），宋国城下之盟乃止。',
  certainty: 'high',
});

// ═══════════════════════════════════════════════════
// 9. 添加宣公期晋伐郑（敌对）
//    晋在宣公期数次伐郑以对抗楚的扩张，形成晋郑敌对
// ═══════════════════════════════════════════════════
console.log('\n=== 9. 添加 jin-zheng 敌对（宣公期）===');
addRel({
  id: 'rel-jin-zheng-enemy-xuan',
  fromId: 'jin',
  toId: 'zheng',
  type: 'enemy',
  activeLuYears: span('xuan-1', 'xuan-11'),
  certainty: 'medium',
  sourceType: 'zuozhuan',
  sourceRef: '《春秋》宣公期：晋为制衡楚的北扩，数次出兵郑地（宣公1年伐郑、宣公6年伐郑等），晋郑呈对立态势；宣公12年邲之战晋大败后，郑向楚臣服，晋郑对立态势延续至成公期。',
});

// ═══════════════════════════════════════════════════
// 10. 添加成公期晋伐郑（成公期晋郑争夺仍在）
// ═══════════════════════════════════════════════════
console.log('\n=== 10. 添加 jin-zheng 敌对（成公期）===');
addRel({
  id: 'rel-jin-zheng-enemy-cheng',
  fromId: 'jin',
  toId: 'zheng',
  type: 'enemy',
  activeLuYears: span('cheng-1', 'cheng-16'),
  certainty: 'medium',
  sourceType: 'zuozhuan',
  sourceRef: '《春秋》成公期：晋为夺回中原主导权而数次伐郑（成公2年、成公13年等），郑在楚晋之间摇摆；成公17年晋悼公即位后晋逐步重建霸权，郑始转向晋。',
});

// ═══════════════════════════════════════════════════
// 11. 添加成公2年鞌之战：齐晋敌对
//     成公2年晋率诸侯（含鲁）在鞌大败齐顷公，此后齐服于晋
// ═══════════════════════════════════════════════════
console.log('\n=== 11. 添加 qi-jin 敌对（鞌之战 cheng-2）===');
addRel({
  id: 'rel-qi-jin-enemy-cheng',
  fromId: 'qi',
  toId: 'jin',
  type: 'enemy',
  activeLuYears: ['cheng-1', 'cheng-2'],
  certainty: 'high',
  sourceType: 'jing',
  sourceRef: '《春秋》成公2年：晋郤克率晋、鲁、卫、曹联军在鞌（今山东济南西北）大败齐顷公，鞌之战后齐向晋服，送太子彊为质，归还鲁卫侵地。',
});

// ═══════════════════════════════════════════════════
// 12. 添加成公2年齐鲁敌对（鞌之战中鲁参与打齐）
// ═══════════════════════════════════════════════════
console.log('\n=== 12. 添加 qi-lu 敌对（cheng-2 鞌之战）===');
addRel({
  id: 'rel-qi-lu-enemy-cheng',
  fromId: 'qi',
  toId: 'lu',
  type: 'enemy',
  activeLuYears: ['cheng-1', 'cheng-2'],
  certainty: 'high',
  sourceType: 'jing',
  sourceRef: '《春秋》成公2年：鞌之战，鲁季孙行父（季文子）与晋共击齐，鞌之战后齐归还鲁国侵地（汶阳之田）。《左传》记载"臧宣叔逆晋师，且道之"，鲁积极参与此役。',
});

// ═══════════════════════════════════════════════════
// 13. 完善 rel-jin-chu-enemy-xi 注记（覆盖宣公至襄公弭兵前）
//     现有数据已覆盖至 xiang-26，实际 xiang-27 晋楚第二次弭兵（弭兵之会）后
//     两国从正式敌对转为相对平衡，故在 xiang-27 后截止较合理
// ═══════════════════════════════════════════════════
console.log('\n=== 13. 完善 jin-chu 敌对注记 ===');
patchRel('rel-jin-chu-enemy-xi', {
  sourceRef: '文公年起晋楚长期争霸，城濮之战（僖28）奠定晋霸；邲之战（宣12）楚大胜，楚强晋弱；鞌之战（成2）后晋重振；成公12年晋楚第一次弭兵、襄公27年第二次弭兵（向戌弭兵）后两国进入相对均衡，正式敌对态势趋缓。',
});

// ═══════════════════════════════════════════════════
// 保存
// ═══════════════════════════════════════════════════
writeFileSync(REL_PATH, JSON.stringify(relations, null, 2), 'utf8');
console.log('\n✅ relations.json 写入成功，共', relations.length, '条关系');
console.log('tributary 关系总数:', relations.filter(r=>r.type==='tributary').length);
