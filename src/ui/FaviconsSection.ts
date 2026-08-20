import { App, ButtonComponent, DropdownComponent, ExtraButtonComponent, Notice, SearchComponent, setIcon } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';

export class FaviconsSection {
    app: App;
    plugin: TypifyPlugin;
    containerEl: HTMLElement;
    private listContainer!: HTMLElement;
    private searchInput: string = '';

    constructor(app: App, plugin: TypifyPlugin, containerEl: HTMLElement) {
        this.app = app;
        this.plugin = plugin;
        this.containerEl = containerEl;
    }

    display(): void {
        this.containerEl.empty();

        const toolbarEl = this.containerEl.createDiv({ cls: 'typify-favicon-toolbar' });

        // Search input (native component)
        const searchComponent = new SearchComponent(toolbarEl)
            .setPlaceholder(t('favicon_search_placeholder'))
            .onChange(() => {
                this.searchInput = searchComponent.getValue().trim().toLowerCase();
                this.renderList();
            });
        searchComponent.inputEl.addClass('typify-manager-search');

        // Toolbar actions: Provider Dropdown + Refresh all button
        const actionsEl = toolbarEl.createDiv({ cls: 'typify-favicon-toolbar-actions' });

        const providerDropdown = new DropdownComponent(actionsEl)
            .addOption('direct', t('favicon_provider_direct'))
            .addOption('google', t('favicon_provider_google'))
            .addOption('duckduckgo', t('favicon_provider_duckduckgo'))
            .setValue(this.plugin.settings.faviconProvider)
            .onChange(async (value) => {
                this.plugin.settings.faviconProvider = value as 'direct' | 'google' | 'duckduckgo';
                await this.plugin.saveSettings({});
            });
        providerDropdown.selectEl.addClass('typify-favicon-provider-select');
        providerDropdown.selectEl.setAttribute('aria-label', t('favicon_provider_heading'));
        providerDropdown.selectEl.title = t('favicon_provider_heading');

        const refreshAllBtn = new ButtonComponent(actionsEl)
            .setButtonText(t('favicon_refresh_all'))
            .onClick(() => {
                void (async () => {
                    const cache = this.plugin.faviconManager.getCache();
                    const failed = this.plugin.faviconManager.getFailedDomains();
                    const domains = Array.from(new Set([...Array.from(cache.keys()), ...Array.from(failed)]));

                    if (domains.length === 0) return;

                    refreshAllBtn.setButtonText(t('favicon_refreshing'));
                    refreshAllBtn.setDisabled(true);

                    let count = 0;
                    for (const domain of domains) {
                        const success = await this.plugin.faviconManager.fetchFavicon(domain, true, true);
                        if (success) count++;
                    }
                    this.plugin.styleManager.buildCache();
                    if (this.plugin.domManager) this.plugin.domManager.reprocessAllPills();

                    refreshAllBtn.setButtonText(t('favicon_refresh_all'));
                    refreshAllBtn.setDisabled(false);
                    const failedCount = domains.length - count;
                    if (failedCount > 0) {
                        new Notice(t('favicon_refresh_partial').replace('{count}', String(count)).replace('{failed}', String(failedCount)));
                    } else {
                        new Notice(t('favicon_refresh_success').replace('{count}', String(count)));
                    }
                    this.renderList();
                })();
            });

        this.listContainer = this.containerEl.createDiv({ cls: 'typify-manager-list typify-favicon-list' });
        this.renderList();
    }

