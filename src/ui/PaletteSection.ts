// ============================================================================
// PALETTE SECTION — Renders the palette manager inside the modal
// ============================================================================

import { ColorComponent, ExtraButtonComponent, Notice, SettingGroup } from 'obsidian';
import type TypifyPlugin from '../main';
import { t, type TranslationKey } from '../lang/helpers';
import { HARMONY_GENERATORS, type HarmonyType } from './color-harmony';
import { SwatchStrip } from './swatch-strip';
import {
    THUMB_SHADES,
    THUMB_ANALOGOUS,
    THUMB_COMPLEMENTARY,
    THUMB_RANDOM
} from './format-thumbs';
import { insertSvg } from '../utils/svg-utils';

const MAX_PALETTE_COLORS = 15;

/**
 * Renders the full palette management section inside a container element.
 * Layout order: Generate palette (card grid + preview box) → Your colors (grid + clear).
 */
export function renderPaletteSection(
    containerEl: HTMLElement,
    plugin: TypifyPlugin
): void {
    const palette = plugin.settings.customPalette;

    // State for harmony generation
    let previewColors: string[] = [];

    // ================================================================
    // SECTION 1: GENERATE COLOR PALETTE
    // ================================================================
    const generateGroup = new SettingGroup(containerEl)
        .setHeading(t('palette_harmony_heading'));

    // Card grid for harmony types (custom DOM — Typify-specific UI)
    generateGroup.addSetting(setting => {
        setting.settingEl.empty();
        setting.settingEl.addClass('typify-card-setting', 'typify-palette-card-section');

        const cardGrid = setting.settingEl.createDiv({ cls: 'typify-card-grid' });

        const harmonyOptions: { key: HarmonyType; labelKey: TranslationKey; svg: string }[] = [
            { key: 'shades',        labelKey: 'palette_harmony_shades',        svg: THUMB_SHADES },
            { key: 'analogous',     labelKey: 'palette_harmony_analogous',     svg: THUMB_ANALOGOUS },
            { key: 'complementary', labelKey: 'palette_harmony_complementary', svg: THUMB_COMPLEMENTARY },
            { key: 'random',        labelKey: 'palette_harmony_random',        svg: THUMB_RANDOM },
        ];

        for (const opt of harmonyOptions) {
            const card = cardGrid.createDiv({ cls: 'typify-fmt-card' });

            const thumb = card.createDiv({ cls: 'typify-fmt-thumb' });
            insertSvg(thumb, opt.svg);

            card.createSpan({ text: t(opt.labelKey), cls: 'typify-fmt-label' });

            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', t(opt.labelKey));

            const selectCard = () => {
                cardGrid.findAll('.typify-fmt-card').forEach(c => { c.removeClass('is-selected'); });
                card.addClass('is-selected');
                selectedHarmony = opt.key;

                // Enable Generate button
                if (generateBtnComponent) {
                    generateBtnComponent.setDisabled(false);
                }
            };

            card.addEventListener('click', selectCard);
            card.addEventListener('keydown', (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    selectCard();
                }
            });
        }
    });

    // Base state for generation
    let baseColorHex = '#5347EB';
    let selectedHarmony: HarmonyType | null = null;
    let generateBtnComponent: ExtraButtonComponent | null = null;
    let addAllBtnComponent: ExtraButtonComponent | null = null;

    // Declare a reference to the strip to update it later
    let swatchStrip: SwatchStrip | null = null;
    let refreshYourColors: () => void;

    // Preview box + Controls (custom DOM inside a Setting)
    generateGroup.addSetting(setting => {
        setting.settingEl.empty();
        setting.settingEl.addClass('typify-card-setting');

        const previewContainer = setting.settingEl.createDiv({ cls: 'typify-palette-preview-container' });

        const previewBox = previewContainer.createDiv({ cls: 'typify-palette-preview' });
        renderPreviewDots(previewBox, previewColors); // render initial placeholder

        // Controls Row
        const controlsContainer = previewContainer.createDiv({ cls: 'typify-palette-actions-row' });
        const leftControls = controlsContainer.createDiv({ cls: 'typify-palette-actions-left' });
        const rightControls = controlsContainer.createDiv({ cls: 'typify-palette-actions-right' });

        // 1. "Adicionar" button (right)
        addAllBtnComponent = new ExtraButtonComponent(rightControls)
            .setIcon('plus')
            .setTooltip(t('palette_add_to_palette_aria'))
            .setDisabled(true)
            .onClick(() => {
                if (!previewColors || previewColors.length === 0) return;
                const remaining = MAX_PALETTE_COLORS - palette.length;
                if (remaining <= 0) {
                    new Notice(t('palette_max_reached').replace('{max}', String(MAX_PALETTE_COLORS)));
                    return;
                }
                const toAdd = previewColors.slice(0, remaining);
                palette.push(...toAdd);

                // Clear preview box after consuming colors
                previewColors = [];
                renderPreviewDots(previewBox, previewColors);
                addAllBtnComponent?.setDisabled(true);

                void plugin.saveSettings(false).then(() => {
                    if (refreshYourColors) refreshYourColors();
                });
            });
        addAllBtnComponent.extraSettingsEl.addClass('typify-palette-add-all-btn');

        // 2. Color Picker (left)
        const colorPickerWrapper = leftControls.createDiv({ cls: 'typify-palette-color-picker' });
        new ColorComponent(colorPickerWrapper)
            .setValue(baseColorHex)
            .onChange(value => {
                baseColorHex = value;
            });

        // 3. "Regenerar" button (left)
        generateBtnComponent = new ExtraButtonComponent(leftControls)
            .setIcon('refresh-cw')
            .setTooltip(t('palette_regenerate_aria'))
            .setDisabled(true)
            .onClick(() => {
                if (!selectedHarmony) return;
                const generator = HARMONY_GENERATORS[selectedHarmony];
                previewColors = generator(5, baseColorHex);
                renderPreviewDots(previewBox, previewColors);
                addAllBtnComponent?.setDisabled(false);
            });
        generateBtnComponent.extraSettingsEl.addClass('typify-palette-generate-btn');
    });



    // ================================================================
    // SECTION 2: YOUR COLORS
    // ================================================================
    let yourColorsGroup: SettingGroup;

    refreshYourColors = () => {
        // Re-create the entire group to properly manage heading extras
        if (yourColorsGroup) {
            // Remove old group DOM
            yourColorsGroup.listEl.parentElement?.remove();
        }

        const headingFrag = new DocumentFragment();
        headingFrag.appendText(t('palette_your_colors'));
        headingFrag.createDiv({
            text: t('palette_saved_count')
                .replace('{count}', String(palette.length))
                .replace('{max}', String(MAX_PALETTE_COLORS)),
            cls: 'setting-item-description typify-palette-counter'
        });

        yourColorsGroup = new SettingGroup(containerEl)
            .setHeading(headingFrag);

        // Clear button in the heading (only when there are colors)
        if (palette.length > 0) {
            yourColorsGroup.addExtraButton(btn => {
                btn.setIcon('trash-2')
                    .setTooltip(t('palette_clear_tooltip'))
                    .onClick(() => {
                        palette.length = 0;
                        void plugin.saveSettings(false).then(() => {
                            if (swatchStrip) swatchStrip.setColors(palette);
                            refreshYourColors();
                        });
                    });
                btn.extraSettingsEl.addClass('typify-palette-clear-btn');
            });
        }

        // SwatchStrip (custom DOM — Typify-specific component)
        yourColorsGroup.addSetting(setting => {
            setting.settingEl.empty();
            setting.settingEl.addClass('typify-card-setting');

            const stripContainer = setting.settingEl.createDiv();

            swatchStrip = new SwatchStrip(stripContainer, {
                colors: palette,
                maxColors: MAX_PALETTE_COLORS,
                onChange: (newColors) => {
                    // Update internal palette and save
                    palette.length = 0;
                    palette.push(...newColors);
                    // Update counter text
                    const counter = yourColorsGroup.listEl.parentElement?.querySelector('.typify-palette-counter');
                    if (counter) {
                        counter.setText(
                            t('palette_saved_count')
                                .replace('{count}', String(newColors.length))
                                .replace('{max}', String(MAX_PALETTE_COLORS))
                        );
                    }
                    void plugin.saveSettings(false);

                    // If palette is empty, re-render to hide clear button
                    if (palette.length === 0) {
                        refreshYourColors();
                    }
                }
            });
        });
    };

    refreshYourColors();
}

// ============================================================================
// HELPERS
// ============================================================================

/** Renders preview dots for generated harmony colors */
function renderPreviewDots(container: HTMLElement, colors: string[]): void {
    container.empty();

    if (!colors || colors.length === 0) {
        for (let i = 0; i < 5; i++) {
            const seg = container.createDiv({ cls: 'typify-palette-preview-seg' });
            const percentage = 15 + (i * 15);
            seg.style.backgroundColor = `color-mix(in srgb, var(--text-normal) ${percentage}%, transparent)`;
        }
        return;
    }

    for (const color of colors) {
        const seg = container.createDiv({ cls: 'typify-palette-preview-seg' });
        seg.style.backgroundColor = color;
    }
}
