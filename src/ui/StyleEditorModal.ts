import { App, Modal, Notice, Setting, setIcon } from 'obsidian';
import type TypifyPlugin from '../main';
import { StatusStyle, DEFAULT_STATUS_COLOR } from '../types';
import { generatePalette } from '../utils';
import { t, type TranslationKey } from '../lang/helpers';
import { IconPickerModal } from './icon-picker';
import { THUMB_PILL, THUMB_RECT, THUMB_FLAT, THUMB_SOFT, THUMB_SOLID } from './format-thumbs';
import { FaviconManager } from '../managers/favicon-manager';
import { insertSvg } from '../utils/svg-utils';

/**
 * Modal for creating or editing a status style.
 * In create mode, a blank form is presented. In edit mode (when `editStyle`
 * and `editIndex` are provided), the form is pre-populated and saving updates
 * the existing style in-place.
 */
export class StyleEditorModal extends Modal {
    plugin: TypifyPlugin;
    private onSave?: () => void;

    // Edit mode: when set, we update an existing style instead of creating new
    private editIndex: number | null = null;

    // Form state
    private styleName = '';
    private baseColor = DEFAULT_STATUS_COLOR;
    private icon = '';
    private appliesTo: string[] = [];
    private shape: 'pill' | 'rectangle' | 'flat' | '' = '';
    private colorMode: 'subtle' | 'solid' | '' = '';
    private matchValue = '';
    private prefixMatch = true;

    // DOM references for live preview updates
    private previewPillLight: HTMLElement | null = null;
    private previewPillDark: HTMLElement | null = null;
    private iconBtnEl: HTMLElement | null = null;

