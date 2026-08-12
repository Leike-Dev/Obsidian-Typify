// ============================================================================
// PROPERTY HELPERS — Pure utility functions for target-property management
// ============================================================================

import type { App } from 'obsidian';
import type TypifyPlugin from '../main';

/**
 * Scans all Markdown files in the vault and returns property names
 * that hold arrays (candidates for target properties).
 * Already-added properties are filtered out.
 */
export function getAllPropertyNames(app: App, plugin: TypifyPlugin): string[] {
    const properties = new Set<string>();

    // Get currently added properties to filter them out
    const addedProps = plugin.settings.targetProperty
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(p => p.length > 0);

    const files = app.vault.getMarkdownFiles();
    for (const file of files) {
        const cache = app.metadataCache.getFileCache(file);
        const frontmatter = cache?.frontmatter;
        if (!frontmatter) continue;
        for (const key of Object.keys(frontmatter)) {
            if (key === 'position') continue;
            if (Array.isArray(frontmatter[key])) {
                if (!addedProps.includes(key.toLowerCase())) {
                    properties.add(key);
                }
            }
        }
    }
    return [...properties].sort((a, b) => a.localeCompare(b));
}

/**
 * Adds a property name to the comma-separated targetProperty string.
 * Skips silently if the property already exists (case-insensitive).
 */
export async function addProperty(plugin: TypifyPlugin, prop: string): Promise<void> {
    const props = plugin.settings.targetProperty
        .split(',')
        .map(p => p.trim().toLowerCase())
        .filter(p => p.length > 0);

    if (props.includes(prop.toLowerCase())) return;

    const current = plugin.settings.targetProperty.trim();
    plugin.settings.targetProperty = current
        ? `${current}, ${prop}`
        : prop;
    await plugin.saveSettings();
}

/**
 * Removes a property name from the comma-separated targetProperty string
 * (case-insensitive match).
 */
export async function removeProperty(plugin: TypifyPlugin, prop: string): Promise<void> {
    const props = plugin.settings.targetProperty
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0 && p.toLowerCase() !== prop.toLowerCase());
    plugin.settings.targetProperty = props.join(', ');
    await plugin.saveSettings();
}
