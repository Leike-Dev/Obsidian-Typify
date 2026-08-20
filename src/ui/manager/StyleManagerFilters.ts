// ============================================================================
// STYLE MANAGER FILTERS — Sort and filter chips
// ============================================================================

import { setIcon } from 'obsidian';
import { t } from '../../lang/helpers';

export type SortMode = 'recent' | 'az' | 'za';

export interface FiltersState {
    sortMode: SortMode;
    activeFilters: Record<string, string>;
}

export interface FiltersCallbacks {
    onChange: () => void;
}

/**
 * Renders the sort and filter chips for the style manager.
 * Manages expandable sub-options for filter categories.
 */
export class StyleManagerFilters {
    private containerEl: HTMLElement;
    private callbacks: FiltersCallbacks;

    sortMode: SortMode = 'recent';
    activeFilters: Record<string, string> = {};
    private expandedSortAlpha = false;
    private expandedFilterCategory: string | null = null;

    constructor(
        containerEl: HTMLElement,
        callbacks: FiltersCallbacks
    ) {
        this.containerEl = containerEl;
        this.callbacks = callbacks;
    }

    render(): void {
        this.containerEl.empty();

        // ── Sort chips ──────────────────────────────────────────────────

        this.containerEl.createSpan({
            text: t('manage_styles_sort_label'),
            cls: 'typify-sort-group-label'
        });

        const chipRecent = this.containerEl.createSpan({
            text: t('sort_recent'),
            cls: `typify-notice-tag typify-sort-chip${this.sortMode === 'recent' ? ' is-active' : ''}`,
            attr: { role: 'button', tabindex: '0', 'aria-pressed': this.sortMode === 'recent' ? 'true' : 'false' }
        });
        chipRecent.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chipRecent.click(); } });
        chipRecent.addEventListener('click', () => {
            this.sortMode = 'recent';
            this.expandedSortAlpha = false;
            this.render();
            this.callbacks.onChange();
        });

        if (this.expandedSortAlpha) {
            const backChip = this.containerEl.createSpan({
                cls: 'typify-notice-tag typify-sort-chip typify-sort-toggle',
                attr: { role: 'button', tabindex: '0' }
            });
            backChip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); backChip.click(); } });
            setIcon(backChip.createSpan(), 'chevron-left');
            backChip.addEventListener('click', () => {
                this.expandedSortAlpha = false;
                this.render();
            });

            const azChip = this.containerEl.createSpan({
                text: 'A → Z',
                cls: `typify-notice-tag typify-sort-chip${this.sortMode === 'az' ? ' is-active' : ''}`,
                attr: { role: 'button', tabindex: '0', 'aria-pressed': this.sortMode === 'az' ? 'true' : 'false' }
            });
            azChip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); azChip.click(); } });
            azChip.addEventListener('click', () => {
                this.sortMode = 'az';
                this.expandedSortAlpha = false;
                this.render();
                this.callbacks.onChange();
            });

            const zaChip = this.containerEl.createSpan({
                text: 'Z → A',
                cls: `typify-notice-tag typify-sort-chip${this.sortMode === 'za' ? ' is-active' : ''}`,
                attr: { role: 'button', tabindex: '0', 'aria-pressed': this.sortMode === 'za' ? 'true' : 'false' }
            });
            zaChip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zaChip.click(); } });
            zaChip.addEventListener('click', () => {
                this.sortMode = 'za';
                this.expandedSortAlpha = false;
                this.render();
                this.callbacks.onChange();
            });
        } else {
            const isAlphaActive = this.sortMode === 'az' || this.sortMode === 'za';
            const alphaChip = this.containerEl.createSpan({
                cls: `typify-notice-tag typify-sort-chip${isAlphaActive ? ' is-active' : ''}`,
                attr: { role: 'button', tabindex: '0', 'aria-pressed': isAlphaActive ? 'true' : 'false' }
            });
            alphaChip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alphaChip.click(); } });
            alphaChip.createSpan({ text: isAlphaActive ? (this.sortMode === 'az' ? 'A → Z' : 'Z → A') : t('sort_alpha') });
            setIcon(alphaChip.createSpan({ cls: 'typify-sort-chip-icon' }), 'corner-down-right');

            alphaChip.addEventListener('click', () => {
                this.expandedSortAlpha = true;
                this.render();
            });
        }

        // ── Separator ────────────────────────────────────────────────────

        this.containerEl.createSpan({
            text: '|',
            cls: 'typify-sort-separator'
        });

        // ── Filter chips ────────────────────────────────────────────────

        this.containerEl.createSpan({
            text: t('manage_styles_filter_label'),
            cls: 'typify-sort-group-label'
        });

        if (this.expandedFilterCategory) {
            this.renderExpandedFilter();
        } else {
            this.renderCollapsedFilters();
        }
    }

    private renderExpandedFilter(): void {
        const backChip = this.containerEl.createSpan({
            cls: 'typify-notice-tag typify-sort-chip typify-sort-toggle',
            attr: { role: 'button', tabindex: '0' }
        });
        backChip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); backChip.click(); } });
        setIcon(backChip.createSpan(), 'chevron-left');
        backChip.addEventListener('click', () => {
            this.expandedFilterCategory = null;
            this.render();
        });

        let subOptions: { id: string, label: string }[] = [];
        if (this.expandedFilterCategory === 'shape') {
            subOptions = [
                { id: 'shape:pill', label: t('shape_pill') },
                { id: 'shape:rectangle', label: t('shape_rectangle') },
                { id: 'shape:flat', label: t('shape_flat') }
            ];
        } else if (this.expandedFilterCategory === 'colormode') {
            subOptions = [
                { id: 'colormode:solid', label: t('color_mode_solid') },
                { id: 'colormode:subtle', label: t('color_mode_subtle') },
                { id: 'colormode:simple', label: t('color_mode_simple') }
            ];
        } else if (this.expandedFilterCategory === 'icon') {
            subOptions = [
                { id: 'icon:has', label: t('sort_hasicon') },
                { id: 'icon:no', label: t('sort_noicon') },
                { id: 'icon:lucide', label: t('sort_icon_lucide') },
                { id: 'icon:emoji', label: t('sort_icon_emoji') },
                { id: 'icon:custom', label: t('sort_icon_custom') },
                { id: 'icon:img', label: t('sort_icon_img') }
            ];
        } else if (this.expandedFilterCategory === 'hasurl') {
            subOptions = [
                { id: 'hasurl:yes', label: t('sort_hasurl') },
                { id: 'hasurl:no', label: t('sort_nourl') }
            ];
        }

        for (const opt of subOptions) {
            const isActive = this.expandedFilterCategory && this.activeFilters[this.expandedFilterCategory] === opt.id;
            const chip = this.containerEl.createSpan({
                text: opt.label,
                cls: `typify-notice-tag typify-sort-chip${isActive ? ' is-active' : ''}`,
                attr: { role: 'button', tabindex: '0', 'aria-pressed': isActive ? 'true' : 'false' }
            });
            chip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); } });
            chip.addEventListener('click', () => {
                if (this.expandedFilterCategory) {
                    if (isActive) {
                        delete this.activeFilters[this.expandedFilterCategory];
                    } else {
                        this.activeFilters[this.expandedFilterCategory] = opt.id;
                    }
                }
                this.expandedFilterCategory = null;
                this.render();
                this.callbacks.onChange();
            });
        }
    }

    private renderCollapsedFilters(): void {
        const filterCategories = [
            { id: 'shape', label: t('shape_title') },
            { id: 'icon', label: t('sort_icon') },
            { id: 'colormode', label: t('sort_colormode') },
            { id: 'hasurl', label: t('sort_link') }
        ];

        for (const cat of filterCategories) {
            const activeOptId = this.activeFilters[cat.id];
            const isActiveCat = !!activeOptId;
            const chip = this.containerEl.createSpan({
                cls: `typify-notice-tag typify-sort-chip${isActiveCat ? ' is-active' : ''}`,
                attr: { role: 'button', tabindex: '0', 'aria-pressed': isActiveCat ? 'true' : 'false' }
            });
            chip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); chip.click(); } });
            chip.createSpan({ text: isActiveCat ? StyleManagerFilters.getActiveFilterLabel(activeOptId) : cat.label });
            setIcon(chip.createSpan({ cls: 'typify-sort-chip-icon' }), 'corner-down-right');

            chip.addEventListener('click', () => {
                this.expandedFilterCategory = cat.id;
                this.render();
            });

            if (isActiveCat) {
                const clearBtn = this.containerEl.createSpan({
                    cls: 'typify-notice-tag typify-sort-chip typify-sort-clear',
                    attr: { role: 'button', tabindex: '0', 'aria-label': t('cancel_button') }
                });
                clearBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearBtn.click(); } });
                setIcon(clearBtn.createSpan(), 'x');
                clearBtn.addEventListener('click', () => {
                    delete this.activeFilters[cat.id];
                    this.render();
                    this.callbacks.onChange();
                });
            }
        }
    }

    static getActiveFilterLabel(id: string): string {
        if (!id) return '';
        if (id === 'shape:pill') return t('shape_pill');
        if (id === 'shape:rectangle') return t('shape_rectangle');
        if (id === 'shape:flat') return t('shape_flat');
        if (id === 'colormode:solid') return t('color_mode_solid');
        if (id === 'colormode:subtle') return t('color_mode_subtle');
        if (id === 'colormode:simple') return t('color_mode_simple');
        if (id === 'icon:has') return t('sort_hasicon');
        if (id === 'icon:no') return t('sort_noicon');
        if (id === 'icon:lucide') return t('sort_icon_lucide');
        if (id === 'icon:emoji') return t('sort_icon_emoji');
        if (id === 'icon:custom') return t('sort_icon_custom');
        if (id === 'icon:img') return t('sort_icon_img');
        if (id === 'hasurl:yes') return t('sort_hasurl');
        if (id === 'hasurl:no') return t('sort_nourl');
        return '';
    }
}
