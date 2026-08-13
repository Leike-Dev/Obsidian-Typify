// ============================================================================
// STYLE MANAGER MODAL — Orchestrates sub-components for managing styles
// ============================================================================

import { App, Modal, Notice } from 'obsidian';
import TypifyPlugin from '../main';
import { StatusStyle } from '../types';
import { StyleEditorModal } from './StyleEditorModal';
import { t } from '../lang/helpers';

import { StyleManagerToolbar } from './manager/StyleManagerToolbar';
import { StyleManagerFilters } from './manager/StyleManagerFilters';
import { StyleManagerList } from './manager/StyleManagerList';
import { StyleManagerBatchActions } from './manager/StyleManagerBatchActions';
import { showDeleteConfirmation } from './manager/StyleDeleteConfirmation';

export class StyleManagerModal extends Modal {
    plugin: TypifyPlugin;
    private onClose_cb?: () => void;

    private toolbar!: StyleManagerToolbar;
    private filters!: StyleManagerFilters;
    private list!: StyleManagerList;
    private batchActions!: StyleManagerBatchActions;

    private selectedScope = '__show_all__';

    constructor(app: App, plugin: TypifyPlugin, onClose?: () => void, initialScope?: string) {
        super(app);
        this.plugin = plugin;
        this.onClose_cb = onClose;
        if (initialScope) {
            this.selectedScope = initialScope;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('typify-manager-modal');

        this.setTitle(t('manage_styles_modal_title'));

        // ── Toolbar (search + scope dropdown) ──────────────────────────
        this.toolbar = new StyleManagerToolbar(
            contentEl,
            this.plugin,
            this.selectedScope,
            { onChange: () => { this.refreshList(); } }
        );

        // ── Sort/filter chips ──────────────────────────────────────────
        const chipsContainerEl = contentEl.createDiv({ cls: 'typify-sort-chips' });
        this.filters = new StyleManagerFilters(
            chipsContainerEl,
            { onChange: () => { this.refreshList(); } }
        );

        // ── Count label ────────────────────────────────────────────────
        const countEl = contentEl.createDiv({ cls: 'typify-manager-count' });

        // ── Style list ─────────────────────────────────────────────────
        const listContainerEl = contentEl.createDiv({ cls: 'typify-manager-list' });

        this.list = new StyleManagerList(
            listContainerEl,
            countEl,
            this.plugin,
            {
                onEdit: (style, realIndex) => { this.openEditor(style, realIndex); },
                onDuplicate: (style) => { this.openDuplicator(style); },
                onDelete: (itemEl, realIndex) => { this.confirmDelete(itemEl, realIndex); },
            }
        );

        // ── Sort/filter initial render ─────────────────────────────────
        this.filters.render();

        // ── Batch hint ─────────────────────────────────────────────────
        const batchHintEl = contentEl.createDiv({ cls: 'typify-manager-batch-hint' });
        this.batchActions = new StyleManagerBatchActions(
            batchHintEl,
            this.app,
            this.plugin,
            {
                onBatchCreated: () => {
                    this.toolbar.populateScopeOptions();
                    this.refreshList();
                }
            }
        );

        this.refreshList();
    }

    // ── Navigation ─────────────────────────────────────────────────────

    private openEditor(style: StatusStyle, realIndex: number): void {
        const currentScope = this.toolbar.selectedScope;
        const onCloseCb = this.onClose_cb;
        this.onClose_cb = undefined;   // prevent close callback from firing
        this.close();                   // close this manager before opening editor
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
        const currentScope = this.toolbar.selectedScope;
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

    private confirmDelete(itemEl: HTMLElement, realIndex: number): void {
        const style = this.plugin.settings.statusStyles[realIndex];
        if (!style) return;

        showDeleteConfirmation(itemEl, style.name, realIndex, {
            onConfirm: (index) => {
                void (async () => {
                    const deleted = this.plugin.settings.statusStyles[index];
                    this.plugin.settings.statusStyles.splice(index, 1);
                    await this.plugin.saveSettings();
                    if (deleted) {
                        new Notice(t('style_deleted').replace('{name}', deleted.name));
                    }
                    this.toolbar.populateScopeOptions();
                    this.refreshList();
                })();
            },
            onCancel: () => { /* confirmation element already removed itself */ }
        });
    }

    // ── Refresh ────────────────────────────────────────────────────────

    private refreshList(): void {
        this.list.render(
            this.toolbar.getSearchFilter(),
            this.toolbar.selectedScope,
            this.filters.sortMode,
            this.filters.activeFilters
        );
        this.batchActions.renderHint(this.toolbar.selectedScope);
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.onClose_cb?.();
    }
}
