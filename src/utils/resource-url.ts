import type { DataAdapter } from 'obsidian';

/**
 * Returns a CSS url() that points directly to a vault resource.
 * The modification time invalidates the browser cache when a file is replaced.
 */
export function getCssResourceUrl(adapter: DataAdapter, filePath: string, mtime: number): string {
    const resourcePath = adapter.getResourcePath(filePath);
    const separator = resourcePath.includes('?') ? '&' : '?';
    const versionedPath = `${resourcePath}${separator}typify-mtime=${String(mtime)}`;
    return `url(${JSON.stringify(versionedPath)})`;
}
