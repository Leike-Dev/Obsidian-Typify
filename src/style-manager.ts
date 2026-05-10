import { getIcon } from 'obsidian';
import TypifyPlugin from './main';
import { StatusStyle } from './types';
import { generatePalette } from './utils';

export class StyleManager {
    private plugin: TypifyPlugin;
    private styleCache: Map<string, { cssVars: Record<string, string>, iconUrl: string | null }> = new Map();

    constructor(plugin: TypifyPlugin) {
        this.plugin = plugin;
    }

    clearCache() {
        this.styleCache.clear();
    }

    findMatchingStyle(value: string, propertyKey: string): StatusStyle | undefined {
        // 1. Exact match with scope
        let match = this.plugin.settings.statusStyles.find(
            s => s.name.toLowerCase() === value.toLowerCase() &&
                s.appliesTo && s.appliesTo.includes(propertyKey)
        );

        if (match) return match;

        // 2. Exact match global (no scope or empty scope)
        match = this.plugin.settings.statusStyles.find(
            s => s.name.toLowerCase() === value.toLowerCase() &&
                (!s.appliesTo || s.appliesTo.length === 0)
        );

        return match;
    }

    applyStyle(el: HTMLElement, style: StatusStyle) {
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

    setCssStyles(el: HTMLElement, styles: Record<string, string | null>) {
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

    clearStyle(el: HTMLElement) {
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

    getStyleData(style: StatusStyle): { cssVars: Record<string, string>, iconUrl: string | null } {
        if (this.styleCache.has(style.name)) {
            return this.styleCache.get(style.name)!;
        }

        const palette = generatePalette(style.baseColor);
        const pillRadius = style.shape === 'flat' ? '0px' : style.shape === 'rectangle' ? '4px' : 'var(--tag-radius, 14px)';

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
            if (this.plugin.customIconsManager) {
                iconUrl = this.plugin.customIconsManager.getSvgDataUri(iconName);
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
}
