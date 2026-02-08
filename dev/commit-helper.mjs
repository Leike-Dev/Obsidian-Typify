/**
 * Enhanced Commit Helper Script
 * Allows staging files (git add) before committing.
 * Prompts for commit type, scope, subject, and body.
 */

import { createInterface } from 'readline';
import { execSync } from 'child_process';

const rl = createInterface({
    input: process.stdin,
    output: process.stdout
});

const types = [
    { value: 'feat', desc: 'A new feature' },
    { value: 'fix', desc: 'A bug fix' },
    { value: 'docs', desc: 'Documentation only changes' },
    { value: 'style', desc: 'Changes that do not affect the meaning of the code (white-space, formatting, etc)' },
    { value: 'refactor', desc: 'A code change that neither fixes a bug nor adds a feature' },
    { value: 'perf', desc: 'A code change that improves performance' },
    { value: 'test', desc: 'Adding missing tests or correcting existing tests' },
    { value: 'chore', desc: 'Changes to the build process or auxiliary tools and libraries' }
];

console.log('\n🔵 Conventional Commits Helper\n');

// Helper to prompt user
function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
}

async function run() {
    try {
        // ==========================================
        // STEP 0: Show Status and Git Add
        // ==========================================
        try {
            const status = execSync('git status -s').toString().trim();
            if (!status) {
                console.log('✅ Working directory is clean. Nothing to commit.');
                process.exit(0);
            }
            console.log('📄 Changed files:');
            console.log(status);
            console.log('-----------------------------------------------------------');

            console.log('What would you like to add?');
            console.log('  [A] Add ALL files (git add .)');
            console.log('  [S] Select files manually');
            console.log('  [N] Nothing (already added manually)');

            const addChoice = (await ask('\nChoice: ')).toLowerCase();

            if (addChoice === 'a') {
                execSync('git add .');
                console.log('✅ Added all files.');
            } else if (addChoice === 's') {
                const files = await ask('Enter file paths (space separated): ');
                if (files.trim()) {
                    execSync(`git add ${files.trim()}`);
                    console.log(`✅ Added: ${files.trim()}`);
                } else {
                    console.log('⚠️  No files added.');
                }
            } else {
                console.log('➡️  Skipping git add.');
            }

        } catch (e) {
            console.log('⚠️  Could not run git status/add. Is this a git repo?');
        }

        // ==========================================
        // STEP 1: Select Type
        // ==========================================
        console.log('\nSelect the type of change you are committing:');
        types.forEach((t, i) => console.log(`  ${i + 1}) ${t.value.padEnd(10)} - ${t.desc}`));

        let typeIndex = -1;
        while (typeIndex < 0 || typeIndex >= types.length) {
            const answer = await ask('\nType number (1-8): ');
            const num = parseInt(answer, 10);
            if (!isNaN(num) && num >= 1 && num <= types.length) {
                typeIndex = num - 1;
            } else {
                console.log('Invalid selection.');
            }
        }
        const type = types[typeIndex].value;

        // ==========================================
        // STEP 2: Scope (Optional)
        // ==========================================
        const scope = await ask('\nScope (optional, e.g., settings, main): ');
        const scopeStr = scope.trim() ? `(${scope.trim()})` : '';

        // ==========================================
        // STEP 3: Short Description (Subject)
        // ==========================================
        let subject = '';
        while (!subject) {
            subject = await ask('Short description: ');
            if (!subject.trim()) console.log('Description is required.');
        }

        // ==========================================
        // STEP 4: Long Description (Body) - Optional
        // ==========================================
        const body = await ask('Long description (optional, press Enter to skip): ');

        // Construct Message
        const head = `${type}${scopeStr}: ${subject.trim()}`;
        const commitMsg = body.trim() ? `${head}\n\n${body.trim()}` : head;

        console.log('\n-----------------------------------------------------------');
        console.log(commitMsg);
        console.log('-----------------------------------------------------------\n');

        // Confirm
        const confirm = await ask('Commit with this message? (y/n): ');
        if (confirm.toLowerCase() === 'y') {
            try {
                execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
                console.log('\n✅ Commit successful!');
            } catch (err) {
                console.error('\n❌ Commit failed.');
            }
        } else {
            console.log('\n❌ Commit cancelled.');
        }

    } catch (error) {
        console.error(error);
    } finally {
        rl.close();
    }
}

run();
