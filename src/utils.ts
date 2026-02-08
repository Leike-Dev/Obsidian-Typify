// ============================================================================
// COLOR UTILITIES - HSL manipulation for auto-generating palettes
// ============================================================================

/**
 * Represents a color palette with light and dark mode variants.
 */
export interface ColorPalette {
    light: { bg: string; text: string; bgHover: string; textHover: string; border: string };
    dark: { bg: string; text: string; bgHover: string; textHover: string; border: string };
}

/**
 * Converts a Hex color string to HSL values.
 * @param hex The hex color string (e.g., "#ffffff" or "ffffff").
 * @returns An object containing hue (h), saturation (s), and lightness (l).
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 50 };

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Converts HSL values to a Hex color string.
 * @param h Hue (0-360)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns The hex color string (e.g., "#ffffff").
 */
function hslToHex(h: number, s: number, l: number): string {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }

    const toHex = (n: number) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Generates an HSLA string from HSL values and alpha.
 * @param h Hue
 * @param s Saturation
 * @param l Lightness
 * @param a Alpha (opacity), default is 1.
 * @returns CSS hsla() string.
 */
function hslToHslaString(h: number, s: number, l: number, a: number = 1): string {
    return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
}

/**
 * Generates a complete color palette (background, text, border, hover states)
 * for both light and dark modes based on a single base color.
 * 
 * Logic:
 * - Light Mode: Uses higher lightness and lower opacity for backgrounds.
 * - Dark Mode: Uses lower lightness/opacity for backgrounds to blend with dark themes.
 * - Text colors are calculated to ensure contrast.
 * 
 * @param baseColor The user-selected base color (Hex).
 * @returns A fully populated ColorPalette object.
 */
export function generatePalette(baseColor: string): ColorPalette {
    const { h, s } = hexToHSL(baseColor);
    const cap = (val: number) => Math.min(val, 100);

    return {
        light: {
            bg: hslToHslaString(h, cap(s * 1.25), 60, 0.2), // 20% opacity
            text: hslToHex(h, s, 35),
            bgHover: hslToHslaString(h, cap(s * 1.25), 60, 0.3), // 30% opacity
            textHover: hslToHex(h, s, 25),
            border: hslToHslaString(h, s, 45, 0.3) // 30% opacity border
        },
        dark: {
            bg: hslToHslaString(h, cap(s * 0.85), 60, 0.25), // 25% opacity
            text: hslToHex(h, s * 0.7, 75),
            bgHover: hslToHslaString(h, cap(s * 0.85), 60, 0.35), // 35% opacity
            textHover: hslToHex(h, s * 0.6, 85),
            border: hslToHslaString(h, s * 0.7, 60, 0.3) // 30% opacity border
        }
    };
}

/**
 * Sanitize a string for use in CSS attribute selectors
 * Escapes backslashes, double quotes, and closing brackets
 */
export function sanitizeCssSelector(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\]/g, '\\]');
}
