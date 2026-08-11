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

test('legacy styles with omitted prefixMatch keep prefix matching enabled', () => {
    const restoreDocument = installFakeStyleDocument();
    const manager = createManager([createStyle()]);

    try {
        manager.buildCache();

        assert.equal(
            manager.findMatchingClass('https://github.com/Leike-Dev/Obsidian-Typify', 'LINK'),
            'typify-style-0',
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
        }),
        createStyle({
            name: 'Typify repository',
            matchValue: 'https://github.com/Leike-Dev',
            appliesTo: [],
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
