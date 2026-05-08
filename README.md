# 春秋地图

鲁国纪年 + MapLibre，看国家/人物/地点/外交，数据在 `src/data`。

## 跑起来

```bash
npm i
npm run dev
```

`http://localhost:5173`

## 脚本

| 命令 | 作用 |
|------|------|
| `npm run dev` | 开发 |
| `npm run build` | 打包（Vercel 同这条） |
| `npm run preview` | 本地看 dist |
| `npm run validate:data` | 校验 JSON |

## 地图模式

分封 / 势力 / 外交 / 春秋 / 地形。地形用 DEM + hillshade，底图 Carto。

## 其它

- 点叠在一起时排序：`radius` > 是否大国（`mapHelpers` 里硬编码列表）> 爵位。
- 手机端布局单独 CSS，逻辑和桌面一套。
- 部署：连 GitHub，Vercel 选 Vite，`build` → `dist`。

数据是 MVP 量级，坐标是估的，别当精确考古用。
