import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateStatusStyles, HEX_COLOR_RE, VALID_SHAPES, VALID_COLOR_MODES } from '../src/utils/style-validator';

// ============================================================================
// ROUND-TRIP TEST — Export → Import preserves all fields
// ============================================================================

/**
 * Simulates a full StatusStyle object as it would be exported by ExportSettingsModal.
 */
function createFullStyle(overrides = {}) {
    return {
        name: 'Test Style',
        baseColor: '#6366f1',
        icon: 'star',
        shape: 'pill',
        colorMode: 'subtle',
        matchValue: 'https://example.com',
        prefixMatch: false,
        appliesTo: ['status'],
        ...overrides,
    };
}

// ─── Round-trip tests ────────────────────────────────────────────────────────

test('round-trip: full style with all fields is preserved', () => {
    const original = createFullStyle();
    const [result] = validateStatusStyles([original]);
    
    assert.ok(result, 'style should be valid');
    assert.equal(result.name, original.name);
    assert.equal(result.baseColor, original.baseColor);
    assert.equal(result.icon, original.icon);
    assert.equal(result.shape, original.shape);
    assert.equal(result.colorMode, original.colorMode);
    assert.equal(result.matchValue, original.matchValue);
    assert.equal(result.prefixMatch, original.prefixMatch);
    assert.deepEqual(result.appliesTo, original.appliesTo);
});

test('round-trip: colorMode "simple" is preserved', () => {
    const original = createFullStyle({ colorMode: 'simple' });
    const [result] = validateStatusStyles([original]);
    
    assert.ok(result, 'style with simple colorMode should be valid');
    assert.equal(result.colorMode, 'simple');
});

test('round-trip: colorMode "solid" is preserved', () => {
    const original = createFullStyle({ colorMode: 'solid' });
    const [result] = validateStatusStyles([original]);
    
    assert.ok(result, 'style with solid colorMode should be valid');
    assert.equal(result.colorMode, 'solid');
});

test('round-trip: prefixMatch true is preserved', () => {
    const original = createFullStyle({ prefixMatch: true });
    const [result] = validateStatusStyles([original]);
    
    assert.ok(result, 'style with prefixMatch should be valid');
    assert.equal(result.prefixMatch, true);
});

test('round-trip: prefixMatch false is preserved', () => {
    const original = createFullStyle({ prefixMatch: false });
    const [result] = validateStatusStyles([original]);
    
    assert.ok(result, 'style with prefixMatch false should be valid');
    assert.equal(result.prefixMatch, false);
});

test('round-trip: all shapes are preserved', () => {
    for (const shape of VALID_SHAPES) {
        const original = createFullStyle({ shape });
        const [result] = validateStatusStyles([original]);
        
        assert.ok(result, `style with shape "${shape}" should be valid`);
        assert.equal(result.shape, shape);
    }
});

test('round-trip: appliesTo with multiple values is preserved', () => {
    const original = createFullStyle({ appliesTo: ['status', 'priority', 'type'] });
    const [result] = validateStatusStyles([original]);
    
    assert.ok(result, 'style with multiple appliesTo should be valid');
    assert.deepEqual(result.appliesTo, ['status', 'priority', 'type']);
});

test('round-trip: style without optional fields is valid', () => {
    const minimal = { name: 'Minimal', baseColor: '#ff0000' };
    const [result] = validateStatusStyles([minimal]);
    
    assert.ok(result, 'minimal style should be valid');
    assert.equal(result.name, 'Minimal');
    assert.equal(result.baseColor, '#ff0000');
    assert.equal(result.icon, '');
    assert.equal(result.shape, undefined);
    assert.equal(result.colorMode, undefined);
    assert.equal(result.matchValue, undefined);
    assert.equal(result.prefixMatch, undefined);
    assert.equal(result.appliesTo, undefined);
});

test('round-trip: batch of styles preserves count and order', () => {
    const styles = [
        createFullStyle({ name: 'First', baseColor: '#111111' }),
        createFullStyle({ name: 'Second', baseColor: '#222222', colorMode: 'simple', prefixMatch: true }),
        createFullStyle({ name: 'Third', baseColor: '#333333', shape: 'flat' }),
    ];
    
    const results = validateStatusStyles(styles);
    
    assert.equal(results.length, 3);
    assert.equal(results[0].name, 'First');
    assert.equal(results[1].name, 'Second');
    assert.equal(results[1].colorMode, 'simple');
    assert.equal(results[1].prefixMatch, true);
    assert.equal(results[2].name, 'Third');
    assert.equal(results[2].shape, 'flat');
});

