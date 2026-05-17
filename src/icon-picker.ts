import { FuzzySuggestModal, App, setIcon, FuzzyMatch } from 'obsidian';
import { LUCIDE_ICONS } from './lucide-icons';
import { t } from './lang/helpers';
import { CustomIconsManager } from './custom-icons';
import { CustomImagesManager } from './custom-images';

// ============================================================================
// ICON PICKER MODAL - Fuzzy search for icons and images
// ============================================================================

/**
 * Modal for selecting an icon from the Lucide library.
 * Uses strict fuzzy matching to filter icons.
 */
export class IconPickerModal extends FuzzySuggestModal<string> {
    private recentIcons: string[];
    private customIconsManager: CustomIconsManager | null;
    private customImagesManager: CustomImagesManager | null;
    private onChoose: (icon: string) => void;
    private currentTab: 'lucide' | 'custom' | 'images' = 'lucide';
    private tabsContainerEl: HTMLElement | null = null;

    constructor(
        app: App, 
        recentIcons: string[], 
        customIconsManager: CustomIconsManager | null, 
        customImagesManager: CustomImagesManager | null,
        onChoose: (icon: string) => void
    ) {
        super(app);
        this.recentIcons = recentIcons || [];
        this.customIconsManager = customIconsManager;
        this.customImagesManager = customImagesManager;
        this.onChoose = onChoose;
        this.setPlaceholder(t('icon_picker_placeholder'));
        this.setInstructions([
            { command: '↑↓', purpose: t('icon_picker_navigate') },
            { command: '↵', purpose: t('icon_picker_select') },
            { command: 'esc', purpose: t('icon_picker_close') }
        ]);
    }

    onOpen() {
        void super.onOpen();
        this.renderTabs();
    }

    private renderTabs() {
        const inputContainer = this.modalEl.querySelector('.prompt-input-container');
        if (!inputContainer) return;

        this.tabsContainerEl = createDiv('typify-icon-tabs');

        const tabs = [
            { id: 'lucide', label: t('tab_icons') },
            { id: 'custom', label: t('tab_custom') },
            { id: 'images', label: t('tab_images') }
        ];

        tabs.forEach(tab => {
            const tabEl = this.tabsContainerEl?.createDiv('typify-icon-tab');
            if (!tabEl) return;
            tabEl.setText(tab.label);
            if (this.currentTab === tab.id) {
                tabEl.addClass('is-active');
            }
            
            tabEl.addEventListener('click', () => {
                if (this.currentTab === tab.id) return;
                
                // Update active class
                this.tabsContainerEl?.querySelectorAll('.typify-icon-tab').forEach(el => { el.removeClass('is-active'); });
                tabEl.addClass('is-active');
                
                // Switch tab and refresh suggestions
                this.currentTab = tab.id as 'lucide' | 'custom' | 'images';
                
                // Trigger input event to force FuzzySuggestModal to re-render getItems()
                this.inputEl.dispatchEvent(new Event('input'));
            });
        });

        inputContainer.insertAdjacentElement('afterend', this.tabsContainerEl);
    }

    /**
     * Returns the list of items to search.
     * Recent icons are shown at the top.
     */
    getItems(): string[] {
        if (this.currentTab === 'images') {
            return this.customImagesManager
                ? this.customImagesManager.listImages().map(i => `img:${i}`)
                : [];
        }

        if (this.currentTab === 'custom') {
            return this.customIconsManager
                ? this.customIconsManager.listIcons().map(i => `custom:${i}`)
                : [];
        }

        // Default tab: Lucide + Recent (which can be Lucide or Custom, we can filter them)
        const recentSet = new Set(this.recentIcons);
        const others = LUCIDE_ICONS.filter(i => !recentSet.has(i));
        return [...this.recentIcons, ...others];
    }

    getItemText(item: string): string {
        // Strip custom: or img: prefix so users can search by name directly
        if (item.startsWith('custom:')) {
            return item.replace('custom:', '');
        }
        if (item.startsWith('img:')) {
            return item.replace('img:', '');
        }
        return item;
    }

    /**
     * Renders each suggestion item in the list.
     * Displays the icon preview, name, and a dot for recent icons.
     * @param match The fuzzy match result.
     * @param el The element to render into.
     */
    renderSuggestion(match: FuzzyMatch<string>, el: HTMLElement): void {
        const icon = match.item;
        el.addClass('csi-icon-suggestion');

        // Icon preview
        const iconEl = el.createSpan({ cls: 'csi-icon-suggestion-icon' });

        if (icon.startsWith('img:')) {
            // Image: render as circular background
            const name = icon.replace('img:', '');
            const dataUri = this.customImagesManager?.getImageDataUri(name);
            if (dataUri) {
                iconEl.addClass('typify-img-preview', 'typify-img-picker-preview');
                iconEl.setCssProps({ '--typify-bg-image': dataUri });
                iconEl.setCssStyles({ backgroundImage: 'var(--typify-bg-image)' });
            } else {
                setIcon(iconEl, 'image'); // fallback
            }
            el.createSpan({ text: name, cls: 'csi-icon-suggestion-name' });
            el.createSpan({ text: 'img', cls: 'csi-icon-custom-badge' });
        } else if (icon.startsWith('custom:')) {
            // Custom icon: render inline SVG from cache
            const name = icon.replace('custom:', '');
            const svgContent = this.customIconsManager?.getSvgContent(name);
            if (svgContent) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svg = doc.documentElement;
                if (svg.instanceOf(SVGElement)) {
                    iconEl.empty();
                    iconEl.appendChild(svg);
                }
            } else {
                setIcon(iconEl, 'square');
            }
            // Display name without prefix
            el.createSpan({ text: name, cls: 'csi-icon-suggestion-name' });
            // Custom badge
            el.createSpan({ text: 'custom', cls: 'csi-icon-custom-badge' });
        } else {
            setIcon(iconEl, icon);
            // Icon name
            el.createSpan({ text: icon, cls: 'csi-icon-suggestion-name' });
            // Recent badge
            if (this.recentIcons.includes(icon)) {
                el.createSpan({ text: '●', cls: 'csi-icon-recent-badge' });
            }
        }
    }

    /**
     * Handler for when an item is chosen.
     */
    onChooseSuggestion(match: FuzzyMatch<string>): void {
        this.onChoose(match.item);
    }

    onChooseItem(item: string): void {
        this.onChoose(item);
    }
}
