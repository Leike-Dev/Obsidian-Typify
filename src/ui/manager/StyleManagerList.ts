// ============================================================================
// STYLE MANAGER LIST — Renders the filtered/sorted list of styles
// ============================================================================

import { ExtraButtonComponent, setIcon } from 'obsidian';
import type TypifyPlugin from '../../main';
import { StatusStyle } from '../../types';
import { t } from '../../lang/helpers';
import type { SortMode } from './StyleManagerFilters';
import { insertSvg } from '../../utils/svg-utils';

export interface ListCallbacks {
    onEdit: (style: StatusStyle, realIndex: number) => void;
    onDuplicate: (style: StatusStyle) => void;
    onDelete: (itemEl: HTMLElement, realIndex: number) => void;
}

/**
 * Renders the style list and count label.
 */
export class StyleManagerList {
    private listContainerEl: HTMLElement;
    private countEl: HTMLElement;
    private plugin: TypifyPlugin;
    private callbacks: ListCallbacks;

    constructor(
        listContainerEl: HTMLElement,
        countEl: HTMLElement,
        plugin: TypifyPlugin,
        callbacks: ListCallbacks
    ) {
        this.listContainerEl = listContainerEl;
        this.countEl = countEl;
        this.plugin = plugin;
        this.callbacks = callbacks;
    }

    /**
     * Renders the list of styles filtered by search, scope, and active filters,
     * then sorted by the current sort mode.
     */
    render(
        filter: string,
        scope: string,
        sortMode: SortMode,
        activeFilters: Record<string, string>
    ): void {
        this.listContainerEl.empty();

        const lowerFilter = filter.toLowerCase();
        const styles = this.plugin.settings.statusStyles;

        let filtered = styles.filter(s => {
            if (lowerFilter !== '' && !s.name.toLowerCase().includes(lowerFilter)) {
                return false;
            }

            if (scope !== '__show_all__') {
                if (scope === '__all__') {
                    if (s.appliesTo && s.appliesTo.length > 0) return false;
                } else {
                    if (!s.appliesTo || s.appliesTo.length === 0) return false;
                    const hasMatch = s.appliesTo.some(prop => prop.toLowerCase() === scope.toLowerCase());
                    if (!hasMatch) return false;
                }
            }

            for (const filterId of Object.values(activeFilters)) {
                const shape = s.shape || 'pill';
                const colorMode = s.colorMode || 'subtle';

                if (filterId === 'shape:pill' && shape !== 'pill') return false;
                if (filterId === 'shape:rectangle' && shape !== 'rectangle') return false;
                if (filterId === 'shape:flat' && shape !== 'flat') return false;
                if (filterId === 'colormode:solid' && colorMode !== 'solid') return false;
                if (filterId === 'colormode:subtle' && colorMode !== 'subtle') return false;
                if (filterId === 'colormode:simple' && colorMode !== 'simple') return false;
                if (filterId === 'icon:has' && !s.icon) return false;
                if (filterId === 'icon:no' && s.icon) return false;
                if (filterId === 'icon:lucide' && (!s.icon || s.icon.includes(':'))) return false;
                if (filterId === 'icon:emoji' && (!s.icon || !s.icon.startsWith('emoji:'))) return false;
                if (filterId === 'icon:custom' && (!s.icon || !s.icon.startsWith('custom:'))) return false;
                if (filterId === 'icon:img' && (!s.icon || (!s.icon.startsWith('img:') && !s.icon.startsWith('favicon:')))) return false;
                if (filterId === 'hasurl:yes' && !s.matchValue) return false;
                if (filterId === 'hasurl:no' && s.matchValue) return false;
            }

            return true;
        });

        if (sortMode === 'recent') {
            filtered = [...filtered].reverse();
        } else if (sortMode === 'az') {
            filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortMode === 'za') {
            filtered = filtered.sort((a, b) => b.name.localeCompare(a.name));
        }

        this.countEl.setText(
            t('manage_styles_count').replace('{count}', String(filtered.length))
        );

        if (filtered.length === 0) {
            this.listContainerEl.createDiv({
                text: styles.length === 0
                    ? t('manage_styles_empty')
                    : t('manage_styles_no_results'),
                cls: 'typify-manager-empty'
            });
            return;
        }

        for (const style of filtered) {
            this.renderItem(style, scope);
        }
    }