    constructor(app: App, plugin: TypifyPlugin, onSave?: () => void, editStyle?: StatusStyle, editIndex?: number) {
        super(app);
        this.plugin = plugin;
        this.onSave = onSave;

        // Pre-populate form if editing
        if (editStyle && editIndex !== undefined) {
            this.editIndex = editIndex;
            this.styleName = editStyle.name;
            this.baseColor = editStyle.baseColor;
            this.icon = editStyle.icon || '';
            this.appliesTo = editStyle.appliesTo ? [...editStyle.appliesTo] : [];
            this.shape = editStyle.shape || 'pill';
            this.colorMode = editStyle.colorMode || 'subtle';
            this.matchValue = editStyle.matchValue || '';
            this.prefixMatch = editStyle.prefixMatch !== false;
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass('typify-editor-modal');

        // Header
        this.setTitle(this.editIndex !== null ? t('edit_style_title') : t('create_style_title'));

        // ============================================================
        // INPUTS
        // ============================================================

        // Style Name
        new Setting(contentEl)
            .setName(t('status_name_title'))
            .addText(text => text
                .setPlaceholder(t('status_name_placeholder'))
                .setValue(this.styleName)
                .onChange(value => {
                    this.styleName = value;
                    this.updatePreview();
                }));

        // Shape — card grid
        this.renderCardSection(contentEl, 'shape_title', [
            { key: 'pill',      labelKey: 'shape_pill',      svg: THUMB_PILL },
            { key: 'rectangle', labelKey: 'shape_rectangle', svg: THUMB_RECT },
            { key: 'flat',      labelKey: 'shape_flat',      svg: THUMB_FLAT },
        ], this.shape, (key) => {
            this.shape = key as 'pill' | 'rectangle' | 'flat';
            this.updatePreview();
        });

        // Color Mode — card grid
        this.renderCardSection(contentEl, 'color_mode_title', [
            { key: 'subtle', labelKey: 'color_mode_subtle', svg: THUMB_SOFT },
            { key: 'solid',  labelKey: 'color_mode_solid',  svg: THUMB_SOLID },
        ], this.colorMode, (key) => {
            this.colorMode = key as 'subtle' | 'solid';
            this.updatePreview();
        });

        // Base Color
        const colorSetting = new Setting(contentEl)
            .setClass('typify-color-picker-setting')
            .setName(t('base_color_title'));

        colorSetting.addColorPicker(color => {
            color.setValue(this.baseColor);

            // Native datalist for color palette shortcuts
            const paletteColors = this.plugin.settings.customPalette;
            if (this.plugin.settings.enableCustomPalette && paletteColors.length > 0) {
                const datalistId = 'typify-palette-list-' + Math.random().toString(36).substring(7);
                const datalist = contentEl.createEl('datalist', { attr: { id: datalistId } });
                for (const hex of paletteColors) {
                    datalist.createEl('option', { value: hex });
                }

                const pickerInput = colorSetting.controlEl.querySelector('input[type="color"]');
                if (pickerInput instanceof HTMLInputElement) {
                    pickerInput.setAttribute('list', datalistId);
                }
            }

            color.onChange(value => {
                this.baseColor = value;
                this.updatePreview();
            });
        });

        // Icon
        const iconSetting = new Setting(contentEl)
            .setName(t('icon_title'));

        // Icon preview + choose button
        iconSetting.addButton(btn => {
            this.iconBtnEl = btn.buttonEl;
            this.renderIconButton();
            btn.onClick(() => {
                new IconPickerModal(
                    this.app,
                    this.plugin.settings.recentIcons,
                    this.plugin.settings.enableCustomIcons
                        ? this.plugin.customIconsManager
                        : null,
                    this.plugin.customImagesManager,
                    (chosenIcon: string) => {
                        this.icon = chosenIcon;
                        this.renderIconButton();
                        this.updatePreview();
                    }
                ).open();
            });
        });

        // Remove icon button (only shown when icon is set)
        iconSetting.addButton(btn => {
            btn.setIcon('x');
            btn.setTooltip(t('remove_icon_tooltip'));
            btn.buttonEl.addClass('typify-btn-remove-icon');
            btn.onClick(() => {
                this.icon = '';
                this.renderIconButton();
                this.updatePreview();
            });
        });

        // Applies To (Scope)
        new Setting(contentEl)
            .setName(t('applies_to_title'))
            .addDropdown(dropdown => {
                dropdown.addOption('all', t('applies_to_all_option'));

                // Parse target properties from settings
                const properties = this.plugin.settings.targetProperty
                    .split(',')
                    .map(p => p.trim())
                    .filter(p => p.length > 0);

                // Add each property as an option
                properties.forEach(prop => {
                    dropdown.addOption(prop, prop);
                });

                // Set initial value based on current appliesTo state
                const initialValue = (this.appliesTo.length > 0) ? this.appliesTo[0]! : 'all';
                // Fallback to 'all' if the saved value is not an available dropdown option
                const validValue = properties.includes(initialValue) ? initialValue : 'all';
                dropdown.setValue(validValue);
                dropdown.onChange(value => {
                    this.appliesTo = value === 'all' ? [] : [value];
                });
            });

        // Link URL (only shown when link styles are enabled)
        if (this.plugin.settings.enableLinkStyles) {
            const linkSetting = new Setting(contentEl)
                .setName(t('link_url_title'))
                .addText(text => {
                    text.setPlaceholder(t('link_url_placeholder'))
                        .setValue(this.matchValue)
                        .onChange(value => {
                            this.matchValue = value;
                        });
                });

            if (this.plugin.settings.enableFavicons) {
                linkSetting.addButton(btn => {
                    btn.setIcon('search');
                    btn.setTooltip(t('favicon_fetch_tooltip'));
                    btn.onClick(async () => {
                        const domain = FaviconManager.extractDomain(this.matchValue);
                        if (!domain) {
                            new Notice(t('favicon_invalid_url'));
                            return;
                        }
                        
                        btn.setDisabled(true);
                        btn.setIcon('loader');
                        
                        const uri = await this.plugin.faviconManager.fetchFavicon(domain);
                        
                        if (uri) {
                            this.icon = `favicon:${domain}`;
                            this.renderIconButton();
                            this.updatePreview();
                        }
                        
                        btn.setDisabled(false);
                        btn.setIcon('search');
                    });
                });
            }

            new Setting(contentEl)
                .setName(t('prefix_match_title'))
                .setDesc(t('prefix_match_desc'))
                .addToggle(toggle => toggle
                    .setValue(this.prefixMatch)
                    .onChange(value => {
                        this.prefixMatch = value;
                    }));
        }

        // ============================================================
        // PREVIEW
        // ============================================================
        const previewContainer = contentEl.createDiv({ cls: 'typify-preview-card' });

        // Light preview
        const lightWrapper = previewContainer.createDiv({ cls: 'typify-preview-wrapper typify-preview-light' });
        this.previewPillLight = lightWrapper.createSpan({ cls: 'typify-preview-pill' });

        // Dark preview
        const darkWrapper = previewContainer.createDiv({ cls: 'typify-preview-wrapper typify-preview-dark' });
        this.previewPillDark = darkWrapper.createSpan({ cls: 'typify-preview-pill' });

        this.updatePreview();

        // ============================================================
        // FOOTER BUTTONS
        // ============================================================
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

        const saveBtn = buttonContainer.createEl('button', { text: t('save_button'), cls: 'mod-cta' });
        saveBtn.addEventListener('click', () => { void this.handleSave(); });

        const cancelBtn = buttonContainer.createEl('button', { text: t('cancel_button'), cls: 'mod-cancel' });
        cancelBtn.addEventListener('click', () => { this.close(); });
    }

    /**
     * Renders the icon button content based on current icon state.
     */
    private renderIconButton(): void {
        if (!this.iconBtnEl) return;
        this.iconBtnEl.empty();
        this.iconBtnEl.removeClass('typify-img-preview', 'typify-img-btn-preview');
        this.iconBtnEl.setCssProps({ '--typify-bg-image': '' });
        this.iconBtnEl.setCssStyles({ fontSize: '' });

        if (this.icon) {
            if (this.icon.startsWith('emoji:')) {
                const emoji = this.icon.replace('emoji:', '');
                this.iconBtnEl.textContent = emoji;
                this.iconBtnEl.setCssStyles({ fontSize: '16px' });
            } else if (this.icon.startsWith('img:')) {
                const name = this.icon.replace('img:', '');
                const dataUri = this.plugin.customImagesManager?.getImageDataUri(name);
                if (dataUri) {
                    const span = this.iconBtnEl.createSpan();
                    span.addClass('typify-img-preview', 'typify-img-btn-preview');
                    span.setCssProps({ '--typify-bg-image': dataUri });
                    span.setCssStyles({ backgroundImage: 'var(--typify-bg-image)' });
                } else {
                    setIcon(this.iconBtnEl, 'image');
                }
            } else if (this.icon.startsWith('custom:')) {
                const name = this.icon.replace('custom:', '');
                const svgContent = this.plugin.customIconsManager?.getSvgContent(name);
                if (svgContent) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                    const svg = doc.documentElement;
                    if (svg.instanceOf(SVGElement)) {
                        this.iconBtnEl.empty();
                        this.iconBtnEl.appendChild(svg);
                    }
                } else {
                    setIcon(this.iconBtnEl, 'image');
                }
            } else if (this.icon.startsWith('favicon:')) {
                const domain = this.icon.replace('favicon:', '');
                const dataUri = this.plugin.faviconManager?.getFaviconDataUri(domain);
                if (dataUri) {
                    const span = this.iconBtnEl.createSpan();
                    span.addClass('typify-img-preview', 'typify-img-btn-preview');
                    span.setCssProps({ '--typify-bg-image': dataUri });
                    span.setCssStyles({ backgroundImage: 'var(--typify-bg-image)' });
                } else {
                    setIcon(this.iconBtnEl, 'globe');
                }
            } else {
                setIcon(this.iconBtnEl, this.icon);
            }
            this.iconBtnEl.setAttr('aria-label', this.icon);
        } else {
            setIcon(this.iconBtnEl, 'plus');
            this.iconBtnEl.setAttr('aria-label', t('add_icon_tooltip'));
        }
    }

