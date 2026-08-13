// ============================================================================
// STYLE DELETE CONFIRMATION — Inline confirmation for deleting a style
// ============================================================================

import { ButtonComponent } from 'obsidian';
import { t } from '../../lang/helpers';

export interface DeleteConfirmationCallbacks {
    onConfirm: (index: number) => void;
    onCancel: () => void;
}

/**
 * Renders an inline delete confirmation panel inside an item element.
 */
export function showDeleteConfirmation(
    itemEl: HTMLElement,
    styleName: string,
    index: number,
    callbacks: DeleteConfirmationCallbacks
): void {
    const confirmEl = itemEl.createDiv({ cls: 'typify-manager-confirm' });
    confirmEl.createSpan({
        text: t('delete_style_confirm').replace('{name}', styleName),
        cls: 'typify-manager-confirm-text'
    });

    const btnGroup = confirmEl.createDiv({ cls: 'typify-manager-confirm-btns' });

    new ButtonComponent(btnGroup)
        .setButtonText(t('confirm_button'))
        .setDestructive()
        .onClick(() => {
            callbacks.onConfirm(index);
        });

    new ButtonComponent(btnGroup)
        .setButtonText(t('cancel_button'))
        .onClick(() => {
            confirmEl.remove();
            callbacks.onCancel();
        });
}
