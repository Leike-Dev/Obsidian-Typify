// ============================================================================
// PALETTE SECTION — Renders the palette manager inside the modal
// ============================================================================

import { Notice, setIcon } from 'obsidian';
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

const MAX_PALETTE_COLORS = 10;

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
    containerEl.createDiv({ text: t('palette_harmony_heading'), cls: 'typify-card-section-title' });



    // Card grid for harmony types
    const cardSection = containerEl.createDiv({ cls: 'typify-card-section typify-palette-card-section' });
    const cardGrid = cardSection.createDiv({ cls: 'typify-card-grid' });

    const harmonyOptions: { key: HarmonyType; labelKey: TranslationKey; svg: string }[] = [
        { key: 'shades',        labelKey: 'palette_harmony_shades',        svg: THUMB_SHADES },
        { key: 'analogous',     labelKey: 'palette_harmony_analogous',     svg: THUMB_ANALOGOUS },
        { key: 'complementary', labelKey: 'palette_harmony_complementary', svg: THUMB_COMPLEMENTARY },
        { key: 'random',        labelKey: 'palette_harmony_random',        svg: THUMB_RANDOM },
    ];

    let selectedHarmony: HarmonyType | null = null;
    let generateBtn: HTMLButtonElement;

    for (const opt of harmonyOptions) {
        const card = cardGrid.createDiv({ cls: 'typify-fmt-card' });

        const thumb = card.createDiv({ cls: 'typify-fmt-thumb' });
        // eslint-disable-next-line @microsoft/sdl/no-inner-html -- trusted static SVG constant
        thumb.innerHTML = opt.svg;

        card.createEl('span', { text: t(opt.labelKey), cls: 'typify-fmt-label' });

        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', t(opt.labelKey));

        const selectCard = () => {
            cardGrid.findAll('.typify-fmt-card').forEach(c => { c.removeClass('is-selected'); });
            card.addClass('is-selected');
            selectedHarmony = opt.key;

            // Enable Generate button instead of generating immediately
            if (generateBtn) {
                generateBtn.removeClass('is-disabled');
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

    // Base state for generation
    let baseColorHex = '#5347EB';

    // Preview box (always visible container)
    const previewContainer = containerEl.createDiv({ cls: 'typify-palette-preview-container' });
    const previewBox = previewContainer.createDiv({ cls: 'typify-palette-preview' });

    // Controls Row
    const controlsContainer = previewContainer.createDiv({ cls: 'typify-palette-actions-row' });

    // Declare a reference to the strip to update it later
    let swatchStrip: SwatchStrip | null = null;

    // 1. "Adicionar" button
    const addAllBtn = controlsContainer.createEl('button', {
        cls: 'typify-palette-add-all-btn is-disabled'
    });
    addAllBtn.textContent = t('palette_add_all_button');
    addAllBtn.addEventListener('click', () => {
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
        addAllBtn.addClass('is-disabled');

        void plugin.saveSettings().then(() => { 
            if (swatchStrip) swatchStrip.setColors(palette);
        });
    });

    // 2. "Gerar" button
    generateBtn = controlsContainer.createEl('button', {
        cls: 'typify-palette-generate-btn is-disabled mod-cta'
    });
    generateBtn.textContent = t('palette_generate_button');
    generateBtn.addEventListener('click', () => {
        if (!selectedHarmony) return;
        const generator = HARMONY_GENERATORS[selectedHarmony];
        previewColors = generator(5, baseColorHex);
        renderPreviewDots(previewBox, previewColors);
        addAllBtn.removeClass('is-disabled');
    });

    // 3. Color Picker
    const colorInputWrapper = controlsContainer.createDiv({ cls: 'csi-color-input-wrapper typify-palette-color-picker' });
    const colorInput = colorInputWrapper.createEl('input', { type: 'color' });
    colorInput.value = baseColorHex;
    colorInput.addEventListener('input', (e) => {
        baseColorHex = (e.target as HTMLInputElement).value;
    });

    // ================================================================
    // SECTION 2: YOUR COLORS
    // ================================================================
    const yourColorsSection = containerEl.createDiv();

    const refreshYourColors = () => {
        yourColorsSection.empty();

        const yourColorsRow = yourColorsSection.createDiv({ cls: 'typify-palette-your-colors-row' });
        const yourColorsLeft = yourColorsRow.createDiv({ cls: 'typify-palette-your-colors-left' });
        yourColorsLeft.createDiv({ text: t('palette_your_colors'), cls: 'typify-card-section-title' });
        
        const counterSpan = yourColorsLeft.createSpan({
            text: t('palette_saved_count')
                .replace('{count}', String(palette.length))
                .replace('{max}', String(MAX_PALETTE_COLORS)),
            cls: 'typify-palette-counter'
        });

        // Clear button inline with heading (only visible when there are colors)
        if (palette.length > 0) {
            const clearBtn = yourColorsRow.createEl('button', {
                cls: 'clickable-icon typify-palette-clear-btn',
                attr: { 'aria-label': t('palette_clear_tooltip') }
            });
            setIcon(clearBtn, 'trash-2');
            clearBtn.addEventListener('click', () => {
                palette.length = 0;
                void plugin.saveSettings().then(() => {
                    if (swatchStrip) swatchStrip.setColors(palette);
                    refreshYourColors();
                });
            });
        }

        // SwatchStrip container
        const stripContainer = yourColorsSection.createDiv();

        swatchStrip = new SwatchStrip(stripContainer, {
            colors: palette,
            maxColors: MAX_PALETTE_COLORS,
            onChange: (newColors) => {
                // Update internal palette and save
                palette.length = 0;
                palette.push(...newColors);
                counterSpan.setText(
                    t('palette_saved_count')
                        .replace('{count}', String(newColors.length))
                        .replace('{max}', String(MAX_PALETTE_COLORS))
                );
                void plugin.saveSettings();
                
                // If palette is empty, re-render to hide clear button
                if (palette.length === 0) {
                    refreshYourColors();
                }
            }
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
    for (const color of colors) {
        const dot = container.createDiv({ cls: 'typify-palette-preview-dot' });
        dot.style.backgroundColor = color;
    }
}
