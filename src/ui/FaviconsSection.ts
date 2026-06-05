import { App, Notice, setIcon } from 'obsidian';
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

        // Privacy Disclaimer
        const infoCard = this.containerEl.createDiv({ cls: 'csi-experimental-warning typify-favicon-warning' });
        infoCard.createEl('p', {
            text: t('favicon_privacy_notice'),
            cls: 'warning-text'
        });

        const filterContainer = this.containerEl.createDiv({ cls: 'csi-manager-search-container' });
        
        const searchInput = filterContainer.createEl('input', {
            type: 'text',
            placeholder: t('favicon_search_placeholder'),
            cls: 'csi-manager-search',
        });
        searchInput.addEventListener('input', () => {
            this.searchInput = searchInput.value.toLowerCase();
            this.renderList();
        });

        const rightControls = filterContainer.createDiv({ cls: 'typify-palette-actions-right' });

        const refreshAllBtn = rightControls.createEl('button', {
            text: t('favicon_refresh_all')
        });
        refreshAllBtn.addEventListener('click', () => {
            void (async () => {
                const domains = Array.from(this.plugin.faviconManager.getCache().keys());
                if (domains.length === 0) return;
                
                refreshAllBtn.setText(t('favicon_refreshing'));
                refreshAllBtn.disabled = true;
                
                let count = 0;
                for (const domain of domains) {
                    const success = await this.plugin.faviconManager.fetchFavicon(domain, true);
                    if (success) count++;
                }
                
                refreshAllBtn.setText(t('favicon_refresh_all'));
                refreshAllBtn.disabled = false;
                new Notice(t('favicon_refresh_success').replace('{count}', String(count)));
                this.renderList();
            })();
        });

        this.listContainer = this.containerEl.createDiv({ cls: 'csi-manager-list typify-favicon-list' });
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

        let count = 0;

        for (const domain of sortedDomains) {
            if (this.searchInput && !domain.includes(this.searchInput)) continue;
            
            count++;
            const itemEl = this.listContainer.createDiv({ cls: 'csi-manager-item typify-favicon-item' });
            const leftEl = itemEl.createDiv({ cls: 'csi-manager-item-info typify-favicon-item-left' });
            
            const isFailed = failed.has(domain);
            const entry = cache.get(domain);
            
            // Status Line (left edge indicator)
            const statusLine = leftEl.createDiv({ cls: 'csi-manager-color-dot' });
            
            let isOutdated = false;
            if (!isFailed && entry) {
                const thirtyDays = 30 * 24 * 60 * 60 * 1000;
                isOutdated = (Date.now() - entry.mtime) > thirtyDays;
            }

            if (isFailed) {
                statusLine.setCssStyles({ backgroundColor: 'var(--text-error)' });
                statusLine.title = t('favicon_status_failed');
            } else if (isOutdated) {
                statusLine.setCssStyles({ backgroundColor: 'var(--color-orange)' });
                statusLine.title = t('favicon_status_outdated');
            } else {
                statusLine.setCssStyles({ backgroundColor: 'var(--text-success)' });
                statusLine.title = t('favicon_status_cached');
            }

            // Preview or fallback icon
            const preview = leftEl.createDiv({ cls: 'typify-favicon-preview' });
            if (!isFailed && entry) {
                preview.style.backgroundImage = entry.dataUri;
            } else {
                setIcon(preview, 'globe');
            }

            // Text block
            const textBlock = leftEl.createDiv({ cls: 'csi-manager-item-text' });
            const nameRow = textBlock.createDiv({ cls: 'csi-manager-item-name' });
            nameRow.setText(domain);
            
            const metaRow = textBlock.createDiv({ cls: 'csi-manager-meta' });
            if (isFailed) {
                metaRow.createSpan({ text: t('favicon_meta_failed') }).setCssStyles({ color: 'var(--text-error)' });
            } else if (isOutdated) {
                metaRow.createSpan({ text: t('favicon_meta_outdated') }).setCssStyles({ color: 'var(--color-orange)' });
            } else if (entry) {
                const days = Math.floor((Date.now() - entry.mtime) / (1000 * 60 * 60 * 24));
                const sizeKb = Math.ceil(entry.dataUri.length / 1024);
                let text = '';
                if (days === 0) {
                    text = t('favicon_meta_today').replace('{size}', String(sizeKb));
                } else {
                    const dayWord = days === 1 ? t('day_singular') : t('day_plural');
                    text = t('favicon_meta_saved').replace('{days}', String(days)).replace('{day_word}', dayWord).replace('{size}', String(sizeKb));
                }
                metaRow.createSpan({ text });
            }
            const rightEl = itemEl.createDiv({ cls: 'csi-manager-actions typify-favicon-item-right' });
            
            const refreshBtn = rightEl.createEl('button', { cls: 'clickable-icon', attr: { 'aria-label': t('favicon_retry') } });
            setIcon(refreshBtn, 'refresh-cw');
            refreshBtn.addEventListener('click', () => {
                void (async () => {
                    setIcon(refreshBtn, 'loader');
                    refreshBtn.disabled = true;
                    await this.plugin.faviconManager.fetchFavicon(domain, false);
                    this.renderList();
                })();
            });

            const deleteBtn = rightEl.createEl('button', { cls: 'clickable-icon', attr: { 'aria-label': t('favicon_remove') } });
            setIcon(deleteBtn, 'trash-2');
            deleteBtn.addEventListener('click', () => {
                void (async () => {
                    await this.plugin.faviconManager.deleteFavicon(domain);
                    this.renderList();
                })();
            });
        }

        if (count === 0) {
            this.listContainer.createDiv({ text: t('favicon_empty_cache'), cls: 'typify-favicon-empty-state' });
        }
    }
}
