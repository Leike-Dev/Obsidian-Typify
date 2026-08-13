import type { TranslationKey } from '../lang/helpers';

// ============================================================================
// Types
// ============================================================================

export type EntryTag = 'NEW' | 'FIX' | 'IMP' | 'BRK';

export interface ChangelogEntry {
	tag: EntryTag;
	text: string;
}

export interface ChangelogVersion {
	version: string;
	date: string;
	entries: ChangelogEntry[];
}

// ============================================================================
// Tag groups configuration
// ============================================================================

export const TAG_GROUPS: {
	tags: EntryTag[];
	labelKey: TranslationKey;
	boxClass: string;
	titleColor: string;
	icon: string;
}[] = [
		{
			tags: ['NEW'],
			labelKey: 'group_new',
			boxClass: 'typify-box-ok',
			titleColor: 'var(--typify-ok)',
			icon: 'sparkles',
		},
		{
			tags: ['IMP'],
			labelKey: 'group_imp',
			boxClass: 'typify-box-warn',
			titleColor: 'var(--typify-warn)',
			icon: 'zap',
		},
		{
			tags: ['FIX'],
			labelKey: 'group_fix',
			boxClass: 'typify-box-info',
			titleColor: 'var(--typify-info)',
			icon: 'wrench',
		},
		{
			tags: ['BRK'],
			labelKey: 'group_brk',
			boxClass: 'typify-box-brk',
			titleColor: 'var(--typify-brk)',
			icon: 'alert-triangle',
		},
	];

// ============================================================================
// Parser
// ============================================================================

/**
 * Parses a raw changelog markdown string into structured version objects.
 * Expected format:
 *   ## 2.4.0 | 6 de junho de 2026
 *   NEW | Entry text
 *   FIX | Another entry
 */
export function parseChangelog(raw: string): ChangelogVersion[] {
	const versions: ChangelogVersion[] = [];
	let current: ChangelogVersion | null = null;

	for (const line of raw.split('\n')) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		// Version header: "## 2.4.0 | 6 de junho de 2026"
		const versionMatch = trimmed.match(/^##\s+([\d.]+)\s+\|\s+(.+)$/);
		if (versionMatch) {
			current = {
				version: versionMatch[1] as string,
				date: versionMatch[2] as string,
				entries: [],
			};
			versions.push(current);
			continue;
		}

		// Entry line: "NEW | Entry text"
		const entryMatch = trimmed.match(/^(NEW|FIX|IMP|BRK)\s+\|\s+(.+)$/);
		if (entryMatch && current) {
			current.entries.push({
				tag: entryMatch[1] as EntryTag,
				text: entryMatch[2] as string,
			});
		}
	}

	return versions;
}

// ============================================================================
// Inline code renderer
// ============================================================================

/**
 * Transforms backtick-wrapped text into <code> elements within a container.
 * Ex: "Renamed `faviconSource`" → "Renamed <code>faviconSource</code>"
 * 
 * Uses container.doc to access the correct Document context
 * instead of the global `activeDocument`.
 */
export function renderInlineCode(container: HTMLElement, text: string): void {
	const doc = container.doc;
	const parts = text.split(/(`[^`]+`)/g);
	for (const part of parts) {
		if (part.startsWith('`') && part.endsWith('`')) {
			container.createEl('code', {
				cls: 'typify-inline-code',
				text: part.slice(1, -1),
			});
		} else {
			container.appendChild(doc.createTextNode(part));
		}
	}
}
