import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    getStyleValue,
    migrateStyleValues,
    styleMatchesValue,
    stylesShareTarget,
} from '../src/utils/style-value';

function makeStyle(overrides = {}) {
    return {
        name: 'Em análise',
        baseColor: '#6366f1',
        icon: '',
        appliesTo: ['status'],
        ...overrides,
    };
}

test('migration copies the old match target without changing the name or link', () => {
    const legacyPlain = makeStyle();
    const legacyLink = makeStyle({ name: 'Site', matchValue: 'https://example.com' });
    const migrated = migrateStyleValues([legacyPlain, legacyLink]);

    assert.equal(migrated[0].styleValue, 'Em análise');
    assert.equal(migrated[1].styleValue, 'https://example.com');
    assert.equal(migrated[1].matchValue, 'https://example.com');
    assert.equal(migrated[1].name, 'Site');
    assert.equal(legacyPlain.styleValue, undefined);
    assert.equal(legacyLink.styleValue, undefined);
});

test('migration retains an independently edited value and is idempotent', () => {
    const style = makeStyle({ styleValue: 'Revisar', matchValue: 'https://example.com' });
    assert.equal(getStyleValue(style), 'Revisar');
    assert.equal(migrateStyleValues([style])[0], style);
});

test('batch matching uses the value and associated link, not the display name', () => {
    const style = makeStyle({ styleValue: 'Pendente', matchValue: 'https://example.com' });
    assert.equal(styleMatchesValue(style, 'pendente', 'STATUS'), true);
    assert.equal(styleMatchesValue(style, 'https://example.com', 'status'), true);
    assert.equal(styleMatchesValue(style, 'Em análise', 'status'), false);
    assert.equal(styleMatchesValue(style, 'Pendente', 'priority'), false);
});

test('catch-all covers its property while link prefixes remain independent', () => {
    const style = makeStyle({
        styleValue: 'Ignored',
        matchValue: 'https://example.com/',
        prefixMatch: true,
        catchAll: true,
    });
    assert.equal(styleMatchesValue(style, 'Anything', 'status'), true);
    assert.equal(styleMatchesValue(style, 'Anything', 'priority'), false);
    assert.equal(styleMatchesValue(style, 'https://example.com/page', 'status'), true);
});

test('conflict checks compare effective targets, including links and catch-all', () => {
    assert.equal(stylesShareTarget(
        makeStyle({ name: 'One', styleValue: 'Pendente' }),
        makeStyle({ name: 'Two', styleValue: 'pendente' }),
    ), true);
    assert.equal(stylesShareTarget(
        makeStyle({ name: 'One', styleValue: 'A', matchValue: 'https://example.com' }),
        makeStyle({ name: 'Two', styleValue: 'B', matchValue: 'https://example.com' }),
    ), true);
    assert.equal(stylesShareTarget(
        makeStyle({ styleValue: 'A', catchAll: true }),
        makeStyle({ styleValue: 'B', catchAll: true }),
    ), true);
    assert.equal(stylesShareTarget(
        makeStyle({ styleValue: 'A' }),
        makeStyle({ styleValue: 'B' }),
    ), false);
});
