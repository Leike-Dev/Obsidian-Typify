import { App, Setting, Notice, setIcon, TextComponent } from 'obsidian';
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
        
        new Setting(this.containerEl)
            .setName(t('favicon_manager_title'))
            .setDesc(t('favicon_manager_desc'))
            .addButton(btn => btn
                .setButtonText(t('favicon_refresh_all'))
                .onClick(async () => {
                    const domains = Array.from(this.plugin.faviconManager.getCache().keys());
                    if (domains.length === 0) return;
                    
                    btn.setDisabled(true);
                    btn.setButtonText(t('favicon_refreshing'));
                    
                    let count = 0;
                    for (const domain of domains) {
                        const success = await this.plugin.faviconManager.fetchFavicon(domain, true);
                        if (success) count++;
                    }
                    
                    btn.setDisabled(false);
                    btn.setButtonText(t('favicon_refresh_all'));
                    new Notice(t('favicon_refresh_success').replace('{count}', String(count)));
                    this.renderList();
                }))
            .addButton(btn => btn
                .setButtonText(t('favicon_clear_cache'))
                .setWarning()
                .onClick(async () => {
                    await this.plugin.faviconManager.clearAll();
                    new Notice(t('favicon_clear_success'));
                    this.renderList();
                }));

        // Privacy Disclaimer
        const infoCard = this.containerEl.createDiv({ cls: 'csi-experimental-warning typify-favicon-warning' });
        infoCard.createEl('p', {
            text: t('favicon_privacy_notice'),
            cls: 'warning-text'
        });

        const filterContainer = this.containerEl.createDiv({ cls: 'typify-favicon-filter' });
        const searchComp = new TextComponent(filterContainer);
        searchComp.setPlaceholder(t('favicon_search_placeholder'));
        searchComp.onChange(value => {
            this.searchInput = value.toLowerCase();
            this.renderList();
        });

        this.listContainer = this.containerEl.createDiv({ cls: 'typify-favicon-list' });
        this.renderList();
    }

    private renderList(): void {
        this.listContainer.empty();
        const cache = this.plugin.faviconManager.getCache();
        const failed = this.plugin.faviconManager.getFailedDomains();
        
        const allDomains = new Set([...Array.from(cache.keys()), ...Array.from(failed)]);
        const sortedDomains = Array.from(allDomains).sort();

        let count = 0;

        for (const domain of sortedDomains) {
            if (this.searchInput && !domain.includes(this.searchInput)) continue;
            
            count++;
            const itemEl = this.listContainer.createDiv({ cls: 'typify-favicon-item' });
            
            const leftEl = itemEl.createDiv({ cls: 'typify-favicon-item-left' });
            
            const isFailed = failed.has(domain);
            const entry = cache.get(domain);
            
            // Status Dot
            const dot = leftEl.createDiv({ cls: 'typify-favicon-status-dot' });
            
            let isOutdated = false;
            if (!isFailed && entry) {
                const thirtyDays = 30 * 24 * 60 * 60 * 1000;
                isOutdated = (Date.now() - entry.mtime) > thirtyDays;
            }

            if (isFailed) {
                dot.setCssStyles({ backgroundColor: 'var(--text-error)' });
                dot.title = t('favicon_status_failed');
            } else if (isOutdated) {
                dot.setCssStyles({ backgroundColor: 'var(--color-orange)' });
                dot.title = t('favicon_status_outdated');
            } else {
                dot.setCssStyles({ backgroundColor: 'var(--text-success)' });
                dot.title = t('favicon_status_cached');
            }

            // Preview or fallback icon
            const preview = leftEl.createDiv({ cls: 'typify-favicon-preview' });
            if (!isFailed && entry) {
                preview.style.backgroundImage = entry.dataUri;
            } else {
                setIcon(preview, 'globe');
            }

            leftEl.createSpan({ text: domain, cls: 'typify-favicon-domain' });

            const rightEl = itemEl.createDiv({ cls: 'typify-favicon-item-right' });
            
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
