// ============================================================================
// PALETTE SECTION — Renders the palette manager inside the settings dropdown
// ============================================================================

import { Setting, Notice } from 'obsidian';
import type TypifyPlugin from '../main';
import { t } from '../lang/helpers';
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
    new Setting(containerEl)
        .setName(t('palette_your_colors').toUpperCase())
        .setHeading()
        .settingEl.addClass('typify-palette-section-heading');

    const gridSetting = new Setting(containerEl);
    gridSetting.infoEl.remove(); // We just want the grid to span full width
    gridSetting.settingEl.addClass('typify-palette-grid-row');
    
    const grid = gridSetting.settingEl.createDiv({ cls: 'typify-palette-grid' });

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

    // Counter and Add All button row
    const counterRow = gridSetting.settingEl.createDiv({ cls: 'typify-palette-counter-row' });

    counterRow.createSpan({
        text: t('palette_saved_count')
            .replace('{count}', String(palette.length))
            .replace('{max}', String(MAX_PALETTE_COLORS)),
        cls: 'typify-palette-counter'
    });

    // Add all button (hidden until colors are generated)
    const addAllBtn = counterRow.createEl('button', { cls: 'typify-palette-add-all-btn is-hidden' });
    addAllBtn.textContent = `+ ${t('palette_add_all_button')}`;
    addAllBtn.addEventListener('click', () => {
        const remaining = MAX_PALETTE_COLORS - palette.length;
        if (remaining <= 0) {
            new Notice(t('palette_max_reached').replace('{max}', String(MAX_PALETTE_COLORS)));
            return;
        }
        // Ensure previewColors exists and has items
        if (!previewColors || previewColors.length === 0) return;
        
        const toAdd = previewColors.slice(0, remaining);
        palette.push(...toAdd);
        void plugin.saveSettings().then(onUpdate);
    });

    // ================================================================
    // GENERATE BY HARMONY
    // ================================================================
    new Setting(containerEl)
        .setName(t('palette_harmony_title').toUpperCase())
        .setHeading()
        .settingEl.addClass('typify-palette-section-heading');

    // State for harmony generation
    let selectedHarmony: HarmonyType = 'analogous';
    let previewColors: string[] = [];

    new Setting(containerEl)
        .setName(t('palette_harmony_heading'))
        .setDesc(t('palette_harmony_desc'))
        .addDropdown(dropdown => {
            dropdown.addOption('analogous', t('palette_harmony_analogous'));
            dropdown.addOption('complementary', t('palette_harmony_complementary'));
            dropdown.addOption('triadic', t('palette_harmony_triadic'));
            dropdown.addOption('random', t('palette_harmony_random'));
            dropdown.setValue(selectedHarmony);
            dropdown.onChange((value) => {
                selectedHarmony = value as HarmonyType;
            });
        })
        .addButton(btn => btn
            .setButtonText(`✦ ${t('palette_generate_button')}`)
            .setCta()
            .onClick(() => {
                const generator = HARMONY_GENERATORS[selectedHarmony];
                previewColors = generator(5);
                renderPreviewDots(previewRow, previewColors);
                addAllBtn.removeClass('is-hidden');
            }));

    const previewSetting = new Setting(containerEl);
    previewSetting.settingEl.addClass('typify-palette-preview-row');
    previewSetting.infoEl.remove(); // No need for title

    // Preview area (spans full width now)
    const previewRow = previewSetting.settingEl.createDiv({ cls: 'typify-palette-preview' });

    // ================================================================
    // DANGER ZONE (Clear)
    // ================================================================
    new Setting(containerEl)
        .setName(t('palette_clear_title'))
        .setDesc(t('palette_clear_desc'))
        .addButton(button => button
            .setButtonText(t('palette_clear_button'))
            .setWarning()
            .onClick(() => {
                if (palette.length === 0) return;
                // Ask for confirmation (optional, but good UX)
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
