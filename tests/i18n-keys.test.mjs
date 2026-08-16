import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { test } from 'node:test';
import process from 'node:process';

const projectRoot = process.cwd();
const sourceRoot = join(projectRoot, 'src');
const englishFile = join(sourceRoot, 'lang', 'en.ts');

function walk(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const fullPath = join(directory, entry.name);
        return entry.isDirectory() ? walk(fullPath) : [fullPath];
    });
}

function extractTranslationKeys(source) {
    return [...source.matchAll(/^\s*'([^']+)'\s*:/gm)]
        .map(match => match[1]);
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('translation keys are referenced by the source code', () => {
    const englishSource = readFileSync(englishFile, 'utf8');
    const translationKeys = extractTranslationKeys(englishSource);

    const sourceCode = walk(sourceRoot)
        .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
        .filter(file => !file.includes(`${sep}lang${sep}`))
        .map(file => readFileSync(file, 'utf8'))
        .join('\n');

    // Also include main.ts if it is in the root directory
    const mainTsPath = join(projectRoot, 'main.ts');
    let mainTsContent = '';
    try {
        mainTsContent = readFileSync(mainTsPath, 'utf8');
    } catch {
        // Ignore if main.ts doesn't exist
    }

    const fullSourceCode = sourceCode + '\n' + mainTsContent;

    const unusedKeys = translationKeys.filter(key => {
        const escapedKey = escapeRegex(key);
        const exactKey = new RegExp(
            `(^|[^A-Za-z0-9_])${escapedKey}([^A-Za-z0-9_]|$)`
        );

        return !exactKey.test(fullSourceCode);
    });

    assert.deepEqual(
        unusedKeys,
        [],
        `Unused translation keys:\n${unusedKeys.join('\n')}`
    );
});

test('all language files have the same keys as en.ts', () => {
    const englishSource = readFileSync(englishFile, 'utf8');
    const englishKeys = extractTranslationKeys(englishSource);
    const expectedKeys = new Set(englishKeys);

    const langDir = join(sourceRoot, 'lang');
    const langFiles = readdirSync(langDir)
        .filter(file => file.endsWith('.ts') && file !== 'en.ts' && file !== 'helpers.ts');

    for (const file of langFiles) {
        const langSource = readFileSync(join(langDir, file), 'utf8');
        const langKeys = extractTranslationKeys(langSource);
        const actualKeys = new Set(langKeys);

        const missingKeys = [...expectedKeys].filter(key => !actualKeys.has(key));
        const extraKeys = [...actualKeys].filter(key => !expectedKeys.has(key));

        assert.deepEqual(
            missingKeys,
            [],
            `Missing translation keys in ${file}:\n${missingKeys.join('\n')}`
        );

        assert.deepEqual(
            extraKeys,
            [],
            `Extra translation keys in ${file}:\n${extraKeys.join('\n')}`
        );
    }
});
