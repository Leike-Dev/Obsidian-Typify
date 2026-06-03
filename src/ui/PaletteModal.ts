// ============================================================================
// PALETTE MODAL — Dedicated modal for managing the color palette
// ============================================================================

import { App, Modal } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';
import { renderPaletteSection } from './PaletteSection';

/**
 * Modal for managing the custom color palette.
 * Provides harmony-based generation and manual color management.
 */
export class PaletteModal extends Modal {
    plugin: TypifyPlugin;
    private onClose_cb?: () => void;

    constructor(app: App, plugin: TypifyPlugin, onClose?: () => void) {
        super(app);
        this.plugin = plugin;
        this.onClose_cb = onClose;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('typify-palette-modal');

        this.setTitle(t('palette_title'));

        // Render palette content inside the modal
        renderPaletteSection(contentEl, this.plugin, () => {
            // Re-render content on updates (add/remove/clear)
            this.onOpen();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.onClose_cb?.();
    }
}
