import { getIcon } from 'obsidian';
import TypifyPlugin from './main';
import { generatePalette } from './utils';

export class StyleManager {
    private plugin: TypifyPlugin;
    private styleElement: HTMLStyleElement | null = null;
    // O(1) Lookup cache: key = value.toLowerCase() + '|' + propertyKey
    private fastLookupMap: Map<string, string> = new Map();
    // Cache for global fallbacks: key = value.toLowerCase()
    private globalFallbackMap: Map<string, string> = new Map();

    constructor(plugin: TypifyPlugin) {
        this.plugin = plugin;
    }

    /**
     * Builds the global CSS and the O(1) lookup dictionary.
     * Should be called on load and on save settings.
     */
    buildCache() {
        this.fastLookupMap.clear();
        this.globalFallbackMap.clear();

        if (this.styleElement) {
            this.styleElement.remove();
        }

        this.styleElement = createEl('style');
        this.styleElement.id = 'typify-dynamic-styles';
        activeDocument.head.appendChild(this.styleElement);

        let cssContent = '';
        const styles = this.plugin.settings.statusStyles;

        styles.forEach((style, index) => {
            const className = `typify-style-${index}`;
            const valueKey = style.name.toLowerCase();

            // Populate O(1) Dictionaries
            if (style.appliesTo && style.appliesTo.length > 0) {
                style.appliesTo.forEach(prop => {
                    this.fastLookupMap.set(`${valueKey}|${prop.toLowerCase()}`, className);
                });
            } else {
                this.globalFallbackMap.set(valueKey, className);
            }

            // Generate CSS
            const palette = generatePalette(style.baseColor, style.colorMode || 'subtle');
            const pillRadius = style.shape === 'flat' ? '0px' : style.shape === 'rectangle' ? '4px' : 'var(--tag-radius, 14px)';

            let iconUrl: string | null = null;
            if (style.icon && style.icon.startsWith('custom:')) {
                const iconName = style.icon.replace('custom:', '');
                if (this.plugin.customIconsManager) {
                    iconUrl = this.plugin.customIconsManager.getSvgDataUri(iconName);
                }
                if (!iconUrl) {
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

            cssContent += `
body .${className} {
    --pill-light-bg: ${palette.light.bg};
    --pill-light-text: ${palette.light.text};
    --pill-light-bg-hover: ${palette.light.bgHover};
    --pill-light-text-hover: ${palette.light.textHover};
    --pill-light-border: ${palette.light.border};
    
    --pill-dark-bg: ${palette.dark.bg};
    --pill-dark-text: ${palette.dark.text};
    --pill-dark-bg-hover: ${palette.dark.bgHover};
    --pill-dark-text-hover: ${palette.dark.textHover};
    --pill-dark-border: ${palette.dark.border};
    
    --pill-radius: ${pillRadius};
`;
            if (iconUrl) {
                cssContent += `
    --pill-icon-url: ${iconUrl};
    --pill-icon-display: inline-block;
`;
            }
            cssContent += `}\n`;
        });

        this.styleElement.textContent = cssContent;
    }

    /**
     * Finds the matched class name in O(1) time.
     */
    findMatchingClass(value: string, propertyKey: string): string | undefined {
        const valLower = value.toLowerCase();
        const propLower = propertyKey.toLowerCase();
        
        // 1. Exact match with scope
        const scopedMatch = this.fastLookupMap.get(`${valLower}|${propLower}`);
        if (scopedMatch) return scopedMatch;

        // 2. Exact match global
        return this.globalFallbackMap.get(valLower);
    }

    /**
     * Applies the class to the element and removes old ones.
     */
    applyStyle(el: HTMLElement, className: string) {
        this.clearStyle(el);
        el.classList.add(className);
    }

    /**
     * Removes any existing typify dynamic classes from the element.
     */
    clearStyle(el: HTMLElement) {
        const classesToRemove: string[] = [];
        el.classList.forEach(cls => {
            if (cls.startsWith('typify-style-')) {
                classesToRemove.push(cls);
            }
        });
        if (classesToRemove.length > 0) {
            el.classList.remove(...classesToRemove);
        }
    }

    /**
     * Cleans up the injected stylesheet on unload.
     */
    cleanup() {
        if (this.styleElement) {
            this.styleElement.remove();
            this.styleElement = null;
        }
        this.fastLookupMap.clear();
        this.globalFallbackMap.clear();
    }
}
