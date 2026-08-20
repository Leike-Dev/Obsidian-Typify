import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StyleManagerList } from '../src/ui/manager/StyleManagerList.ts';


// Helper to create a fake element chain
const createFakeEl = () => {
    const el = {
        empty: () => {},
        setText: () => {},
        addClass: () => {},
        removeClass: () => {},
        appendChild: () => {},
        createDiv: () => createFakeEl(),
        createSpan: () => createFakeEl(),
        setCssStyles: () => {},
        setCssProps: () => {},
        childElementCount: 0,
        textContent: '',
        addEventListener: () => {}
    };
    return el;
};

// Fake t() and setIcon for test environment
globalThis.t = (key) => {
    if (key === 'manage_styles_count') return 'Count: {count}';
    return key;
};
globalThis.setIcon = () => {};
globalThis.HTMLElement = class {};

test('Property filter respects multiple appliesTo values (P2)', () => {
    let countText = '';
    const fakeListEl = createFakeEl();
    const fakeCountEl = createFakeEl();
    fakeCountEl.setText = (txt) => { countText = txt; };

    const fakePlugin = {
        settings: {
            statusStyles: [
                { name: 'style1', appliesTo: ['tags', 'status'] },
                { name: 'style2', appliesTo: ['priority'] }
            ]
        }
    };

    const managerList = new StyleManagerList(fakeListEl, fakeCountEl, fakePlugin, {
        onEdit: () => {}, onDuplicate: () => {}, onDelete: () => {}
    });

    managerList.render('', 'status', 'recent', {});
    assert.equal(countText, '1 style(s)');

    managerList.render('', 'tags', 'recent', {});
    assert.equal(countText, '1 style(s)');
});

test('Color mode filter respects simple/Minimalista (P3)', () => {
    let countText = '';
    const fakeListEl = createFakeEl();
    const fakeCountEl = createFakeEl();
    fakeCountEl.setText = (txt) => { countText = txt; };

    const fakePlugin = {
        settings: {
            statusStyles: [
                { name: 'style1', colorMode: 'simple' },
                { name: 'style2', colorMode: 'solid' }
            ]
        }
    };

    const managerList = new StyleManagerList(fakeListEl, fakeCountEl, fakePlugin, {
        onEdit: () => {}, onDuplicate: () => {}, onDelete: () => {}
    });

    managerList.render('', '__show_all__', 'recent', { colormode: 'colormode:simple' });
    assert.equal(countText, '1 style(s)');
});
