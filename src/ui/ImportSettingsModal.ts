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
        cancelBtn.addEventListener('click', () => this.close());
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

        let data: { statusStyles?: unknown; targetProperty?: unknown };
        try {
            data = JSON.parse(jsonString) as { statusStyles?: unknown; targetProperty?: unknown };
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
        if (typeof data.targetProperty === 'string' && data.targetProperty.trim()) {
            this.plugin.settings.targetProperty = data.targetProperty;
        }
        this.plugin.settings.statusStyles = validStyles;

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
