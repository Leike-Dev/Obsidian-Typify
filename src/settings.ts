import { PluginSettingTab, App, Setting, Notice, setIcon } from 'obsidian';
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
 * Handles configuration of target property, status styles, and import/export.
 */
export class CustomStatusIconsSettingTab extends PluginSettingTab {
    plugin: TypifyPlugin;
    togglesExpanded = false;
    experimentalSectionEl: HTMLElement | null = null;
    noticesSetting: Setting | null = null;

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
        containerEl.addClass('typify-settings-container');

        // General settings at the top, without a heading
        // (per Obsidian Plugin Guidelines: avoid a top-level heading like the plugin name)

        const changelogSetting = new Setting(containerEl)
            .setName(t('changelog_title'))
            .setDesc(t('changelog_desc'))
            .addButton(button => button
                .setButtonText(t('changelog_button'))
                .onClick(() => {
                    new ChangelogModal(this.app, this.plugin.manifest, () => { this.display(); }).open();
                }));

        if (this.plugin.settings.lastSeenVersion !== this.plugin.manifest.version) {
            const nameEl = changelogSetting.nameEl;
            nameEl.setText(t('changelog_title') + ' ');
            nameEl.createSpan({ text: t('changelog_badge_new'), cls: 'typify-changelog-badge-new' });
        }

        this.noticesSetting = new Setting(containerEl)
            .setName(t('notices_title'))
            .setDesc(t('notices_desc'))
            .addButton(button => button
                .setButtonText(t('notices_button'))
                .onClick(() => {
                    new NoticesModal(this.app, this.plugin).open();
                }));

        this.renderNoticesBadge();

        // ================================================================
        // SECTION: GENERAL
        // ================================================================
        new Setting(containerEl).setName(t('section_configuration_title')).setHeading();

        // ================================================================
        // TARGET PROPERTY
        // ================================================================
        const targetPropSetting = new Setting(containerEl)
            .setName(t('target_property_title'))
            .setDesc(t('target_property_desc'));

        const propInputWrapper = targetPropSetting.controlEl.createDiv({
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
                const chip = chipsContainer.createDiv({ cls: 'typify-target-chip' });
                chip.createSpan({ text: prop, cls: 'typify-target-chip-text' });
                const removeBtn = chip.createEl('button', {
                    cls: 'typify-target-chip-remove',
                    attr: { 'aria-label': 'Remove' }
                });
                removeBtn.setText('\u00d7');
                removeBtn.addEventListener('click', () => {
                    void this.removeProperty(prop);
                    renderTargetChips();
                });
            }
        };

