import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DOMManager } from '../src/managers/dom-manager';

// ============================================================================
// HELPERS
// ============================================================================

function restoreGlobal(name, descriptor) {
    if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
    } else {
        delete globalThis[name];
    }
}

/**
 * Creates a minimal mock plugin for saveSettings tests.
 * Tracks which side-effects are invoked.
 */
function createMockPlugin(targetProps = ['status'], saveData = async () => {}) {
    const calls = {
        saveData: 0,
        buildCache: 0,
        updateBodyClasses: 0,
        reprocessAllPills: 0,
    };

    const plugin = {
        settings: {},
        cachedTargetProps: null,
        settingsSaveQueue: Promise.resolve(),
        getTargetProperties: () => targetProps,
        saveData: async (settings) => {
            calls.saveData++;
            await saveData(settings);
        },
        styleManager: {
            buildCache: () => { calls.buildCache++; },
        },
        domManager: {
            reprocessAllPills: () => { calls.reprocessAllPills++; },
        },
        updateBodyClasses: () => { calls.updateBodyClasses++; },
    };

    // Mirrors saveSettings without requiring a full Obsidian Plugin instance.
    plugin.saveSettings = async (options) => {
        const {
            rebuildStyles = false,
            updateBodyClasses = false,
        } = options;

        const reprocessPills = rebuildStyles || options.reprocessPills === true;

        plugin.cachedTargetProps = null;

        if (rebuildStyles) {
            plugin.styleManager.buildCache();
        }

        if (updateBodyClasses) {
            plugin.updateBodyClasses();
        }

        if (reprocessPills && plugin.domManager) {
            plugin.domManager.reprocessAllPills();
        }

        const saveOperation = plugin.settingsSaveQueue.then(() => plugin.saveData(plugin.settings));
        plugin.settingsSaveQueue = saveOperation.catch(() => {});
        await saveOperation;
    };

    return { plugin, calls };
}

// ============================================================================
// TESTS: saveSettings effect matrix
// ============================================================================

test('saveSettings({}) only persists — no side-effects', async () => {
    const { plugin, calls } = createMockPlugin();

    await plugin.saveSettings({});

    assert.equal(calls.saveData, 1);
    assert.equal(calls.buildCache, 0);
    assert.equal(calls.updateBodyClasses, 0);
    assert.equal(calls.reprocessAllPills, 0);
});

test('saveSettings({ rebuildStyles: true }) calls buildCache and reprocessAllPills', async () => {
    const { plugin, calls } = createMockPlugin();

    await plugin.saveSettings({ rebuildStyles: true });

    assert.equal(calls.saveData, 1);
    assert.equal(calls.buildCache, 1);
    assert.equal(calls.reprocessAllPills, 1, 'rebuildStyles must imply reprocessPills');
    assert.equal(calls.updateBodyClasses, 0);
});

test('saveSettings({ reprocessPills: true }) calls reprocessAllPills without buildCache', async () => {
    const { plugin, calls } = createMockPlugin();

    await plugin.saveSettings({ reprocessPills: true });

    assert.equal(calls.saveData, 1);
    assert.equal(calls.buildCache, 0);
    assert.equal(calls.reprocessAllPills, 1);
    assert.equal(calls.updateBodyClasses, 0);
});

test('saveSettings({ updateBodyClasses: true }) calls updateBodyClasses without rebuild', async () => {
    const { plugin, calls } = createMockPlugin();

    await plugin.saveSettings({ updateBodyClasses: true });

    assert.equal(calls.saveData, 1);
    assert.equal(calls.updateBodyClasses, 1);
    assert.equal(calls.buildCache, 0);
    assert.equal(calls.reprocessAllPills, 0);
});

test('saveSettings applies visual effects before the disk write finishes', async () => {
    let finishSave;
    const pendingSave = new Promise((resolve) => { finishSave = resolve; });
    const { plugin, calls } = createMockPlugin(['status'], () => pendingSave);

    const savePromise = plugin.saveSettings({ rebuildStyles: true, updateBodyClasses: true });

    assert.equal(calls.buildCache, 1);
    assert.equal(calls.updateBodyClasses, 1);
    assert.equal(calls.reprocessAllPills, 1);

    await Promise.resolve();
    assert.equal(calls.saveData, 1);

    finishSave();
    await savePromise;
});

test('saveSettings serializes rapid disk writes', async () => {
    const pendingSaves = [];
    let activeWrites = 0;
    let maxActiveWrites = 0;
    const { plugin, calls } = createMockPlugin(['status'], () => new Promise((resolve) => {
        activeWrites++;
        maxActiveWrites = Math.max(maxActiveWrites, activeWrites);
        pendingSaves.push(() => {
            activeWrites--;
            resolve();
        });
    }));

    const firstSave = plugin.saveSettings({});
    await Promise.resolve();
    const secondSave = plugin.saveSettings({});
    await Promise.resolve();

    assert.equal(calls.saveData, 1, 'second write must wait for the first');
    pendingSaves.shift()();
    await firstSave;
    await Promise.resolve();

    assert.equal(calls.saveData, 2);
    pendingSaves.shift()();
    await secondSave;
    assert.equal(maxActiveWrites, 1);
});

// ============================================================================
// TESTS: reprocessAllPills targetProperty guard
// ============================================================================

