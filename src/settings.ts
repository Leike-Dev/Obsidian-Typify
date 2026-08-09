import { PluginSettingTab, App, Setting, Notice, SettingDefinitionItem, setIcon } from 'obsidian';
import { StyleEditorModal } from './ui/StyleEditorModal';
import { StyleManagerModal } from './ui/StyleManagerModal';
import { ExportSettingsModal } from './ui/ExportSettingsModal';
import { ImportSettingsModal } from './ui/ImportSettingsModal';
import { PaletteModal } from './ui/PaletteModal';
import { FaviconsModal } from './ui/FaviconsModal';
import { ChangelogModal } from './ui/ChangelogModal';
import { NoticesModal } from './ui/NoticesModal';
import { PropertySuggest } from './ui/property-suggest';
import type TypifyPlugin from './main';
import { t } from './lang/helpers';

// ============================================================================
// SETTINGS TAB
// ============================================================================

/**
 * Settings Tab for the Typify plugin.
 * Uses the declarative settings API (Obsidian 1.13+) for search indexing
 * and rendering. Complex UI sections use SettingDefinitionRender for
 * imperative control within the declarative framework.
 */
export class CustomStatusIconsSettingTab extends PluginSettingTab {
    plugin: TypifyPlugin;
    private noticesSetting: Setting | null = null;

    constructor(app: App, plugin: TypifyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.icon = 'sparkles';
    }

    update(): void {
        super.update();
    }

    getSettingDefinitions(): SettingDefinitionItem[] {
        const defs: SettingDefinitionItem[] = [];

        // ================================================================
        // CHANGELOG & NOTICES (top-level, no heading)
        // ================================================================
        defs.push({
            name: t('changelog_title'),
            desc: t('changelog_desc'),
            render: (setting: Setting) => {
                setting.addButton(button => button
                    .setButtonText(t('changelog_button'))
                    .onClick(() => {
                        new ChangelogModal(this.app, this.plugin.manifest, () => { this.update(); }).open();
                    }));

                if (this.plugin.settings.lastSeenVersion !== this.plugin.manifest.version) {
                    const nameEl = setting.nameEl;
                    nameEl.setText(t('changelog_title') + ' ');
                    nameEl.createSpan({ text: t('changelog_badge_new'), cls: 'typify-changelog-badge-new' });
                }
            }
        });

        defs.push({
            name: t('notices_title'),
            desc: t('notices_desc'),
            render: (setting: Setting) => {
                this.noticesSetting = setting;
                setting.addButton(button => button
                    .setButtonText(t('notices_button'))
                    .onClick(() => {
                        new NoticesModal(this.app, this.plugin).open();
                    }));
                this.renderNoticesBadge();
            }
        });

        // ================================================================
        // TARGET PROPERTY (top-level)
        // ================================================================
        defs.push({
            name: t('target_property_title'),
            desc: t('target_property_desc'),
            render: (setting: Setting) => {
                        const propInputWrapper = setting.controlEl.createDiv({
                            cls: 'typify-target-property-wrapper'
                        });

                        const propInput = propInputWrapper.createEl('input', {
                            type: 'text',
                            cls: 'typify-target-property-input',
                            attr: {
                                placeholder: t('target_property_placeholder'),
                                spellcheck: 'false'
                            }
                        });

                        // Obsidian-native autocomplete via AbstractInputSuggest
                        const propSuggest = new PropertySuggest(this.app, propInput, () => this.getAllPropertyNames());
                        propSuggest.onSelect((prop) => {
                            void this.addProperty(prop);
                            propInput.value = '';
                            renderTargetChips();
                        });

                        const chipsContainer = propInputWrapper.createDiv({
                            cls: 'typify-target-property-chips'
                        });

                        const renderTargetChips = () => {
                            chipsContainer.empty();
                            const props = this.plugin.settings.targetProperty
                                .split(',')
                                .map(p => p.trim())
                                .filter(p => p.length > 0);

                            for (const prop of props) {
                                const chip = chipsContainer.createSpan({ cls: 'setting-hotkey' });
                                chip.appendText(prop + ' ');
                                const removeBtn = chip.createSpan({
                                    cls: 'setting-hotkey-icon setting-delete-hotkey',
                                    attr: { 'aria-label': 'Remover' }
                                });
                                setIcon(removeBtn, 'x');
                                removeBtn.addEventListener('click', () => {
                                    void this.removeProperty(prop);
                                    renderTargetChips();
                                });
                            }
                        };

                        renderTargetChips();
                    }
        });

        // ================================================================
        // SECTION: STYLES
        // ================================================================
        defs.push({
            type: 'group' as const,
            heading: t('section_styles_title'),
            items: [
                // Add Status
                {
                    name: t('add_status_title'),
                    desc: t('add_status_desc'),
                    render: (setting: Setting) => {
                        setting.addButton(button => button
                            .setButtonText(t('add_status_button'))
                            .setCta()
                            .onClick(() => {
                                new StyleEditorModal(this.app, this.plugin, () => { this.update(); }).open();
                            }));
                    }
                },
                // Manage Styles
                {
                    name: t('manage_styles_title'),
                    desc: t('manage_styles_desc'),
                    render: (setting: Setting) => {
                        setting.addButton(button => button
                            .setButtonText(t('manage_styles_button'))
                            .onClick(() => {
                                new StyleManagerModal(this.app, this.plugin, () => { this.update(); }).open();
                            }));
                    }
                }
            ]
        });

        // ================================================================
        // GROUP: UI COMPONENTS (other styles)
        // ================================================================
        defs.push({
            type: 'group' as const,
            heading: t('ui_components_title'),
            cls: 'typify-settings-ui-group',
            items: [
                // Hide Remove Button — dropdown
                {
                    name: t('hide_remove_button_title'),
                    desc: t('hide_remove_button_desc'),
                    control: {
                        type: 'dropdown' as const,
                        key: 'hideRemoveButton',
                        options: {
                            'none': t('hide_remove_button_none'),
                            'properties': t('hide_remove_button_properties'),
                            'bases': t('hide_remove_button_bases'),
                            'both': t('hide_remove_button_both')
                        }
                    }
                },

                // Hide Remove Button Hover — needs side-effect for body class
                {
                    name: t('hide_remove_button_hover_title'),
                    desc: t('hide_remove_button_hover_desc'),
                    render: (setting: Setting) => {
                        setting.addToggle(toggle => toggle
                            .setValue(this.plugin.settings.hideRemoveButtonHover)
                            .onChange(async (value) => {
                                this.plugin.settings.hideRemoveButtonHover = value;
                                await this.plugin.saveSettings();
                                this.plugin.updateBodyClasses();
                            }));
                    }
                },

                // Custom Icons — needs side-effects on toggle
                {
                    name: t('custom_icons_toggle_title'),
                    desc: t('custom_icons_toggle_desc'),
                    render: (setting: Setting) => {
                        setting.addToggle(toggle => toggle
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
                                    } catch (e) {
                                        new Notice(t('custom_icons_error'));
                                        console.error('[Typify] Custom icons error:', e);
                                    }
                                } else {
                                    this.plugin.customIconsManager.clear();
                                }
                                this.update();
                            }));
                    }
                },

