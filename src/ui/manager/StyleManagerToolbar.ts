// ============================================================================
// STYLE MANAGER TOOLBAR — Search input and scope dropdown
// ============================================================================

import { DropdownComponent, SearchComponent } from 'obsidian';
import type TypifyPlugin from '../../main';
import { t } from '../../lang/helpers';

export interface ToolbarCallbacks {
    onChange: () => void;
}

/**
 * Renders the search input and scope dropdown for the style manager.
 * Provides public accessors for the current search filter and selected scope.
 */
export class StyleManagerToolbar {
    private searchComponent: SearchComponent;
    private scopeDropdown: DropdownComponent;
    private plugin: TypifyPlugin;
    private callbacks: ToolbarCallbacks;

    selectedScope: string;

    constructor(
        containerEl: HTMLElement,
        plugin: TypifyPlugin,
        initialScope: string,
        callbacks: ToolbarCallbacks
    ) {
        this.plugin = plugin;
        this.selectedScope = initialScope;
        this.callbacks = callbacks;

        const searchContainer = containerEl.createDiv({ cls: 'typify-manager-search-container' });

        // Search input
        this.searchComponent = new SearchComponent(searchContainer)
            .setPlaceholder(t('manage_styles_search'))
            .onChange(() => {
                this.callbacks.onChange();
            });
        this.searchComponent.inputEl.addClass('typify-manager-search');

        // Scope dropdown
        this.scopeDropdown = new DropdownComponent(searchContainer)
            .onChange(value => {
                this.selectedScope = value;
                this.callbacks.onChange();
            });
        this.scopeDropdown.selectEl.addClass('typify-manager-scope-select');

        this.populateScopeOptions();
    }

    /** Returns the current search filter text. */
    getSearchFilter(): string {
        return this.searchComponent.getValue();
    }

    /** Repopulates scope options from current settings and restores selection. */
    populateScopeOptions(): void {
        const selectEl = this.scopeDropdown.selectEl;
        selectEl.empty();

        // "Mostrar todos" — shows all styles (default)
        selectEl.createEl('option', {
            text: t('scope_show_all'),
            value: '__show_all__',
        }).value = '__show_all__';

        // "Geral" — shows only global (no appliesTo) styles
        selectEl.createEl('option', {
            text: t('scope_all'),
            value: '__all__',
        }).value = '__all__';

        const scopeMap = new Map<string, string>();

        const targetProps = this.plugin.settings.targetProperty
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        targetProps.forEach(p => scopeMap.set(p.toLowerCase(), p));

        for (const style of this.plugin.settings.statusStyles) {
            if (style.appliesTo && style.appliesTo.length > 0) {
                style.appliesTo.forEach(prop => {
                    const lower = prop.toLowerCase();
                    if (!scopeMap.has(lower)) {
                        scopeMap.set(lower, prop);
                    }
                });
            }
        }

        const sorted = Array.from(scopeMap.values()).sort((a, b) => a.localeCompare(b));
        for (const scope of sorted) {
            selectEl.createEl('option', { text: scope, value: scope }).value = scope;
        }

        // Restore previously selected scope
        if (this.selectedScope !== '__show_all__' && this.selectedScope !== '__all__') {
            const lowerScope = this.selectedScope.toLowerCase();
            if (scopeMap.has(lowerScope)) {
                this.selectedScope = scopeMap.get(lowerScope)!;
                this.scopeDropdown.setValue(this.selectedScope);
            } else {
                this.selectedScope = '__show_all__';
                this.scopeDropdown.setValue('__show_all__');
                setTimeout(() => this.callbacks.onChange(), 0);
            }
        } else if (this.selectedScope !== '__show_all__') {
            this.scopeDropdown.setValue(this.selectedScope);
        }
    }
}
