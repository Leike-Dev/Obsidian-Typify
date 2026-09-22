import assert from 'node:assert/strict';
import { test } from 'node:test';
import { StyleManager } from '../src/managers/style-manager';

function restoreGlobal(name, descriptor) {
    if (descriptor) {
        Object.defineProperty(globalThis, name, descriptor);
    } else {
        delete globalThis[name];
    }
}

function installFakeStyleDocument() {
    const createElDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'createEl');
    const documentDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');

    Object.defineProperty(globalThis, 'createEl', {
        configurable: true,
        value: (tagName) => {
            assert.equal(tagName, 'style');
            return {
                id: '',
                isConnected: false,
                textContent: '',
                remove() {
                    this.isConnected = false;
                },
            };
        },
    });

    Object.defineProperty(globalThis, 'document', {
        configurable: true,
        value: {
            head: {
                appendChild(element) {
                    element.isConnected = true;
                    return element;
                },
            },
        },
    });

    return () => {
        restoreGlobal('createEl', createElDescriptor);
        restoreGlobal('document', documentDescriptor);
    };
}

function createStyle(overrides = {}) {
    return {
        name: 'GitHub',
        matchValue: 'https://github.com',
        appliesTo: ['link'],
        icon: '',
        baseColor: '#4078c0',
        colorMode: 'subtle',
        shape: 'pill',
        ...overrides,
    };
}

function createManager(styles) {
    return new StyleManager({
        settings: {
            statusStyles: styles,
        },
    });
}

test('runtime styles use the target document and update without recreating the element', () => {
    function createStyleDocument() {
        const elements = [];
        return {
            elements,
            head: {
                createEl(tagName, options) {
                    assert.equal(tagName, 'style');
                    const element = {
                        id: options.attr.id,
                        isConnected: true,
                        textContent: '',
                        remove() {
                            this.isConnected = false;
                        },
                    };
                    elements.push(element);
                    return element;
                },
            },
        };
    }

    const mainDocument = createStyleDocument();
    const popoutDocument = createStyleDocument();
    const documents = [mainDocument, popoutDocument];
    const plugin = {
        settings: { statusStyles: [createStyle()] },
        windowManager: { getDocuments: () => documents },
    };
    const manager = new StyleManager(plugin);

    try {
        manager.buildCache();
        for (const doc of documents) {
            assert.equal(doc.elements.length, 1);
            assert.equal(doc.elements[0].id, 'typify-dynamic-styles');
            assert.match(doc.elements[0].textContent, /typify-style-0/);
        }

        plugin.settings.statusStyles = [];
        manager.buildCache();
        for (const doc of documents) {
            assert.equal(doc.elements.length, 1);
            assert.equal(doc.elements[0].textContent, '');
        }
    } finally {
        manager.cleanup();
    }

    for (const doc of documents) {
        assert.equal(doc.elements[0].isConnected, false);
    }
});

test('legacy styles with omitted prefixMatch default to exact match', () => {
    const restoreDocument = installFakeStyleDocument();
    const manager = createManager([createStyle()]);

    try {
        manager.buildCache();

        assert.equal(
            manager.findMatchingClass('https://github.com/Leike-Dev/Obsidian-Typify', 'LINK'),
            undefined,
        );
        assert.equal(
            manager.findMatchingClass('https://github.com/Leike-Dev/Obsidian-Typify', 'other'),
            undefined,
        );
    } finally {
        manager.cleanup();
        restoreDocument();
    }
});

test('prefixMatch false keeps exact matching without accepting longer values', () => {
    const restoreDocument = installFakeStyleDocument();
    const manager = createManager([
        createStyle({
            prefixMatch: false,
        }),
    ]);

    try {
        manager.buildCache();

        assert.equal(
            manager.findMatchingClass('https://github.com', 'link'),
            'typify-style-0',
        );
        assert.equal(
            manager.findMatchingClass('https://github.com/Leike-Dev', 'link'),
            undefined,
        );
    } finally {
        manager.cleanup();
        restoreDocument();
    }
});

test('the longest matching prefix wins', () => {
    const restoreDocument = installFakeStyleDocument();
    const manager = createManager([
        createStyle({
            name: 'GitHub',
            appliesTo: [],
            prefixMatch: true,
        }),
        createStyle({
            name: 'Typify repository',
            matchValue: 'https://github.com/Leike-Dev',
            appliesTo: [],
            prefixMatch: true,
        }),
    ]);

    try {
        manager.buildCache();

        assert.equal(
            manager.findMatchingClass('https://github.com/Leike-Dev/Obsidian-Typify', 'link'),
            'typify-style-1',
        );
    } finally {
        manager.cleanup();
        restoreDocument();
    }
});
