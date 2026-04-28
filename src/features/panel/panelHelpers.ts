import type { EventCategory, ZhouRank, RelationType } from '@/domain/types'

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  battle:     '战争',
  assembly:   '会盟',
  succession: '君位',
  ritual:     '礼制',
  diplomatic: '外交',
  disaster:   '灾异',
  other:      '其他',
}

export const RANK_LABELS: Record<ZhouRank, string> = {
  wang:       '天子',
  gong:       '公',
  hou:        '侯',
  bo:         '伯',
  zi:         '子',
  nan:        '男',
  barbarian:  '蛮夷',
  unknown:    '不详',
}

export const REL_LABELS: Record<RelationType, string> = {
  ally:       '盟友',
  enemy:      '敌对',
  vassal:     '附庸（臣）',
  suzerain:   '宗主',
  marriage:   '姻亲',
  tributary:  '朝贡',
}

export const CERTAINTY_LABELS: Record<string, string> = {
  high:   '史料确凿',
  medium: '史料存疑',
  low:    '推测',
}
