import { getIcon } from 'obsidian';
import TypifyPlugin from '../main';
import { generatePalette } from '../utils';
import { getStyleValue } from '../utils/style-value';

export class StyleManager {
    private plugin: TypifyPlugin;
    private styleElements = new Map<Document, HTMLStyleElement>();
    private currentCss: string = '';
    // O(1) Lookup cache: key = value.toLowerCase() + '|' + propertyKey
    private fastLookupMap = new Map<string, string>();
    // Cache for global fallbacks: key = value.toLowerCase()
    private globalFallbackMap = new Map<string, string>();
    // Link display info remains separate from property-value matching.
    private styleInfoMap = new Map<string, { name: string; linkValue?: string; prefixMatch: boolean }>();
    // Prefix match styles, sorted longest-first for best-match priority
    private prefixScopedList: { prefix: string; prop: string; classString: string }[] = [];
    private prefixGlobalList: { prefix: string; classString: string }[] = [];
    // Property-level fallback: when catchAll is true, any unmatched value in that property gets this class
    private propertyFallbackMap = new Map<string, string>();

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
        this.propertyFallbackMap.clear();
        this.prefixScopedList = [];
        this.prefixGlobalList = [];

        let cssContent = '';
        const styles = this.plugin.settings.statusStyles;

        // 1. Image Deduplication in :root
        const uniqueImages = new Set<string>();
        styles.forEach(style => {
            if (style.icon && style.icon.startsWith('img:')) {
                uniqueImages.add(style.icon.replace('img:', ''));
            }
        });

        const uniqueFavicons = new Set<string>();
        styles.forEach(style => {
            if (style.icon && style.icon.startsWith('favicon:')) {
                uniqueFavicons.add(style.icon.replace('favicon:', ''));
            }
        });

        if (uniqueImages.size > 0 || uniqueFavicons.size > 0) {
            cssContent += `:root {\n`;
            uniqueImages.forEach(imgName => {
                const cssUrl = this.plugin.customImagesManager?.getImageCssUrl(imgName);
                if (cssUrl) {
                    const safeVarName = this.sanitizeCssVarName(imgName);
                    cssContent += `    --typify-img-${safeVarName}: ${cssUrl};\n`;
                }
            });
            uniqueFavicons.forEach(domain => {
                const cssUrl = this.plugin.faviconManager?.getFaviconCssUrl(domain);
                if (cssUrl) {
                    const safeVarName = this.sanitizeCssVarName(domain);
                    cssContent += `    --typify-favicon-${safeVarName}: ${cssUrl};\n`;
                }
            });
            cssContent += `}\n\n`;
        }

        const lucideIconCache = new Map<string, string>();

