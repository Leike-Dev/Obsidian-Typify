import type TypifyPlugin from './main';
import { StyleEditorModal } from './ui/StyleEditorModal';
import { StyleManagerModal } from './ui/StyleManagerModal';
import { FaviconsModal } from './ui/FaviconsModal';
import { NoticesModal } from './ui/NoticesModal';
import { t } from './lang/helpers';

/**
 * Registers all global commands for the Command Palette.
 */
export function registerCommands(plugin: TypifyPlugin) {
    plugin.addCommand({
        id: 'create-style',
        name: t('command_create_style'),
        icon: 'plus',
        callback: () => {
            new StyleEditorModal(plugin.app, plugin).open();
        }
    });

    plugin.addCommand({
        id: 'manage-styles',
        name: t('command_manage_styles'),
        icon: 'palette',
        callback: () => {
            new StyleManagerModal(plugin.app, plugin).open();
        }
    });

    plugin.addCommand({
        id: 'manage-favicons',
        name: t('command_manage_favicons'),
        icon: 'globe',
        // checkCallback is used so the command is only available when Favicons are enabled
        checkCallback: (checking: boolean) => {
            if (plugin.settings.enableFavicons) {
                if (!checking) {
                    new FaviconsModal(plugin.app, plugin).open();
                }
                return true;
            }
            return false;
        }
    });

    plugin.addCommand({
        id: 'plugin-notices',
        name: t('command_plugin_notices'),
        icon: 'bell',
        callback: () => {
            new NoticesModal(plugin.app, plugin).open();
        }
    });
}