    /**
     * Updates the live preview pills with current form state.
     */
    private updatePreview(): void {
        if (!this.previewPillLight || !this.previewPillDark) return;

        const previewMode: 'subtle' | 'solid' = this.colorMode === 'solid' ? 'solid' : 'subtle';
        const palette = generatePalette(this.baseColor, previewMode);
        const displayName = this.styleName || t('new_status_name');

        // Light pill
        this.previewPillLight.empty();
        this.previewPillLight.createSpan({ text: displayName, cls: 'typify-preview-pill-text' });
        const previewRadius = this.shape === 'flat' ? '0px' : this.shape === 'rectangle' ? '4px' : '10px';
        this.previewPillLight.setCssStyles({
            backgroundColor: palette.light.bg,
            color: palette.light.text,
            border: `1px solid ${palette.light.border}`,
            borderRadius: previewRadius
        });

        // Dark pill
        this.previewPillDark.empty();
        this.previewPillDark.createSpan({ text: displayName, cls: 'typify-preview-pill-text' });
        this.previewPillDark.setCssStyles({
            backgroundColor: palette.dark.bg,
            color: palette.dark.text,
            border: `1px solid ${palette.dark.border}`,
            borderRadius: previewRadius
        });

        // Add icon preview to pills if icon is set
        if (this.icon) {
            this.addIconToPill(this.previewPillLight);
            this.addIconToPill(this.previewPillDark);
        }
    }

