import { PluginSettingTab, App, Setting, setIcon, Notice } from 'obsidian';
import type CustomStatusIconsPlugin from './main';
import { StatusStyle, DEFAULT_STATUS_COLOR } from './types';
import { IconPickerModal } from './icon-picker';
import { generatePalette } from './utils';
import { t } from './lang/helpers';

// ============================================================================
// SETTINGS TAB
// ============================================================================

/**
 * Settings Tab for the Custom Status Icons plugin.
 * Handles configuration of target property, status styles, and import/export.
 */
export class CustomStatusIconsSettingTab extends PluginSettingTab {
    plugin: CustomStatusIconsPlugin;

    constructor(app: App, plugin: CustomStatusIconsPlugin) {
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
        const header = containerEl.createDiv({ cls: 'csi-settings-header' });
        const title = header.createEl('h2', { text: t('settings_title') });
        title.createEl('span', { text: this.plugin.manifest.version, cls: 'csi-version' });

        // ================================================================
        // TARGET PROPERTY CARD
        // ================================================================
        const targetCard = containerEl.createDiv({ cls: 'csi-setting-card' });

        // Info section (left side)
        const targetInfo = targetCard.createDiv({ cls: 'csi-card-info' });
        targetInfo.createDiv({ text: t('target_property_title'), cls: 'csi-card-title' });
        targetInfo.createEl('p', {
            text: t('target_property_desc'),
            cls: 'csi-card-description'
        });

        // Input section (right side)
        const targetSetting = new Setting(targetCard)
            .addText(text => text
                .setPlaceholder(t('target_property_placeholder'))
                .setValue(this.plugin.settings.targetProperty)
                .onChange(async (value) => {
                    this.plugin.settings.targetProperty = value;
                    await this.plugin.saveSettings();
                }));
        targetSetting.settingEl.style.padding = '0';
        targetSetting.settingEl.style.border = 'none';
        targetSetting.settingEl.style.background = 'none';
        targetSetting.infoEl.remove();

        // ================================================================
        // ADD STATUS CARD
        // ================================================================
        const styleCard = containerEl.createDiv({ cls: 'csi-setting-card' });

        // Info section (left side)
        const styleInfo = styleCard.createDiv({ cls: 'csi-card-info' });
        styleInfo.createDiv({ text: t('add_status_title'), cls: 'csi-card-title' });
        styleInfo.createEl('p', {
            text: t('add_status_desc'),
            cls: 'csi-card-description'
        });

        // Button (right side)
        const addButton = styleCard.createEl('button', { text: t('add_status_button') });
        addButton.setAttribute('class', 'mod-cta');
        addButton.addEventListener('click', async () => {
            this.plugin.settings.statusStyles.push({
                name: t('new_status_name'),
                baseColor: DEFAULT_STATUS_COLOR,
                icon: 'circle'
            });
            await this.plugin.saveSettings();
            this.display();
        });

        // ================================================================
        // EXPORT CARD
        // ================================================================
        const exportCard = containerEl.createDiv({ cls: 'csi-setting-card' });

        const exportInfo = exportCard.createDiv({ cls: 'csi-card-info' });
        exportInfo.createDiv({ text: t('export_title'), cls: 'csi-card-title' });
        exportInfo.createEl('p', {
            text: t('export_desc'),
            cls: 'csi-card-description'
        });

        const exportButton = exportCard.createEl('button', { text: t('export_button') });
        exportButton.addEventListener('click', () => {
            this.exportSettings();
        });

        // ================================================================
        // IMPORT CARD
        // ================================================================
        const importCard = containerEl.createDiv({ cls: 'csi-setting-card' });

        const importInfo = importCard.createDiv({ cls: 'csi-card-info' });
        importInfo.createDiv({ text: t('import_title'), cls: 'csi-card-title' });
        importInfo.createEl('p', {
            text: t('import_desc'),
            cls: 'csi-card-description'
        });

        const importButton = importCard.createEl('button', { text: t('import_button') });
        importButton.addEventListener('click', () => {
            this.importSettings();
        });

        // ================================================================
        // STATUS LIST
        // ================================================================
        containerEl.createDiv({ cls: 'csi-status-list-header', text: t('saved_styles_title') });

        const statusListEl = containerEl.createDiv({ cls: 'csi-status-list' });

        if (this.plugin.settings.statusStyles.length === 0) {
            statusListEl.createEl('p', {
                text: t('no_styles_defined'),
                cls: 'csi-card-description',
                attr: { style: 'text-align: center; padding: 20px;' }
            });
        }

        this.plugin.settings.statusStyles.forEach((style, index) => {
            this.renderStatusItem(statusListEl, style, index);
        });
    }

