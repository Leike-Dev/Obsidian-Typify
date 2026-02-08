import { FuzzySuggestModal, App, setIcon, FuzzyMatch, getIcon } from 'obsidian';
import { LUCIDE_ICONS } from './lucide-icons';
import { t } from './lang/helpers';

// ============================================================================
// ICON PICKER MODAL - Fuzzy search for Lucide icons
// ============================================================================

/**
 * Modal for selecting an icon from the Lucide library.
 * Uses strict fuzzy matching to filter icons.
 */
export class IconPickerModal extends FuzzySuggestModal<string> {
    private recentIcons: string[];
    private onChoose: (icon: string) => void;

    constructor(app: App, recentIcons: string[], onChoose: (icon: string) => void) {
        super(app);
        this.recentIcons = recentIcons || [];
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
        // Recent icons first, then all others
        const recentSet = new Set(this.recentIcons);
        const others = LUCIDE_ICONS.filter(i => !recentSet.has(i));
        return [...this.recentIcons, ...others];
    }

    getItemText(item: string): string {
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
        setIcon(iconEl, icon);

        // Icon name
        el.createSpan({ text: icon, cls: 'csi-icon-suggestion-name' });

        // Recent badge
        if (this.recentIcons.includes(icon)) {
            el.createSpan({ text: '●', cls: 'csi-icon-recent-badge' });
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