                // Link Styles — simple toggle
                {
                    name: t('link_styles_toggle_title'),
                    desc: t('link_styles_toggle_desc'),
                    control: {
                        type: 'toggle' as const,
                        key: 'enableLinkStyles'
                    }
                },

                // Custom Palette Toggle — needs side-effect + experimental badge
                {
                    name: t('custom_palette_toggle_title'),
                    desc: t('custom_palette_toggle_desc'),
                    render: (setting: Setting) => {
                        setting.addToggle(toggle => toggle
                            .setValue(this.plugin.settings.enableCustomPalette)
                            .onChange(async (value) => {
                                this.plugin.settings.enableCustomPalette = value;
                                await this.plugin.saveSettings();
                                this.update();
                            }));

                        const nameEl = setting.nameEl;
                        nameEl.setText(t('custom_palette_toggle_title') + ' ');
                        nameEl.createSpan({ text: t('experimental_tag'), cls: 'typify-experimental-tag' });
                    }
                },

                // Favicons Toggle — needs side-effect + experimental badge
                {
                    name: t('favicon_manager_title'),
                    desc: t('favicon_manager_toggle_desc'),
                    render: (setting: Setting) => {
                        setting.addToggle(toggle => toggle
                            .setValue(this.plugin.settings.enableFavicons)
                            .onChange(async (value) => {
                                this.plugin.settings.enableFavicons = value;
                                await this.plugin.saveSettings();
                                if (value) {
                                    await this.plugin.faviconManager.initialize();
                                } else {
                                    this.plugin.faviconManager.cleanupActiveUrls();
                                }
                                this.update();
                            }));

                        const favNameEl = setting.nameEl;
                        favNameEl.setText(t('favicon_manager_title') + ' ');
                        favNameEl.createSpan({ text: t('experimental_tag'), cls: 'typify-experimental-tag' });
                    }
                }
            ]
        });

        // ================================================================
        // SECTION: EXPERIMENTAL (conditional on palette or favicons)
        // ================================================================
        defs.push({
            type: 'group' as const,
            heading: t('section_experimental_title'),
            cls: 'typify-experimental-heading',
            visible: () => this.plugin.settings.enableCustomPalette || this.plugin.settings.enableFavicons,
            items: [
                // Palette Manager
                {
                    name: t('palette_title'),
                    desc: t('palette_manager_desc'),
                    visible: () => this.plugin.settings.enableCustomPalette,
                    render: (setting: Setting) => {
                        setting.addButton(button => button
                            .setButtonText(t('manage_styles_button'))
                            .onClick(() => {
                                new PaletteModal(this.app, this.plugin, () => { this.update(); }).open();
                            }));
                    }
                },

                // Favicon Manager
                {
                    name: t('favicon_manager_title'),
                    desc: t('favicon_manager_desc'),
                    visible: () => this.plugin.settings.enableFavicons,
                    render: (setting: Setting) => {
                        setting.addButton(button => button
                            .setButtonText(t('manage_styles_button'))
                            .onClick(() => {
                                new FaviconsModal(this.app, this.plugin, () => { this.update(); }).open();
                            }));
                    }
                }
            ]
        });

        // ================================================================
        // SECTION: DATA MANAGEMENT
        // ================================================================
        defs.push({
            type: 'group' as const,
            heading: t('section_data_management_title'),
            items: [
                // Export
                {
                    name: t('export_title'),
                    desc: t('export_desc'),
                    render: (setting: Setting) => {
                        setting.addButton(button => button
                            .setButtonText(t('export_button'))
                            .onClick(() => {
                                new ExportSettingsModal(this.app, this.plugin).open();
                            }));
                    }
                },
                // Import
                {
                    name: t('import_title'),
                    desc: t('import_desc'),
                    render: (setting: Setting) => {
                        setting.addButton(button => button
                            .setButtonText(t('import_button'))
                            .onClick(() => {
                                new ImportSettingsModal(this.app, this.plugin, () => { this.update(); }).open();
                            }));
                    }
                }
            ]
        });

        return defs;
    }

    private getActiveNoticesCount(): number {
        let count = 0;
        if (this.plugin.settings.enableFavicons) count++; // Favicon providers notice
        if (this.plugin.settings.enableCustomIcons) count++; // Custom icons notice
        if (this.plugin.settings.enableFavicons) count++; // Local cache active notice
        return count;
    }

    private getAllPropertyNames(): string[] {
        const properties = new Set<string>();
        
        // Get currently added properties to filter them out
        const addedProps = this.plugin.settings.targetProperty
            .split(',')
            .map(p => p.trim().toLowerCase())
            .filter(p => p.length > 0);

        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            const cache = this.app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;
            if (!frontmatter) continue;
            for (const key of Object.keys(frontmatter)) {
                if (key === 'position') continue;
                if (Array.isArray(frontmatter[key])) {
                    if (!addedProps.includes(key.toLowerCase())) {
                        properties.add(key);
                    }
                }
            }
        }
        return [...properties].sort((a, b) => a.localeCompare(b));
    }

    private async addProperty(prop: string): Promise<void> {
        const props = this.plugin.settings.targetProperty
            .split(',')
            .map(p => p.trim().toLowerCase())
            .filter(p => p.length > 0);

        if (props.includes(prop.toLowerCase())) return;

        const current = this.plugin.settings.targetProperty.trim();
        this.plugin.settings.targetProperty = current
            ? `${current}, ${prop}`
            : prop;
        await this.plugin.saveSettings();
    }

    private async removeProperty(prop: string): Promise<void> {
        const props = this.plugin.settings.targetProperty
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0 && p.toLowerCase() !== prop.toLowerCase());
        this.plugin.settings.targetProperty = props.join(', ');
        await this.plugin.saveSettings();
    }
    private renderNoticesBadge() {
        if (!this.noticesSetting) return;

        // Remove existing badge if any
        const existingBadge = this.noticesSetting.controlEl.querySelector('.typify-notices-badge-container');
        if (existingBadge) {
            existingBadge.remove();
        }

        const activeNoticesCount = this.getActiveNoticesCount();
        if (activeNoticesCount > 0) {
            const badgeContainer = createDiv();
            badgeContainer.addClass('typify-notices-badge-container');
            badgeContainer.createSpan({ text: activeNoticesCount.toString(), cls: 'typify-notices-badge' });

            // Insert the badge before the button
            this.noticesSetting.controlEl.prepend(badgeContainer);
        }
    }
}