    /**
     * Prepends an icon element to a preview pill.
     */
    private addIconToPill(pill: HTMLElement): void {
        const iconSpan = createSpan();

        if (this.icon.startsWith('emoji:')) {
            const emoji = this.icon.replace('emoji:', '');
            iconSpan.addClass('typify-preview-pill-icon');
            iconSpan.textContent = emoji;
            iconSpan.setCssStyles({ backgroundColor: 'transparent', maskImage: 'none' });
        } else if (this.icon.startsWith('img:')) {
            const name = this.icon.replace('img:', '');
            const dataUri = this.plugin.customImagesManager?.getImageDataUri(name);
            if (dataUri) {
                iconSpan.addClass('typify-img-preview', 'typify-img-pill-icon');
                iconSpan.setCssProps({ '--typify-bg-image': dataUri });
                iconSpan.setCssStyles({ backgroundImage: 'var(--typify-bg-image)' });
            } else {
                iconSpan.addClass('typify-preview-pill-icon');
                setIcon(iconSpan, 'image');
            }
        } else if (this.icon.startsWith('custom:')) {
            iconSpan.addClass('typify-preview-pill-icon');
            const name = this.icon.replace('custom:', '');
            const svgContent = this.plugin.customIconsManager?.getSvgContent(name);
            if (svgContent) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svgEl = doc.documentElement;
                if (svgEl.instanceOf(SVGElement)) {
                    iconSpan.empty();
                    iconSpan.appendChild(svgEl);
                }
            }
        } else if (this.icon.startsWith('favicon:')) {
            const domain = this.icon.replace('favicon:', '');
            const dataUri = this.plugin.faviconManager?.getFaviconDataUri(domain);
            if (dataUri) {
                iconSpan.addClass('typify-img-preview', 'typify-img-pill-icon');
                iconSpan.setCssProps({ '--typify-bg-image': dataUri });
                iconSpan.setCssStyles({ backgroundImage: 'var(--typify-bg-image)' });
            } else {
                iconSpan.addClass('typify-preview-pill-icon');
                setIcon(iconSpan, 'globe');
            }
        } else {
            iconSpan.addClass('typify-preview-pill-icon');
            setIcon(iconSpan, this.icon);
        }