    private renderItem(style: StatusStyle, selectedScope: string): void {
        const item = this.listContainerEl.createDiv({ cls: 'typify-manager-item' });

        const infoSection = item.createDiv({ cls: 'typify-manager-item-info' });

        const dot = infoSection.createSpan({ cls: 'typify-manager-color-dot' });
        dot.setCssStyles({ backgroundColor: style.baseColor });

        const textBlock = infoSection.createDiv({ cls: 'typify-manager-item-text' });

        const nameRow = textBlock.createDiv({ cls: 'typify-manager-item-name' });
        nameRow.setText(style.name);

        const metaRow = textBlock.createDiv({ cls: 'typify-manager-meta' });

        if (style.icon) {
            const iconMeta = metaRow.createSpan({ cls: 'typify-manager-icon-meta' });
            const iconPreview = iconMeta.createSpan({ cls: 'typify-manager-icon-preview' });

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
                    iconPreview.empty();
                    insertSvg(iconPreview, svgContent, true);
                } else {
                    setIcon(iconPreview, 'image');
                }
            } else if (style.icon.startsWith('emoji:')) {
                const emoji = style.icon.replace('emoji:', '');
                iconPreview.textContent = emoji;
                iconPreview.setCssStyles({ fontSize: '14px' });
            } else if (style.icon.startsWith('favicon:')) {
                const domain = style.icon.replace('favicon:', '');
                const dataUri = this.plugin.faviconManager?.getFaviconDataUri(domain);
                if (dataUri) {
                    iconPreview.addClass('typify-img-preview', 'typify-img-manager-preview');
                    iconPreview.setCssProps({ '--typify-bg-image': dataUri });
                    iconPreview.setCssStyles({ backgroundImage: 'var(--typify-bg-image)' });
                } else {
                    setIcon(iconPreview, 'globe');
                }
            } else {
                setIcon(iconPreview, style.icon);
            }
        }

        const shapeText = style.shape === 'flat' ? t('shape_flat') : style.shape === 'rectangle' ? t('shape_rectangle') : t('shape_pill');
        if (metaRow.childElementCount > 0) {
            metaRow.createSpan({ text: ' \u00b7 ' });
        }
        metaRow.createSpan({ text: shapeText });

        const modeText = style.colorMode === 'solid' ? t('color_mode_solid') : style.colorMode === 'simple' ? t('color_mode_simple') : t('color_mode_subtle');
        metaRow.createSpan({ text: ' \u00b7 ' });
        metaRow.createSpan({ text: modeText });

        if (style.matchValue) {
            metaRow.createSpan({ text: ' \u00b7 ' });
            metaRow.createSpan({ text: t('link_url_title') });
            if (style.prefixMatch === true) {
                metaRow.createSpan({ text: ` (${t('prefix_match_title')})` });
            }
        }

        // In "show all" mode, display the scope group
        if (selectedScope === '__show_all__') {
            const groupLabel = (style.appliesTo && style.appliesTo.length > 0)
                ? style.appliesTo.join(', ')
                : t('scope_all');
            metaRow.createSpan({ text: ` (${groupLabel})` });
        }

        const actionsSection = item.createDiv({ cls: 'typify-manager-actions' });
        const realIndex = this.plugin.settings.statusStyles.indexOf(style);

        new ExtraButtonComponent(actionsSection)
            .setIcon('copy')
            .setTooltip(t('duplicate_style'))
            .onClick(() => {
                this.callbacks.onDuplicate(style);
            });

        new ExtraButtonComponent(actionsSection)
            .setIcon('pencil')
            .setTooltip(t('edit_style_title'))
            .onClick(() => {
                this.callbacks.onEdit(style, realIndex);
            });

        new ExtraButtonComponent(actionsSection)
            .setIcon('trash-2')
            .setTooltip(t('delete_button'))
            .onClick(() => {
                this.callbacks.onDelete(item, realIndex);
            });
    }
}
