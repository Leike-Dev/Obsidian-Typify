import assert from 'node:assert/strict';
import test from 'node:test';
import { IconPickerModal } from '../src/ui/icon-picker';

test('icon picker uses Obsidian icon ids and keeps recent icons first without duplicates', () => {
    const picker = new IconPickerModal({}, ['activity'], null, null, () => {});

    assert.deepEqual(picker.getItems(), ['activity', 'alarm-clock']);
});
