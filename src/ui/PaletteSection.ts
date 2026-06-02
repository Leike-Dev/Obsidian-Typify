// ============================================================================
// PALETTE SECTION — Renders the palette manager inside the settings dropdown
// ============================================================================

import { Setting, Notice } from 'obsidian';
import type TypifyPlugin from '../main';
import { t, type TranslationKey } from '../lang/helpers';
import { HARMONY_GENERATORS, type HarmonyType } from './color-harmony';

const MAX_PALETTE_COLORS = 10;

/**
 * Renders the full palette management section inside a container element.
 * Includes: color grid, add button, harmony generator, and clear button.
 */
export function renderPaletteSection(
    containerEl: HTMLElement,
    plugin: TypifyPlugin,
    onUpdate: () => void
): void {
    const palette = plugin.settings.customPalette;

    // ================================================================
    // YOUR COLORS
    // ================================================================
    containerEl.createDiv({
        text: t('palette_your_colors'),
        cls: 'typify-palette-section-label'
    });

    const colorsContainer = containerEl.createDiv({ cls: 'typify-palette-colors-box' });
    const grid = colorsContainer.createDiv({ cls: 'typify-palette-grid' });

    // Render existing color cards
    for (let i = 0; i < palette.length; i++) {
        renderColorCard(grid, palette[i], () => {
            palette.splice(i, 1);
            void plugin.saveSettings().then(onUpdate);
        });
    }

    // Add button (if under limit)
    if (palette.length < MAX_PALETTE_COLORS) {
        const addCard = grid.createDiv({ cls: 'typify-palette-card typify-palette-add-card' });
        addCard.setAttribute('role', 'button');
        addCard.setAttribute('tabindex', '0');
        addCard.setAttribute('aria-label', t('palette_add_color'));

        // "+" icon area
        addCard.createDiv({ cls: 'typify-palette-add-icon', text: '+' });
        addCard.createEl('span', { text: t('palette_add_color'), cls: 'typify-palette-card-hex' });

        // Hidden color input
        const colorInput = addCard.createEl('input', { type: 'color' });
        colorInput.addClass('typify-palette-hidden-input');
        colorInput.value = '#6366f1';

        const openPicker = () => colorInput.click();
        addCard.addEventListener('click', openPicker);
        addCard.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openPicker();
            }
        });

        colorInput.addEventListener('change', () => {
            if (palette.length >= MAX_PALETTE_COLORS) {
                new Notice(t('palette_max_reached').replace('{max}', String(MAX_PALETTE_COLORS)));
                return;
            }
            palette.push(colorInput.value);
            void plugin.saveSettings().then(onUpdate);
        });
    }

    // Counter
    colorsContainer.createDiv({
        text: t('palette_saved_count')
            .replace('{count}', String(palette.length))
            .replace('{max}', String(MAX_PALETTE_COLORS)),
        cls: 'typify-palette-counter'
    });

    // ================================================================
    // GENERATE BY HARMONY
    // ================================================================
    containerEl.createDiv({
        text: t('palette_harmony_title'),
        cls: 'typify-palette-section-label'
    });

    const harmonyBox = containerEl.createDiv({ cls: 'typify-palette-harmony-box' });

    // State for harmony generation
    let selectedHarmony: HarmonyType = 'analogous';
    let previewColors: string[] = [];

    const harmonySetting = new Setting(harmonyBox)
        .setName(t('palette_harmony_heading'))
        .setDesc(t('palette_harmony_desc'));

    // Dropdown for harmony type
    harmonySetting.addDropdown(dropdown => {
        const harmonies: HarmonyType[] = ['analogous', 'complementary', 'triadic', 'random'];
        for (const h of harmonies) {
            dropdown.addOption(h, t(`palette_harmony_${h}` as TranslationKey));
        }
        dropdown.setValue(selectedHarmony);
        dropdown.onChange((value) => {
            selectedHarmony = value as HarmonyType;
        });
    });

    // Preview area
    const previewRow = harmonyBox.createDiv({ cls: 'typify-palette-preview' });

    // Buttons row
    const buttonsRow = harmonyBox.createDiv({ cls: 'typify-palette-harmony-buttons' });

    // Generate button
    const generateBtn = buttonsRow.createEl('button', { cls: 'mod-cta typify-palette-gen-btn' });
    generateBtn.textContent = `✦ ${t('palette_generate_button')}`;
    generateBtn.addEventListener('click', () => {
        const generator = HARMONY_GENERATORS[selectedHarmony];
        previewColors = generator(5);
        renderPreviewDots(previewRow, previewColors);
        addAllBtn.removeClass('is-hidden');
    });

    // Add all button (hidden until colors are generated)
    const addAllBtn = buttonsRow.createEl('button', { cls: 'typify-palette-add-all-btn is-hidden' });
    addAllBtn.textContent = `+ ${t('palette_add_all_button')}`;
    addAllBtn.addEventListener('click', () => {
        const remaining = MAX_PALETTE_COLORS - palette.length;
        if (remaining <= 0) {
            new Notice(t('palette_max_reached').replace('{max}', String(MAX_PALETTE_COLORS)));
            return;
        }
        const toAdd = previewColors.slice(0, remaining);
        palette.push(...toAdd);
        void plugin.saveSettings().then(onUpdate);
    });

    // ================================================================
    // CLEAR PALETTE
    // ================================================================
    new Setting(containerEl)
        .setName(t('palette_clear_title'))
        .setDesc(t('palette_clear_desc'))
        .addButton(btn => btn
            .setButtonText(t('palette_clear_button'))
            .setWarning()
            .onClick(() => {
                plugin.settings.customPalette = [];
                void plugin.saveSettings().then(onUpdate);
            }));
}

// ============================================================================
// HELPERS
// ============================================================================

/** Renders a single color card with hex label and remove button */
function renderColorCard(
    parent: HTMLElement,
    color: string,
    onRemove: () => void
): void {
    const card = parent.createDiv({ cls: 'typify-palette-card' });
    card.style.setProperty('--palette-color', color);

    // Color swatch
    const swatch = card.createDiv({ cls: 'typify-palette-swatch' });
    swatch.style.backgroundColor = color;

    // Hex label + remove button row
    const infoRow = card.createDiv({ cls: 'typify-palette-card-info' });
    infoRow.createEl('span', { text: color.substring(0, 4) + '…', cls: 'typify-palette-card-hex' });

    const removeBtn = infoRow.createEl('button', {
        cls: 'typify-palette-card-remove',
        attr: { 'aria-label': t('palette_remove_color') }
    });
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onRemove();
    });
}

/** Renders preview dots for generated harmony colors */
function renderPreviewDots(container: HTMLElement, colors: string[]): void {
    container.empty();
    for (const color of colors) {
        const dot = container.createDiv({ cls: 'typify-palette-preview-dot' });
        dot.style.backgroundColor = color;
    }
}
