## 1.6.0 | August 23, 2026

NEW | "Outline" color mode: border-only style with subtle background contrast.
NEW | "Prefix match" for associated links: applies the style to any URL starting with the configured value.
NEW | Style duplication: quickly duplicate an existing style from the Style Manager.
NEW | Batch style creation: auto-create styles for multiple unconfigured values at once (up to 50).
NEW | Sorting & advanced filters in Style Manager: Recent, Alphabetical, Shape, Icon, Fill mode, Link.
NEW | Detailed explanations added to each option in the "Create style" modal.
NEW | Exclusive icon (sparkles) next to Typify in Obsidian settings search.
NEW | Informational notice about "Prefix match" added to the "Plugin notices" panel.
IMP | Migrated to Obsidian's new native settings API (requires Obsidian 1.13.0+).
IMP | "Manage styles" and "Other styles" moved from modals to dedicated settings sub-pages.
IMP | "Color palette" modal restructured with native Obsidian layout, responsive design, and Lucide icons.
IMP | "Manage favicons" redesigned: compact layout with provider selector in search bar.
IMP | "What's new" and "Plugin notices" modals redesigned with pill-tab navigation and fixed height.
IMP | "Shape" and "Color mode" pre-filled by default when creating new styles.
IMP | "All properties" renamed to "General" to avoid confusion with "Show all" filter.
IMP | Styles applied immediately when adding a property — no reload needed.
IMP | Parallel loading of icons, images, and favicons for faster startup.
IMP | Intelligent Lucide icon cache for faster visual updates with many styles.
IMP | Internal file conversion replaced with Obsidian's native function.
IMP | READMEs restructured across 5 languages with new banners and dedicated feature pages.
IMP | Sponsorship badge and Obsidian plugin page badge added to READMEs.
FIX | Tag CSS disappearing when editing colors in "Color palette" with settings open.
FIX | SVGs without `viewBox` breaking the "Create style" modal interface.
FIX | Custom icons/favicons not hiding immediately on disable or showing as broken squares on re-enable.
FIX | Dynamic views (Canvas, Bases) requiring reload to display new styles.
FIX | Style rendering delay in unfocused windows.
FIX | Removing a property now clears its styles immediately from the open note.
FIX | "Associated links" now reverts to original URL when property is unstyled.
FIX | Favicon search results now differentiated from empty cache.
FIX | Favicon fetching no longer freezes the plugin on slow sites.
FIX | Old favicon preserved when internet drops during refresh.
FIX | "Retry" button now works on sites marked as permanent failures.
FIX | Stored favicon size now displayed correctly.

