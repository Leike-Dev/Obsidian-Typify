import type { StatusStyle } from '../types';

/** The value matched before the separate styleValue setting existed. */
export function getStyleValue(style: StatusStyle): string {
    return style.styleValue?.trim() || style.matchValue?.trim() || style.name.trim();
}

/** Duplicate the former match target into the new field without changing stored link URLs. */
export function migrateStyleValues(styles: StatusStyle[]): StatusStyle[] {
    return styles.map(style => style.styleValue?.trim()
        ? style
        : { ...style, styleValue: getStyleValue(style) });
}

/** Whether a style covers a value in a particular property. */
export function styleMatchesValue(style: StatusStyle, value: string, propertyKey: string): boolean {
    const scope = style.appliesTo;
    if (scope?.length && !scope.some(prop => prop.toLowerCase() === propertyKey.toLowerCase())) {
        return false;
    }

    if (style.catchAll === true && scope?.length) return true;

    const normalizedValue = value.toLowerCase();
    if (normalizedValue === getStyleValue(style).toLowerCase()) return true;

    const link = style.matchValue?.trim().toLowerCase();
    if (!link) return false;
    return style.prefixMatch === true
        ? normalizedValue.startsWith(link)
        : normalizedValue === link;
}

/** Detect targets that would compete in the same property scope. */
export function stylesShareTarget(first: StatusStyle, second: StatusStyle): boolean {
    const firstCatchAll = first.catchAll === true && !!first.appliesTo?.length;
    const secondCatchAll = second.catchAll === true && !!second.appliesTo?.length;
    if (firstCatchAll && secondCatchAll) return true;

    const exactValues = (style: StatusStyle, catchAll: boolean): Set<string> => {
        const keys = new Set<string>();
        if (!catchAll) keys.add(getStyleValue(style).toLowerCase());
        if (style.matchValue?.trim() && style.prefixMatch !== true) {
            keys.add(style.matchValue.trim().toLowerCase());
        }
        return keys;
    };

    const firstExact = exactValues(first, firstCatchAll);
    const secondExact = exactValues(second, secondCatchAll);
    if ([...firstExact].some(key => secondExact.has(key))) return true;

    const firstPrefix = first.matchValue?.trim().toLowerCase();
    const secondPrefix = second.matchValue?.trim().toLowerCase();
    return !!firstPrefix && !!secondPrefix
        && first.prefixMatch === true && second.prefixMatch === true
        && firstPrefix === secondPrefix;
}
