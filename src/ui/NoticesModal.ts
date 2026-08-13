import { App, Modal, setIcon } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';

interface NoticeItem {
    type: string;
    icon: string;
    title: string;
    desc: string;
}

export class NoticesModal extends Modal {
    private plugin: TypifyPlugin;

    private currentFilter: string = 'all';

    constructor(app: App, plugin: TypifyPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("typify-notices-modal");

        this.setTitle(t('notices_title'));

        const notices = this.getActiveNotices();

        const tagsContainer = contentEl.createDiv({ cls: 'typify-sort-chips typify-notices-tags' });
        const listContainer = contentEl.createDiv({ cls: 'typify-notices-list' });

        const renderList = () => {
            listContainer.empty();
            const filteredNotices = this.currentFilter === 'all' 
                ? notices 
                : notices.filter(n => n.type === this.currentFilter);

            if (filteredNotices.length === 0) {
                listContainer.createEl('p', { text: t('notices_empty'), cls: 'typify-no-notices' });
            } else {
                for (const notice of filteredNotices) {
                    const itemEl = listContainer.createDiv({ cls: `typify-manager-item typify-notice-item is-${notice.type}` });

                    const infoEl = itemEl.createDiv({ cls: 'typify-manager-item-info' });

                    const iconEl = infoEl.createDiv({ cls: `typify-box-icon typify-notice-icon typify-notice-${notice.type}` });
                    setIcon(iconEl, notice.icon);

                    const textContainer = infoEl.createDiv({ cls: 'typify-manager-item-text typify-notice-text' });
                    const titleEl = textContainer.createDiv({ text: notice.title, cls: 'typify-notice-item-title' });
                    titleEl.addClass(`typify-notice-${notice.type}`);
                    textContainer.createDiv({ text: notice.desc, cls: 'typify-notice-item-desc' });
                }
            }
        };

        const renderTags = () => {
            tagsContainer.empty();
            
            const counts: Record<string, number> = { 'all': notices.length };
            notices.forEach(n => {
                counts[n.type] = (counts[n.type] || 0) + 1;
            });

            const createTag = (id: string, label: string, count: number) => {
                const isActive = this.currentFilter === id;
                const tagEl = tagsContainer.createSpan({
                    cls: `typify-notice-tag typify-sort-chip${isActive ? ' is-active' : ''}`,
                    attr: {
                        role: 'button',
                        tabindex: '0',
                        'aria-pressed': isActive ? 'true' : 'false'
                    }
                });
                tagEl.createSpan({ text: label });
                tagEl.createSpan({ text: count.toString(), cls: 'typify-tag-count' });
                tagEl.addEventListener('click', () => {
                    this.currentFilter = id;
                    renderTags();
                    renderList();
                });
                tagEl.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        tagEl.click();
                    }
                });
            };

            createTag('all', t('notices_tab_all'), counts['all'] || 0);

            Object.keys(counts).forEach(type => {
                if (type !== 'all') {
                    const transKey = `notices_tab_${type}` as Parameters<typeof t>[0];
                    const translated = t(transKey);
                    const label = translated !== transKey ? translated : (type.charAt(0).toUpperCase() + type.slice(1));
                    createTag(type, label, counts[type] || 0);
                }
            });
        };

        renderTags();
        renderList();
    }

    private getActiveNotices(): NoticeItem[] {
        const notices: NoticeItem[] = [];

        if (this.plugin.settings.enableFavicons) {
            notices.push({
                type: 'warning',
                icon: 'megaphone',
                title: t('notice_internet_title'),
                desc: t('notice_internet_desc')
            });
            notices.push({
                type: 'info',
                icon: 'globe',
                title: t('notice_favicon_title'),
                desc: t('notice_favicon_desc')
            });
        }

        if (this.plugin.settings.enableCustomIcons) {
            notices.push({
                type: 'info',
                icon: 'info',
                title: t('notice_custom_icons_title'),
                desc: t('notice_custom_icons_desc')
            });
        }

        if (this.plugin.settings.enableFavicons) {
            notices.push({
                type: 'system',
                icon: 'database',
                title: t('notice_cache_title'),
                desc: t('notice_cache_desc')
            });
        }

        // Static Tips / Usage Tips
        notices.push({
            type: 'info',
            icon: 'list',
            title: t('notice_usage_list_title'),
            desc: t('notice_usage_list_desc')
        });

        notices.push({
            type: 'info',
            icon: 'case-sensitive',
            title: t('notice_usage_case_title'),
            desc: t('notice_usage_case_desc')
        });

        notices.push({
            type: 'info',
            icon: 'layers',
            title: t('notice_usage_priority_title'),
            desc: t('notice_usage_priority_desc')
        });

        notices.push({
            type: 'info',
            icon: 'tags',
            title: t('notice_usage_multiple_title'),
            desc: t('notice_usage_multiple_desc')
        });

        notices.push({
            type: 'info',
            icon: 'image',
            title: t('notice_custom_images_title'),
            desc: t('notice_custom_images_desc')
        });

        return notices;
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