    /**
     * Renders a single status style item in the list (accordion style).
     * @param container The container to append the item to.
     * @param style The status style object to render.
     * @param index The index of the style in the settings array.
     */
    renderStatusItem(container: HTMLElement, style: StatusStyle, index: number): void {
        const itemEl = container.createDiv({ cls: 'csi-status-item' });

        // ============================================
        // ACCORDION HEADER
        // ============================================
        const header = itemEl.createDiv({ cls: 'csi-status-header' });

        const nameDisplay = header.createDiv({ cls: 'csi-status-name' });
        // Preview dot
        const dot = nameDisplay.createSpan({ cls: 'csi-status-preview-dot' });
        dot.style.backgroundColor = style.baseColor;

        const nameText = nameDisplay.createSpan({ text: style.name });

        const arrow = header.createDiv({ cls: 'csi-status-arrow' });
        setIcon(arrow, 'chevron-down');

        // Toggle Expand/Collapse
        header.addEventListener('click', () => {
            itemEl.classList.toggle('is-open');
        });

        // ============================================
        // ACCORDION BODY
        // ============================================
        const body = itemEl.createDiv({ cls: 'csi-status-body' });

        // --- Controls (using card layout) ---
        const controlsContainer = body.createDiv({ cls: 'csi-controls-list' });

        // 1. Status Name
        const nameCard = controlsContainer.createDiv({ cls: 'csi-control-card' });
        const nameInfo = nameCard.createDiv({ cls: 'csi-card-info' });
        nameInfo.createDiv({ text: t('status_name_title'), cls: 'csi-card-title' });
        nameInfo.createEl('p', { text: t('status_name_desc'), cls: 'csi-card-description' });
        const nameInput = nameCard.createEl('input', { type: 'text', value: style.name, cls: 'csi-input-text' });
        nameInput.addEventListener('change', async () => {
            style.name = nameInput.value;
            nameText.textContent = nameInput.value;
            await this.plugin.saveSettings();
        });

        // 2. Base Color
        const colorCard = controlsContainer.createDiv({ cls: 'csi-control-card' });
        const colorInfo = colorCard.createDiv({ cls: 'csi-card-info' });
        colorInfo.createDiv({ text: t('base_color_title'), cls: 'csi-card-title' });
        colorInfo.createEl('p', { text: t('base_color_desc'), cls: 'csi-card-description' });
        const colorInput = colorCard.createEl('input', { type: 'color', value: style.baseColor });

        const updateColor = async (newColor: string) => {
            style.baseColor = newColor;
            colorInput.value = newColor;
            dot.style.backgroundColor = newColor;
            await this.plugin.saveSettings();
            this.updatePreviewColors(body, newColor);
        };

        colorInput.addEventListener('change', async () => { await updateColor(colorInput.value); });

        // 3. Icon Selector
        const iconCard = controlsContainer.createDiv({ cls: 'csi-control-card' });
        const iconInfo = iconCard.createDiv({ cls: 'csi-card-info' });
        iconInfo.createDiv({ text: t('icon_title'), cls: 'csi-card-title' });
        iconInfo.createEl('p', { text: t('icon_desc'), cls: 'csi-card-description' });

        const iconWrapper = iconCard.createDiv({ cls: 'csi-control-area' });

        const iconPreview = iconWrapper.createDiv({ cls: 'csi-icon-preview' });

        const iconButton = iconWrapper.createEl('button', { cls: 'csi-icon-picker-btn' });
        setIcon(iconButton, 'plus');
        iconButton.setAttribute('aria-label', t('icon_desc'));

        const removeIconButton = iconWrapper.createEl('button', { cls: 'csi-icon-picker-btn csi-btn-remove-icon' });
        setIcon(removeIconButton, 'x');
        removeIconButton.setAttribute('aria-label', t('remove_icon_tooltip'));

        if (!style.icon) removeIconButton.style.display = 'none';

        const updateIconPreview = (iconKey: string) => {
            iconPreview.empty();
            if (iconKey) {
                setIcon(iconPreview, iconKey);
                removeIconButton.style.display = 'flex';
            } else {
                removeIconButton.style.display = 'none';
            }
        };
        updateIconPreview(style.icon);

        iconButton.addEventListener('click', () => {
            new IconPickerModal(
                this.app,
                this.plugin.settings.recentIcons,
                async (icon) => {
                    style.icon = icon;
                    updateIconPreview(icon);
                    this.addToRecentIcons(icon);
                    await this.plugin.saveSettings();
                }
            ).open();
        });

        removeIconButton.addEventListener('click', async () => {
            style.icon = '';
            updateIconPreview('');
            await this.plugin.saveSettings();
        });

        // 4. Preview (separate card, no title)
        const previewCard = body.createDiv({ cls: 'csi-preview-card' });
        const palette = generatePalette(style.baseColor);

        // Light Mode Preview Container
        const lightWrapper = previewCard.createDiv({ cls: 'csi-preview-wrapper csi-preview-light' });
        lightWrapper.createDiv({ text: t('preview_light_context'), cls: 'csi-preview-label' });
        const lightPill = lightWrapper.createDiv({ cls: 'csi-preview-pill' });
        lightPill.style.backgroundColor = palette.light.bg;
        lightPill.style.color = palette.light.text;
        lightPill.createSpan({ text: '●' });
        lightPill.createSpan({ text: style.name });

        // Dark Mode Preview Container
        const darkWrapper = previewCard.createDiv({ cls: 'csi-preview-wrapper csi-preview-dark' });
        darkWrapper.createDiv({ text: t('preview_dark_context'), cls: 'csi-preview-label' });
        const darkPill = darkWrapper.createDiv({ cls: 'csi-preview-pill' });
        darkPill.style.backgroundColor = palette.dark.bg;
        darkPill.style.color = palette.dark.text;
        darkPill.createSpan({ text: '●' });
        darkPill.createSpan({ text: style.name });

        // --- Actions ---
        const actions = body.createDiv({ cls: 'csi-actions' });
        const deleteBtn = actions.createEl('button', { cls: 'csi-delete-btn' });
        setIcon(deleteBtn, 'trash-2');
        deleteBtn.createSpan({ text: t('delete_button') });

        let confirmTimeout: ReturnType<typeof setTimeout> | null = null;
        let isConfirming = false;

        const resetDeleteButton = () => {
            isConfirming = false;
            deleteBtn.empty();
            deleteBtn.removeClass('csi-delete-confirm');
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.createSpan({ text: t('delete_button') });
            if (confirmTimeout) {
                clearTimeout(confirmTimeout);
                confirmTimeout = null;
            }
        };

        deleteBtn.addEventListener('click', async () => {
            if (!isConfirming) {
                // First click - show confirmation
                isConfirming = true;
                deleteBtn.empty();
                deleteBtn.addClass('csi-delete-confirm');
                setIcon(deleteBtn, 'trash-2');
                deleteBtn.createSpan({ text: t('delete_confirm_inline') });

                // Auto-reset after 3 seconds
                confirmTimeout = setTimeout(resetDeleteButton, 3000);
            } else {
                // Second click - delete
                if (confirmTimeout) clearTimeout(confirmTimeout);
                this.plugin.settings.statusStyles.splice(index, 1);
                await this.plugin.saveSettings();
                this.display();
            }
        });
    }

