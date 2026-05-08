// Lu 纪年
export interface LuYear {
  id: string
  /** 鲁国纪年，如"隐公元年" */
  luLabel: string
  /** 鲁公名 */
  luDuke: string
  /** 鲁公在位年序 */
  luYearNum: number
  /** 周王历（如"周平王四十九年"） */
  zhouLabel: string
  /** 公元纪年（负数为 BC） */
  bce: number
}

export type SourceType = 'jing' | 'zuozhuan' | 'other'
export type Certainty = 'high' | 'medium' | 'low'

export interface Place {
  id: string
  name: string
  /** 隶属国 id */
  stateId: string | null
  /** 今地参考（非地图坐标用途，仅注释） */
  modernRef?: string
  /** MapLibre 坐标 [lng, lat]，使用古代地理位置估计值 */
  coords: [number, number]
  certainty: Certainty
}

export type ZhouRank = 'wang' | 'gong' | 'hou' | 'bo' | 'zi' | 'nan' | 'barbarian' | 'unknown'

export interface State {
  id: string
  name: string
  rank: ZhouRank
  /** 分封始封者 */
  founder?: string
  /** 姬姓/异姓 */
  clan?: string
  /** 都城 place id */
  capitalId: string | null
  /** 地图多边形，GeoJSON coordinates（可省略则仅显示都城点） */
  territory?: [number, number][][]
  color: string
  certainty: Certainty
}

export type PersonRole = 'duke' | 'minister' | 'general' | 'envoy' | 'other'

export interface Person {
  id: string
  name: string
  /** 字 */
  courtesy?: string
  /** 庙号/谥号 */
  posthumous?: string
  stateId: string | null
  role: PersonRole
  /** 在位/活跃鲁纪年范围 */
  activeLuYears: string[]
  certainty: Certainty
}

export type RelationType =
  | 'ally'      // 盟友
  | 'enemy'     // 敌对
  | 'vassal'    // 附庸（from -> to）
  | 'suzerain'  // 宗主（from -> to）
  | 'marriage'  // 姻亲
  | 'tributary' // 朝贡

export interface Relation {
  id: string
  fromId: string
  toId: string
  type: RelationType
  /** 生效鲁纪年 id 列表（空=全程） */
  activeLuYears: string[]
  sourceType: SourceType
  sourceRef: string
  certainty: Certainty
}

export type EventCategory =
  | 'battle'      // 战争
  | 'assembly'    // 会盟
  | 'succession'  // 君位继承
  | 'ritual'      // 礼制
  | 'diplomatic'  // 外交
  | 'disaster'    // 灾异
  | 'other'

export interface ChunqiuEvent {
  id: string
  luYearId: string
  /** 经文原句 */
  jingText: string
  /** 《左传》对应段落（可选） */
  zuoComment?: string
  category: EventCategory
  /** 涉及国家 id 列表 */
  stateIds: string[]
  /** 涉及地点 id 列表 */
  placeIds: string[]
  /** 涉及人物 id 列表 */
  personIds: string[]
  sourceType: SourceType
  /** 文献出处引用 */
  sourceRef: string
  certainty: Certainty
  /** 城邑归属变更 */
  territoryChanges?: Array<{
    placeId: string
    fromStateId: string | null
    toStateId: string
    changeType: 'annex' | 'recover' | 'cede'
  }>
}

export type MapMode =
  | 'fengjian'    // 周礼分封图（爵位标注）
  | 'territory'   // 城邑总览图
  | 'diplomacy'   // 外交关系图
  | 'chunqiu'     // 春秋模式（仅有载诸侯）
  | 'terrain'     // DEM + hillshade

export interface AppState {
  currentLuYearId: string
  mapMode: MapMode
  selectedEntityId: string | null
  selectedEntityType: 'state' | 'place' | 'person' | null
  panelTab: 'person' | 'state' | 'place' | 'stats'
  searchQuery: string
  rightPanelCollapsed: boolean
  mobilePanelOpen: boolean
}
