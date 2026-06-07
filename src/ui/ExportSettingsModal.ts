import { App, Modal, Notice } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';

/**
 * Modal for exporting plugin settings via clipboard.
 * Displays the JSON in a read-only textarea with a "Copy to clipboard" button.
 */
export class ExportSettingsModal extends Modal {
    private plugin: TypifyPlugin;
    private textAreaEl!: HTMLTextAreaElement;

    constructor(app: App, plugin: TypifyPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('typify-export-modal');

        this.setTitle(t('export_modal_title'));

        // JSON preview
        const textContainer = contentEl.createDiv({ cls: 'typify-data-text-container' });
        this.textAreaEl = textContainer.createEl('textarea', { cls: 'typify-data-textarea' });
        this.textAreaEl.readOnly = true;

        const data = {
            version: this.plugin.manifest.version,
            exportedAt: new Date().toISOString(),
            // Core
            targetProperty: this.plugin.settings.targetProperty,
            statusStyles: this.plugin.settings.statusStyles,
            // UI Components
            hideRemoveButton: this.plugin.settings.hideRemoveButton,
            hideRemoveButtonHover: this.plugin.settings.hideRemoveButtonHover,
            enableLinkStyles: this.plugin.settings.enableLinkStyles,
            // Custom Palette
            enableCustomPalette: this.plugin.settings.enableCustomPalette,
            customPalette: this.plugin.settings.customPalette,
            // Favicons
            enableFavicons: this.plugin.settings.enableFavicons,
            autoFetchFavicons: this.plugin.settings.autoFetchFavicons,
            faviconProvider: this.plugin.settings.faviconProvider,
            // Custom Icons
            enableCustomIcons: this.plugin.settings.enableCustomIcons,
        };
        this.textAreaEl.value = JSON.stringify(data, null, 2);

        // Copy button
        const btnContainer = contentEl.createDiv({ cls: 'modal-button-container' });
        const copyBtn = btnContainer.createEl('button', {
            text: t('copy_clipboard_button'),
            cls: 'mod-cta'
        });
        copyBtn.addEventListener('click', () => {
            void this.copyToClipboard();
        });
    }

    private async copyToClipboard(): Promise<void> {
        try {
            await navigator.clipboard.writeText(this.textAreaEl.value);
            new Notice(t('copy_clipboard_success'));
            this.close();
        } catch {
            new Notice(t('export_error'));
        }
    }

    onClose() {
        this.contentEl.empty();
    }
}
