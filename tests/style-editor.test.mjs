import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StyleEditorModal } from '../src/ui/StyleEditorModal';

function makePlugin(styles = []) {
    const saves = [];
    return {
        settings: { statusStyles: styles },
        saves,
        async saveSettings(options) { saves.push(options); },
    };
}

function makeStyle(overrides = {}) {
    return {
        name: 'Original',
        baseColor: '#6366f1',
        icon: '',
        appliesTo: ['status'],
        ...overrides,
    };
}

test('new link styles start with the name as their independent property value', async () => {
    const plugin = makePlugin();
    const editor = new StyleEditorModal({}, plugin, undefined, undefined, undefined, undefined, {
        name: 'Portal',
        matchValue: 'https://example.com',
    });

    await editor.handleSave();
    assert.equal(plugin.settings.statusStyles[0].name, 'Portal');
    assert.equal(plugin.settings.statusStyles[0].styleValue, 'Portal');
    assert.equal(plugin.settings.statusStyles[0].matchValue, 'https://example.com');
    assert.equal(plugin.saves.length, 1);
});

test('new style name and value start together, then become independent', () => {
    const editor = new StyleEditorModal({}, makePlugin());
    editor.updateStyleName('Pending');
    assert.equal(editor.styleValue, 'Pending');

    editor.updateStyleValue('To review');
    editor.updateStyleName('My status style');
    assert.equal(editor.styleName, 'My status style');
    assert.equal(editor.styleValue, 'To review');
});

test('renaming a legacy link style does not change its old match target', async () => {
    const original = makeStyle({ matchValue: 'https://example.com' });
    const plugin = makePlugin([original]);
    const editor = new StyleEditorModal({}, plugin, undefined, original, 0);
    editor.styleName = 'Renamed';

    await editor.handleSave();
    assert.equal(plugin.settings.statusStyles[0].name, 'Renamed');
    assert.equal(plugin.settings.statusStyles[0].styleValue, 'https://example.com');
    assert.equal(plugin.settings.statusStyles[0].matchValue, 'https://example.com');
});

test('duplicate styles start with a fresh value and no competing link or catch-all', async () => {
    const original = makeStyle({
        styleValue: 'Pending',
        matchValue: 'https://example.com',
        catchAll: true,
    });
    const plugin = makePlugin([original]);
    const editor = new StyleEditorModal({}, plugin, undefined, original);

    await editor.handleSave();
    assert.equal(plugin.settings.statusStyles.length, 2);
    assert.equal(plugin.settings.statusStyles[1].name, 'Original (copy)');
    assert.equal(plugin.settings.statusStyles[1].styleValue, 'Original (copy)');
    assert.equal(plugin.settings.statusStyles[1].matchValue, undefined);
    assert.equal(plugin.settings.statusStyles[1].catchAll, undefined);
});

test('different names cannot silently claim the same value in one property', async () => {
    const original = makeStyle({ styleValue: 'Pending' });
    const plugin = makePlugin([original]);
    const editor = new StyleEditorModal({}, plugin, undefined, undefined, undefined, undefined, {
        name: 'Another',
        styleValue: 'pending',
        appliesTo: ['status'],
    });

    await editor.handleSave();
    assert.equal(plugin.settings.statusStyles.length, 1);
    assert.equal(plugin.saves.length, 0);
});
