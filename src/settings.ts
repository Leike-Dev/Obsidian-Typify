import { PluginSettingTab, App, Setting, Notice } from 'obsidian';
import { StyleEditorModal } from './ui/StyleEditorModal';
import { StyleManagerModal } from './ui/StyleManagerModal';
import { ExportSettingsModal } from './ui/ExportSettingsModal';
import { ImportSettingsModal } from './ui/ImportSettingsModal';
import type TypifyPlugin from './main';
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

        // 3. HIDE REMOVE BUTTON (X)
        new Setting(containerEl)
            .setName(t('hide_remove_button_title'))
            .setDesc(t('hide_remove_button_desc'))
            .addDropdown(dropdown => {
                dropdown.addOption('none', t('hide_remove_button_none'));
                dropdown.addOption('properties', t('hide_remove_button_properties'));
                dropdown.addOption('bases', t('hide_remove_button_bases'));
                dropdown.addOption('both', t('hide_remove_button_both'));
                
                dropdown.setValue(this.plugin.settings.hideRemoveButton);
                
                dropdown.onChange(async (value) => {
                    this.plugin.settings.hideRemoveButton = value as 'none' | 'properties' | 'bases' | 'both';
                    await this.plugin.saveSettings();
                });
            });

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
                    new ExportSettingsModal(this.app, this.plugin).open();
                }));

        // IMPORT
        new Setting(containerEl)
            .setName(t('import_title'))
            .setDesc(t('import_desc'))
            .addButton(button => button
                .setButtonText(t('import_button'))
                .onClick(() => {
                    new ImportSettingsModal(this.app, this.plugin, () => this.display()).open();
                }));



    }
}
