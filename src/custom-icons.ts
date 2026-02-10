import { App, normalizePath } from 'obsidian';

// ============================================================================
// CUSTOM ICONS MANAGER
// Loads SVG files from the plugin's icons/ folder into an in-memory cache.
// All getters are SYNC to keep updateStyles() synchronous.
// ============================================================================

const ICONS_FOLDER = 'icons';
const MAX_SVG_SIZE = 100 * 1024; // 100KB limit per SVG file

export class CustomIconsManager {
    private cache: Map<string, string> = new Map();       // name → raw SVG string
    private dataUriCache: Map<string, string> = new Map(); // name → data URI
    private app: App;
    private basePath: string;

    constructor(app: App, pluginId: string) {
        this.app = app;
        this.basePath = normalizePath(`${app.vault.configDir}/plugins/${pluginId}/${ICONS_FOLDER}`);
    }

    /**
     * Loads all SVG files from the icons/ folder into memory.
     * Creates the folder if it doesn't exist.
     * Called ONCE during onload() or when the toggle is activated.
     */
    async initialize(): Promise<{ loaded: number; errors: string[] }> {
        this.cache.clear();
        this.dataUriCache.clear();

        const errors: string[] = [];

        // Create icons folder if it doesn't exist
        const adapter = this.app.vault.adapter;
        if (!(await adapter.exists(this.basePath))) {
            await adapter.mkdir(this.basePath);
            return { loaded: 0, errors: [] };
        }

        // List all files in the icons folder
        const listed = await adapter.list(this.basePath);
        const svgFiles = listed.files.filter(f => f.toLowerCase().endsWith('.svg'));

        for (const filePath of svgFiles) {
            try {
                // Check file size
                const stat = await adapter.stat(filePath);
                if (stat && stat.size > MAX_SVG_SIZE) {
                    const name = this.filePathToName(filePath);
                    errors.push(`${name}: file too large (${Math.round(stat.size / 1024)}KB > 100KB)`);
                    continue;
                }

                const content = await adapter.read(filePath);

                // Basic SVG validation
                if (!content.includes('<svg') || !content.includes('</svg>')) {
                    const name = this.filePathToName(filePath);
                    errors.push(`${name}: invalid SVG format`);
                    continue;
                }

                const name = this.filePathToName(filePath);

                // Normalize the SVG for use as a mask icon (replace currentColor)
                const normalizedSvg = content.replace(/currentColor/g, 'black');
                const encodedSvg = encodeURIComponent(normalizedSvg);
                const dataUri = `url("data:image/svg+xml;charset=utf-8,${encodedSvg}")`;

                this.cache.set(name, content);
                this.dataUriCache.set(name, dataUri);
            } catch (e) {
                const name = this.filePathToName(filePath);
                errors.push(`${name}: ${e instanceof Error ? e.message : 'unknown error'}`);
            }
        }

        return { loaded: this.cache.size, errors };
    }

    /**
     * Returns the raw SVG content for a custom icon. SYNC.
     */
    getSvgContent(name: string): string | null {
        return this.cache.get(name) || null;
    }

    /**
     * Returns the encoded data URI for use in CSS mask-image. SYNC.
     */
    getSvgDataUri(name: string): string | null {
        return this.dataUriCache.get(name) || null;
    }

    /**
     * Clears the in-memory cache without reloading.
     */
    clear(): void {
        this.cache.clear();
        this.dataUriCache.clear();
    }

    /**
     * Returns the list of available custom icon names. SYNC.
     */
    listIcons(): string[] {
        return Array.from(this.cache.keys());
    }

    /**
     * Reloads all custom icons from disk.
     */
    async refresh(): Promise<{ loaded: number; errors: string[] }> {
        return await this.initialize();
    }

    /**
     * Extracts the icon name from a file path.
     * e.g. ".obsidian/plugins/typify/icons/my-icon.svg" → "my-icon"
     */
    private filePathToName(filePath: string): string {
        const parts = filePath.split('/');
        const fileName = parts[parts.length - 1];
        return fileName.replace(/\.svg$/i, '');
    }
}
