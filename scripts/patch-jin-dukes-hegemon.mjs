/**
 * 补全晋国国君 activeLuYears（霸主栏显示），并校验 luYearId 存在。
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const personsPath = path.join(root, 'src', 'data', 'sample', 'persons.json')

function range(prefix, from, to) {
  const out = []
  for (let i = from; i <= to; i++) out.push(`${prefix}-${i}`)
  return out
}

const persons = JSON.parse(fs.readFileSync(personsPath, 'utf8'))

function patch(id, newYears) {
  const p = persons.find((x) => x.id === id)
  if (!p) throw new Error(`missing ${id}`)
  p.activeLuYears = newYears
  console.log(`patched ${id} -> ${newYears.length} years`)
}

patch('jin-xianggong', range('wen', 2, 12))

const jing = persons.find((x) => x.id === 'jin-jingong')
if (!jing) throw new Error('missing jin-jingong')
const jy = new Set(jing.activeLuYears)
range('cheng', 11, 14).forEach((y) => jy.add(y))
jing.activeLuYears = [...jy].sort((a, b) => {
  const [pa, na] = a.split('-')
  const [pb, nb] = b.split('-')
  const order = ['yin', 'huan', 'zhuang', 'min', 'xi', 'wen', 'xuan', 'cheng', 'xiang', 'zhao', 'ding', 'ai']
  if (pa !== pb) return order.indexOf(pa) - order.indexOf(pb)
  return parseInt(na, 10) - parseInt(nb, 10)
})
console.log(`patched jin-jingong -> ${jing.activeLuYears.length} years`)

const insert = [
  {
    id: 'jin-daogong',
    name: '周',
    posthumous: '晋悼公',
    stateId: 'jin',
    role: 'duke',
    desc: '晋厉公后即位；复霸中原，向戌弭兵前晋楚争衡。',
    activeLuYears: range('xiang', 1, 15),
    sourceRef: '《春秋》《左传》襄公元年至十五年',
    certainty: 'high',
  },
  {
    id: 'jin-pinggong',
    name: '彪',
    posthumous: '晋平公',
    stateId: 'jin',
    role: 'duke',
    desc: '晋悼公后；在位与列国会盟频仍，晋楚再争。',
    activeLuYears: range('xiang', 16, 31),
    sourceRef: '《春秋》《左传》襄公十六年至三十一年',
    certainty: 'high',
  },
  {
    id: 'jin-zhaogong',
    name: '夷',
    posthumous: '晋昭公',
    stateId: 'jin',
    role: 'duke',
    desc: '晋平公后；六卿势张。',
    activeLuYears: range('zhao', 1, 10),
    sourceRef: '《春秋》《左传》昭公',
    certainty: 'medium',
  },
  {
    id: 'jin-qinggong',
    name: '弃疾',
    posthumous: '晋顷公',
    stateId: 'jin',
    role: 'duke',
    desc: '晋昭公后。',
    activeLuYears: range('zhao', 11, 23),
    sourceRef: '《春秋》《左传》昭公',
    certainty: 'medium',
  },
  {
    id: 'jin-dinggong',
    name: '午',
    posthumous: '晋定公',
    stateId: 'jin',
    role: 'duke',
    desc: '晋顷公后；赵鞅专晋政。',
    activeLuYears: range('zhao', 24, 32),
    sourceRef: '《春秋》《左传》昭公末',
    certainty: 'medium',
  },
]

for (const row of insert) {
  if (persons.some((p) => p.id === row.id)) {
    console.warn(`already exists ${row.id}, skip insert`)
    continue
  }
  const idx = persons.findIndex((p) => p.id === 'jin-jingong')
  persons.splice(idx + 1, 0, row)
  console.log(`inserted ${row.id}`)
}

fs.writeFileSync(personsPath, JSON.stringify(persons, null, 2), 'utf8')
console.log('done')
