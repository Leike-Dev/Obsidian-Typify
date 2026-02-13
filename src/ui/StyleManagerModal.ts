import { App, Modal, Notice, setIcon } from 'obsidian';
import type TypifyPlugin from '../main';
import { StatusStyle } from '../types';
import { StyleEditorModal } from './StyleEditorModal';
import { t } from '../lang/helpers';

/**
 * Modal for managing existing styles.
 * Displays a searchable list with delete (+ confirmation) capability.
 */
export class StyleManagerModal extends Modal {
    plugin: TypifyPlugin;
    private onClose_cb?: () => void;

    // DOM refs
    private listContainerEl: HTMLElement | null = null;
    private searchInput: HTMLInputElement | null = null;
    private countEl: HTMLElement | null = null;

    constructor(app: App, plugin: TypifyPlugin, onClose?: () => void) {
        super(app);
        this.plugin = plugin;
        this.onClose_cb = onClose;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('csi-manager-modal');

        this.setTitle(t('manage_styles_modal_title'));

        // Search input
        const searchContainer = contentEl.createDiv({ cls: 'csi-manager-search-container' });
        this.searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: t('manage_styles_search'),
            cls: 'csi-manager-search',
        });
        this.searchInput.addEventListener('input', () => {
            this.renderList(this.searchInput?.value ?? '');
        });

        // Count label
        this.countEl = contentEl.createDiv({ cls: 'csi-manager-count' });

        // List container
        this.listContainerEl = contentEl.createDiv({ cls: 'csi-manager-list' });

        this.renderList('');
    }

    /**
     * Renders the style list, filtered by the given search term.
     */
    private renderList(filter: string): void {
        if (!this.listContainerEl || !this.countEl) return;
        this.listContainerEl.empty();

        const lowerFilter = filter.toLowerCase();
        const styles = this.plugin.settings.statusStyles;
        const filtered = styles.filter(s => s.name.toLowerCase().includes(lowerFilter));

        // Update count
        this.countEl.setText(
            t('manage_styles_count').replace('{count}', String(filtered.length))
        );

        // Empty state
        if (filtered.length === 0) {
            this.listContainerEl.createDiv({
                text: styles.length === 0
                    ? t('manage_styles_empty')
                    : t('manage_styles_no_results'),
                cls: 'csi-manager-empty'
            });
            return;
        }

        // Render each item
        filtered.forEach(style => {
            this.renderItem(style, styles.indexOf(style));
        });
    }

    /**
     * Renders a single style item card.
     */
    private renderItem(style: StatusStyle, index: number): void {
        if (!this.listContainerEl) return;

        const item = this.listContainerEl.createDiv({ cls: 'csi-manager-item' });

        // Left section: color dot + info
        const infoSection = item.createDiv({ cls: 'csi-manager-item-info' });

        // Color dot
        const dot = infoSection.createSpan({ cls: 'csi-manager-color-dot' });
        dot.setCssStyles({ backgroundColor: style.baseColor });

        // Text block
        const textBlock = infoSection.createDiv({ cls: 'csi-manager-item-text' });

        // Name row (with icon if present)
        const nameRow = textBlock.createDiv({ cls: 'csi-manager-item-name' });
        nameRow.setText(style.name);

        // Metadata row
        const metaRow = textBlock.createDiv({ cls: 'csi-manager-meta' });

        // Scope info
        const scopeText = (style.appliesTo && style.appliesTo.length > 0)
            ? style.appliesTo.join(', ')
            : t('scope_all');
        metaRow.createSpan({ text: `${t('scope_label')}: ${scopeText}` });

        // Icon info
        if (style.icon) {
            metaRow.createSpan({ text: ' · ' });
            const iconMeta = metaRow.createSpan({ cls: 'csi-manager-icon-meta' });
            iconMeta.createSpan({ text: `${t('icon_label')}: ` });

            // Show small icon preview
            const iconPreview = iconMeta.createSpan({ cls: 'csi-manager-icon-preview' });
            if (style.icon.startsWith('custom:')) {
                const name = style.icon.replace('custom:', '');
                const svgContent = this.plugin.customIconsManager?.getSvgContent(name);
                if (svgContent) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                    const svg = doc.documentElement;
                    if (svg instanceof SVGElement) {
                        iconPreview.empty();
                        iconPreview.appendChild(svg);
                    }
                } else {
                    setIcon(iconPreview, 'image');
                }
            } else {
                setIcon(iconPreview, style.icon);
            }
        }

        // Shape info
        if (style.shape && style.shape !== 'pill') {
            metaRow.createSpan({ text: ' · ' });
            metaRow.createSpan({ text: `${t('shape_label')}: ${t('shape_rectangle')}` });
        }

        // Right section: action buttons
        const actionsSection = item.createDiv({ cls: 'csi-manager-actions' });

        // Edit button
        const editBtn = actionsSection.createEl('button', {
            cls: 'clickable-icon csi-manager-edit-btn',
            attr: { 'aria-label': t('edit_style_title') }
        });
        setIcon(editBtn, 'pencil');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.close();
            new StyleEditorModal(
                this.app,
                this.plugin,
                () => {
                    // Re-open manager after saving to show updated list
                    this.onClose_cb?.();
                    new StyleManagerModal(this.app, this.plugin, this.onClose_cb).open();
                },
                style,
                index
            ).open();
        });

        // Delete button
        const deleteBtn = actionsSection.createEl('button', {
            cls: 'clickable-icon csi-manager-delete-btn',
            attr: { 'aria-label': t('delete_button') }
        });
        setIcon(deleteBtn, 'trash-2');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirm(item, index);
        });
    }

    /**
     * Shows inline delete confirmation replacing the item content.
     */
    private showDeleteConfirm(itemEl: HTMLElement, index: number): void {
        const style = this.plugin.settings.statusStyles[index];
        if (!style) return;

        // Create confirmation overlay
        const confirmEl = itemEl.createDiv({ cls: 'csi-manager-confirm' });
        confirmEl.createSpan({
            text: t('delete_style_confirm').replace('{name}', style.name),
            cls: 'csi-manager-confirm-text'
        });

        const btnGroup = confirmEl.createDiv({ cls: 'csi-manager-confirm-btns' });

        // Confirm button
        const confirmBtn = btnGroup.createEl('button', {
            text: t('confirm_button'),
            cls: 'mod-warning'
        });
        confirmBtn.addEventListener('click', () => {
            void (async () => {
                this.plugin.settings.statusStyles.splice(index, 1);
                await this.plugin.saveSettings();
                new Notice(t('style_deleted').replace('{name}', style.name));
                this.renderList(this.searchInput?.value ?? '');
            })();
        });

        // Cancel button
        const cancelBtn = btnGroup.createEl('button', {
            text: t('cancel_button')
        });
        cancelBtn.addEventListener('click', () => {
            confirmEl.remove();
        });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        this.onClose_cb?.();
    }
}