        pill.prepend(iconSpan);
    }

    /**
     * Handles the Save button click.
     * Validates input, saves the style, and closes the modal.
     */
    private async handleSave(): Promise<void> {
        // Validate
        const name = this.styleName.trim();
        if (!name) {
            new Notice(t('style_name_required'));
            return;
        }
        if (this.shape === '' || this.colorMode === '') {
            new Notice(t('shape_color_required'));
            return;
        }
        // Check for conflicts: same name with overlapping or identical scope
        const newScope = this.appliesTo;
        let hasExactDuplicate = false;
        let hasOverlap = false;

        this.plugin.settings.statusStyles.forEach((existing, idx) => {
            // Skip the style being edited
            if (this.editIndex !== null && idx === this.editIndex) return;
            // Different name = no conflict
            if (existing.name.toLowerCase() !== name.toLowerCase()) return;

            const existingScope = existing.appliesTo || [];

            // Both apply to all = exact duplicate
            if (existingScope.length === 0 && newScope.length === 0) {
                hasExactDuplicate = true;
                return;
            }

            // Both scoped: check if identical or partially overlapping
            if (existingScope.length > 0 && newScope.length > 0) {
                const existingNorm = existingScope.map(p => p.toLowerCase()).sort();
                const newNorm = newScope.map(p => p.toLowerCase()).sort();
                // Exact same properties = exact duplicate
                if (existingNorm.length === newNorm.length && existingNorm.every((p, i) => p === newNorm[i])) {
                    hasExactDuplicate = true;
                    return;
                }
                // Partial overlap = warn
                if (existingNorm.some(p => newNorm.includes(p))) {
                    hasOverlap = true;
                    return;
                }
                return; // No overlap at all = fine
            }

            // One is "All", other is scoped = overlap (scoped wins via CSS specificity)
            hasOverlap = true;
        });

        if (hasExactDuplicate) {
            new Notice(t('style_duplicate'));
            return;
        }

        if (hasOverlap) {
            new Notice(t('style_overlap_warning'));
        }

        const style: StatusStyle = {
            name: name,
            baseColor: this.baseColor,
            icon: this.icon
        };

        if (this.matchValue.trim()) {
            style.matchValue = this.matchValue.trim();
            style.prefixMatch = this.prefixMatch;
        }

        // Only add appliesTo if scoped
        if (this.appliesTo.length > 0) {
            style.appliesTo = this.appliesTo;
        }

        // Only add shape if not the default
        if (this.shape !== 'pill') {
            style.shape = this.shape as 'pill' | 'rectangle' | 'flat';
        }

        // Only add colorMode if not the default
        if (this.colorMode !== 'subtle') {
            style.colorMode = this.colorMode as 'subtle' | 'solid';
        }

        // Update existing or push new
        if (this.editIndex !== null) {
            this.plugin.settings.statusStyles[this.editIndex] = style;
        } else {
            this.plugin.settings.statusStyles.push(style);
        }
        await this.plugin.saveSettings();

        const noticeKey = this.editIndex !== null ? 'style_updated' : 'style_saved';
        new Notice(t(noticeKey).replace('{name}', name));

        // Notify caller to refresh
        this.onSave?.();

        this.close();
    }

    /**
     * Renders a card-selection section (title + description + grid of SVG cards).
     */
    private renderCardSection(
        parent: HTMLElement,
        titleKey: TranslationKey,
        options: { key: string; labelKey: TranslationKey; svg: string }[],
        currentValue: string,
        onChange: (key: string) => void
    ): void {
        const section = parent.createDiv({ cls: 'typify-card-section' });
        section.createDiv({ text: t(titleKey), cls: 'typify-card-section-title' });

        const grid = section.createDiv({ cls: 'typify-card-grid' });

        for (const opt of options) {
            const card = grid.createDiv({ cls: 'typify-fmt-card' });
            if (currentValue === opt.key) card.addClass('is-selected');

            const thumb = card.createDiv({ cls: 'typify-fmt-thumb' });
            insertSvg(thumb, opt.svg);

            card.createEl('span', { text: t(opt.labelKey), cls: 'typify-fmt-label' });

            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', t(opt.labelKey));

            const selectCard = () => {
                grid.findAll('.typify-fmt-card').forEach(c => { c.removeClass('is-selected'); });
                card.addClass('is-selected');
                onChange(opt.key);
            };

            card.addEventListener('click', selectCard);
            card.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectCard();
                }
            });
        }
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
