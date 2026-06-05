// ============================================================================
// FAVICONS MODAL — Dedicated modal for managing the favicons cache
// ============================================================================

import { App, Modal } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';
import { FaviconsSection } from './FaviconsSection';

/**
 * Modal for managing the custom favicons.
 * Provides a UI to clear the cache, refresh all icons, and remove specific domains.
 */
export class FaviconsModal extends Modal {
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
        contentEl.addClass('typify-favicons-modal');

        this.setTitle(t('favicon_manager_title'));

        // Render favicons content inside the modal
        new FaviconsSection(this.app, this.plugin, contentEl).display();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.onClose_cb?.();
    }
}
