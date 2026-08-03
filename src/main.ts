import { Plugin, Notice } from 'obsidian';
import { CustomStatusIconsSettings, DEFAULT_SETTINGS } from './types';
import { CustomStatusIconsSettingTab } from './settings';
import { CustomIconsManager } from './managers/custom-icons';
import { CustomImagesManager } from './managers/custom-images';
import { t } from './lang/helpers';
import { StyleManager } from './managers/style-manager';
import { DOMManager } from './managers/dom-manager';
import { FaviconManager } from './managers/favicon-manager';

export default class TypifyPlugin extends Plugin {
    settings!: CustomStatusIconsSettings;
    customIconsManager!: CustomIconsManager;
    customImagesManager!: CustomImagesManager;
    faviconManager!: FaviconManager;
    styleManager!: StyleManager;
    domManager!: DOMManager;
    private cachedTargetProps: string[] | null = null;

    async onload() {
        await this.loadSettings();

        this.registerEvent(this.app.workspace.on('typify:version-seen', (version: string) => {
            this.settings.lastSeenVersion = version;
            void this.saveSettings();
        }));

        // Initialize custom icons manager
        this.customIconsManager = new CustomIconsManager(this.app, this.manifest.id);
        if (this.settings.enableCustomIcons) {
            await this.customIconsManager.initialize();

            // Check for missing custom icons
            const missingIcons = this.settings.statusStyles
                .filter(s => s.icon?.startsWith('custom:'))
                .filter(s => !this.customIconsManager.getSvgDataUri(s.icon.replace('custom:', '')));

            if (missingIcons.length > 0) {
                const names = missingIcons.map(s => s.icon.replace('custom:', '')).join(', ');
                new Notice(t('custom_icons_missing').replace('{count}', String(missingIcons.length)).replace('{names}', names));
            }
        }

        // Initialize custom images manager (always loaded as it doesn't have a toggle yet)
        this.customImagesManager = new CustomImagesManager(this.app, this.manifest.id);
        const imgResult = await this.customImagesManager.initialize();

        // Warn about oversized images that were skipped
        if (imgResult.errors.length > 0) {
            new Notice(
                t('custom_images_oversized')
                    .replace('{count}', String(imgResult.errors.length))
                    .replace('{names}', imgResult.errors.join('; '))
            );
        }

        // Warn about missing images referenced in styles
        const missingImages = this.settings.statusStyles
            .filter(s => s.icon?.startsWith('img:'))
            .filter(s => !this.customImagesManager.getImageDataUri(s.icon.replace('img:', '')));

        if (missingImages.length > 0) {
            const names = missingImages.map(s => s.icon.replace('img:', '')).join(', ');
            new Notice(
                t('custom_images_missing')
                    .replace('{count}', String(missingImages.length))
                    .replace('{names}', names)
            );
        }

        // Initialize Favicon manager
        this.faviconManager = new FaviconManager(this);
        if (this.settings.enableFavicons) {
            await this.faviconManager.initialize();
        }

        this.addSettingTab(new CustomStatusIconsSettingTab(this.app, this));

        this.styleManager = new StyleManager(this);
        // Build style cache O(1) and CSS stylesheet before parsing the DOM
        this.styleManager.buildCache();

        this.domManager = new DOMManager(this, this.styleManager);
        this.domManager.init();

        this.updateBodyClasses();
        this.updateThemeCompat();

        // Re-check theme compat when user switches themes
        this.registerEvent(this.app.workspace.on('css-change', () => {
            this.updateThemeCompat();
        }));
    }

    onunload() {
        if (this.domManager) {
            this.domManager.cleanup();
        }
        if (this.styleManager) {
            this.styleManager.cleanup();
        }
        if (this.faviconManager) {
            this.faviconManager.cleanupActiveUrls();
        }
        activeDocument.body.classList.remove(
            'typify-hide-x-none', 'typify-hide-x-properties',
            'typify-hide-x-bases', 'typify-hide-x-both',
            'typify-compat-minimal'
        );
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<CustomStatusIconsSettings>);
    }

    async saveSettings(rebuildCss: boolean = true) {
        this.cachedTargetProps = null; 
        await this.saveData(this.settings);
        
        if (rebuildCss) {
            // Re-build stylesheet and cache
            this.styleManager.buildCache(); 
            
            if (this.domManager) {
                this.domManager.reprocessAllPills();
                this.domManager.refreshProcessing();
            }
            this.updateBodyClasses();
        }
    }

    getTargetProperties(): string[] {
        if (!this.cachedTargetProps) {
            this.cachedTargetProps = this.settings.targetProperty
                .split(',')
                .map(p => p.trim().toLowerCase())
                .filter(p => p.length > 0);
        }
        return this.cachedTargetProps;
    }

    public updateBodyClasses() {
        activeDocument.body.classList.remove('typify-hide-x-none', 'typify-hide-x-properties', 'typify-hide-x-bases', 'typify-hide-x-both', 'typify-reveal-x-on-hover');
        if (this.settings.hideRemoveButton && this.settings.hideRemoveButton !== 'none') {
            activeDocument.body.classList.add(`typify-hide-x-${this.settings.hideRemoveButton}`);
            
            if (this.settings.hideRemoveButtonHover) {
                activeDocument.body.classList.add('typify-reveal-x-on-hover');
            }
        }
    }

    /**
     * Detects theme-specific quirks and toggles compat body classes.
     * Currently handles Minimal theme's tighter Bases card heights.
     */
    private updateThemeCompat() {
        const rawTheme = this.app.vault.getConfig?.('cssTheme');
        const cssTheme = typeof rawTheme === 'string' ? rawTheme : '';
        activeDocument.body.classList.toggle(
            'typify-compat-minimal',
            cssTheme.toLowerCase().includes('minimal')
        );
    }

    /**
     * Public API for external plugins (like Obsidian-Folio) to style pills.
     */
    processPill(pill: Element, propertyKey: string) {
        if (this.domManager) {
            this.domManager.processPill(pill, propertyKey);
        }
    }
}