        renderTargetChips();


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
                            // Errors are already surfaced to the user via Notice;
                            // no additional console output needed.
                        } catch (e) {
                            new Notice(t('custom_icons_error'));
                            console.error('[Typify] Custom icons error:', e);
                        }
                    } else {
                        // Clear cache so custom icons stop rendering immediately
                        this.plugin.customIconsManager.clear();
                    }

                    this.renderNoticesBadge();
                }));




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
                    new StyleEditorModal(this.app, this.plugin, () => { this.display(); }).open();
                }));

        // 2. MANAGE STYLES (New Button)
        new Setting(containerEl)
            .setName(t('manage_styles_title'))
            .setDesc(t('manage_styles_desc'))
            .addButton(button => button
                .setButtonText(t('manage_styles_button'))
                .onClick(() => {
                    new StyleManagerModal(this.app, this.plugin, () => { this.display(); }).open();
                }));

        // ================================================================
        // COLLAPSIBLE UI COMPONENTS SECTION
        // ================================================================
        const isTogglesOpen = this.togglesExpanded;

        const togglesHeader = new Setting(containerEl)
            .setName(t('ui_components_title'))
            .setDesc(t('ui_components_desc'));

        togglesHeader.settingEl.classList.add("typify-dropdown-header");
        if (isTogglesOpen) {
            togglesHeader.settingEl.classList.add("is-expanded");
        }

        const toggleIconToggles = togglesHeader.controlEl.createSpan({ cls: "typify-dropdown-icon" });
        setIcon(toggleIconToggles, isTogglesOpen ? "chevron-down" : "chevron-right");
        togglesHeader.settingEl.classList.add("typify-clickable-header");

        const togglesContainer = containerEl.createDiv({ cls: "typify-dropdown-container" });
        togglesContainer.style.display = isTogglesOpen ? "block" : "none";

        togglesHeader.settingEl.addEventListener("click", () => {
            const newState = !this.togglesExpanded;
            this.togglesExpanded = newState;
            togglesContainer.style.display = newState ? "block" : "none";
            toggleIconToggles.empty();
            setIcon(toggleIconToggles, newState ? "chevron-down" : "chevron-right");
            if (newState) {
                togglesHeader.settingEl.classList.add("is-expanded");
            } else {
                togglesHeader.settingEl.classList.remove("is-expanded");
            }
        });

        // 3. HIDE REMOVE BUTTON (X)
        new Setting(togglesContainer)
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

        new Setting(togglesContainer)
            .setName(t('hide_remove_button_hover_title'))
            .setDesc(t('hide_remove_button_hover_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.hideRemoveButtonHover)
                .onChange(async (value) => {
                    this.plugin.settings.hideRemoveButtonHover = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateBodyClasses();
                }));

        // ================================================================
        // LINK STYLES
        // ================================================================
        new Setting(togglesContainer)
            .setName(t('link_styles_toggle_title'))
            .setDesc(t('link_styles_toggle_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableLinkStyles)
                .onChange(async (value) => {
                    this.plugin.settings.enableLinkStyles = value;
                    await this.plugin.saveSettings();
                }));

        // CUSTOM PALETTE TOGGLE (with Experimental badge)
        const paletteSetting = new Setting(togglesContainer)
            .setDesc(t('custom_palette_toggle_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableCustomPalette)
                .onChange(async (value) => {
                    this.plugin.settings.enableCustomPalette = value;
                    await this.plugin.saveSettings();
                    this.renderExperimentalSection();
                }));

        // Set name with experimental badge
        const nameEl = paletteSetting.nameEl;
        nameEl.setText(t('custom_palette_toggle_title') + ' ');
        nameEl.createSpan({ text: t('experimental_tag'), cls: 'typify-experimental-tag' });

        // FAVICONS TOGGLE (with Experimental badge)
        const faviconsSetting = new Setting(togglesContainer)
            .setDesc(t('favicon_manager_toggle_desc'))
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableFavicons)
                .onChange(async (value) => {
                    this.plugin.settings.enableFavicons = value;
                    await this.plugin.saveSettings();
                    
                    if (value) {
                        await this.plugin.faviconManager.initialize();
                    } else {
                        this.plugin.faviconManager.cleanupActiveUrls();
                    }
                    this.renderExperimentalSection();
                    this.renderNoticesBadge();
                }));

        const favNameEl = faviconsSetting.nameEl;
        favNameEl.setText(t('favicon_manager_title') + ' ');
        favNameEl.createSpan({ text: t('experimental_tag'), cls: 'typify-experimental-tag' });

        // ================================================================
        // SECTION: EXPERIMENTAL (visible only when palette or favicons are enabled)
        // ================================================================
        this.experimentalSectionEl = containerEl.createDiv();
        this.renderExperimentalSection();

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
                    new ImportSettingsModal(this.app, this.plugin, () => { this.display(); }).open();
                }));




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
        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            const cache = this.app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;
            if (!frontmatter) continue;
            for (const key of Object.keys(frontmatter)) {
                if (key === 'position') continue;
                properties.add(key);
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
            const badgeContainer = activeDocument.createElement('div');
            badgeContainer.addClass('typify-notices-badge-container');
            badgeContainer.createSpan({ text: activeNoticesCount.toString(), cls: 'typify-notices-badge' });
            
            // Insert the badge before the button
            this.noticesSetting.controlEl.prepend(badgeContainer);
        }
    }

    private renderExperimentalSection() {
        if (!this.experimentalSectionEl) return;
        
        this.experimentalSectionEl.empty();
        const showExperimental = this.plugin.settings.enableCustomPalette || this.plugin.settings.enableFavicons;
        this.experimentalSectionEl.style.display = showExperimental ? "block" : "none";

        if (!showExperimental) return;

        const experimentalHeading = new Setting(this.experimentalSectionEl).setName(t('section_experimental_title')).setHeading();
        experimentalHeading.settingEl.addClass('typify-experimental-heading');

        if (this.plugin.settings.enableCustomPalette) {
            new Setting(this.experimentalSectionEl)
                .setName(t('palette_title'))
                .setDesc(t('palette_manager_desc'))
                .addButton(button => button
                    .setButtonText(t('manage_styles_button'))
                    .onClick(() => {
                        new PaletteModal(this.app, this.plugin, () => { this.display(); }).open();
                    }));
        }

        if (this.plugin.settings.enableFavicons) {
            new Setting(this.experimentalSectionEl)
                .setName(t('favicon_manager_title'))
                .setDesc(t('favicon_manager_desc'))
                .addButton(button => button
                    .setButtonText(t('manage_styles_button'))
                    .onClick(() => {
                        new FaviconsModal(this.app, this.plugin, () => { this.display(); }).open();
                    }));
        }
    }
}