        styles.forEach((style, index) => {
            const className = `typify-style-${String(index)}`;
            const valueKey = getStyleValue(style).toLowerCase();
            const linkKey = style.matchValue?.trim().toLowerCase();

            let isImage = false;
            let isEmoji = false;
            let emojiChar = '';
            if (style.icon && style.icon.startsWith('img:')) {
                const imgName = style.icon.replace('img:', '');
                if (this.plugin.customImagesManager?.getImageCssUrl(imgName)) {
                    isImage = true;
                }
            } else if (style.icon && style.icon.startsWith('emoji:')) {
                isEmoji = true;
                emojiChar = style.icon.replace('emoji:', '');
            } else if (style.icon && style.icon.startsWith('favicon:')) {
                const domain = style.icon.replace('favicon:', '');
                if (this.plugin.faviconManager?.getFaviconCssUrl(domain)) {
                    isImage = true;
                }
            }

            const classString = isImage ? `${className} typify-is-image` : isEmoji ? `${className} typify-is-emoji` : className;

            const hasScopedCatchAll = style.catchAll === true && !!style.appliesTo?.length;
            const exactKeys = new Set<string>();
            if (!hasScopedCatchAll) exactKeys.add(valueKey);
            if (linkKey && style.prefixMatch !== true) exactKeys.add(linkKey);

            if (style.appliesTo && style.appliesTo.length > 0) {
                style.appliesTo.forEach(prop => {
                    const propertyKey = prop.toLowerCase();
                    if (hasScopedCatchAll && !this.propertyFallbackMap.has(propertyKey)) {
                        this.propertyFallbackMap.set(propertyKey, classString);
                    }
                    exactKeys.forEach(key => this.fastLookupMap.set(`${key}|${propertyKey}`, classString));
                    if (linkKey && style.prefixMatch === true) {
                        this.prefixScopedList.push({ prefix: linkKey, prop: propertyKey, classString });
                    }
                });
            } else {
                exactKeys.forEach(key => this.globalFallbackMap.set(key, classString));
                if (linkKey && style.prefixMatch === true) {
                    this.prefixGlobalList.push({ prefix: linkKey, classString });
                }
            }

            // Populate display info map
            this.styleInfoMap.set(classString, {
                name: style.name,
                linkValue: linkKey,
                prefixMatch: style.prefixMatch === true
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
                        // NOTE: outerHTML is used here for READ-ONLY serialization of Obsidian's
                        // built-in SVG icons into CSS data URIs. No DOM mutation occurs.
                        const svg = fallbackEl.outerHTML.replace(/currentColor/g, 'black');
                        iconUrl = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
                    }
                }
            } else if (style.icon && style.icon.startsWith('img:')) {
                const imgName = style.icon.replace('img:', '');
                const safeVarName = this.sanitizeCssVarName(imgName);
                if (this.plugin.customImagesManager?.getImageCssUrl(imgName)) {
                    iconUrl = `var(--typify-img-${safeVarName})`;
                }
            } else if (style.icon && style.icon.startsWith('favicon:')) {
                const domain = style.icon.replace('favicon:', '');
                const safeVarName = this.sanitizeCssVarName(domain);
                if (this.plugin.faviconManager?.getFaviconCssUrl(domain)) {
                    iconUrl = `var(--typify-favicon-${safeVarName})`;
                }
            } else if (style.icon) {
                if (lucideIconCache.has(style.icon)) {
                    iconUrl = lucideIconCache.get(style.icon)!;
                } else {
                    const iconEl = getIcon(style.icon);
                    if (iconEl) {
                        // NOTE: outerHTML is used here for READ-ONLY serialization of Obsidian's
                        // built-in SVG icons into CSS data URIs. No DOM mutation occurs.
                        const svgString = iconEl.outerHTML.replace(/currentColor/g, 'black');
                        const encodedSvg = encodeURIComponent(svgString);
                        iconUrl = `url("data:image/svg+xml;charset=utf-8,${encodedSvg}")`;
                        lucideIconCache.set(style.icon, iconUrl);
                    }
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
            } else if (isEmoji) {
                // Escape quotes and backslashes to prevent CSS injection
                const safeEmojiChar = emojiChar.replace(/(["\\])/g, '\\$1');
                cssContent += `
    --pill-emoji: "${safeEmojiChar}";
    --pill-icon-display: inline-block;
`;
            }
            cssContent += `}\n`;
        });



        this.currentCss = cssContent;
        this.updateAllDocuments();
    }

    private updateAllDocuments() {
        if (!this.plugin.windowManager) return;
        const docs = this.plugin.windowManager.getDocuments();
        docs.forEach(doc => this.injectIntoDocument(doc));
    }

    injectIntoDocument(doc: Document) {
        let styleEl = this.styleElements.get(doc);
        if (!styleEl || !styleEl.isConnected) {
            if (styleEl) styleEl.remove();
            // User-defined colors and icons require runtime CSS in each Obsidian window.
            styleEl = doc.head.createEl('style', { attr: { id: 'typify-dynamic-styles' } });
            this.styleElements.set(doc, styleEl);
        }
        if (styleEl.textContent !== this.currentCss) {
            styleEl.textContent = this.currentCss;
        }
    }

    removeFromDocument(doc: Document) {
        const styleEl = this.styleElements.get(doc);
        if (styleEl) {
            styleEl.remove();
            this.styleElements.delete(doc);
        }
    }

    private sanitizeCssVarName(filename: string): string {
        return filename.toLowerCase().replace(/[^a-z0-9-]/g, '_');
    }

    /**
     * Finds the matched class name for a given value + property pair.
     *
     * Matching priority (most specific wins):
     *   1. Exact scoped   — value + property (fastLookupMap)
     *   2. Exact global   — value in any property (globalFallbackMap)
     *   3. Prefix scoped  — value starts with prefix + property (prefixScopedList, longest wins)
     *   4. Prefix global  — value starts with prefix in any property (prefixGlobalList, longest wins)
     *   5. Property fallback (catchAll) — any value in property (propertyFallbackMap)
     */
    findMatchingClass(value: string, propertyKey: string): string | undefined {
        const valLower = value.toLowerCase();
        const propLower = propertyKey.toLowerCase();

        const scopedMatch = this.fastLookupMap.get(`${valLower}|${propLower}`);
        if (scopedMatch) return scopedMatch;

        const globalMatch = this.globalFallbackMap.get(valLower);
        if (globalMatch) return globalMatch;

        let bestPrefix: string | undefined;
        let bestLength = 0;

        for (const entry of this.prefixScopedList) {
            if (entry.prefix.length > bestLength && valLower.startsWith(entry.prefix) && entry.prop === propLower) {
                bestPrefix = entry.classString;
                bestLength = entry.prefix.length;
            }
        }

        for (const entry of this.prefixGlobalList) {
            if (entry.prefix.length > bestLength && valLower.startsWith(entry.prefix)) {
                bestPrefix = entry.classString;
                bestLength = entry.prefix.length;
            }
        }

        if (bestPrefix) return bestPrefix;

        // Property-level fallback (catchAll styles)
        return this.propertyFallbackMap.get(propLower);
    }

    /** Returns the link label only when this style's associated URL matched the link. */
    getLinkDisplayName(classString: string, url: string): string | undefined {
        const info = this.styleInfoMap.get(classString);
        if (!info?.linkValue) return undefined;
        const normalizedUrl = url.toLowerCase();
        if (info.prefixMatch
            ? normalizedUrl.startsWith(info.linkValue)
            : normalizedUrl === info.linkValue) {
            return info.name;
        }
        return undefined;
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
            if (cls.startsWith('typify-style-') || cls === 'typify-is-image' || cls === 'typify-is-emoji') {
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
        this.updateAllDocuments();
    }

    /**
     * Cleans up the injected stylesheet on unload.
     */
    cleanup() {
        this.styleElements.forEach(el => el.remove());
        this.styleElements.clear();
        this.fastLookupMap.clear();
        this.globalFallbackMap.clear();
        this.styleInfoMap.clear();
        this.propertyFallbackMap.clear();
        this.prefixScopedList = [];
        this.prefixGlobalList = [];
    }
}
