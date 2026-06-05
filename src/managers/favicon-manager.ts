import { App, normalizePath, requestUrl, Notice } from 'obsidian';
import { t } from '../lang/helpers';

export interface FaviconCacheEntry {
    dataUri: string;
    mtime: number;
    size: number;
}

const FAVICONS_FOLDER = 'favicons';

export class FaviconManager {
    private app: App;
    private basePath: string;
    private cache = new Map<string, FaviconCacheEntry>();
    private failedDomains = new Set<string>();
    private activeObjectUrls = new Set<string>();

    private activeRequests = 0;
    private requestQueue: Array<() => void> = [];
    private readonly MAX_CONCURRENT = 2;

    constructor(app: App, pluginId: string) {
        this.app = app;
        this.basePath = normalizePath(`${app.vault.configDir}/plugins/${pluginId}/${FAVICONS_FOLDER}`);
    }

    /**
     * Extracts a clean hostname from any URL string.
     */
    static extractDomain(url: string): string | null {
        if (!url) return null;
        try {
            const urlString = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
            const parsed = new URL(urlString);
            return parsed.hostname.toLowerCase();
        } catch {
            return null;
        }
    }

    async initialize(): Promise<void> {
        this.cache.clear();
        this.failedDomains.clear();
        const adapter = this.app.vault.adapter;

        if (!(await adapter.exists(this.basePath))) {
            await adapter.mkdir(this.basePath);
            return;
        }

        const listed = await adapter.list(this.basePath);
        for (const filePath of listed.files) {
            const fileName = this.filePathToName(filePath);
            
            if (fileName.endsWith('.failed')) {
                const domain = fileName.replace('.failed', '');
                this.failedDomains.add(domain);
                continue;
            }

            if (fileName.endsWith('.png')) {
                const domain = fileName.replace('.png', '');
                try {
                    const stat = await adapter.stat(filePath);
                    if (!stat) continue;
                    
                    const binary = await adapter.readBinary(filePath);
                    const base64 = this.arrayBufferToBase64(binary);
                    const dataUri = `url("data:image/png;base64,${base64}")`;
                    
                    this.cache.set(domain, {
                        dataUri,
                        mtime: stat.mtime,
                        size: stat.size
                    });
                } catch (e) {
                    console.error(`Typify: Failed to load favicon cache for ${domain}`, e);
                }
            }
        }
    }

    getFaviconDataUri(domain: string): string | null {
        return this.cache.get(domain)?.dataUri || null;
    }

    getCache(): Map<string, FaviconCacheEntry> {
        return this.cache;
    }

    getFailedDomains(): Set<string> {
        return this.failedDomains;
    }

    hasFailed(domain: string): boolean {
        return this.failedDomains.has(domain);
    }

    /**
     * Clears all ObjectURLs tracking to avoid memory leaks if modal is closed abruptly.
     */
    cleanupActiveUrls(): void {
        this.activeObjectUrls.forEach(url => URL.revokeObjectURL(url));
        this.activeObjectUrls.clear();
    }

