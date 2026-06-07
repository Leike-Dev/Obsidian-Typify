import { App, Modal, setIcon } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';

export class NoticesModal extends Modal {
    private plugin: TypifyPlugin;

    constructor(app: App, plugin: TypifyPlugin) {
        super(app);
        this.plugin = plugin;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("typify-notices-modal");

        this.setTitle(t('notices_title'));

        contentEl.createDiv({ text: t('notices_list_title'), cls: 'typify-card-section-title' });

        const listContainer = contentEl.createDiv({ cls: 'typify-notices-list' });

        // Logic to gather active notices
        const notices = this.getActiveNotices();

        if (notices.length === 0) {
            listContainer.createEl('p', { text: t('notices_empty'), cls: 'typify-no-notices' });
        } else {
            for (const notice of notices) {
                const itemEl = listContainer.createDiv({ cls: `typify-notice-item is-${notice.type}` });

                const iconEl = itemEl.createDiv({ cls: `typify-notice-icon typify-notice-${notice.type}` });
                setIcon(iconEl, notice.icon);

                const textContainer = itemEl.createDiv({ cls: 'typify-notice-text' });
                const titleEl = textContainer.createDiv({ text: notice.title, cls: 'typify-notice-item-title' });
                titleEl.addClass(`typify-notice-${notice.type}`);
                textContainer.createDiv({ text: notice.desc, cls: 'typify-notice-item-desc' });
            }
        }
    }

    private getActiveNotices() {
        const notices = [];

        if (this.plugin.settings.enableFavicons) {
            notices.push({
                type: 'warning',
                icon: 'megaphone',
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
                type: 'success',
                icon: 'database',
                title: t('notice_cache_title'),
                desc: t('notice_cache_desc')
            });
        }

        return notices;
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
