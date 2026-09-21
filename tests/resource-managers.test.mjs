import test from 'node:test';
import assert from 'node:assert/strict';
import { CustomImagesManager } from '../src/managers/custom-images.ts';
import { FaviconManager } from '../src/managers/favicon-manager.ts';

function createAdapter(files, stats) {
    let binaryReads = 0;
    const resourcePaths = [];

    return {
        adapter: {
            exists: async () => true,
            list: async () => ({ files, folders: [] }),
            stat: async (path) => stats[path] ?? null,
            readBinary: async () => {
                binaryReads++;
                throw new Error('resource contents should not be read during initialization');
            },
            getResourcePath: (path) => {
                resourcePaths.push(path);
                return `app://local/${encodeURIComponent(path)}`;
            },
        },
        getBinaryReads: () => binaryReads,
        resourcePaths,
    };
}

test('custom images use versioned Obsidian resource URLs without reading file contents', async () => {
    const filePath = '.obsidian/plugins/typify/img/my cat.jpg';
    const { adapter, getBinaryReads, resourcePaths } = createAdapter(
        [filePath],
        { [filePath]: { size: 1024, mtime: 1234 } },
    );
    const manager = new CustomImagesManager({
        vault: { configDir: '.obsidian', adapter },
    }, 'typify');

    const result = await manager.initialize();

    assert.deepEqual(result, { loaded: 1, errors: [] });
    assert.equal(getBinaryReads(), 0);
    assert.deepEqual(resourcePaths, [filePath]);
    assert.equal(
        manager.getImageCssUrl('my cat.jpg'),
        `url("app://local/${encodeURIComponent(filePath)}?typify-mtime=1234")`,
    );
});

test('favicon cache uses versioned Obsidian resource URLs without reading file contents', async () => {
    const faviconPath = '.obsidian/plugins/typify/favicons/example.com.png';
    const failedPath = '.obsidian/plugins/typify/favicons/missing.example.failed';
    const { adapter, getBinaryReads, resourcePaths } = createAdapter(
        [faviconPath, failedPath],
        { [faviconPath]: { size: 512, mtime: 5678 } },
    );
    const plugin = {
        app: { vault: { configDir: '.obsidian', adapter } },
        manifest: { id: 'typify' },
        settings: { faviconProvider: 'direct' },
    };
    const manager = new FaviconManager(plugin);

    await manager.initialize();

    assert.equal(getBinaryReads(), 0);
    assert.deepEqual(resourcePaths, [faviconPath]);
    assert.equal(
        manager.getFaviconCssUrl('example.com'),
        `url("app://local/${encodeURIComponent(faviconPath)}?typify-mtime=5678")`,
    );
    assert.equal(manager.hasFailed('missing.example'), true);
});
