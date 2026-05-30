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
    // Display info cache: className → { name, hasMatchValue }
    private styleInfoMap: Map<string, { name: string; hasMatchValue: boolean }> = new Map();

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
        this.styleInfoMap.clear();

        if (this.styleElement) {
            this.styleElement.remove();
        }

        this.styleElement = createEl('style');
        this.styleElement.id = 'typify-dynamic-styles';
        activeDocument.head.appendChild(this.styleElement);

        let cssContent = '';
        const styles = this.plugin.settings.statusStyles;

        // 1. Image Deduplication in :root
        const uniqueImages = new Set<string>();
        styles.forEach(style => {
            if (style.icon && style.icon.startsWith('img:')) {
                uniqueImages.add(style.icon.replace('img:', ''));
            }
        });

        if (uniqueImages.size > 0) {
            cssContent += `:root {\n`;
            uniqueImages.forEach(imgName => {
                const dataUri = this.plugin.customImagesManager?.getImageDataUri(imgName);
                if (dataUri) {
                    const safeVarName = this.sanitizeCssVarName(imgName);
                    cssContent += `    --typify-img-${safeVarName}: ${dataUri};\n`;
                }
            });
            cssContent += `}\n\n`;
        }

        styles.forEach((style, index) => {
            const className = `typify-style-${String(index)}`;
            const valueKey = (style.matchValue || style.name).toLowerCase();

            let isImage = false;
            if (style.icon && style.icon.startsWith('img:')) {
                const imgName = style.icon.replace('img:', '');
                if (this.plugin.customImagesManager?.getImageDataUri(imgName)) {
                    isImage = true;
                }
            }

            const classString = isImage ? `${className} typify-is-image` : className;

            // Populate O(1) Dictionaries
            if (style.appliesTo && style.appliesTo.length > 0) {
                style.appliesTo.forEach(prop => {
                    this.fastLookupMap.set(`${valueKey}|${prop.toLowerCase()}`, classString);
                });
            } else {
                this.globalFallbackMap.set(valueKey, classString);
            }

            // Populate display info map
            this.styleInfoMap.set(classString, {
                name: style.name,
                hasMatchValue: !!style.matchValue
            });

            // Generate CSS
            const palette = generatePalette(style.baseColor, style.colorMode || 'subtle');
            const pillRadius = style.shape === 'flat' ? '0px' : style.shape === 'rectangle' ? '4px' : '14px';

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
            } else if (style.icon && style.icon.startsWith('img:')) {
                const imgName = style.icon.replace('img:', '');
                const safeVarName = this.sanitizeCssVarName(imgName);
                if (this.plugin.customImagesManager?.getImageDataUri(imgName)) {
                    iconUrl = `var(--typify-img-${safeVarName})`;
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
                if (isImage) {
                    cssContent += `
    --pill-image-url: ${iconUrl};
    --pill-icon-display: inline-block;
`;
                } else {
                    cssContent += `
    --pill-icon-url: ${iconUrl};
    --pill-icon-display: inline-block;
`;
                }
            }
            cssContent += `}\n`;
        });



        this.styleElement.textContent = cssContent;
    }

    private sanitizeCssVarName(filename: string): string {
        return filename.toLowerCase().replace(/[^a-z0-9-]/g, '_');
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
     * Returns display info for a matched class string.
     */
    getStyleInfo(classString: string): { name: string; hasMatchValue: boolean } | undefined {
        return this.styleInfoMap.get(classString);
    }

    /**
     * Applies the class to the element and removes old ones.
     * Skips DOM operations if the element already has the correct class.
     */
    applyStyle(el: HTMLElement, classString: string) {
        if (el.dataset.typifyClass === classString) return;
        this.clearStyle(el);
        const classes = classString.split(' ');
        el.classList.add(...classes);
        el.dataset.typifyClass = classString;
    }

    /**
     * Removes any existing typify dynamic classes from the element.
     */
    clearStyle(el: HTMLElement) {
        delete el.dataset.typifyClass;
        const classesToRemove: string[] = [];
        el.classList.forEach(cls => {
            if (cls.startsWith('typify-style-') || cls === 'typify-is-image') {
                classesToRemove.push(cls);
            }
        });
        if (classesToRemove.length > 0) {
            el.classList.remove(...classesToRemove);
        }
    }

    /**
     * Ensures the <style> element is still attached to the DOM.
     * Re-injects it into the active document if it was removed externally.
     */
    ensureAttached(): void {
        if (!this.styleElement || this.styleElement.isConnected) return;
        activeDocument.head.appendChild(this.styleElement);
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
        this.styleInfoMap.clear();
    }
}
