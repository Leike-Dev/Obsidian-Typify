import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { EMOJIS } from '../src/constants/emojis';

test('emoji tuples preserve the complete picker dataset', () => {
    assert.equal(EMOJIS.length, 1870);

    for (const [index, entry] of EMOJIS.entries()) {
        assert.equal(entry.length, 3, `entry ${String(index)} must have exactly three fields`);
        assert.equal(typeof entry[0], 'string');
        assert.equal(typeof entry[1], 'string');
        assert.equal(typeof entry[2], 'string');
        assert.notEqual(entry[0], '', `entry ${String(index)} must have an emoji`);
        assert.notEqual(entry[1], '', `entry ${String(index)} must have a name`);
    }

    const pickerItems = EMOJIS.map(
        ([char, name, search]) => `emoji:${char}|||${name}|||${search}`,
    );
    const hash = createHash('sha256').update(pickerItems.join('\n')).digest('hex');

    assert.equal(hash, '892eb114dfee0e9a9337c84006cc4af0a76e5c7b3ace26f5b0090c0bf751d039');
});
