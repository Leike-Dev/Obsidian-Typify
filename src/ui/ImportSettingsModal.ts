import { App, ButtonComponent, Modal, Notice } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';
import { validateStatusStyles } from '../utils/style-validator';

/**
 * Modal for importing plugin settings via clipboard paste.
 * User pastes JSON into a textarea and clicks Import.
 * Validates the JSON structure before applying.
 */
export class ImportSettingsModal extends Modal {
    private plugin: TypifyPlugin;
    private textAreaEl!: HTMLTextAreaElement;
    private onImport?: () => void;

    constructor(app: App, plugin: TypifyPlugin, onImport?: () => void) {
        super(app);
        this.plugin = plugin;
        this.onImport = onImport;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('typify-import-modal');

        this.setTitle(t('import_modal_title'));

        // Textarea for pasting JSON
        const textContainer = contentEl.createDiv({ cls: 'typify-data-text-container' });
        this.textAreaEl = textContainer.createEl('textarea', { cls: 'typify-data-textarea' });
        this.textAreaEl.placeholder = t('import_paste_placeholder');

        // Buttons
        const btnContainer = contentEl.createDiv({ cls: 'modal-button-container' });

        new ButtonComponent(btnContainer)
            .setButtonText(t('import_button'))
            .setCta()
            .onClick(() => {
                void this.handleImport();
            });

        new ButtonComponent(btnContainer)
            .setButtonText(t('cancel_button'))
            .onClick(() => { this.close(); });
    }

    /**
     * Validates and applies the imported JSON data.
     * Each style is individually validated to prevent corrupted data.
     */
    private async handleImport(): Promise<void> {
        const jsonString = this.textAreaEl.value.trim();
        if (!jsonString) {
            new Notice(t('import_empty_notice'));
            return;
        }

        let data: Record<string, unknown>;
        try {
            data = JSON.parse(jsonString) as Record<string, unknown>;
        } catch {
            new Notice(t('import_invalid_json'));
            return;
        }

        // Must have statusStyles array
        if (!data.statusStyles || !Array.isArray(data.statusStyles)) {
            new Notice(t('import_error'));
            return;
        }

        // Validate each style individually
        const validStyles = validateStatusStyles(data.statusStyles as Record<string, unknown>[]);
        const skipped = (data.statusStyles as unknown[]).length - validStyles.length;

        if (validStyles.length === 0) {
            new Notice(t('import_no_valid_styles'));
            return;
        }

        // Apply settings
        const oldEnableCustomIcons = this.plugin.settings.enableCustomIcons;
        const oldEnableFavicons = this.plugin.settings.enableFavicons;

        if (typeof data.targetProperty === 'string' && data.targetProperty.trim()) {
            this.plugin.settings.targetProperty = data.targetProperty;
        }
        if (typeof data.hideRemoveButton === 'string' && ['none', 'properties', 'bases', 'both'].includes(data.hideRemoveButton)) {
            this.plugin.settings.hideRemoveButton = data.hideRemoveButton as 'none' | 'properties' | 'bases' | 'both';
        }
        if (typeof data.hideRemoveButtonHover === 'boolean') {
            this.plugin.settings.hideRemoveButtonHover = data.hideRemoveButtonHover;
        }
        if (typeof data.enableLinkStyles === 'boolean') {
            this.plugin.settings.enableLinkStyles = data.enableLinkStyles;
        }
        if (typeof data.enableCustomPalette === 'boolean') {
            this.plugin.settings.enableCustomPalette = data.enableCustomPalette;
        }
        if (Array.isArray(data.customPalette)) {
            const palette = (data.customPalette as unknown[]).filter((c): c is string => typeof c === 'string');
            if (palette.length > 0) this.plugin.settings.customPalette = palette;
        }
        if (typeof data.enableFavicons === 'boolean') {
            this.plugin.settings.enableFavicons = data.enableFavicons;
        }
        if (typeof data.autoFetchFavicons === 'boolean') {
            this.plugin.settings.autoFetchFavicons = data.autoFetchFavicons;
        }
        if (typeof data.faviconProvider === 'string' && ['google', 'duckduckgo', 'direct'].includes(data.faviconProvider)) {
            this.plugin.settings.faviconProvider = data.faviconProvider as 'google' | 'duckduckgo' | 'direct';
        }
        if (typeof data.enableCustomIcons === 'boolean') {
            this.plugin.settings.enableCustomIcons = data.enableCustomIcons;
        }

        this.plugin.settings.statusStyles = validStyles;

        // Handle side-effects for managers BEFORE saving, so buildCache sees the loaded assets
        if (this.plugin.settings.enableCustomIcons !== oldEnableCustomIcons) {
            if (this.plugin.settings.enableCustomIcons) {
                await this.plugin.customIconsManager.initialize();
            } else {
                this.plugin.customIconsManager.clear();
            }
        }

        if (this.plugin.settings.enableFavicons !== oldEnableFavicons) {
            if (this.plugin.settings.enableFavicons) {
                await this.plugin.faviconManager.initialize();
            } else {
                this.plugin.faviconManager.cleanupActiveUrls();
            }
        }

        await this.plugin.saveSettings();


        if (skipped > 0) {
            new Notice(t('import_partial_success')
                .replace('{imported}', String(validStyles.length))
                .replace('{skipped}', String(skipped)));
        } else {
            new Notice(t('import_success'));
        }
        this.onImport?.();
        this.close();
    }


    onClose() {
        this.contentEl.empty();
    }
}
