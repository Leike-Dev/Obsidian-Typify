import { App, Modal, Notice, setIcon } from 'obsidian';
import TypifyPlugin from '../main';
import { StatusStyle, DEFAULT_STATUS_COLOR } from '../types';
import { StyleEditorModal } from './StyleEditorModal';
import { t } from '../lang/helpers';

export class StyleManagerModal extends Modal {
    plugin: TypifyPlugin;
    private onClose_cb?: () => void;

    private listContainerEl: HTMLElement | null = null;
    private searchInput: HTMLInputElement | null = null;
    private scopeSelect: HTMLSelectElement | null = null;
    private countEl: HTMLElement | null = null;
    private batchHintEl: HTMLElement | null = null;
    private sortChipsContainerEl: HTMLElement | null = null;

    private selectedScope = '__show_all__';
    private sortMode: 'recent' | 'az' | 'za' = 'recent';
    private activeFilter: string | null = null;
    private expandedFilterCategory: string | null = null;

    constructor(app: App, plugin: TypifyPlugin, onClose?: () => void, initialScope?: string) {
        super(app);
        this.plugin = plugin;
        this.onClose_cb = onClose;
        if (initialScope) {
            this.selectedScope = initialScope;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('typify-manager-modal');

        this.setTitle(t('manage_styles_modal_title'));

        const searchContainer = contentEl.createDiv({ cls: 'typify-manager-search-container' });

        this.searchInput = searchContainer.createEl('input', {
            type: 'text',
            placeholder: t('manage_styles_search'),
            cls: 'typify-manager-search',
        });
        this.searchInput.addEventListener('input', () => {
            this.refreshList();
        });

        this.scopeSelect = searchContainer.createEl('select', {
            cls: 'typify-manager-scope-select dropdown',
        });
        this.populateScopeOptions();
        // Restore previously selected scope after repopulating options
        if (this.scopeSelect && this.selectedScope !== '__show_all__') {
            this.scopeSelect.value = this.selectedScope;
        }
        this.scopeSelect.addEventListener('change', () => {
            this.selectedScope = this.scopeSelect?.value ?? '__show_all__';
            this.refreshList();
        });

        this.sortChipsContainerEl = contentEl.createDiv({ cls: 'typify-sort-chips' });

        this.countEl = contentEl.createDiv({ cls: 'typify-manager-count' });
        this.listContainerEl = contentEl.createDiv({ cls: 'typify-manager-list' });

        this.renderSortChips();

        this.batchHintEl = contentEl.createDiv({ cls: 'typify-manager-batch-hint' });

        this.refreshList();
    }

    private populateScopeOptions(): void {
        if (!this.scopeSelect) return;
        this.scopeSelect.empty();

        // "全部显示" — shows all styles (default)
        const showAllOpt = this.scopeSelect.createEl('option', {
            text: t('scope_show_all'),
            value: '__show_all__',
        });
        showAllOpt.value = '__show_all__';

        // "任意属性" — shows only global (no appliesTo) styles
        const allPropsOpt = this.scopeSelect.createEl('option', {
            text: t('scope_all'),
            value: '__all__',
        });
        allPropsOpt.value = '__all__';

        const scopes = new Set<string>();

        const targetProps = this.plugin.settings.targetProperty
            .split(',')
            .map(p => p.trim())
            .filter(p => p.length > 0);
        targetProps.forEach(p => scopes.add(p));

        for (const style of this.plugin.settings.statusStyles) {
            if (style.appliesTo && style.appliesTo.length > 0) {
                scopes.add(style.appliesTo[0]!);
            }
        }

        const sorted = [...scopes].sort((a, b) => a.localeCompare(b));
        for (const scope of sorted) {
            const opt = this.scopeSelect.createEl('option', { text: scope, value: scope });
            opt.value = scope;
        }
    }

    private refreshList(): void {
        this.renderList(this.searchInput?.value ?? '', this.selectedScope);
        this.renderBatchHint(this.selectedScope);
    }

    private renderSortChips(): void {
        if (!this.sortChipsContainerEl) return;
        this.sortChipsContainerEl.empty();

        this.sortChipsContainerEl.createSpan({
            text: t('manage_styles_sort_label'),
            cls: 'typify-sort-group-label'
        });

        type SortModeId = 'recent' | 'az' | 'za';
        const sortOptions: { id: SortModeId, label: string }[] = [
            { id: 'recent', label: t('sort_recent') },
            { id: 'az', label: 'A → Z' },
            { id: 'za', label: 'Z → A' }
        ];

        for (const opt of sortOptions) {
            const chip = this.sortChipsContainerEl.createSpan({
                text: opt.label,
                cls: `typify-notice-tag typify-sort-chip${this.sortMode === opt.id ? ' is-active' : ''}`
            });
            chip.addEventListener('click', () => {
                this.sortMode = opt.id;
                this.renderSortChips();
                this.refreshList();
            });
        }

        this.sortChipsContainerEl.createSpan({
            text: '|',
            cls: 'typify-sort-separator'
        });

        this.sortChipsContainerEl.createSpan({
            text: t('manage_styles_filter_label'),
            cls: 'typify-sort-group-label'
        });

        if (this.expandedFilterCategory) {
            const backChip = this.sortChipsContainerEl.createSpan({ cls: 'typify-notice-tag typify-sort-chip typify-sort-toggle' });
            setIcon(backChip.createSpan(), 'chevron-left');
            backChip.addEventListener('click', () => {
                this.expandedFilterCategory = null;
                this.renderSortChips();
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
                    { id: 'colormode:subtle', label: t('color_mode_subtle') }
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
                const chip = this.sortChipsContainerEl.createSpan({
                    text: opt.label,
                    cls: `typify-notice-tag typify-sort-chip${this.activeFilter === opt.id ? ' is-active' : ''}`
                });
                chip.addEventListener('click', () => {
                    this.activeFilter = this.activeFilter === opt.id ? null : opt.id;
                    this.expandedFilterCategory = null;
                    this.renderSortChips();
                    this.refreshList();
                });
            }
        } else {
            const filterCategories = [
                { id: 'shape', label: t('shape_title') },
                { id: 'icon', label: t('sort_icon') },
                { id: 'colormode', label: t('sort_colormode') },
                { id: 'hasurl', label: t('sort_link') }
            ];

            for (const cat of filterCategories) {
                const isActiveCat = this.activeFilter?.startsWith(cat.id + ':');
                const chip = this.sortChipsContainerEl.createSpan({
                    cls: `typify-notice-tag typify-sort-chip${isActiveCat ? ' is-active' : ''}`
                });
                chip.createSpan({ text: isActiveCat ? this.getActiveFilterLabel() : cat.label });
                setIcon(chip.createSpan({ cls: 'typify-sort-chip-icon' }), 'chevron-down');

                chip.addEventListener('click', () => {
                    this.expandedFilterCategory = cat.id;
                    this.renderSortChips();
                });

                if (isActiveCat) {
                    const clearBtn = this.sortChipsContainerEl.createSpan({
                        cls: 'typify-notice-tag typify-sort-chip typify-sort-clear'
                    });
                    setIcon(clearBtn.createSpan(), 'x');
                    clearBtn.addEventListener('click', () => {
                        this.activeFilter = null;
                        this.renderSortChips();
                        this.refreshList();
                    });
                }
            }
        }
    }

    private getActiveFilterLabel(): string {
        if (!this.activeFilter) return '';
        if (this.activeFilter === 'shape:pill') return t('shape_pill');
        if (this.activeFilter === 'shape:rectangle') return t('shape_rectangle');
        if (this.activeFilter === 'shape:flat') return t('shape_flat');
        if (this.activeFilter === 'colormode:solid') return t('color_mode_solid');
        if (this.activeFilter === 'colormode:subtle') return t('color_mode_subtle');
        if (this.activeFilter === 'icon:has') return t('sort_hasicon');
        if (this.activeFilter === 'icon:no') return t('sort_noicon');
        if (this.activeFilter === 'icon:lucide') return t('sort_icon_lucide');
        if (this.activeFilter === 'icon:emoji') return t('sort_icon_emoji');
        if (this.activeFilter === 'icon:custom') return t('sort_icon_custom');
        if (this.activeFilter === 'icon:img') return t('sort_icon_img');
        if (this.activeFilter === 'hasurl:yes') return t('sort_hasurl');
        if (this.activeFilter === 'hasurl:no') return t('sort_nourl');
        return '';
    }

    private renderList(filter: string, scope: string): void {
        if (!this.listContainerEl || !this.countEl) return;
        this.listContainerEl.empty();

        const lowerFilter = filter.toLowerCase();
        const styles = this.plugin.settings.statusStyles;

        let filtered = styles.filter(s => {
            if (lowerFilter !== '' && !s.name.toLowerCase().includes(lowerFilter)) {
                return false;
            }

            if (scope !== '__show_all__') {
                const styleScope = (s.appliesTo && s.appliesTo.length > 0)
                    ? s.appliesTo[0]!.toLowerCase()
                    : '__all__';
                if (styleScope !== scope.toLowerCase()) return false;
            }

            if (this.activeFilter) {
                if (this.activeFilter === 'shape:pill' && s.shape !== 'pill') return false;
                if (this.activeFilter === 'shape:rectangle' && s.shape !== 'rectangle') return false;
                if (this.activeFilter === 'shape:flat' && s.shape !== 'flat') return false;
                if (this.activeFilter === 'colormode:solid' && s.colorMode !== 'solid') return false;
                if (this.activeFilter === 'colormode:subtle' && s.colorMode !== 'subtle') return false;
                if (this.activeFilter === 'icon:has' && !s.icon) return false;
                if (this.activeFilter === 'icon:no' && s.icon) return false;
                if (this.activeFilter === 'icon:lucide' && (!s.icon || s.icon.includes(':'))) return false;
                if (this.activeFilter === 'icon:emoji' && (!s.icon || !s.icon.startsWith('emoji:'))) return false;
                if (this.activeFilter === 'icon:custom' && (!s.icon || !s.icon.startsWith('custom:'))) return false;
                if (this.activeFilter === 'icon:img' && (!s.icon || (!s.icon.startsWith('img:') && !s.icon.startsWith('favicon:')))) return false;
                if (this.activeFilter === 'hasurl:yes' && !s.matchValue) return false;
                if (this.activeFilter === 'hasurl:no' && s.matchValue) return false;
            }

            return true;
        });

        if (this.sortMode === 'az') {
            filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (this.sortMode === 'za') {
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

        for (let i = 0; i < filtered.length; i++) {
            const style = filtered[i]!;
            this.renderItem(style);
        }
    }

    private renderItem(style: StatusStyle): void {
        if (!this.listContainerEl) return;

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

        const modeText = style.colorMode === 'solid' ? t('color_mode_solid') : t('color_mode_subtle');
        metaRow.createSpan({ text: ' \u00b7 ' });
        metaRow.createSpan({ text: modeText });

        if (style.matchValue) {
            metaRow.createSpan({ text: ' \u00b7 ' });
            metaRow.createSpan({ text: t('link_url_title') });
            if (style.prefixMatch !== false) {
                metaRow.createSpan({ text: ` (${t('prefix_match_title')})` });
            }
        }

        // In "show all" mode, display the scope group
        if (this.selectedScope === '__show_all__') {
            const groupLabel = (style.appliesTo && style.appliesTo.length > 0)
                ? style.appliesTo[0]
                : t('scope_all');
            metaRow.createSpan({ text: ` (${groupLabel})` });
        }

        const actionsSection = item.createDiv({ cls: 'typify-manager-actions' });
        const realIndex = this.plugin.settings.statusStyles.indexOf(style);

        const editBtn = actionsSection.createEl('button', {
            cls: 'clickable-icon typify-manager-edit-btn',
            attr: { 'aria-label': t('edit_style_title') }
        });
        setIcon(editBtn, 'pencil');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const currentScope = this.selectedScope;
            new StyleEditorModal(
                this.app,
                this.plugin,
                () => {
                    this.onClose_cb?.();
                    new StyleManagerModal(this.app, this.plugin, this.onClose_cb, currentScope).open();
                },
                style,
                realIndex
            ).open();
        });

        const deleteBtn = actionsSection.createEl('button', {
            cls: 'clickable-icon typify-manager-delete-btn',
            attr: { 'aria-label': t('delete_button') }
        });
        setIcon(deleteBtn, 'trash-2');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirm(item, realIndex);
        });
    }



