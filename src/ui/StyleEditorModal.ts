import { App, Modal, Notice, Setting, setIcon } from 'obsidian';
import type TypifyPlugin from '../main';
import { StatusStyle, DEFAULT_STATUS_COLOR } from '../types';
import { IconPickerModal } from '../icon-picker';
import { generatePalette } from '../utils';
import { t } from '../lang/helpers';

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
    private shape: 'pill' | 'rectangle' | 'flat' = 'pill';

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
        }
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        // Header
        this.setTitle(this.editIndex !== null ? t('edit_style_title') : t('create_style_title'));
        this.modalEl.addClass('mod-confirmation');

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

        // Base Color
        new Setting(contentEl)
            .setName(t('base_color_title'))
            .addColorPicker(color => {
                color.setValue(this.baseColor);
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
            btn.buttonEl.addClass('csi-btn-remove-icon');
            btn.onClick(() => {
                this.icon = '';
                this.renderIconButton();
                this.updatePreview();
            });
        });

        // ============================================================
        // SHAPE
        // ============================================================
        new Setting(contentEl)
            .setName(t('shape_title'))
            .addDropdown(dropdown => {
                dropdown.addOption('pill', t('shape_pill'));
                dropdown.addOption('rectangle', t('shape_rectangle'));
                dropdown.addOption('flat', t('shape_flat'));
                dropdown.setValue(this.shape);
                dropdown.onChange(value => {
                    this.shape = value as 'pill' | 'rectangle' | 'flat';
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
                const initialValue = (this.appliesTo.length > 0) ? this.appliesTo[0] : 'all';
                // Fallback to 'all' if the saved value is not an available dropdown option
                const validValue = properties.includes(initialValue) ? initialValue : 'all';
                dropdown.setValue(validValue);
                dropdown.onChange(value => {
                    this.appliesTo = value === 'all' ? [] : [value];
                });
            });

        // ============================================================
        // PREVIEW
        // ============================================================
        const previewContainer = contentEl.createDiv({ cls: 'csi-preview-card' });

        // Light preview
        const lightWrapper = previewContainer.createDiv({ cls: 'csi-preview-wrapper csi-preview-light' });
        lightWrapper.createDiv({ text: t('preview_light_context'), cls: 'csi-preview-label' });
        this.previewPillLight = lightWrapper.createSpan({ cls: 'csi-preview-pill' });

        // Dark preview
        const darkWrapper = previewContainer.createDiv({ cls: 'csi-preview-wrapper csi-preview-dark' });
        darkWrapper.createDiv({ text: t('preview_dark_context'), cls: 'csi-preview-label' });
        this.previewPillDark = darkWrapper.createSpan({ cls: 'csi-preview-pill' });

        this.updatePreview();

        // ============================================================
        // FOOTER BUTTONS
        // ============================================================
        const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });

        const saveBtn = buttonContainer.createEl('button', { text: t('save_button'), cls: 'mod-cta' });
        saveBtn.addEventListener('click', () => { void this.handleSave(); });

        const cancelBtn = buttonContainer.createEl('button', { text: t('cancel_button'), cls: 'mod-cancel' });
        cancelBtn.addEventListener('click', () => this.close());
    }

    /**
     * Renders the icon button content based on current icon state.
     */
    private renderIconButton(): void {
        if (!this.iconBtnEl) return;
        this.iconBtnEl.empty();

        if (this.icon) {
            if (this.icon.startsWith('custom:')) {
                const name = this.icon.replace('custom:', '');
                const svgContent = this.plugin.customIconsManager?.getSvgContent(name);
                if (svgContent) {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                    const svg = doc.documentElement;
                    if (svg instanceof SVGElement) {
                        this.iconBtnEl.empty();
                        this.iconBtnEl.appendChild(svg);
                    }
                } else {
                    setIcon(this.iconBtnEl, 'image');
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

        const palette = generatePalette(this.baseColor);
        const displayName = this.styleName || t('new_status_name');

        // Light pill
        this.previewPillLight.empty();
        this.previewPillLight.setText(displayName);
        const previewRadius = this.shape === 'flat' ? '0px' : this.shape === 'rectangle' ? '4px' : '10px';
        this.previewPillLight.setCssStyles({
            backgroundColor: palette.light.bg,
            color: palette.light.text,
            border: `1px solid ${palette.light.border}`,
            borderRadius: previewRadius
        });

        // Dark pill
        this.previewPillDark.empty();
        this.previewPillDark.setText(displayName);
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
        iconSpan.setCssStyles({
            display: 'inline-flex',
            alignItems: 'center',
            width: '14px',
            height: '14px',
            marginRight: '4px',
            flexShrink: '0'
        });

        if (this.icon.startsWith('custom:')) {
            const name = this.icon.replace('custom:', '');
            const svgContent = this.plugin.customIconsManager?.getSvgContent(name);
            if (svgContent) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svgEl = doc.documentElement;
                if (svgEl instanceof SVGElement) {
                    iconSpan.empty();
                    iconSpan.appendChild(svgEl);
                    svgEl.setCssStyles({ width: '14px', height: '14px' });
                }
            }
        } else {
            setIcon(iconSpan, this.icon);
            const svg = iconSpan.querySelector('svg');
            if (svg) {
                svg.setCssStyles({ width: '14px', height: '14px' });
            }
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

        // Create the style object
        const style: StatusStyle = {
            name: name,
            baseColor: this.baseColor,
            icon: this.icon
        };

        // Only add appliesTo if scoped
        if (this.appliesTo.length > 0) {
            style.appliesTo = this.appliesTo;
        }

        // Only add shape if not the default
        if (this.shape !== 'pill') {
            style.shape = this.shape;
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

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
