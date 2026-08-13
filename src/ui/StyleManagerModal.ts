// ============================================================================
// STYLE MANAGER MODAL — Modal host for the shared style manager view
// ============================================================================

import { App, Modal } from 'obsidian';
import TypifyPlugin from '../main';
import type { StatusStyle } from '../types';
import { StyleEditorModal } from './StyleEditorModal';
import { t } from '../lang/helpers';
import { StyleManagerView } from './manager/StyleManagerView';

export class StyleManagerModal extends Modal {
    plugin: TypifyPlugin;
    private onClose_cb?: () => void;
    private view!: StyleManagerView;
    private selectedScope = '__show_all__';

    constructor(app: App, plugin: TypifyPlugin, onClose?: () => void, initialScope?: string) {
        super(app);
        this.plugin = plugin;
        this.onClose_cb = onClose;
        if (initialScope) {
            this.selectedScope = initialScope;
        }
    }

    onOpen(): void {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('typify-manager-modal');

        this.setTitle(t('manage_styles_modal_title'));

        this.view = new StyleManagerView(
            contentEl,
            this.app,
            this.plugin,
            {
                onEdit: (style, realIndex) => { this.openEditor(style, realIndex); },
                onDuplicate: (style) => { this.openDuplicator(style); },
            },
            this.selectedScope
        );
        this.view.display();
    }

    private openEditor(style: StatusStyle, realIndex: number): void {
        const currentScope = this.view.selectedScope;
        const onCloseCb = this.onClose_cb;
        this.onClose_cb = undefined;
        this.close();

        new StyleEditorModal(
            this.app,
            this.plugin,
            () => {
                onCloseCb?.();
                new StyleManagerModal(this.app, this.plugin, onCloseCb, currentScope).open();
            },
            style,
            realIndex,
            () => {
                new StyleManagerModal(this.app, this.plugin, onCloseCb, currentScope).open();
            }
        ).open();
    }

    private openDuplicator(style: StatusStyle): void {
        const currentScope = this.view.selectedScope;
        const onCloseCb = this.onClose_cb;
        this.onClose_cb = undefined;
        this.close();

        new StyleEditorModal(
            this.app,
            this.plugin,
            () => {
                onCloseCb?.();
                new StyleManagerModal(this.app, this.plugin, onCloseCb, currentScope).open();
            },
            style,
            undefined,
            () => {
                new StyleManagerModal(this.app, this.plugin, onCloseCb, currentScope).open();
            }
        ).open();
    }

    onClose(): void {
        this.contentEl.empty();
        this.onClose_cb?.();
    }
}