    /**
     * Updates the preview pills (light/dark) when the base color changes.
     * @param itemEl The DOM element of the status item.
     * @param baseColor The new base color (Hex).
     */
    updatePreviewColors(itemEl: HTMLElement, baseColor: string): void {
        const palette = generatePalette(baseColor);
        const pills = itemEl.querySelectorAll('.csi-preview-pill') as NodeListOf<HTMLElement>;

        if (pills[0]) {
            pills[0].style.backgroundColor = palette.light.bg;
            pills[0].style.color = palette.light.text;
        }

        if (pills[1]) {
            pills[1].style.backgroundColor = palette.dark.bg;
            pills[1].style.color = palette.dark.text;
        }
    }

    /**
     * Adds an icon to the recent icons list.
     * Keeps the list at a maximum of 10 items.
     */
    addToRecentIcons(icon: string): void {
        const recent = this.plugin.settings.recentIcons;
        // Remove if already exists
        const index = recent.indexOf(icon);
        if (index > -1) recent.splice(index, 1);
        // Add at the beginning
        recent.unshift(icon);
        // Limit to 10
        if (recent.length > 10) recent.pop();
    }

    /**
     * Exports the current settings to a JSON file.
     */
    exportSettings(): void {
        const data = {
            version: this.plugin.manifest.version,
            exportedAt: new Date().toISOString(),
            targetProperty: this.plugin.settings.targetProperty,
            statusStyles: this.plugin.settings.statusStyles
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom-status-icons-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Imports settings from a JSON file.
     * Validates the file format before applying.
     */
    importSettings(): void {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.addEventListener('change', async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                // Validate imported data
                if (!data.statusStyles || !Array.isArray(data.statusStyles)) {
                    throw new Error('Invalid format');
                }

                // Import settings
                if (data.targetProperty) {
                    this.plugin.settings.targetProperty = data.targetProperty;
                }
                this.plugin.settings.statusStyles = data.statusStyles;

                await this.plugin.saveSettings();
                this.display();

                // Show success message
                new Notice(t('import_success'));
            } catch (error) {
                new Notice(t('import_error'));
            }
        });
        input.click();
    }
}
