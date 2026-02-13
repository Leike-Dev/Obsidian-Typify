// ============================================================================
// LOCALIZATION HELPERS
// Resolves translation keys using the user's Obsidian language setting.
// ============================================================================

import { en } from './en';
import { ptBR } from './pt-BR';

const localeMap: { [key: string]: Partial<typeof en> } = {
    'en': en,
    'pt': ptBR,
    'pt-br': ptBR,
};

const locale = window.localStorage.getItem('language') || 'en';

/**
 * Returns the localized string for the given translation key.
 * Fallback chain: user's locale → English → raw key name.
 * @param key A valid translation key from the English locale file.
 * @returns The translated string, or the key itself if no translation is found.
 */
export function t(key: keyof typeof en): string {
    const lang = localeMap[locale.toLowerCase()] || en;
    return (lang as Record<string, string>)[key] || (en as Record<string, string>)[key] || key;
}
