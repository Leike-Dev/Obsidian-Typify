// ============================================================================
// STYLE MANAGER PAGE — Native Obsidian settings sub-page
// ============================================================================

import { App, SettingPage } from 'obsidian';
import type TypifyPlugin from '../main';
import type { StatusStyle } from '../types';
import { t } from '../lang/helpers';
import { StyleEditorModal } from './StyleEditorModal';
import { StyleManagerView } from './manager/StyleManagerView';

/**
 * Hosts the style manager in the native navigable settings-page component.
 *
 * The editor remains a Modal, as recommended for multi-field validated forms.
 * The page stays mounted underneath it, so saving or cancelling only refreshes
 * the list and preserves the current search, filters, sorting, and scope.
 */
export class StyleManagerPage extends SettingPage {
    private view: StyleManagerView | null = null;
    private visible = false;

    constructor(
        private app: App,
        private plugin: TypifyPlugin
    ) {
        super();
        this.title = t('manage_styles_title');
    }

    display(): void {
        this.visible = true;
        this.containerEl.empty();
        this.containerEl.addClass('typify-manager-page');

        this.view = new StyleManagerView(
            this.containerEl,
            this.app,
            this.plugin,
            {
                onEdit: (style, realIndex) => { this.openEditor(style, realIndex); },
                onDuplicate: (style) => { this.openDuplicator(style); },
            }
        );
        this.view.display();
    }

    hide(): void {
        this.visible = false;
        this.view = null;
        this.containerEl.removeClass('typify-manager-page');
        super.hide();
    }

    private openEditor(style: StatusStyle, realIndex: number): void {
        new StyleEditorModal(
            this.app,
            this.plugin,
            () => { this.refresh(); },
            style,
            realIndex,
            () => { this.refresh(); }
        ).open();
    }

    private openDuplicator(style: StatusStyle): void {
        new StyleEditorModal(
            this.app,
            this.plugin,
            () => { this.refresh(); },
            style,
            undefined,
            () => { this.refresh(); }
        ).open();
    }

    private refresh(): void {
        if (!this.visible) return;
        this.view?.refresh();
    }
}
