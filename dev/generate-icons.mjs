// Script to generate lucide-icons.ts from lucide-static package
// Run with: node dev/generate-icons.mjs

import * as lucide from 'lucide-static';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Get all exported icon names (they are in PascalCase)
const iconNames = Object.keys(lucide)
    .filter(key => typeof lucide[key] === 'string' && lucide[key].includes('<svg'))
    .map(pascalCase => {
        // Convert PascalCase to kebab-case
        return pascalCase
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .toLowerCase();
    })
    .sort();

console.log(`Found ${iconNames.length} icons`);

// Generate the TypeScript file
const content = `// ============================================================================
// LUCIDE ICONS - Auto-generated from lucide-static@0.446.0
// Compatible with Obsidian's built-in icon system
// Generated on: ${new Date().toISOString()}
// Total icons: ${iconNames.length}
// ============================================================================

export const LUCIDE_ICONS: string[] = [
${iconNames.map(name => `    '${name}'`).join(',\n')}
];
`;

// Write to src/lucide-icons.ts
writeFileSync(join('src', 'lucide-icons.ts'), content);
console.log('Generated src/lucide-icons.ts successfully!');