// ─── Rejection tests ─────────────────────────────────────────────────────────

test('rejects style with missing name', () => {
    const results = validateStatusStyles([{ baseColor: '#ff0000' }]);
    assert.equal(results.length, 0);
});

test('rejects style with empty name', () => {
    const results = validateStatusStyles([{ name: '   ', baseColor: '#ff0000' }]);
    assert.equal(results.length, 0);
});

test('rejects style with invalid hex color', () => {
    const results = validateStatusStyles([{ name: 'Test', baseColor: 'red' }]);
    assert.equal(results.length, 0);
});

test('rejects style with short hex color', () => {
    const results = validateStatusStyles([{ name: 'Test', baseColor: '#fff' }]);
    assert.equal(results.length, 0);
});

test('rejects non-object items', () => {
    const results = validateStatusStyles([null, undefined, 42, 'string', [], true]);
    assert.equal(results.length, 0);
});

test('rejects invalid colorMode values', () => {
    const style = createFullStyle({ colorMode: 'neon' });
    const [result] = validateStatusStyles([style]);
    
    assert.ok(result, 'style should be valid');
    assert.equal(result.colorMode, undefined, 'invalid colorMode should be dropped');
});

test('rejects invalid shape values', () => {
    const style = createFullStyle({ shape: 'circle' });
    const [result] = validateStatusStyles([style]);
    
    assert.ok(result, 'style should be valid');
    assert.equal(result.shape, undefined, 'invalid shape should be dropped');
});

test('filters out non-string and empty appliesTo entries', () => {
    const style = createFullStyle({ appliesTo: ['valid', '', 42, null, 'also-valid'] });
    const [result] = validateStatusStyles([style]);
    
    assert.ok(result, 'style should be valid');
    assert.deepEqual(result.appliesTo, ['valid', 'also-valid']);
});

test('drops prefixMatch when not a boolean', () => {
    const style = createFullStyle({ prefixMatch: 'yes' });
    const [result] = validateStatusStyles([style]);
    
    assert.ok(result, 'style should be valid');
    assert.equal(result.prefixMatch, undefined, 'non-boolean prefixMatch should be dropped');
});

test('skips invalid styles but keeps valid ones in batch', () => {
    const styles = [
        { name: '', baseColor: '#ff0000' }, // invalid: empty name
        createFullStyle({ name: 'Valid One' }),
        { name: 'No Color' }, // invalid: missing baseColor
        createFullStyle({ name: 'Valid Two', colorMode: 'simple' }),
    ];
    
    const results = validateStatusStyles(styles);
    
    assert.equal(results.length, 2);
    assert.equal(results[0].name, 'Valid One');
    assert.equal(results[1].name, 'Valid Two');
    assert.equal(results[1].colorMode, 'simple');
});

// ─── Regex constant tests ────────────────────────────────────────────────────

test('HEX_COLOR_RE accepts valid 6-digit hex colors', () => {
    assert.ok(HEX_COLOR_RE.test('#000000'));
    assert.ok(HEX_COLOR_RE.test('#ffffff'));
    assert.ok(HEX_COLOR_RE.test('#ABCDEF'));
    assert.ok(HEX_COLOR_RE.test('#6366f1'));
});

test('HEX_COLOR_RE rejects invalid hex formats', () => {
    assert.ok(!HEX_COLOR_RE.test('#fff'));
    assert.ok(!HEX_COLOR_RE.test('000000'));
    assert.ok(!HEX_COLOR_RE.test('#gggggg'));
    assert.ok(!HEX_COLOR_RE.test('#1234567'));
    assert.ok(!HEX_COLOR_RE.test(''));
});

// ─── Constants sync test ─────────────────────────────────────────────────────

test('VALID_COLOR_MODES includes all StatusStyle colorMode values', () => {
    assert.ok(VALID_COLOR_MODES.includes('subtle'), 'must include subtle');
    assert.ok(VALID_COLOR_MODES.includes('solid'), 'must include solid');
    assert.ok(VALID_COLOR_MODES.includes('simple'), 'must include simple');
    assert.equal(VALID_COLOR_MODES.length, 3, 'must have exactly 3 modes');
});

test('VALID_SHAPES includes all StatusStyle shape values', () => {
    assert.ok(VALID_SHAPES.includes('pill'), 'must include pill');
    assert.ok(VALID_SHAPES.includes('rectangle'), 'must include rectangle');
    assert.ok(VALID_SHAPES.includes('flat'), 'must include flat');
    assert.equal(VALID_SHAPES.length, 3, 'must have exactly 3 shapes');
});
