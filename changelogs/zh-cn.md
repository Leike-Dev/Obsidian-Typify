## 2.4.0 | 2026年6月6日

NEW | 通过 `favicon-providers.json` 支持自定义提供者
NEW | 集中式公告板，状态持久化到设置中
IMP | 缓存重写 — 在大型库中读取速度提高3倍
FIX | 使用 DuckDuckGo 打开离线笔记时空白的网站图标
FIX | 超过 80 KB 的自定义 SVG 会导致无声崩溃
BRK | `faviconSource` 重命名为 `faviconProvider` — 打开库时自动迁移

## 2.3.1 | 2026年4月14日

FIX | 在路径中包含特殊字符的库中无法加载图标
FIX | 使用自定义图标时与 Iconize 插件发生冲突

## 2.3.0 | 2026年3月2日

NEW | 链式后备支持：Google → DuckDuckGo → 直接获取
IMP | 自定义 SVG 最大大小从 50 KB 增加到 100 KB
FIX | 设置模态框在 Obsidian 1.7+ 中无法正确关闭
