// ============================================================================
// STYLE MANAGER BATCH ACTIONS — Batch create hint and confirmation
// ============================================================================

import { App, ButtonComponent, Notice } from 'obsidian';
import type TypifyPlugin from '../../main';
import { StatusStyle, DEFAULT_STATUS_COLOR } from '../../types';
import { t } from '../../lang/helpers';

export interface BatchCallbacks {
    onBatchCreated: () => void;
}

/**
 * Manages the batch creation hint and confirmation flow.
 */
export class StyleManagerBatchActions {
    private containerEl: HTMLElement;
    private plugin: TypifyPlugin;
    private app: App;
    private callbacks: BatchCallbacks;

    constructor(
        containerEl: HTMLElement,
        app: App,
        plugin: TypifyPlugin,
        callbacks: BatchCallbacks
    ) {
        this.containerEl = containerEl;
        this.app = app;
        this.plugin = plugin;
        this.callbacks = callbacks;
    }

    /**
     * Renders the batch creation hint for the given scope.
     */
    renderHint(scope: string): void {
        this.containerEl.empty();

        if (scope === '__show_all__') return;

        const candidateValues = this.getCandidateValuesForScope(scope);
        if (candidateValues.length === 0) return;

        // Names that exist in the current scope
        const existingInScope = new Set(
            this.plugin.settings.statusStyles
                .filter(s => {
                    const styleScope = (s.appliesTo && s.appliesTo.length > 0)
                        ? s.appliesTo[0]!.toLowerCase()
                        : '__all__';
                    return styleScope === scope.toLowerCase();
                })
                .map(s => s.name.toLowerCase())
        );

        // Names that exist in global
        const existingGlobal = new Set(
            this.plugin.settings.statusStyles
                .filter(s => !s.appliesTo || s.appliesTo.length === 0)
                .map(s => s.name.toLowerCase())
        );

        // Values not in current scope
        const notInScope = candidateValues.filter(v => !existingInScope.has(v.toLowerCase()));
        if (notInScope.length === 0) return;

        // Separate: already in global vs truly new
        const alreadyGlobal = notInScope.filter(v => existingGlobal.has(v.toLowerCase()));
        const trulyNew = notInScope.filter(v => !existingGlobal.has(v.toLowerCase()));

        const totalUncreated = notInScope.length;

        if (totalUncreated > 50) {
            this.containerEl.createSpan({
                text: t('batch_create_too_many').replace('{count}', String(totalUncreated)),
                cls: 'typify-batch-hint-text'
            });
            return;
        }

        // Helper: render a list of values as inline-code spans separated by ", "
        const renderInlineCodeList = (parent: HTMLElement, values: string[]) => {
            values.forEach((val, i) => {
                parent.createSpan({ text: val, cls: 'typify-inline-code' });
                if (i < values.length - 1) {
                    parent.createSpan({ text: ', ' });
                }
            });
        };

        // Case 1: All candidates already in global — no batch create needed
        if (trulyNew.length === 0 && alreadyGlobal.length > 0) {
            const note = this.containerEl.createDiv({ cls: 'typify-batch-hint-line' });
            note.createSpan({
                text: t('batch_create_all_global_before'),
                cls: 'typify-batch-hint-note'
            });
            renderInlineCodeList(note, alreadyGlobal);
            note.createSpan({
                text: t('batch_create_all_global_after'),
                cls: 'typify-batch-hint-note'
            });
            return;
        }

        // Case 2: Some truly new values — show batch create prompt
        const hintText = this.containerEl.createDiv({ cls: 'typify-batch-hint-line' });
        hintText.createSpan({
            text: t('batch_create_detected_before').replace('{count}', String(trulyNew.length)),
            cls: 'typify-batch-hint-text'
        });
        const actionEl = hintText.createEl('b', {
            text: t('batch_create_detected_action'),
            cls: 'typify-batch-hint-action'
        });
        hintText.createSpan({
            text: t('batch_create_detected_after'),
            cls: 'typify-batch-hint-text'
        });

        actionEl.addEventListener('click', () => {
            this.showConfirmation(scope, trulyNew);
        });

        // If some values already exist in global, show supplementary note
        if (alreadyGlobal.length > 0) {
            const globalNote = this.containerEl.createDiv({ cls: 'typify-batch-hint-line' });
            globalNote.createSpan({
                text: t('batch_create_already_global_before'),
                cls: 'typify-batch-hint-note'
            });
            renderInlineCodeList(globalNote, alreadyGlobal);
            globalNote.createSpan({
                text: t('batch_create_already_global_after'),
                cls: 'typify-batch-hint-note'
            });
        }
    }

    private showConfirmation(scope: string, trulyNew: string[]): void {
        this.containerEl.empty();

        if (trulyNew.length === 0) return;

        const confirmEl = this.containerEl.createDiv({ cls: 'typify-batch-confirm' });
        confirmEl.createDiv({
            text: t('batch_create_confirm_desc').replace('{values}', trulyNew.join(', ')),
            cls: 'typify-batch-confirm-text'
        });

        const btnGroup = confirmEl.createDiv({ cls: 'typify-batch-confirm-btns' });

        new ButtonComponent(btnGroup)
            .setButtonText(t('confirm_button'))
            .setCta()
            .onClick(() => {
                void (async () => {
                    let created = 0;
                    const existingNames = new Set(
                        this.plugin.settings.statusStyles.map(s => s.name.toLowerCase())
                    );

                    for (const val of trulyNew) {
                        if (existingNames.has(val.toLowerCase())) continue;

                        const style: StatusStyle = {
                            name: val,
                            baseColor: DEFAULT_STATUS_COLOR,
                            icon: '',
                            appliesTo: [scope],
                            shape: 'pill',
                            colorMode: 'subtle'
                        };
                        this.plugin.settings.statusStyles.push(style);
                        created++;
                    }

                    await this.plugin.saveSettings();
                    new Notice(t('batch_create_success').replace('{count}', String(created)));
                    this.callbacks.onBatchCreated();
                })();
            });

        new ButtonComponent(btnGroup)
            .setButtonText(t('cancel_button'))
            .onClick(() => {
                this.renderHint(scope);
            });
    }

    private getCandidateValuesForScope(scope: string): string[] {
        const values = new Set<string>();

        const files = this.app.vault.getMarkdownFiles();
        for (const file of files) {
            const cache = this.app.metadataCache.getFileCache(file);
            const frontmatter = cache?.frontmatter;
            if (!frontmatter) continue;

            const val: unknown = frontmatter[scope];
            if (val == null) continue;

            if (Array.isArray(val)) {
                for (const v of val) {
                    if (typeof v === 'string' && v.trim()) {
                        values.add(v.trim());
                    }
                }
            } else if (typeof val === 'string' && val.trim()) {
                values.add(val.trim());
            }
        }

        return [...values].sort((a, b) => a.localeCompare(b));
    }
}
