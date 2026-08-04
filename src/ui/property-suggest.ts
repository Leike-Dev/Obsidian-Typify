import { AbstractInputSuggest, App } from 'obsidian';

/**
 * Attaches to a text input to provide type-ahead autocomplete for vault property names.
 *
 * Usage in settings:
 * ```ts
 * new Setting(containerEl).addText(text => {
 *     const suggest = new PropertySuggest(this.app, text.inputEl, () => this.getAllPropertyNames());
 *     suggest.onSelect((prop) => { ... });
 *     return text.setPlaceholder('Property');
 * });
 * ```
 */
export class PropertySuggest extends AbstractInputSuggest<string> {
    private getProperties: () => string[];

    constructor(app: App, inputEl: HTMLInputElement, getProperties: () => string[]) {
        super(app, inputEl);
        this.getProperties = getProperties;
    }

    protected getSuggestions(query: string): string[] {
        const lower = query.toLowerCase();
        return this.getProperties()
            .filter(p => p.toLowerCase().includes(lower))
            .sort((a, b) => a.localeCompare(b));
    }

    renderSuggestion(prop: string, el: HTMLElement): void {
        el.setText(prop);
    }

    selectSuggestion(prop: string, evt: MouseEvent | KeyboardEvent): void {
        super.selectSuggestion(prop, evt);
        this.close();
    }
}