    private renderList(): void {
        /*
         * PERFORMANCE & MEMORY MANAGEMENT EXPLANATION:
         * 
         * 1. DOM & Garbage Collection: Calling `this.listContainer.empty()` safely detaches all child nodes.
         *    Since the event listeners (like 'click' for refresh/delete) are bound to these detached child elements, 
         *    and there are no strong references to them from the global scope, V8's Garbage Collector will 
         *    automatically safely sweep them and their closures from memory. This prevents memory leaks.
         * 
         * 2. Performance: Generating the list (looping through cached items) involves simple, lightweight 
         *    mathematical operations (Date difference and string length). The browser can execute hundreds 
         *    of these iterations in less than a millisecond without causing UI stuttering.
         */
        this.listContainer.empty();
        const cache = this.plugin.faviconManager.getCache();
        const failed = this.plugin.faviconManager.getFailedDomains();

        const allDomains = new Set([...Array.from(cache.keys()), ...Array.from(failed)]);
        const sortedDomains = Array.from(allDomains).sort();
        const hasAnyDomains = sortedDomains.length > 0;

        let count = 0;

        for (const domain of sortedDomains) {
            if (this.searchInput && !domain.includes(this.searchInput)) continue;

            count++;
            const itemEl = this.listContainer.createDiv({ cls: 'typify-manager-item typify-favicon-item' });
            const leftEl = itemEl.createDiv({ cls: 'typify-manager-item-info typify-favicon-item-left' });

            const isFailed = failed.has(domain);
            const entry = cache.get(domain);

            let isOutdated = false;
            if (!isFailed && entry) {
                const thirtyDays = 30 * 24 * 60 * 60 * 1000;
                isOutdated = (Date.now() - entry.mtime) > thirtyDays;
            }

            // Preview or fallback icon
            const preview = leftEl.createDiv({ cls: 'typify-favicon-preview' });
            if (!isFailed && entry) {
                preview.setCssStyles({ backgroundImage: entry.dataUri });
            } else {
                setIcon(preview, 'globe');
            }

            // Text block
            const textBlock = leftEl.createDiv({ cls: 'typify-manager-item-text' });
            const nameRow = textBlock.createDiv({ cls: 'typify-manager-item-name' });
            nameRow.setText(domain);

            const metaRow = textBlock.createDiv({ cls: 'typify-manager-meta' });
            if (isFailed) {
                metaRow.createSpan({ text: t('favicon_meta_failed') }).setCssStyles({ color: 'var(--text-error)' });
            } else if (isOutdated) {
                metaRow.createSpan({ text: t('favicon_meta_outdated') }).setCssStyles({ color: 'var(--color-orange)' });
            } else if (entry) {
                const days = Math.floor((Date.now() - entry.mtime) / (1000 * 60 * 60 * 24));
                const sizeKb = Math.ceil(entry.size / 1024);
                let text = '';
                if (days === 0) {
                    text = t('favicon_meta_today').replace('{size}', String(sizeKb));
                } else {
                    const dayWord = days === 1 ? t('day_singular') : t('day_plural');
                    text = t('favicon_meta_saved').replace('{days}', String(days)).replace('{day_word}', dayWord).replace('{size}', String(sizeKb));
                }
                metaRow.createSpan({ text });
            }
            const rightEl = itemEl.createDiv({ cls: 'typify-manager-actions typify-favicon-item-right' });

            // Refresh button (native ExtraButtonComponent)
            const refreshBtn = new ExtraButtonComponent(rightEl)
                .setIcon('refresh-cw')
                .setTooltip(t('favicon_retry'))
                .onClick(() => {
                    void (async () => {
                        refreshBtn.setDisabled(true);
                        try {
                            await this.plugin.faviconManager.fetchFavicon(domain, false, true);
                            this.plugin.styleManager.buildCache();
                            if (this.plugin.domManager) this.plugin.domManager.reprocessAllPills();
                        } finally {
                            this.renderList();
                        }
                    })();
                });

            // Delete button (native ExtraButtonComponent)
            const deleteBtn = new ExtraButtonComponent(rightEl)
                .setIcon('trash-2')
                .setTooltip(t('favicon_remove'))
                .onClick(() => {
                    void (async () => {
                        deleteBtn.setDisabled(true);
                        try {
                            await this.plugin.faviconManager.deleteFavicon(domain);
                            this.plugin.styleManager.buildCache();
                            if (this.plugin.domManager) this.plugin.domManager.reprocessAllPills();
                        } finally {
                            this.renderList();
                        }
                    })();
                });
            deleteBtn.extraSettingsEl.addClass('typify-manager-delete-btn');
        }

        if (count === 0) {
            const emptyText = hasAnyDomains ? t('favicon_no_results') : t('favicon_empty_cache');
            this.listContainer.createDiv({ text: emptyText, cls: 'typify-favicon-empty-state' });
        }
    }
}