test('reprocessAllPills clears pills when property is removed from targets', () => {
    const activeDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'activeDocument');
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const htmlElementDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'HTMLElement');

    // Minimal HTMLElement mock for instanceof checks
    class HTMLElementMock {}
    Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: HTMLElementMock });

    const clearedPills = [];
    const processedPills = [];

    const pill = Object.create(HTMLElementMock.prototype, {
        getAttribute: { value: () => 'removed-prop' },
        classList: { value: { remove: (cls) => clearedPills.push(cls) } },
        removeAttribute: { value: () => {} },
        querySelector: { value: () => null },
    });

    Object.defineProperty(globalThis, 'activeDocument', {
        configurable: true,
        value: {
            body: {
                findAll(selector) {
                    if (selector === '.custom-status-icon-pill') return [pill];
                    return [];
                },
            },
        },
    });
    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: { body: { findAll() { return []; } } },
    });

    try {
        const manager = Object.create(DOMManager.prototype);
        manager.observer = {};
        manager.plugin = {
            getTargetProperties: () => ['status'],
            windowManager: { getDocuments: () => [globalThis.document, globalThis.activeDocument].filter(Boolean) }
        };
        manager.styleManager = { clearStyle: () => {} };
        manager.processPill = (...args) => processedPills.push(args);
        manager.processMetadataContainer = () => {};
        manager.processBasesView = () => {};
        manager.processBasesCardsView = () => {};
        manager.processValueListElement = () => {};

        manager.reprocessAllPills();

        assert.equal(processedPills.length, 0, 'Should NOT reprocess pill with removed property');
        assert.ok(clearedPills.includes('custom-status-icon-pill'), 'Should remove the pill class');
    } finally {
        restoreGlobal('activeDocument', activeDocumentDescriptor);
        restoreGlobal('document', documentDescriptor);
        restoreGlobal('HTMLElement', htmlElementDescriptor);
    }
});

test('reprocessAllPills restores link text when property is removed', () => {
    const activeDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'activeDocument');
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const htmlElementDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'HTMLElement');

    class HTMLElementMock {}
    Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: HTMLElementMock });

    let restoredText = null;

    const linkContent = Object.create(HTMLElementMock.prototype, {
        getAttribute: { value: (attr) => attr === 'data-href' ? 'https://example.com' : null },
        textContent: {
            get() { return 'My Link Name'; },
            set(val) { restoredText = val; },
        },
        instanceOf: { value: () => true },
    });

    const pill = Object.create(HTMLElementMock.prototype, {
        getAttribute: { value: () => 'removed-prop' },
        classList: { value: { remove: () => {} } },
        removeAttribute: { value: () => {} },
        querySelector: {
            value: (sel) => {
                if (sel === '.multi-select-pill-content.external-link') return linkContent;
                return null;
            },
        },
    });

    Object.defineProperty(globalThis, 'activeDocument', {
        configurable: true,
        value: {
            body: {
                findAll(selector) {
                    if (selector === '.custom-status-icon-pill') return [pill];
                    return [];
                },
            },
        },
    });
    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: { body: { findAll() { return []; } } },
    });

    try {
        const manager = Object.create(DOMManager.prototype);
        manager.observer = {};
        manager.plugin = {
            getTargetProperties: () => ['status'],
            windowManager: { getDocuments: () => [globalThis.document, globalThis.activeDocument].filter(Boolean) }
        };
        manager.styleManager = { clearStyle: () => {} };
        manager.processPill = () => {};
        manager.processMetadataContainer = () => {};
        manager.processBasesView = () => {};
        manager.processBasesCardsView = () => {};
        manager.processValueListElement = () => {};

        manager.reprocessAllPills();

        assert.equal(restoredText, 'https://example.com', 'URL should be restored when property is removed');
    } finally {
        restoreGlobal('activeDocument', activeDocumentDescriptor);
        restoreGlobal('document', documentDescriptor);
        restoreGlobal('HTMLElement', htmlElementDescriptor);
    }
});

test('reprocessAllPills unwraps .typify-single-value when property is removed', () => {
    const activeDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'activeDocument');
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const htmlElementDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'HTMLElement');

    class HTMLElementMock {}
    Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: HTMLElementMock });

    let parentTextContent = null;

    const parent = {
        set textContent(val) { parentTextContent = val; },
    };

    const valueElement = Object.create(HTMLElementMock.prototype, {
        getAttribute: { value: () => 'removed-prop' },
        classList: {
            value: {
                remove: () => {},
                contains: (cls) => cls === 'typify-single-value',
            },
        },
        removeAttribute: { value: () => {} },
        querySelector: { value: () => null },
        textContent: { get() { return 'My Value'; } },
        parentElement: { get() { return parent; } },
    });

    Object.defineProperty(globalThis, 'activeDocument', {
        configurable: true,
        value: {
            body: {
                findAll(selector) {
                    if (selector === '.custom-status-icon-value') return [valueElement];
                    return [];
                },
            },
        },
    });
    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: { body: { findAll() { return []; } } },
    });

    try {
        const manager = Object.create(DOMManager.prototype);
        manager.observer = {};
        manager.plugin = {
            getTargetProperties: () => ['status'],
            windowManager: { getDocuments: () => [globalThis.document, globalThis.activeDocument].filter(Boolean) }
        };
        manager.styleManager = { clearStyle: () => {} };
        manager.processPill = () => {};
        manager.processMetadataContainer = () => {};
        manager.processBasesView = () => {};
        manager.processBasesCardsView = () => {};
        manager.processValueListElement = () => {};

        manager.reprocessAllPills();

        assert.equal(parentTextContent, 'My Value', 'Single-value wrapper should be unwrapped');
    } finally {
        restoreGlobal('activeDocument', activeDocumentDescriptor);
        restoreGlobal('document', documentDescriptor);
        restoreGlobal('HTMLElement', htmlElementDescriptor);
    }
});
