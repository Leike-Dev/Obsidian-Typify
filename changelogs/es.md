## 2.4.0 | 6 de junio de 2026

NEW | Soporte para proveedores personalizados vía `favicon-providers.json`
NEW | Tablón de anuncios centralizado con estado persistente en la configuración
IMP | Caché reescrita — lectura 3× más rápida en bóvedas grandes
FIX | Favicon en blanco al abrir una nota sin conexión con DuckDuckGo
FIX | SVGs personalizados mayores de 80 KB causaban bloqueos silenciosos
BRK | `faviconSource` renombrado a `faviconProvider` — migración automática al abrir la bóveda

## 2.3.1 | 14 de abril de 2026

FIX | Los iconos no se cargaban en bóvedas con caracteres especiales en la ruta
FIX | Conflicto con el plugin Iconize al usar iconos personalizados

## 2.3.0 | 2 de marzo de 2026

NEW | Soporte de fallback en cadena: Google → DuckDuckGo → Búsqueda directa
IMP | Tamaño máximo de SVG personalizado aumentado de 50 KB a 100 KB
FIX | El modal de configuración no se cerraba correctamente en Obsidian 1.7+
