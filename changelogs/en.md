## 2.4.0 | June 6, 2026

NEW | Support for custom providers via `favicon-providers.json`
NEW | Centralized notice board with state persisted in settings
IMP | Cache rewritten — 3× faster reading on large vaults
FIX | Blank favicon when opening offline note with DuckDuckGo
FIX | Custom SVGs over 80 KB caused silent crash
BRK | `faviconSource` renamed to `faviconProvider` — automatic migration when opening vault

## 2.3.1 | April 14, 2026

FIX | Icons not loading in vaults with special characters in path
FIX | Conflict with Iconize plugin when using custom icons

## 2.3.0 | March 2, 2026

NEW | Chain fallback support: Google → DuckDuckGo → Direct fetch
IMP | Maximum custom SVG size increased from 50 KB to 100 KB
FIX | Settings modal not closing correctly in Obsidian 1.7+
