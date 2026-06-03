import { App, normalizePath } from 'obsidian';

// ============================================================================
// CUSTOM IMAGES MANAGER
// Loads image files (PNG, JPG, WEBP, GIF) from the plugin's img/ folder.
// Converts them to Base64 to be used as CSS background-images.
// ============================================================================

const IMAGES_FOLDER = 'img';
const MAX_IMAGE_SIZE = 50 * 1024; // 50KB limit per image file

export class CustomImagesManager {
    private dataUriCache = new Map<string, string>(); // name → data URI (Base64)
    private app: App;
    private basePath: string;

    constructor(app: App, pluginId: string) {
        this.app = app;
        this.basePath = normalizePath(`${app.vault.configDir}/plugins/${pluginId}/${IMAGES_FOLDER}`);
    }

    /**
     * Loads all image files from the img/ folder into memory as Base64.
     * Creates the folder if it doesn't exist.
     * Called ONCE during onload().
     */
    async initialize(): Promise<{ loaded: number; errors: string[] }> {
        this.dataUriCache.clear();

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
                if (stat && stat.size > MAX_IMAGE_SIZE) {
                    const name = this.filePathToName(filePath);
                    errors.push(`${name}: file too large (${String(Math.round(stat.size / 1024))}KB > 50KB)`);
                    continue;
                }

                const binary = await adapter.readBinary(filePath);
                const base64 = this.arrayBufferToBase64(binary);
                const mimeType = this.getMimeType(filePath);
                const dataUri = `url("data:${mimeType};base64,${base64}")`;

                const name = this.filePathToName(filePath);
                this.dataUriCache.set(name, dataUri);
            } catch (e) {
                const name = this.filePathToName(filePath);
                errors.push(`${name}: ${e instanceof Error ? e.message : 'unknown error'}`);
            }
        }

        return { loaded: this.dataUriCache.size, errors };
    }

    /**
     * Returns the encoded data URI for use in CSS background-image. SYNC.
     */
    getImageDataUri(name: string): string | null {
        return this.dataUriCache.get(name) || null;
    }

    /**
     * Clears the in-memory cache without reloading.
     */
    clear(): void {
        this.dataUriCache.clear();
    }

    /**
     * Returns the list of available custom image names. SYNC.
     */
    listImages(): string[] {
        return Array.from(this.dataUriCache.keys());
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
        return parts[parts.length - 1]; // Keep extension so we distinguish joao.png vs joao.jpg
    }

    private getMimeType(filePath: string): string {
        const lower = filePath.toLowerCase();
        if (lower.endsWith('.png')) return 'image/png';
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
        if (lower.endsWith('.webp')) return 'image/webp';
        if (lower.endsWith('.gif')) return 'image/gif';
        return 'application/octet-stream';
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}
