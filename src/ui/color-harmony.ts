// ============================================================================
// COLOR HARMONY — Generates palettes based on color theory
// ============================================================================

import { hslToHex, hexToHSL } from '../utils';

/** Wrap hue to 0-360 range */
function wrapHue(h: number): number {
    return ((h % 360) + 360) % 360;
}

/** Generate or extract a hue with balanced saturation/lightness */
function getBaseHSL(hex?: string): { h: number; s: number; l: number } {
    if (hex) {
        return hexToHSL(hex);
    }
    return {
        h: Math.random() * 360,
        s: 50 + Math.random() * 40,  // 50–90%
        l: 40 + Math.random() * 25   // 40–65%
    };
}

/**
 * Analogous: colors adjacent on the color wheel (±30° steps).
 */
export function generateAnalogous(count = 5, baseColorHex?: string): string[] {
    const base = getBaseHSL(baseColorHex);
    const step = 30;
    const start = base.h - step * Math.floor(count / 2);
    return Array.from({ length: count }, (_, i) =>
        hslToHex(wrapHue(start + step * i), base.s, base.l)
    );
}

/**
 * Complementary: opposite hue (180°) with intermediate variations.
 */
export function generateComplementary(count = 5, baseColorHex?: string): string[] {
    const base = getBaseHSL(baseColorHex);
    const comp = wrapHue(base.h + 180);
    const colors: string[] = [hslToHex(base.h, base.s, base.l)];

    // Fill remaining slots alternating between base and complement variations
    for (let i = 1; i < count; i++) {
        const isComp = i % 2 === 1;
        const hue = isComp ? comp : base.h;
        const lShift = Math.floor(i / 2) * 8;
        colors.push(hslToHex(wrapHue(hue + lShift * 2), base.s, Math.min(80, base.l + lShift)));
    }
    return colors;
}

/**
 * Shades (Degradê): monochromatic lightness variations of the same hue.
 * Goes from the lightest to the darkest.
 */
export function generateShades(count = 5, baseColorHex?: string): string[] {
    const base = getBaseHSL(baseColorHex);
    const lStart = 85;
    const lEnd = 20;
    const lStep = count > 1 ? (lStart - lEnd) / (count - 1) : 0;
    return Array.from({ length: count }, (_, i) =>
        hslToHex(base.h, base.s, lStart - lStep * i)
    );
}

/**
 * Random: completely random colors with balanced saturation/lightness.
 * (Base color does not affect random)
 */
export function generateRandom(count = 5, baseColorHex?: string): string[] {
    return Array.from({ length: count }, () => {
        const c = getBaseHSL(); // Random ignores baseColor
        return hslToHex(c.h, c.s, c.l);
    });
}

/** All harmony types mapped by key */
export type HarmonyType = 'shades' | 'analogous' | 'complementary' | 'random';

export const HARMONY_GENERATORS: Record<HarmonyType, (count?: number, baseColorHex?: string) => string[]> = {
    shades: generateShades,
    analogous: generateAnalogous,
    complementary: generateComplementary,
    random: generateRandom
};
