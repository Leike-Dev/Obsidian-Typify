// ============================================================================
// STYLE MANAGER VIEW — Shared manager UI for modal and settings sub-page
// ============================================================================

import { App, Notice } from 'obsidian';
import type TypifyPlugin from '../../main';
import type { StatusStyle } from '../../types';
import { t } from '../../lang/helpers';

import { StyleManagerToolbar } from './StyleManagerToolbar';
import { StyleManagerFilters } from './StyleManagerFilters';
import { StyleManagerList } from './StyleManagerList';
import { StyleManagerBatchActions } from './StyleManagerBatchActions';
import { showDeleteConfirmation } from './StyleDeleteConfirmation';

export interface StyleManagerViewCallbacks {
    onEdit: (style: StatusStyle, realIndex: number) => void;
    onDuplicate: (style: StatusStyle) => void;
}

/**
 * Renders and coordinates the style manager independently from its host.
 *
 * The same view can live in a Modal (commands and external entry points) or in
 * a SettingPage (the navigable entry in the Typify settings tab).
 */
export class StyleManagerView {
    private toolbar!: StyleManagerToolbar;
    private filters!: StyleManagerFilters;
    private list!: StyleManagerList;
    private batchActions!: StyleManagerBatchActions;

    constructor(
        private containerEl: HTMLElement,
        private app: App,
        private plugin: TypifyPlugin,
        private callbacks: StyleManagerViewCallbacks,
        private initialScope = '__show_all__'
    ) {}

    get selectedScope(): string {
        return this.toolbar.selectedScope;
    }

    display(): void {
        this.containerEl.empty();

        this.toolbar = new StyleManagerToolbar(
            this.containerEl,
            this.plugin,
            this.initialScope,
            { onChange: () => { this.refreshList(); } }
        );

        const chipsContainerEl = this.containerEl.createDiv({ cls: 'typify-sort-chips' });
        this.filters = new StyleManagerFilters(
            chipsContainerEl,
            { onChange: () => { this.refreshList(); } }
        );

        const countEl = this.containerEl.createDiv({ cls: 'typify-manager-count' });
        const listContainerEl = this.containerEl.createDiv({ cls: 'typify-manager-list' });

        this.list = new StyleManagerList(
            listContainerEl,
            countEl,
            this.plugin,
            {
                onEdit: (style, realIndex) => { this.callbacks.onEdit(style, realIndex); },
                onDuplicate: (style) => { this.callbacks.onDuplicate(style); },
                onDelete: (itemEl, realIndex) => { this.confirmDelete(itemEl, realIndex); },
            }
        );

        this.filters.render();

        const batchHintEl = this.containerEl.createDiv({ cls: 'typify-manager-batch-hint' });
        this.batchActions = new StyleManagerBatchActions(
            batchHintEl,
            this.app,
            this.plugin,
            { onBatchCreated: () => { this.refresh(); } }
        );

        this.refreshList();
    }

    /**
     * Refreshes dynamic options and the list while preserving search, filters,
     * sorting, and the selected scope.
     */
    refresh(): void {
        this.toolbar.populateScopeOptions();
        this.refreshList();
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
                    this.refresh();
                })();
            },
            onCancel: () => { /* confirmation element already removed itself */ }
        });
    }

    private refreshList(): void {
        this.list.render(
            this.toolbar.getSearchFilter(),
            this.toolbar.selectedScope,
            this.filters.sortMode,
            this.filters.activeFilters
        );
        this.batchActions.renderHint(this.toolbar.selectedScope);
    }
}
