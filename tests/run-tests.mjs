import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { build } from 'esbuild';

const normalizePath = (path) => path.replaceAll('\\', '/');

const testMocks = {
    name: 'typify-test-mocks',
    setup(context) {
        context.onResolve({ filter: /^obsidian$/ }, () => ({
            path: 'obsidian',
            namespace: 'typify-test-mocks',
        }));
        context.onLoad({ filter: /^obsidian$/, namespace: 'typify-test-mocks' }, () => ({
            contents: 'export const getIcon = () => null;',
            loader: 'js',
        }));

        context.onResolve({ filter: /^\.\.\/main$/ }, (args) => {
            const importer = normalizePath(args.importer);
            if (
                importer.endsWith('/src/managers/dom-manager.ts') ||
                importer.endsWith('/src/managers/style-manager.ts')
            ) {
                return {
                    path: 'typify-main',
                    namespace: 'typify-test-mocks',
                };
            }
        });
        context.onLoad({ filter: /^typify-main$/, namespace: 'typify-test-mocks' }, () => ({
            contents: 'export default class TypifyPlugin {}',
            loader: 'js',
        }));

        context.onResolve({ filter: /^\.\/style-manager$/ }, (args) => {
            if (normalizePath(args.importer).endsWith('/src/managers/dom-manager.ts')) {
                return {
                    path: 'style-manager',
                    namespace: 'typify-test-mocks',
                };
            }
        });
        context.onLoad({ filter: /^style-manager$/, namespace: 'typify-test-mocks' }, () => ({
            contents: 'export class StyleManager {}',
            loader: 'js',
        }));
    },
};

const outputDirectory = await mkdtemp(join(tmpdir(), 'typify-tests-'));
let exitCode = 1;

try {
    await build({
        absWorkingDir: process.cwd(),
        entryPoints: [
            'tests/dom-manager.test.mjs',
            'tests/style-manager.test.mjs',
        ],
        bundle: true,
        platform: 'node',
        format: 'cjs',
        outdir: outputDirectory,
        outExtension: { '.js': '.cjs' },
        sourcemap: 'inline',
        logLevel: 'silent',
        plugins: [testMocks],
    });

    const testFiles = (await readdir(outputDirectory))
        .filter((filename) => filename.endsWith('.test.cjs'))
        .sort()
        .map((filename) => join(outputDirectory, filename));

    const result = spawnSync(process.execPath, ['--test', ...testFiles], {
        stdio: 'inherit',
    });

    if (result.error) throw result.error;
    exitCode = result.status ?? 1;
} catch (error) {
    console.error(error);
} finally {
    await rm(outputDirectory, { recursive: true, force: true });
}

process.exitCode = exitCode;
