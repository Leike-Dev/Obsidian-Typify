import assert from 'node:assert/strict';
import test from 'node:test';
import { IconPickerModal } from '../src/ui/icon-picker';

test('icon picker uses Obsidian icon ids and keeps recent icons first without duplicates', () => {
    const picker = new IconPickerModal({}, ['activity'], null, null, () => {});

    assert.deepEqual(picker.getItems(), ['activity', 'alarm-clock']);
});

test('icon picker serializes tuple emojis without changing complex sequences', () => {
    const picker = new IconPickerModal({}, [], null, null, () => {});
    picker.currentTab = 'emoji';

    const items = picker.getItems();

    assert.equal(items.length, 1870);
    assert.ok(items.includes('emoji:😀|||grinning face|||'));
    assert.ok(items.includes('emoji:☝️|||index pointing up|||point_up'));
    assert.ok(items.includes('emoji:👩‍💻|||woman technologist|||'));
    assert.ok(items.includes('emoji:👨‍👩‍👧‍👦|||family: man, woman, girl, boy|||family_man_woman_girl_boy'));
    assert.ok(items.includes('emoji:🇧🇷|||flag: brazil|||'));
    assert.ok(items.includes('emoji:🏴󠁧󠁢󠁥󠁮󠁧󠁿|||flag: england|||'));
});