    private renderBatchHint(scope: string): void {
        if (!this.batchHintEl) return;
        this.batchHintEl.empty();

        if (scope === '__show_all__') return;

        const candidateValues = this.getCandidateValuesForScope(scope);
        if (candidateValues.length === 0) return;

        // Names that exist in the current scope
        const existingInScope = new Set(
            this.plugin.settings.statusStyles
                .filter(s => {
                    const styleScope = (s.appliesTo && s.appliesTo.length > 0)
                        ? s.appliesTo[0]!.toLowerCase()
                        : '__all__';
                    return styleScope === scope.toLowerCase();
                })
                .map(s => s.name.toLowerCase())
        );

        // Names that exist in global ("任意属性")
        const existingGlobal = new Set(
            this.plugin.settings.statusStyles
                .filter(s => !s.appliesTo || s.appliesTo.length === 0)
                .map(s => s.name.toLowerCase())
        );

        // Values not in current scope
        const notInScope = candidateValues.filter(v => !existingInScope.has(v.toLowerCase()));
        if (notInScope.length === 0) return;

        // Among those, separate: already in global vs truly new
        const alreadyGlobal = notInScope.filter(v => existingGlobal.has(v.toLowerCase()));
        const trulyNew = notInScope.filter(v => !existingGlobal.has(v.toLowerCase()));

        const totalUncreated = notInScope.length;

        if (totalUncreated > 50) {
            this.batchHintEl.createSpan({
                text: t('batch_create_too_many').replace('{count}', String(totalUncreated)),
                cls: 'typify-batch-hint-text'
            });
            return;
        }

        // Helper: render a list of values as inline-code spans separated by ", "
        const renderInlineCodeList = (parent: HTMLElement, values: string[]) => {
            values.forEach((val, i) => {
                parent.createSpan({ text: val, cls: 'typify-inline-code' });
                if (i < values.length - 1) {
                    parent.createSpan({ text: ', ' });
                }
            });
        };

        // Case 1: All candidates already in global — no batch create needed
        if (trulyNew.length === 0 && alreadyGlobal.length > 0) {
            const note = this.batchHintEl.createDiv({ cls: 'typify-batch-hint-line' });
            note.createSpan({
                text: t('batch_create_all_global_before'),
                cls: 'typify-batch-hint-note'
            });
            renderInlineCodeList(note, alreadyGlobal);
            note.createSpan({
                text: t('batch_create_all_global_after'),
                cls: 'typify-batch-hint-note'
            });
            return;
        }

        // Case 2: Some truly new values — show batch create prompt
        const hintText = this.batchHintEl.createDiv({ cls: 'typify-batch-hint-line' });
        hintText.createSpan({
            text: t('batch_create_detected_before').replace('{count}', String(trulyNew.length)),
            cls: 'typify-batch-hint-text'
        });
        const actionEl = hintText.createEl('b', {
            text: t('batch_create_detected_action'),
            cls: 'typify-batch-hint-action'
        });
        hintText.createSpan({
            text: t('batch_create_detected_after'),
            cls: 'typify-batch-hint-text'
        });

        actionEl.addEventListener('click', () => {
            this.showBatchCreateConfirm(scope, trulyNew);
        });

        // If some values already exist in global, show supplementary note
        if (alreadyGlobal.length > 0) {
            const globalNote = this.batchHintEl.createDiv({ cls: 'typify-batch-hint-line' });
            globalNote.createSpan({
                text: t('batch_create_already_global_before'),
                cls: 'typify-batch-hint-note'
            });
            renderInlineCodeList(globalNote, alreadyGlobal);
            globalNote.createSpan({
                text: t('batch_create_already_global_after'),
                cls: 'typify-batch-hint-note'
            });
        }
    }

