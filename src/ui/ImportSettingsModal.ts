import { App, Modal, Notice } from 'obsidian';
import type TypifyPlugin from '../main';
import { StatusStyle } from '../types';
import { t } from '../lang/helpers';

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

        const importBtn = btnContainer.createEl('button', {
            text: t('import_button'),
            cls: 'mod-cta'
        });
        importBtn.addEventListener('click', () => {
            void this.handleImport();
        });

        const cancelBtn = btnContainer.createEl('button', {
            text: t('cancel_button'),
            cls: 'mod-cancel'
        });
        cancelBtn.addEventListener('click', () => { this.close(); });
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
        const validStyles = this.validateStyles(data.statusStyles as Record<string, unknown>[]);
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
            const palette = data.customPalette.filter((c: unknown) => typeof c === 'string');
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

        await this.plugin.saveSettings();

        // Handle side-effects for managers that don't auto-reload on saveSettings
        if (this.plugin.settings.enableCustomIcons !== oldEnableCustomIcons) {
            if (this.plugin.settings.enableCustomIcons) {
                void this.plugin.customIconsManager.initialize();
            } else {
                this.plugin.customIconsManager.clear();
            }
        }

        if (this.plugin.settings.enableFavicons !== oldEnableFavicons) {
            if (this.plugin.settings.enableFavicons) {
                void this.plugin.faviconManager.initialize();
            } else {
                this.plugin.faviconManager.cleanupActiveUrls();
            }
        }

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

    private static readonly HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;
    private static readonly VALID_SHAPES = ['pill', 'rectangle', 'flat'];
    private static readonly VALID_COLOR_MODES = ['subtle', 'solid'];

    /**
     * Validates an array of raw objects and returns only valid StatusStyle entries.
     */
    private validateStyles(raw: Record<string, unknown>[]): StatusStyle[] {
        const valid: StatusStyle[] = [];

        for (const item of raw) {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) continue;

            // Required: name (non-empty string)
            if (typeof item.name !== 'string' || !item.name.trim()) continue;

            // Required: baseColor (valid hex)
            if (typeof item.baseColor !== 'string' || !ImportSettingsModal.HEX_COLOR_RE.test(item.baseColor)) continue;

            const style: StatusStyle = {
                name: item.name.trim(),
                baseColor: item.baseColor,
                icon: typeof item.icon === 'string' ? item.icon : ''
            };

            // Optional: shape
            if (typeof item.shape === 'string' && ImportSettingsModal.VALID_SHAPES.includes(item.shape)) {
                style.shape = item.shape as StatusStyle['shape'];
            }

            // Optional: matchValue
            if (typeof item.matchValue === 'string' && item.matchValue.trim() !== '') {
                style.matchValue = item.matchValue.trim();
            }

            // Optional: colorMode
            if (typeof item.colorMode === 'string' && ImportSettingsModal.VALID_COLOR_MODES.includes(item.colorMode)) {
                style.colorMode = item.colorMode as StatusStyle['colorMode'];
            }

            // Optional: appliesTo (array of strings)
            if (Array.isArray(item.appliesTo)) {
                const filtered = (item.appliesTo as unknown[]).filter((v): v is string => typeof v === 'string' && v.trim() !== '');
                if (filtered.length > 0) {
                    style.appliesTo = filtered;
                }
            }

            valid.push(style);
        }

        return valid;
    }

    onClose() {
        this.contentEl.empty();
    }
}
