import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Copies built artifacts to the local Obsidian vault for testing.
 * Target: H:\Docs\Obsinote\.obsidian\plugins\typify
 */
const VAULT_PLUGIN_DIR = 'H:\\Docs\\Obsinote\\.obsidian\\plugins\\typify';
const ROOT = process.cwd();

const files = ['main.js', 'manifest.json', 'styles.css'];

// Ensure target directory exists
if (!existsSync(VAULT_PLUGIN_DIR)) {
    mkdirSync(VAULT_PLUGIN_DIR, { recursive: true });
}

for (const file of files) {
    const src = join(ROOT, file);
    const dest = join(VAULT_PLUGIN_DIR, file);
    if (!existsSync(src)) {
        console.warn(`[copy-to-local] Skipping ${file}: source not found`);
        continue;
    }
    copyFileSync(src, dest);
    console.log(`[copy-to-local] ${file} → ${dest}`);
}

// Create .hotreload marker file for hot-reload plugin
const hotreloadPath = join(VAULT_PLUGIN_DIR, '.hotreload');
if (!existsSync(hotreloadPath)) {
    writeFileSync(hotreloadPath, '');
    console.log('[copy-to-local] Created .hotreload marker');
}

console.log('[copy-to-local] Done.');