    private getCandidateValuesForScope(scope: string): string[] {
        const values = new Set<string>();

        const { app } = this;
        const files = app.vault.getMarkdownFiles();
        for (const file of files) {
            const cache = app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;
            if (!frontmatter) continue;

            const val: unknown = frontmatter[scope];
            if (val == null) continue;

            if (Array.isArray(val)) {
                for (const v of val) {
                    if (typeof v === 'string' && v.trim()) {
                        values.add(v.trim());
                    }
                }
            } else if (typeof val === 'string' && val.trim()) {
                values.add(val.trim());
            }
        }

        return [...values].sort((a, b) => a.localeCompare(b));
    }

    private showBatchCreateConfirm(scope: string, trulyNew: string[]): void {
        if (!this.batchHintEl) return;
        this.batchHintEl.empty();

        if (trulyNew.length === 0) {
            return;
        }

        const confirmEl = this.batchHintEl.createDiv({ cls: 'typify-batch-confirm' });
        confirmEl.createDiv({
            text: t('batch_create_confirm_desc').replace('{values}', trulyNew.join(', ')),
            cls: 'typify-batch-confirm-text'
        });

        const btnGroup = confirmEl.createDiv({ cls: 'typify-batch-confirm-btns' });

        const confirmBtn = btnGroup.createEl('button', {
            text: t('confirm_button'),
            cls: 'mod-cta'
        });
        confirmBtn.addEventListener('click', () => {
            void (async () => {
                let created = 0;
                const existingNames = new Set(
                    this.plugin.settings.statusStyles.map(s => s.name.toLowerCase())
                );

                for (const val of trulyNew) {
                    if (existingNames.has(val.toLowerCase())) continue;

                    const style: StatusStyle = {
                        name: val,
                        baseColor: DEFAULT_STATUS_COLOR,
                        icon: '',
                        appliesTo: [scope],
                        shape: 'pill',
                        colorMode: 'subtle'
                    };
                    this.plugin.settings.statusStyles.push(style);
                    created++;
                }

                await this.plugin.saveSettings();
                new Notice(t('batch_create_success').replace('{count}', String(created)));
                this.populateScopeOptions();
                this.refreshList();
            })();
        });

        const cancelBtn = btnGroup.createEl('button', {
            text: t('cancel_button')
        });
        cancelBtn.addEventListener('click', () => {
            this.renderBatchHint(scope);
        });
    }

    private showDeleteConfirm(itemEl: HTMLElement, index: number): void {
        const style = this.plugin.settings.statusStyles[index];
        if (!style) return;

        const confirmEl = itemEl.createDiv({ cls: 'typify-manager-confirm' });
        confirmEl.createSpan({
            text: t('delete_style_confirm').replace('{name}', style.name),
            cls: 'typify-manager-confirm-text'
        });

        const btnGroup = confirmEl.createDiv({ cls: 'typify-manager-confirm-btns' });

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
