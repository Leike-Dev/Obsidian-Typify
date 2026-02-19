import { PluginSettingTab, App, Setting, Notice } from 'obsidian';
import { StyleEditorModal } from './ui/StyleEditorModal';
import { StyleManagerModal } from './ui/StyleManagerModal';
import type TypifyPlugin from './main';
import { StatusStyle } from './types';
import { t } from './lang/helpers';

// ============================================================================
// SETTINGS TAB
// ============================================================================

/**
 * Settings Tab for the Typify plugin.
 * Handles configuration of target property, status styles, and import/export.
 */
export class CustomStatusIconsSettingTab extends PluginSettingTab {
    plugin: TypifyPlugin;

    constructor(app: App, plugin: TypifyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    /**
     * Renders the settings tab content.
     */
    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.addClass('csi-settings-container');

        // ================================================================
        // HEADER
        // ================================================================
        new Setting(containerEl)
            .setName(t('settings_title'))
            .setHeading()
            .setDesc(`v${this.plugin.manifest.version}`);

        // ================================================================
        // SECTION 1: CONFIGURATION
        // ================================================================
        new Setting(containerEl).setName(t('section_configuration_title')).setHeading();

        // ================================================================
        // TARGET PROPERTY
        // ================================================================
        new Setting(containerEl)
            .setName(t('target_property_title'))
            .setDesc(t('target_property_desc'))
            .addText(text => {
                text
                    .setPlaceholder(t('target_property_placeholder'))
                    .setValue(this.plugin.settings.targetProperty)
                    .onChange(async (value) => {
                        this.plugin.settings.targetProperty = value;
                        await this.plugin.saveSettings();
                    });
                text.inputEl.addEventListener('blur', () => {
                    this.display();
                });
            });


        // ================================================================
        // CUSTOM ICONS
        // ================================================================
        new Setting(containerEl)
            .setName(t('custom_icons_toggle_title'))
            .setDesc(t('custom_icons_toggle_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableCustomIcons)
                .onChange(async (value) => {
                    this.plugin.settings.enableCustomIcons = value;
                    await this.plugin.saveSettings();
                    if (value) {
                        try {
                            const result = await this.plugin.customIconsManager.initialize();
                            if (result.loaded > 0) {
                                new Notice(t('custom_icons_loaded').replace('{count}', String(result.loaded)));
                            } else {
                                new Notice(t('custom_icons_empty'));
                            }
                            if (result.errors.length > 0) {
                                console.warn('[Typify] Custom icon errors:', result.errors);
                            }
                        } catch (e) {
                            new Notice(t('custom_icons_error'));
                            console.error('[Typify] Custom icons error:', e);
                        }
                    } else {
                        // Clear cache so custom icons stop rendering immediately
                        this.plugin.customIconsManager.clear();
                    }

                    this.display();
                }));


        // Info card (shown only when custom icons are enabled)
        if (this.plugin.settings.enableCustomIcons) {
            const infoCard = containerEl.createDiv({ cls: 'csi-experimental-warning' });
            infoCard.createEl('p', {
                text: t('custom_icons_info'),
                cls: 'warning-text'
            });
        }

        // ================================================================

        // SECTION: STYLES (Styles Management)
        // ================================================================
        new Setting(containerEl).setName(t('section_styles_title')).setHeading();

        // 1. ADD STATUS
        new Setting(containerEl)
            .setName(t('add_status_title'))
            .setDesc(t('add_status_desc'))
            .addButton(button => button
                .setButtonText(t('add_status_button'))
                .setCta()
                .onClick(() => {
                    new StyleEditorModal(this.app, this.plugin, () => this.display()).open();
                }));

        // 2. MANAGE STYLES (New Button)
        new Setting(containerEl)
            .setName(t('manage_styles_title'))
            .setDesc(t('manage_styles_desc'))
            .addButton(button => button
                .setButtonText(t('manage_styles_button'))
                .onClick(() => {
                    new StyleManagerModal(this.app, this.plugin, () => this.display()).open();
                }));



        // ================================================================
        // DATA MANAGEMENT
        // ================================================================
        new Setting(containerEl).setName(t('section_data_management_title')).setHeading();

        // EXPORT
        new Setting(containerEl)
            .setName(t('export_title'))
            .setDesc(t('export_desc'))
            .addButton(button => button
                .setButtonText(t('export_button'))
                .onClick(() => {
                    void this.exportSettings();
                }));

        // IMPORT
        new Setting(containerEl)
            .setName(t('import_title'))
            .setDesc(t('import_desc'))
            .addButton(button => button
                .setButtonText(t('import_button'))
                .onClick(() => {
                    void this.importSettings();
                }));



    }

    /**
     * Exports the current settings to a JSON file in the Vault root.
     * Works on both Desktop and Mobile.
     */
    async exportSettings(): Promise<void> {
        const data = {
            version: this.plugin.manifest.version,
            exportedAt: new Date().toISOString(),
            targetProperty: this.plugin.settings.targetProperty,
            statusStyles: this.plugin.settings.statusStyles
        };

        const jsonContent = JSON.stringify(data, null, 2);
        const fileName = `typify-config-${new Date().toISOString().slice(0, 10)}.json`;

        try {
            // Check if file exists to avoid overwrite or error (or just append time)
            let finalName = fileName;
            let counter = 1;
            while (await this.app.vault.adapter.exists(finalName)) {
                finalName = `typify-config-${new Date().toISOString().slice(0, 10)}-${counter}.json`;
                counter++;
            }

            await this.app.vault.create(finalName, jsonContent);
            new Notice(t('export_success').replace('{file}', finalName));
        } catch (error) {
            new Notice(t('export_error'));
            console.error('Failed to export settings:', error);
        }
    }


    /**
     * Imports settings from a JSON file.
     * Validates the file format before applying.
     */
    importSettings(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', (e) => {
            void (async () => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                try {
                    const text = await file.text();
                    const data = JSON.parse(text) as {
                        statusStyles?: unknown;
                        targetProperty?: unknown;
                    };

                    // Validate imported data
                    if (!data.statusStyles || !Array.isArray(data.statusStyles)) {
                        throw new Error('Invalid format');
                    }

                    // Import settings
                    if (typeof data.targetProperty === 'string') {
                        this.plugin.settings.targetProperty = data.targetProperty;
                    }
                    this.plugin.settings.statusStyles = data.statusStyles as StatusStyle[];

                    await this.plugin.saveSettings();
                    this.display();

                    // Show success message
                    new Notice(t('import_success'));
                } catch {
                    new Notice(t('import_error'));
                }
            })();
        });
        input.click();
    }
}
