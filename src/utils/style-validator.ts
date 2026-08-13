// ============================================================================
// STYLE VALIDATOR — Reusable validation for StatusStyle objects
// ============================================================================

import type { StatusStyle } from '../types';

/**
 * Valid hex color pattern: #RRGGBB (6 digits, case-insensitive).
 */
export const HEX_COLOR_RE = /^#[0-9a-f]{6}$/i;

/**
 * All shape values accepted by StatusStyle.
 * Must stay in sync with the `shape` union in types.ts.
 */
export const VALID_SHAPES: readonly string[] = ['pill', 'rectangle', 'flat'];

/**
 * All colorMode values accepted by StatusStyle.
 * Must stay in sync with the `colorMode` union in types.ts.
 */
export const VALID_COLOR_MODES: readonly string[] = ['subtle', 'solid', 'simple'];

/**
 * Validates an array of raw objects and returns only valid StatusStyle entries.
 *
 * Required fields: `name` (non-empty string), `baseColor` (valid hex #RRGGBB).
 * Optional fields are copied only when they pass type/value checks.
 *
 * This function never mutates the input array.
 */
export function validateStatusStyles(raw: Record<string, unknown>[]): StatusStyle[] {
    const valid: StatusStyle[] = [];

    for (const item of raw) {
        if (typeof item !== 'object' || item === null || Array.isArray(item)) continue;

        // Required: name (non-empty string)
        if (typeof item.name !== 'string' || !item.name.trim()) continue;

        // Required: baseColor (valid hex)
        if (typeof item.baseColor !== 'string' || !HEX_COLOR_RE.test(item.baseColor)) continue;

        const style: StatusStyle = {
            name: item.name.trim(),
            baseColor: item.baseColor,
            icon: typeof item.icon === 'string' ? item.icon : ''
        };

        // Optional: shape
        if (typeof item.shape === 'string' && VALID_SHAPES.includes(item.shape)) {
            style.shape = item.shape as StatusStyle['shape'];
        }

        // Optional: matchValue
        if (typeof item.matchValue === 'string' && item.matchValue.trim() !== '') {
            style.matchValue = item.matchValue.trim();
        }

        // Optional: prefixMatch (only meaningful when matchValue is present)
        if (typeof item.prefixMatch === 'boolean') {
            style.prefixMatch = item.prefixMatch;
        }

        // Optional: colorMode
        if (typeof item.colorMode === 'string' && VALID_COLOR_MODES.includes(item.colorMode)) {
            style.colorMode = item.colorMode as StatusStyle['colorMode'];
        }

        // Optional: appliesTo (array of non-empty strings)
        if (Array.isArray(item.appliesTo)) {
            const filtered = (item.appliesTo as unknown[]).filter(
                (v): v is string => typeof v === 'string' && v.trim() !== ''
            );
            if (filtered.length > 0) {
                style.appliesTo = filtered;
            }
        }

        valid.push(style);
    }

    return valid;
}
