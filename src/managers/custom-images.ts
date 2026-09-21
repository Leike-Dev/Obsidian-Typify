import { App, normalizePath } from 'obsidian';
import { getCssResourceUrl } from '../utils/resource-url';

// ============================================================================
// CUSTOM IMAGES MANAGER
// Catalogs image files (PNG, JPG, WEBP, GIF) from the plugin's img/ folder.
// Uses Obsidian resource URLs so image bytes are loaded by the browser on demand.
// ============================================================================

const IMAGES_FOLDER = 'img';
const MAX_IMAGE_SIZE = 50 * 1024; // 50KB limit per image file

export class CustomImagesManager {
    private imageUrlCache = new Map<string, string>(); // name → CSS resource URL
    private app: App;
    private basePath: string;

    constructor(app: App, pluginId: string) {
        this.app = app;
        this.basePath = normalizePath(`${app.vault.configDir}/plugins/${pluginId}/${IMAGES_FOLDER}`);
    }

    /**
     * Catalogs image files from the img/ folder without reading their contents.
     * Creates the folder if it doesn't exist.
     * Called ONCE during onload().
     */
    async initialize(): Promise<{ loaded: number; errors: string[] }> {
        this.imageUrlCache.clear();

        const errors: string[] = [];
        const adapter = this.app.vault.adapter;

        // Create img folder if it doesn't exist
        if (!(await adapter.exists(this.basePath))) {
            await adapter.mkdir(this.basePath);
            return { loaded: 0, errors: [] };
        }

        // List all files in the img folder
        const listed = await adapter.list(this.basePath);
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
        const imageFiles = listed.files.filter(f => {
            const lower = f.toLowerCase();
            return imageExtensions.some(ext => lower.endsWith(ext));
        });

        for (const filePath of imageFiles) {
            try {
                // Check file size
                const stat = await adapter.stat(filePath);
                if (!stat) {
                    throw new Error('file metadata unavailable');
                }
                if (stat.size > MAX_IMAGE_SIZE) {
                    const name = this.filePathToName(filePath);
                    errors.push(`${name}: file too large (${String(Math.round(stat.size / 1024))}KB > 50KB)`);
                    continue;
                }

                const name = this.filePathToName(filePath);
                this.imageUrlCache.set(name, getCssResourceUrl(adapter, filePath, stat.mtime));
            } catch (e) {
                const name = this.filePathToName(filePath);
                errors.push(`${name}: ${e instanceof Error ? e.message : 'unknown error'}`);
            }
        }

        return { loaded: this.imageUrlCache.size, errors };
    }

    /**
     * Returns the local resource URL for use in CSS background-image. SYNC.
     */
    getImageCssUrl(name: string): string | null {
        return this.imageUrlCache.get(name) || null;
    }

    /**
     * Clears the in-memory cache without reloading.
     */
    clear(): void {
        this.imageUrlCache.clear();
    }

    /**
     * Returns the list of available custom image names. SYNC.
     */
    listImages(): string[] {
        return Array.from(this.imageUrlCache.keys());
    }

    /**
     * Reloads all custom images from disk.
     */
    async refresh(): Promise<{ loaded: number; errors: string[] }> {
        return await this.initialize();
    }

    /**
     * Extracts the image name from a file path.
     * e.g. ".obsidian/plugins/typify/img/joao.png" → "joao.png"
     */
    private filePathToName(filePath: string): string {
        const parts = filePath.split('/');
        return parts[parts.length - 1]!; // Keep extension so we distinguish joao.png vs joao.jpg
    }

}
