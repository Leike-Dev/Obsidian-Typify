import { FuzzySuggestModal, App, setIcon, FuzzyMatch } from 'obsidian';
import { LUCIDE_ICONS } from './lucide-icons';
import { t } from './lang/helpers';
import { CustomIconsManager } from './custom-icons';

// ============================================================================
// ICON PICKER MODAL - Fuzzy search for Lucide icons
// ============================================================================

/**
 * Modal for selecting an icon from the Lucide library.
 * Uses strict fuzzy matching to filter icons.
 */
export class IconPickerModal extends FuzzySuggestModal<string> {
    private recentIcons: string[];
    private customIconsManager: CustomIconsManager | null;
    private onChoose: (icon: string) => void;

    constructor(app: App, recentIcons: string[], customIconsManager: CustomIconsManager | null, onChoose: (icon: string) => void) {
        super(app);
        this.recentIcons = recentIcons || [];
        this.customIconsManager = customIconsManager;
        this.onChoose = onChoose;
        this.setPlaceholder(t('icon_picker_placeholder'));
        this.setInstructions([
            { command: '↑↓', purpose: t('icon_picker_navigate') },
            { command: '↵', purpose: t('icon_picker_select') },
            { command: 'esc', purpose: t('icon_picker_close') }
        ]);
    }

    /**
     * Returns the list of items to search.
     * Recent icons are shown at the top.
     */
    getItems(): string[] {
        // Custom icons first (with prefix), then recent, then all Lucide
        const customWithPrefix = this.customIconsManager
            ? this.customIconsManager.listIcons().map(i => `custom:${i}`)
            : [];
        const recentSet = new Set(this.recentIcons);
        const customSet = new Set(customWithPrefix);
        const others = LUCIDE_ICONS.filter(i => !recentSet.has(i) && !customSet.has(i));
        return [...customWithPrefix, ...this.recentIcons, ...others];
    }

    getItemText(item: string): string {
        // Strip custom: prefix so users can search by icon name directly
        if (item.startsWith('custom:')) {
            return item.replace('custom:', '');
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

        if (icon.startsWith('custom:')) {
            // Custom icon: render inline SVG from cache
            const name = icon.replace('custom:', '');
            const svgContent = this.customIconsManager?.getSvgContent(name);
            if (svgContent) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgContent, 'image/svg+xml');
                const svg = doc.documentElement;
                if (svg instanceof SVGElement) {
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
    onChooseSuggestion(match: FuzzyMatch<string>, evt: MouseEvent | KeyboardEvent): void {
        this.onChoose(match.item);
    }

    onChooseItem(item: string, evt: MouseEvent | KeyboardEvent): void {
        this.onChoose(item);
    }
}
