import { Plugin, getIcon } from 'obsidian';
import { CustomStatusIconsSettings, DEFAULT_SETTINGS } from './types';
import { generatePalette, sanitizeCssSelector } from './utils';
import { CustomStatusIconsSettingTab } from './settings';

// ============================================================================
// MAIN PLUGIN CLASS
// ============================================================================

/**
 * Main Plugin Class.
 * Handles the lifecycle of the plugin, settings management, and DOM observation.
 */
export default class TypifyPlugin extends Plugin {
    settings: CustomStatusIconsSettings;
    observer: MutationObserver;

    /**
     * Called when the plugin is loaded.
     * Initializes settings, registers the settings tab, and sets up the MutationObserver.
     */
    async onload() {
        await this.loadSettings();

        this.addSettingTab(new CustomStatusIconsSettingTab(this.app, this));

        const processNode = (node: Node) => {
            if (!(node instanceof HTMLElement)) return;

            // ============================================
            // CONTEXT 1: Metadata Properties
            // ============================================
            const propertyRows: NodeListOf<Element> | never[] = node.querySelectorAll
                ? node.querySelectorAll('.metadata-property')
                : [];

            propertyRows.forEach(row => {
                const propertyKey = row.getAttribute('data-property-key');
                if (propertyKey?.toLowerCase() !== this.settings.targetProperty.toLowerCase()) return;

                const pills = row.querySelectorAll('.multi-select-pill');
                pills.forEach((pill: Element) => this.processPill(pill));
            });

            // ============================================
            // CONTEXT 2: Bases Plugin (Table View)
            // ============================================
            const basesPropertyName = `note.${this.settings.targetProperty}`.toLowerCase();
            const basesCells: NodeListOf<Element> | never[] = node.querySelectorAll
                ? node.querySelectorAll('.bases-td')
                : [];

            basesCells.forEach(cell => {
                const dataProperty = cell.getAttribute('data-property');
                if (dataProperty?.toLowerCase() !== basesPropertyName) return;

                const pills = cell.querySelectorAll('.multi-select-pill');
                pills.forEach((pill: Element) => this.processPill(pill));
            });

            // ============================================
            // CONTEXT 3: Bases Plugin (Cards View)
            // ============================================
            const basesCardsProperties: NodeListOf<Element> | never[] = node.querySelectorAll
                ? node.querySelectorAll('.bases-cards-property')
                : [];

            basesCardsProperties.forEach(prop => {
                const dataProperty = prop.getAttribute('data-property');
                if (dataProperty?.toLowerCase() !== basesPropertyName) return;

                const valueElements = prop.querySelectorAll('.value-list-element');
                valueElements.forEach((el: Element) => this.processValueListElement(el));
            });

            // ============================================
            // Check if node itself is a pill or value-list-element
            // ============================================
            if (node.classList?.contains('multi-select-pill')) {
                // Check Metadata Property context
                const metadataProperty = node.closest('.metadata-property');
                if (metadataProperty) {
                    const propertyKey = metadataProperty.getAttribute('data-property-key');
                    if (propertyKey?.toLowerCase() === this.settings.targetProperty.toLowerCase()) {
                        this.processPill(node);
                        return;
                    }
                }

                // Check Bases table context
                const basesCell = node.closest('.bases-td');
                if (basesCell) {
                    const dataProperty = basesCell.getAttribute('data-property');
                    if (dataProperty?.toLowerCase() === basesPropertyName) {
                        this.processPill(node);
                    }
                }
            }

            // Check if node itself is a value-list-element (Bases Cards)
            if (node.classList?.contains('value-list-element')) {
                const basesCardsProp = node.closest('.bases-cards-property');
                if (basesCardsProp) {
                    const dataProperty = basesCardsProp.getAttribute('data-property');
                    if (dataProperty?.toLowerCase() === basesPropertyName) {
                        this.processValueListElement(node);
                    }
                }
            }
        };

        // Debounce function to avoid excessive processing
        let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
        const debouncedRefresh = () => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                this.refreshProcessing();
            }, 100);
        };

        this.observer = new MutationObserver((mutations) => {
            let needsRefresh = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => processNode(node));
                    needsRefresh = true;
                }
                if (mutation.type === 'attributes' || mutation.type === 'characterData') {
                    needsRefresh = true;
                }
                // Check Metadata container context
                if (mutation.target instanceof HTMLElement &&
                    (mutation.target.classList.contains('metadata-properties') ||
                        mutation.target.classList.contains('metadata-container') ||
                        mutation.target.closest('.metadata-container'))) {
                    processNode(mutation.target);
                    needsRefresh = true;
                }
                // Check Bases container context (both Table and Cards views)
                if (mutation.target instanceof HTMLElement &&
                    (mutation.target.classList.contains('bases-view') ||
                        mutation.target.classList.contains('bases-tbody') ||
                        mutation.target.classList.contains('bases-cards-container') ||
                        mutation.target.closest('.bases-view'))) {
                    processNode(mutation.target);
                    needsRefresh = true;
                }
            });
            if (needsRefresh) {
                debouncedRefresh();
            }
        });

        this.registerEvent(this.app.workspace.on('layout-change', () => {
            this.refreshProcessing();
        }));

        this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
            this.refreshProcessing();
        }));

        this.refreshProcessing();
        this.updateStyles();
    }

    /**
     * Manually triggers processing of all relevant containers in the DOM.
     * Use this when layout changes or view updates occur.
     */
    refreshProcessing() {
        // ============================================
        // CONTEXT 1: Metadata Properties
        // ============================================
        const metadataContainers = document.querySelectorAll('.metadata-container');
        metadataContainers.forEach(container => {
            this.processMetadataContainer(container as HTMLElement);
            this.observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        });

        // ============================================
        // CONTEXT 2: Bases Plugin (Table View)
        // ============================================
        const basesViews = document.querySelectorAll('.bases-view');
        basesViews.forEach(view => {
            this.processBasesView(view as HTMLElement);
            this.processBasesCardsView(view as HTMLElement);
            this.observer.observe(view, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        });
    }

    /**
     * Processes a single status, adding the custom class and data attribute.
     * @param pill The DOM element representing the status.
     */
    processPill(pill: Element) {
        if (pill.classList.contains('custom-status-icon-pill')) return;

        pill.classList.add('custom-status-icon-pill');

        const content = pill.querySelector('.multi-select-pill-content');
        if (content) {
            const value = content.textContent?.trim() || '';
            pill.setAttribute('data-value', value);
        }
    }

    // ============================================
    // Process value-list-element for Bases Cards View
    // ============================================
    /**
     * Processes a value element in the Bases Cards view.
     * @param element The DOM element representing the value.
     */
    processValueListElement(element: Element) {
        if (element.classList.contains('custom-status-icon-value')) return;

        element.classList.add('custom-status-icon-value');

        // Get the text content directly (excluding nested tags like <a class="tag">)
        const value = element.textContent?.trim() || '';
        element.setAttribute('data-value', value);
    }

    // ============================================
    // Metadata Properties: Find pills in property rows
    // ============================================
    /**
     * Scans a metadata container for property rows that match the target property.
     * @param container The metadata container element.
     */
    processMetadataContainer(container: HTMLElement) {
        const propertyRows = container.querySelectorAll('.metadata-property');
        propertyRows.forEach(row => {
            const propertyKey = row.getAttribute('data-property-key');
            if (propertyKey?.toLowerCase() !== this.settings.targetProperty.toLowerCase()) return;

            const pills = row.querySelectorAll('.multi-select-pill');
            pills.forEach(pill => this.processPill(pill));
        });
    }

    // ============================================
    // Bases Plugin: Find pills in table cells
    // ============================================
    /**
     * Scans a Bases Table View for cells that match the target property.
     * @param view The Bases view element.
     */
    processBasesView(view: HTMLElement) {
        const basesPropertyName = `note.${this.settings.targetProperty}`.toLowerCase();
        const cells = view.querySelectorAll('.bases-td');

        cells.forEach(cell => {
            const dataProperty = cell.getAttribute('data-property');
            if (dataProperty?.toLowerCase() !== basesPropertyName) return;

            const pills = cell.querySelectorAll('.multi-select-pill');
            pills.forEach(pill => this.processPill(pill));
        });
    }

    // ============================================
    // Bases Plugin Cards View: Find value-list-elements in cards
    // ============================================
    /**
     * Scans a Bases Cards View for properties that match the target property.
     * @param view The Bases view element.
     */
    processBasesCardsView(view: HTMLElement) {
        const basesPropertyName = `note.${this.settings.targetProperty}`.toLowerCase();
        const cardsProperties = view.querySelectorAll('.bases-cards-property');

        cardsProperties.forEach(prop => {
            const dataProperty = prop.getAttribute('data-property');
            if (dataProperty?.toLowerCase() !== basesPropertyName) return;

            const valueElements = prop.querySelectorAll('.value-list-element');
            valueElements.forEach(el => this.processValueListElement(el));
        });
    }

    // Keep old method name for backwards compatibility
    processContainer(container: HTMLElement) {
        this.processMetadataContainer(container);
    }

    /**
     * Called when the plugin is disabled.
     * Cleans up observers and removes injected classes/attributes from the DOM.
     */
    onunload() {
        if (this.observer) {
            this.observer.disconnect();
        }
        // Remove custom classes when plugin is disabled
        document.querySelectorAll('.custom-status-icon-pill').forEach(el => {
            el.classList.remove('custom-status-icon-pill');
            el.removeAttribute('data-value');
        });
        document.querySelectorAll('.custom-status-icon-value').forEach(el => {
            el.classList.remove('custom-status-icon-value');
            el.removeAttribute('data-value');
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.refreshProcessing();
        this.updateStyles();
    }

    /**
     * Generates and injects the dynamic CSS for user-defined status styles.
     * Creates a <style> element in the document head if it doesn't exist.
     */
    updateStyles() {
        // Find or create the style element
        let styleEl = document.getElementById('custom-status-icons-css') as HTMLStyleElement;
        if (!styleEl) {
            styleEl = document.head.createEl('style', {
                attr: { id: 'custom-status-icons-css' }
            });
        }

        let css = '/* Custom Status Icons - Dynamic Styles */\n\n';

        this.settings.statusStyles.forEach(style => {
            const palette = generatePalette(style.baseColor);

            // Sanitize name for CSS selector
            const safeName = sanitizeCssSelector(style.name);

            // Light Mode Colors
            css += `
body .multi-select-pill.custom-status-icon-pill[data-value="${safeName}" i] {
    --pill-background: ${palette.light.bg} !important;
    --pill-color: ${palette.light.text} !important;
    --pill-background-hover: ${palette.light.bgHover} !important;
    --pill-color-hover: ${palette.light.textHover} !important;
    --pill-border-color: ${palette.light.border} !important;
}
`;

            // Dark Mode Colors
            css += `
body.theme-dark .multi-select-pill.custom-status-icon-pill[data-value="${safeName}" i] {
    --pill-background: ${palette.dark.bg} !important;
    --pill-color: ${palette.dark.text} !important;
    --pill-background-hover: ${palette.dark.bgHover} !important;
    --pill-color-hover: ${palette.dark.textHover} !important;
    --pill-border-color: ${palette.dark.border} !important;
}
`;

            // ============================================
            // CONTEXT 3: Bases Cards View Colors
            // ============================================
            // Light Mode Colors
            css += `
.bases-view .bases-cards-container .bases-cards-property .value-list-element.custom-status-icon-value[data-value="${safeName}" i] {
    background: ${palette.light.bg} !important;
    color: ${palette.light.text} !important;
    border: 1px solid ${palette.light.border} !important;
    border-radius: 12px !important;
    padding: 2px 6px !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 4px !important;
}
.bases-view .bases-cards-container .bases-cards-property .value-list-element.custom-status-icon-value[data-value="${safeName}" i]:hover {
    background: ${palette.light.bgHover} !important;
    color: ${palette.light.textHover} !important;
}
`;

            // Dark Mode Colors
            css += `
body.theme-dark .bases-view .bases-cards-container .bases-cards-property .value-list-element.custom-status-icon-value[data-value="${safeName}" i] {
    background: ${palette.dark.bg} !important;
    color: ${palette.dark.text} !important;
    border: 1px solid ${palette.dark.border} !important;
}
body.theme-dark .bases-view .bases-cards-container .bases-cards-property .value-list-element.custom-status-icon-value[data-value="${safeName}" i]:hover {
    background: ${palette.dark.bgHover} !important;
    color: ${palette.dark.textHover} !important;
}
`;

            // Icon Mask for Pills and Cards
            const iconEl = getIcon(style.icon);
            if (iconEl) {
                // Get the SVG string and encode for data URI
                const svgString = iconEl.outerHTML.replace(/currentColor/g, 'black');
                const encodedSvg = encodeURIComponent(svgString);
                const dataUri = `url("data:image/svg+xml;charset=utf-8,${encodedSvg}")`;

                css += `
.multi-select-pill.custom-status-icon-pill[data-value="${safeName}" i] .multi-select-pill-content::before {
    content: '';
    -webkit-mask-image: ${dataUri} !important;
    mask-image: ${dataUri} !important;
    background-color: currentColor;
    border-radius: 0;
}
`;

                // Icon for Bases Cards View
                css += `
.bases-view .bases-cards-container .bases-cards-property .value-list-element.custom-status-icon-value[data-value="${safeName}" i]::before {
    content: '';
    display: inline-block;
    width: 14px;
    height: 14px;
    min-width: 14px;
    -webkit-mask-image: ${dataUri};
    mask-image: ${dataUri};
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
    background-color: currentColor;
}
`;
            }
        });

        styleEl.textContent = css;
    }
}
