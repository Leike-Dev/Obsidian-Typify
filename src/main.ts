import { Plugin, getIcon, Notice } from 'obsidian';
import { CustomStatusIconsSettings, DEFAULT_SETTINGS, StatusStyle } from './types';
import { generatePalette } from './utils';
import { CustomStatusIconsSettingTab } from './settings';
import { CustomIconsManager } from './custom-icons';
import { t } from './lang/helpers';

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
    customIconsManager: CustomIconsManager;
    private cachedTargetProps: string[] | null = null;
    private debounceTimeout: ReturnType<typeof setTimeout> | null = null;
    private styleCache: Map<string, { cssVars: Record<string, string>, iconUrl: string | null }> = new Map();

    /**
     * Called when the plugin is loaded.
     * Initializes settings, registers the settings tab, and sets up the MutationObserver.
     */
    async onload() {
        await this.loadSettings();

        // Initialize custom icons manager (cache loaded once, sync access later)
        this.customIconsManager = new CustomIconsManager(this.app, this.manifest.id);
        if (this.settings.enableCustomIcons) {
            await this.customIconsManager.initialize();

            // Check for missing custom icons referenced by saved styles
            const missingIcons = this.settings.statusStyles
                .filter(s => s.icon?.startsWith('custom:'))
                .filter(s => !this.customIconsManager.getSvgDataUri(s.icon.replace('custom:', '')));

            if (missingIcons.length > 0) {
                const names = missingIcons.map(s => s.icon.replace('custom:', '')).join(', ');
                new Notice(t('custom_icons_missing').replace('{count}', String(missingIcons.length)).replace('{names}', names));
            }
        }

        this.addSettingTab(new CustomStatusIconsSettingTab(this.app, this));

        const processNode = (node: Node) => {
            if (!(node instanceof HTMLElement)) return;

            const targetProps = this.getTargetProperties();

            // ============================================
            // CONTEXT 1: Metadata Properties
            // ============================================
            const propertyRows = node.findAll('.metadata-property');

            propertyRows.forEach(row => {
                const propertyKey = row.getAttribute('data-property-key');
                if (!propertyKey || !targetProps.includes(propertyKey.toLowerCase())) return;

                const pills = row.findAll('.multi-select-pill');
                pills.forEach((pill: Element) => this.processPill(pill, propertyKey));
            });

            // ============================================
            // CONTEXT 2: Bases Plugin (Table View)
            // ============================================
            const basesCells = node.findAll('.bases-td');

            basesCells.forEach(cell => {
                const dataProperty = cell.getAttribute('data-property');
                // Bases property format: "note.status"
                if (!dataProperty) return;

                const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                if (!match) return;

                const pills = cell.findAll('.multi-select-pill');
                pills.forEach((pill: Element) => this.processPill(pill, match));
            });

            // ============================================
            // CONTEXT 3: Bases Plugin (Cards View)
            // ============================================
            const basesCardsProperties = node.findAll('.bases-cards-property');

            basesCardsProperties.forEach(prop => {
                const dataProperty = prop.getAttribute('data-property');
                if (!dataProperty) return;

                const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                if (!match) return;

                const valueElements = prop.findAll('.value-list-element');
                valueElements.forEach((el: Element) => this.processValueListElement(el, match));
            });

            // ============================================
            // Check if node itself is a pill or value-list-element
            // ============================================
            if (node.classList?.contains('multi-select-pill')) {
                // Check Metadata Property context
                const metadataProperty = node.closest('.metadata-property');
                if (metadataProperty) {
                    const propertyKey = metadataProperty.getAttribute('data-property-key');
                    if (propertyKey && targetProps.includes(propertyKey.toLowerCase())) {
                        this.processPill(node, propertyKey);
                        return;
                    }
                }

                // Check Bases table context
                const basesCell = node.closest('.bases-td');
                if (basesCell) {
                    const dataProperty = basesCell.getAttribute('data-property');
                    if (dataProperty) {
                        const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                        if (match) {
                            this.processPill(node, match);
                        }
                    }
                }
            }

            // Check if node itself is a value-list-element (Bases Cards)
            if (node.classList?.contains('value-list-element')) {
                const basesCardsProp = node.closest('.bases-cards-property');
                if (basesCardsProp) {
                    const dataProperty = basesCardsProp.getAttribute('data-property');
                    if (dataProperty) {
                        const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                        if (match) {
                            this.processValueListElement(node, match);
                        }
                    }
                }
            }
        };

        // Debounce function to avoid excessive processing
        const debouncedRefresh = () => {
            if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
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
                    // IGNORE changes to attributes we control to prevent infinite loops
                    if (mutation.target instanceof HTMLElement) {
                        if (
                            (mutation.target.classList.contains('multi-select-pill') ||
                                mutation.target.classList.contains('value-list-element') ||
                                mutation.target.classList.contains('custom-status-icon-pill') ||
                                mutation.target.classList.contains('custom-status-icon-value')) &&
                            (mutation.attributeName === 'data-value' ||
                                mutation.attributeName === 'data-property-key' ||
                                mutation.attributeName === 'style' ||
                                mutation.attributeName === 'class')
                        ) {
                            return; // Skip this mutation
                        }
                    }
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
    }

    /**
     * Manually triggers processing of all relevant containers in the DOM.
     * Use this when layout changes or view updates occur.
     */
    refreshProcessing() {
        // ============================================
        // CONTEXT 1: Metadata Properties
        // ============================================
        const metadataContainers = document.body.findAll('.metadata-container');
        metadataContainers.forEach(container => {
            this.processMetadataContainer(container);
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
        const basesViews = document.body.findAll('.bases-view');
        basesViews.forEach(view => {
            this.processBasesView(view);
            this.processBasesCardsView(view);
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
     * @param propertyKey The property key (e.g., 'status') this pill belongs to.
     */
    processPill(pill: Element, propertyKey: string) {
        if (!(pill instanceof HTMLElement)) return;

        // Always ensure property key is set for reference
        if (pill.getAttribute('data-property-key') !== propertyKey) {
            pill.setAttribute('data-property-key', propertyKey);
        }

        const content = pill.querySelector('.multi-select-pill-content');
        const value = content?.textContent?.trim() || '';

        // Update data-value
        if (pill.getAttribute('data-value') !== value) {
            pill.setAttribute('data-value', value);
        }

        // Find and apply style
        const style = this.findMatchingStyle(value, propertyKey);
        if (style) {
            pill.classList.add('custom-status-icon-pill');
            this.applyStyle(pill, style);
        } else {
            pill.classList.remove('custom-status-icon-pill');
            this.clearStyle(pill);
        }
    }

    /**
     * Processes a value element in the Bases Cards view.
     * @param element The DOM element representing the value.
     * @param propertyKey The property key this element belongs to.
     */
    processValueListElement(element: Element, propertyKey: string) {
        if (!(element instanceof HTMLElement)) return;

        if (element.getAttribute('data-property-key') !== propertyKey) {
            element.setAttribute('data-property-key', propertyKey);
        }

        // Get the text content directly (excluding nested tags like <a class="tag"> if any, though usually text node)
        // For safety, just use textContent of the element itself
        const value = element.textContent?.trim() || '';

        if (element.getAttribute('data-value') !== value) {
            element.setAttribute('data-value', value);
        }

        const style = this.findMatchingStyle(value, propertyKey);
        if (style) {
            element.classList.add('custom-status-icon-value');
            this.applyStyle(element, style);
        } else {
            element.classList.remove('custom-status-icon-value');
            this.clearStyle(element);
        }
    }

    /**
     * Finds the most specific matching style for a given value and property.
     */
    private findMatchingStyle(value: string, propertyKey: string): StatusStyle | undefined {
        // 1. Exact match with scope
        let match = this.settings.statusStyles.find(
            s => s.name.toLowerCase() === value.toLowerCase() &&
                s.appliesTo && s.appliesTo.includes(propertyKey)
        );

        if (match) return match;

        // 2. Exact match global (no scope or empty scope)
        match = this.settings.statusStyles.find(
            s => s.name.toLowerCase() === value.toLowerCase() &&
                (!s.appliesTo || s.appliesTo.length === 0)
        );

        return match;
    }

    /**
     * Applies the calculated styles and variables to the element.
     */
    private applyStyle(el: HTMLElement, style: StatusStyle) {
        const data = this.getStyleData(style);
        const styles: Record<string, string | null> = {};

        // Collect CSS variables
        Object.entries(data.cssVars).forEach(([key, val]) => {
            styles[key] = val;
        });

        // Collect Icon variables
        if (data.iconUrl) {
            styles['--pill-icon-url'] = data.iconUrl;
            styles['--pill-icon-display'] = 'inline-block';
        } else {
            styles['--pill-icon-url'] = null;
            styles['--pill-icon-display'] = null;
        }

        this.setCssStyles(el, styles);
    }

    /**
     * Helper to set multiple CSS properties on an element.
     * Abstracts direct style manipulation and handles removals.
     */
    private setCssStyles(el: HTMLElement, styles: Record<string, string | null>) {
        Object.entries(styles).forEach(([key, val]) => {
            if (val === null) {
                if (el.style.getPropertyValue(key)) {
                    el.style.removeProperty(key);
                }
            } else {
                if (el.style.getPropertyValue(key) !== val) {
                    el.style.setProperty(key, val);
                }
            }
        });
    }

    /**
     * Clears custom styles from the element.
     */
    private clearStyle(el: HTMLElement) {
        const stylesToClear: Record<string, string | null> = {};
        [
            '--pill-light-bg', '--pill-light-text', '--pill-light-bg-hover', '--pill-light-text-hover', '--pill-light-border',
            '--pill-dark-bg', '--pill-dark-text', '--pill-dark-bg-hover', '--pill-dark-text-hover', '--pill-dark-border',
            '--pill-radius', '--pill-icon-url', '--pill-icon-display'
        ].forEach(prop => {
            stylesToClear[prop] = null;
        });

        this.setCssStyles(el, stylesToClear);
    }

    /**
     * Generates or retrieves cached CSS variables and icon data.
     */
    private getStyleData(style: StatusStyle): { cssVars: Record<string, string>, iconUrl: string | null } {
        if (this.styleCache.has(style.name)) {
            return this.styleCache.get(style.name);
        }

        const palette = generatePalette(style.baseColor);
        const isRectangle = style.shape === 'rectangle';
        const pillRadius = isRectangle ? '4px' : 'var(--tag-radius, 14px)';

        const cssVars: Record<string, string> = {
            '--pill-light-bg': palette.light.bg,
            '--pill-light-text': palette.light.text,
            '--pill-light-bg-hover': palette.light.bgHover,
            '--pill-light-text-hover': palette.light.textHover,
            '--pill-light-border': palette.light.border,
            '--pill-dark-bg': palette.dark.bg,
            '--pill-dark-text': palette.dark.text,
            '--pill-dark-bg-hover': palette.dark.bgHover,
            '--pill-dark-text-hover': palette.dark.textHover,
            '--pill-dark-border': palette.dark.border,
            '--pill-radius': pillRadius
        };

        // Icon generation
        let iconUrl: string | null = null;
        if (style.icon && style.icon.startsWith('custom:')) {
            const iconName = style.icon.replace('custom:', '');
            // We need to access customIconsManager. It is initialized in onload.
            if (this.customIconsManager) {
                iconUrl = this.customIconsManager.getSvgDataUri(iconName);
            }
            if (!iconUrl) {
                // Fallback square
                const fallbackEl = getIcon('square');
                if (fallbackEl) {
                    const svg = fallbackEl.outerHTML.replace(/currentColor/g, 'black');
                    iconUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
                }
            }
        } else if (style.icon) {
            const iconEl = getIcon(style.icon);
            if (iconEl) {
                const svgString = iconEl.outerHTML.replace(/currentColor/g, 'black');
                const encodedSvg = encodeURIComponent(svgString);
                iconUrl = `url("data:image/svg+xml;charset=utf-8,${encodedSvg}")`;
            }
        }

        const data = { cssVars, iconUrl };
        this.styleCache.set(style.name, data);
        return data;
    }

    // ============================================
    // Metadata Properties: Find pills in property rows
    // ============================================
    /**
     * Scans a metadata container for property rows that match the target property.
     * @param container The metadata container element.
     */
    processMetadataContainer(container: HTMLElement) {
        const targetProps = this.getTargetProperties();

        const propertyRows = container.findAll('.metadata-property');
        propertyRows.forEach(row => {
            const propertyKey = row.getAttribute('data-property-key');
            if (!propertyKey || !targetProps.includes(propertyKey.toLowerCase())) return;

            const pills = row.findAll('.multi-select-pill');
            pills.forEach(pill => this.processPill(pill, propertyKey));
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
        const targetProps = this.getTargetProperties();

        const cells = view.findAll('.bases-td');

        cells.forEach(cell => {
            const dataProperty = cell.getAttribute('data-property');
            if (!dataProperty) return;

            const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
            if (!match) return;

            const pills = cell.findAll('.multi-select-pill');
            pills.forEach(pill => this.processPill(pill, match));
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
        const targetProps = this.getTargetProperties();

        const cardsProperties = view.findAll('.bases-cards-property');

        cardsProperties.forEach(prop => {
            const dataProperty = prop.getAttribute('data-property');
            if (!dataProperty) return;

            const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
            if (!match) return;

            const valueElements = prop.findAll('.value-list-element');
            valueElements.forEach(el => this.processValueListElement(el, match));
        });
    }



    /**
     * Called when the plugin is disabled.
     * Cleans up observers and removes injected classes/attributes from the DOM.
     */
    onunload() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
        if (this.observer) {
            this.observer.disconnect();
        }
        // Remove custom classes when plugin is disabled
        document.body.findAll('.custom-status-icon-pill').forEach(el => {
            el.classList.remove('custom-status-icon-pill');
            el.removeAttribute('data-value');
            el.removeAttribute('data-property-key');
        });
        document.body.findAll('.custom-status-icon-value').forEach(el => {
            el.classList.remove('custom-status-icon-value');
            el.removeAttribute('data-value');
            el.removeAttribute('data-property-key');
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        this.cachedTargetProps = null; // Invalidate cache
        this.styleCache.clear(); // Invalidate style cache
        await this.saveData(this.settings);
        this.refreshProcessing();
    }

    /**
     * Returns the parsed target properties, using cache for efficiency.
     */
    getTargetProperties(): string[] {
        if (!this.cachedTargetProps) {
            this.cachedTargetProps = this.settings.targetProperty
                .split(',')
                .map(p => p.trim().toLowerCase())
                .filter(p => p.length > 0);
        }
        return this.cachedTargetProps;
    }


}
