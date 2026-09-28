import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StyleManagerBatchActions } from '../src/ui/manager/StyleManagerBatchActions';

function makeElement() {
    return {
        children: [],
        empty() { this.children = []; },
        createDiv() {
            const child = makeElement();
            this.children.push(child);
            return child;
        },
        createSpan() {
            const child = makeElement();
            this.children.push(child);
            return child;
        },
        createEl() {
            const child = makeElement();
            this.children.push(child);
            return child;
        },
        addEventListener() {},
    };
}

function makeBatchActions(styles) {
    const container = makeElement();
    const file = { path: 'example.md' };
    const app = {
        vault: { getMarkdownFiles: () => [file] },
        metadataCache: { getFileCache: () => ({ frontmatter: { status: 'Pending' } }) },
    };
    const plugin = { settings: { statusStyles: styles } };
    return { container, actions: new StyleManagerBatchActions(container, app, plugin, {}) };
}

test('batch creation recognizes an existing match with a different display name', () => {
    const { container, actions } = makeBatchActions([
        { name: 'Display', styleValue: 'Pending', appliesTo: ['status'] },
    ]);
    actions.renderHint('status');
    assert.equal(container.children.length, 0);
});

test('batch creation does not mistake an existing display name for a match', () => {
    const { container, actions } = makeBatchActions([
        { name: 'Pending', styleValue: 'Something else', appliesTo: ['status'] },
    ]);
    actions.renderHint('status');
    assert.ok(container.children.length > 0);
});

test('batch creation recognizes a catch-all style for the property', () => {
    const { container, actions } = makeBatchActions([
        { name: 'Fallback', styleValue: 'Ignored', appliesTo: ['status'], catchAll: true },
    ]);
    actions.renderHint('status');
    assert.equal(container.children.length, 0);
});
