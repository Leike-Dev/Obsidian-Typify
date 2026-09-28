import type TypifyPlugin from './main';
import { StyleEditorModal } from './ui/StyleEditorModal';
import { t } from './lang/helpers';
import { Menu } from 'obsidian';
import { getStyleValue } from './utils/style-value';

/**
 * Registers native context menus (like right-clicking external URLs).
 */
export function registerContextMenus(plugin: TypifyPlugin) {
    plugin.registerEvent(
        plugin.app.workspace.on('url-menu', (menu: Menu, url: string) => {
            const styles = plugin.settings.statusStyles;
            let matchIndex = -1;

            // 1. Search for an exact match first
            matchIndex = styles.findIndex(s => {
                const matchVal = (s.matchValue?.trim() || getStyleValue(s)).toLowerCase();
                return url.toLowerCase() === matchVal;
            });

            // 2. If no exact match, search for a prefix match (longest prefix wins)
            if (matchIndex === -1) {
                let bestPrefixLen = -1;
                styles.forEach((s, i) => {
                    if (s.prefixMatch && s.matchValue?.trim()) {
                        const matchVal = s.matchValue.trim().toLowerCase();
                        if (url.toLowerCase().startsWith(matchVal) && matchVal.length > bestPrefixLen) {
                            bestPrefixLen = matchVal.length;
                            matchIndex = i;
                        }
                    }
                });
            }

            if (matchIndex !== -1) {
                const existingStyle = styles[matchIndex];
                menu.addItem((item) => {
                    item.setTitle(t('context_edit_link_style'))
                        .setIcon('pencil')
                        .onClick(() => {
                            new StyleEditorModal(
                                plugin.app,
                                plugin,
                                undefined,
                                existingStyle,
                                matchIndex,
                                undefined
                            ).open();
                        });
                });
            } else {
                menu.addItem((item) => {
                    item.setTitle(t('context_create_link_style'))
                        .setIcon('palette')
                        .onClick(() => {
                            new StyleEditorModal(
                                plugin.app,
                                plugin,
                                undefined,
                                undefined,
                                undefined,
                                undefined,
                                { matchValue: url }
                            ).open();
                        });
                });
            }
        })
    );
}