    /**
     * Fetches a favicon in a cascade pattern:
     * 1. Direct request to domain.com/favicon.ico
     * 2. DuckDuckGo API fallback
     * Processes into a transparent 32x32 PNG and saves it locally.
     */
    async fetchFavicon(domain: string, silent = false): Promise<string | null> {
        if (this.cache.has(domain)) {
            return this.cache.get(domain)!.dataUri;
        }

        if (this.failedDomains.has(domain)) {
            if (!silent) new Notice(t('favicon_fetch_failed').replace('{domain}', domain));
            return null;
        }

        return new Promise<string | null>((resolve) => {
            const task = async () => {
                try {
                    let buffer = await this.tryFetch(`https://${domain}/favicon.ico`);
                    
                    if (!buffer) {
                        buffer = await this.tryFetch(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
                    }

                    if (!buffer) {
                        await this.markAsFailed(domain);
                        if (!silent) new Notice(t('favicon_fetch_failed').replace('{domain}', domain));
                        resolve(null);
                        return;
                    }

                    const pngBuffer = await this.normalizeToPng(buffer);
                    const savedUri = await this.saveFavicon(domain, pngBuffer);
                    resolve(savedUri);
                } catch (e) {
                    console.error(`Typify: Favicon process failed for ${domain}`, e);
                    resolve(null);
                } finally {
                    this.activeRequests--;
                    this.processQueue();
                }
            };

            if (this.activeRequests < this.MAX_CONCURRENT) {
                this.activeRequests++;
                void task();
            } else {
                this.requestQueue.push(() => {
                    this.activeRequests++;
                    void task();
                });
            }
        });
    }

    private processQueue(): void {
        if (this.requestQueue.length > 0 && this.activeRequests < this.MAX_CONCURRENT) {
            const next = this.requestQueue.shift();
            if (next) next();
        }
    }

    private async tryFetch(url: string): Promise<ArrayBuffer | null> {
        try {
            const response = await requestUrl({ url, method: 'GET', throw: false });
            if (response.status === 200 && response.arrayBuffer) {
                // Ensure it's not a generic HTML bot protection page
                const contentType = response.headers['content-type']?.toLowerCase() || '';
                if (contentType.includes('text/html')) return null;
                
                return response.arrayBuffer;
            }
            return null;
        } catch {
            return null;
        }
    }

    private normalizeToPng(buffer: ArrayBuffer): Promise<ArrayBuffer> {
        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);
        this.activeObjectUrls.add(url);

        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                try {
                    // Check if it's a valid image (e.g. natural dimensions > 0)
                    if (img.naturalWidth === 0) throw new Error("Invalid image dimensions");

                    const canvas = document.createElement('canvas');
                    canvas.width = 32;
                    canvas.height = 32;
                    const ctx = canvas.getContext('2d')!;
                    
                    // Enforce transparent background
                    ctx.clearRect(0, 0, 32, 32);
                    ctx.drawImage(img, 0, 0, 32, 32);
                    
                    canvas.toBlob(pngBlob => {
                        if (pngBlob) {
                            pngBlob.arrayBuffer().then(resolve).catch(reject);
                        } else {
                            reject(new Error("Failed to create blob from canvas"));
                        }
                    }, 'image/png');
                } catch (e) {
                    reject(e instanceof Error ? e : new Error(String(e)));
                } finally {
                    URL.revokeObjectURL(url);
                    this.activeObjectUrls.delete(url);
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                this.activeObjectUrls.delete(url);
                reject(new Error("Failed to decode image"));
            };

            img.src = url;
        });
    }

    private async saveFavicon(domain: string, buffer: ArrayBuffer): Promise<string> {
        const adapter = this.app.vault.adapter;
        const filePath = `${this.basePath}/${domain}.png`;
        
        await adapter.writeBinary(filePath, buffer);
        
        const stat = await adapter.stat(filePath);
        const base64 = this.arrayBufferToBase64(buffer);
        const dataUri = `url("data:image/png;base64,${base64}")`;
        
        this.cache.set(domain, {
            dataUri,
            mtime: stat?.mtime || Date.now(),
            size: stat?.size || buffer.byteLength
        });

        // If it was marked as failed before, remove the failed flag
        if (this.failedDomains.has(domain)) {
            await this.removeFailedMark(domain);
        }

        return dataUri;
    }

    private async markAsFailed(domain: string): Promise<void> {
        const adapter = this.app.vault.adapter;
        const filePath = `${this.basePath}/${domain}.failed`;
        await adapter.write(filePath, '');
        this.failedDomains.add(domain);
    }

    private async removeFailedMark(domain: string): Promise<void> {
        const adapter = this.app.vault.adapter;
        const filePath = `${this.basePath}/${domain}.failed`;
        if (await adapter.exists(filePath)) {
            await adapter.remove(filePath);
        }
        this.failedDomains.delete(domain);
    }

    async deleteFavicon(domain: string): Promise<void> {
        const adapter = this.app.vault.adapter;
        const filePath = `${this.basePath}/${domain}.png`;
        if (await adapter.exists(filePath)) {
            await adapter.remove(filePath);
        }
        this.cache.delete(domain);
        await this.removeFailedMark(domain);
    }

    async clearAll(): Promise<void> {
        const adapter = this.app.vault.adapter;
        const listed = await adapter.list(this.basePath);
        for (const file of listed.files) {
            await adapter.remove(file);
        }
        this.cache.clear();
        this.failedDomains.clear();
    }

    private filePathToName(filePath: string): string {
        const parts = filePath.split('/');
        return parts[parts.length - 1]!;
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]!);
        }
        return btoa(binary);
    }
}
