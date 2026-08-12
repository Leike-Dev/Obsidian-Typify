import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setImmediate as waitForImmediate } from 'node:timers/promises';
import { DOMManager } from '../src/managers/dom-manager';

function restoreGlobal(name, descriptor) {
    if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
    } else {
        delete globalThis[name];
    }
}

test('reprocessAllPills exits before touching the DOM after cleanup', () => {
    const activeDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'activeDocument');
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    let activeDocumentReads = 0;

    Object.defineProperty(globalThis, 'activeDocument', {
        configurable: true,
        get() {
            activeDocumentReads += 1;
            throw new Error('activeDocument must not be read after cleanup');
        },
    });

    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        get() {
            throw new Error('document must not be read after cleanup');
        },
    });

    try {
        const manager = Object.create(DOMManager.prototype);
        manager.observer = null;

        assert.doesNotThrow(() => manager.reprocessAllPills());
        assert.equal(activeDocumentReads, 0);
    } finally {
        restoreGlobal('activeDocument', activeDocumentDescriptor);
        restoreGlobal('document', documentDescriptor);
    }
});

test('reprocessAllPills scans every currently rendered root while active', () => {
    const activeDocumentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'activeDocument');
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const selectors = [];
    const processedPills = [];
    const processedValues = [];
    const processedMetadata = [];
    const processedBases = [];
    const processedCards = [];

    const styledPill = { getAttribute: () => 'status' };
    const styledValue = { getAttribute: () => 'status' };
    const metadataContainer = {};
    const basesView = {};

    const elementsBySelector = new Map([
        ['.custom-status-icon-pill', [styledPill]],
        ['.custom-status-icon-value', [styledValue]],
        ['.metadata-container', [metadataContainer]],
        ['.bases-view', [basesView]],
    ]);

    Object.defineProperty(globalThis, 'activeDocument', {
        configurable: true,
        value: {
            body: {
                findAll(selector) {
                    selectors.push(selector);
                    return elementsBySelector.get(selector) ?? [];
                },
            },
        },
    });

    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: {
            body: {
                findAll() {
                    return [];
                },
            },
        },
    });

    try {
        const manager = Object.create(DOMManager.prototype);
        manager.observer = {};
        manager.processPill = (...args) => processedPills.push(args);
        manager.processValueListElement = (...args) => processedValues.push(args);
        manager.processMetadataContainer = (container) => processedMetadata.push(container);
        manager.processBasesView = (view) => processedBases.push(view);
        manager.processBasesCardsView = (view) => processedCards.push(view);

        manager.reprocessAllPills();

        assert.deepEqual(selectors, [
            '.custom-status-icon-pill',
            '.custom-status-icon-value',
            '.metadata-container',
            '.bases-view',
        ]);
        assert.deepEqual(processedPills, [[styledPill, 'status']]);
        assert.deepEqual(processedValues, [[styledValue, 'status']]);
        assert.deepEqual(processedMetadata, [metadataContainer]);
        assert.deepEqual(processedBases, [basesView]);
        assert.deepEqual(processedCards, [basesView]);
    } finally {
        restoreGlobal('activeDocument', activeDocumentDescriptor);
        restoreGlobal('document', documentDescriptor);
    }
});

test('active leaf changes wait for deferred loading before reprocessing', async () => {
    const mutationObserverDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'MutationObserver');
    const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'window');
    let activeLeafHandler;

    class MutationObserverMock {
        disconnect() {}
        observe() {}
    }

    Object.defineProperty(globalThis, 'MutationObserver', {
        configurable: true,
        value: MutationObserverMock,
    });
    Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {
            setInterval: () => 1,
        },
    });

    const plugin = {
        app: {
            workspace: {
                on(eventName, handler) {
                    if (eventName === 'active-leaf-change') {
                        activeLeafHandler = handler;
                    }
                    return { eventName };
                },
            },
        },
        getTargetProperties: () => [],
        registerEvent: () => {},
        registerInterval: () => {},
    };

    try {
        const manager = new DOMManager(plugin, {});
        const order = [];

        manager.refreshProcessing = () => order.push('refresh');
        manager.reprocessAllPills = () => order.push('reprocess');
        manager.init();

        assert.equal(typeof activeLeafHandler, 'function');
        order.length = 0;

        activeLeafHandler({
            loadIfDeferred() {
                order.push('load');
                return Promise.resolve();
            },
        });

        assert.deepEqual(order, ['load']);
        await waitForImmediate();
        assert.deepEqual(order, ['load', 'refresh', 'reprocess']);

        order.length = 0;
        activeLeafHandler({
            loadIfDeferred() {
                order.push('load');
                return Promise.reject(new Error('deferred load failed'));
            },
        });

        await waitForImmediate();
        assert.deepEqual(order, ['load', 'refresh']);
    } finally {
        restoreGlobal('MutationObserver', mutationObserverDescriptor);
        restoreGlobal('window', windowDescriptor);
    }
});
