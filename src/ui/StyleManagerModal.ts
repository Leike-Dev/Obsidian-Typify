import { App, Modal, Notice, setIcon } from 'obsidian';
import TypifyPlugin from '../main';
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
    private scopeSelect: HTMLSelectElement | null = null;
    private countEl: HTMLElement | null = null;

    // Filter state
    private selectedScope = '__all__';

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

        // Search + scope filter row
        const searchContainer = contentEl.createDiv({ cls: 'csi-manager-search-container' });

        this.searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: t('manage_styles_search'),
            cls: 'csi-manager-search',
        });
        this.searchInput.addEventListener('input', () => {
            this.refreshList();
        });

        // Scope dropdown
        this.scopeSelect = searchContainer.createEl('select', {
            cls: 'csi-manager-scope-select dropdown',
        });
        this.populateScopeOptions();
        this.scopeSelect.addEventListener('change', () => {
            this.selectedScope = this.scopeSelect?.value ?? '__all__';
            this.refreshList();
        });

        // Count label
        this.countEl = contentEl.createDiv({ cls: 'csi-manager-count' });

        // List container
        this.listContainerEl = contentEl.createDiv({ cls: 'csi-manager-list' });

        this.refreshList();
    }

    /**
     * Builds the scope dropdown options from target properties + existing style scopes.
     */
    private populateScopeOptions(): void {
        if (!this.scopeSelect) return;
        this.scopeSelect.empty();

        // "All" option
        const allOpt = this.scopeSelect.createEl('option', { text: t('scope_all'), value: '__all__' });
        allOpt.value = '__all__';

        // Collect unique scopes: from settings targetProperty + from existing styles
        const scopes = new Set<string>();

        // From configured target properties
        const targetProps = this.plugin.settings.targetProperty
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        targetProps.forEach(p => scopes.add(p));

        // From existing style scopes
        for (const style of this.plugin.settings.statusStyles) {
            if (style.appliesTo && style.appliesTo.length > 0) {
                scopes.add(style.appliesTo[0]);
            }
        }

        // Sort alphabetically and add to dropdown
        const sorted = [...scopes].sort((a, b) => a.localeCompare(b));
        for (const scope of sorted) {
            const opt = this.scopeSelect.createEl('option', { text: scope, value: scope });
            opt.value = scope;
        }
    }

    /**
     * Convenience: re-renders the list using current filter state.
     */
    private refreshList(): void {
        this.renderList(this.searchInput?.value ?? '', this.selectedScope);
    }

    /**
     * Renders the style list, filtered by the given search term and scope.
     * The scope dropdown determines which group to show; no group headers needed.
     */
    private renderList(filter: string, scope: string): void {
        if (!this.listContainerEl || !this.countEl) return;
        this.listContainerEl.empty();

        const lowerFilter = filter.toLowerCase();
        const styles = this.plugin.settings.statusStyles;

        // Filter by text (name only) AND by selected scope
        const filtered = styles.filter(s => {
            // Text filter (name only — scope is handled by the dropdown)
            if (lowerFilter !== '' && !s.name.toLowerCase().includes(lowerFilter)) {
                return false;
            }

            // Scope filter: __all__ matches styles without appliesTo (global)
            const styleScope = (s.appliesTo && s.appliesTo.length > 0)
                ? s.appliesTo[0].toLowerCase()
                : '__all__';
            return styleScope === scope.toLowerCase();
        });

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

        // Render items (no group headers — the dropdown determines the scope)
        for (const style of filtered) {
            this.renderItem(style, styles.indexOf(style));
        }
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

        // Icon info
        if (style.icon) {
            const iconMeta = metaRow.createSpan({ cls: 'csi-manager-icon-meta' });
            iconMeta.createSpan({ text: `${t('icon_label')}: ` });

            // Show small icon preview
            const iconPreview = iconMeta.createSpan({ cls: 'csi-manager-icon-preview' });
            
            if (style.icon.startsWith('img:')) {
                const name = style.icon.replace('img:', '');
                const dataUri = this.plugin.customImagesManager?.getImageDataUri(name);
                if (dataUri) {
                    iconPreview.addClass('typify-img-preview', 'typify-img-manager-preview');
                    iconPreview.setCssProps({ '--typify-bg-image': dataUri });
                    iconPreview.setCssStyles({ backgroundImage: 'var(--typify-bg-image)' });
                } else {
                    setIcon(iconPreview, 'image');
                }
            } else if (style.icon.startsWith('custom:')) {
                const name = style.icon.replace('custom:', '');
                const svgContent = this.plugin.customIconsManager?.getSvgContent(name);
                if (svgContent) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                    const svg = doc.documentElement;
                    if (svg.instanceOf(SVGElement)) {
                        iconPreview.empty();
                        iconPreview.appendChild(svg);
                    }
                } else {
                    setIcon(iconPreview, 'image');
                }
            } else if (style.icon.startsWith('emoji:')) {
                const emoji = style.icon.replace('emoji:', '');
                iconPreview.textContent = emoji;
                iconPreview.setCssStyles({ fontSize: '14px' });
            } else {
                setIcon(iconPreview, style.icon);
            }
        }

        // Shape info
        const shapeText = style.shape === 'flat' ? t('shape_flat') : style.shape === 'rectangle' ? t('shape_rectangle') : t('shape_pill');
        if (metaRow.childElementCount > 0) {
            metaRow.createSpan({ text: ' \u00b7 ' });
        }
        metaRow.createSpan({ text: `${t('shape_label')}: ${shapeText}` });

        // Color mode info
        const modeText = style.colorMode === 'solid' ? t('color_mode_solid') : t('color_mode_subtle');
        metaRow.createSpan({ text: ' \u00b7 ' });
        metaRow.createSpan({ text: `${t('color_mode_label')}: ${modeText}` });

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
                this.populateScopeOptions();
                this.refreshList();
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
