import { App, Modal, PluginManifest } from "obsidian";
// @ts-ignore
import changelogText from "../../CHANGELOG.md";
import { t } from "../lang/helpers";

// Types

type EntryTag = "NEW" | "FIX" | "IMP" | "BRK";

interface ChangelogEntry {
	tag: EntryTag;
	text: string;
}

interface ChangelogVersion {
	version: string;
	date: string;
	entries: ChangelogEntry[];
}

// Tag groups configuration

const TAG_GROUPS: {
	tags: EntryTag[];
	labelKey: string;
	boxClass: string;
	titleColor: string;
	icon: string;
}[] = [
	{
		tags: ["NEW", "IMP"],
		labelKey: "group_new_imp",
		boxClass: "typify-box-ok",
		titleColor: "var(--typify-ok)",
		icon: "✦",
	},
	{
		tags: ["FIX"],
		labelKey: "group_fix",
		boxClass: "typify-box-info",
		titleColor: "var(--typify-info)",
		icon: "⚙",
	},
	{
		tags: ["BRK"],
		labelKey: "group_brk",
		boxClass: "typify-box-warn",
		titleColor: "var(--typify-warn)",
		icon: "⚠",
	},
];

const TAG_META: Record<EntryTag, { label: string; cls: string }> = {
	NEW: { label: "NEW", cls: "typify-ct-new" },
	IMP: { label: "IMP", cls: "typify-ct-imp" },
	FIX: { label: "FIX", cls: "typify-ct-fix" },
	BRK: { label: "BRK", cls: "typify-ct-brk" },
};

// Parser

function parseChangelog(raw: string): ChangelogVersion[] {
	const versions: ChangelogVersion[] = [];
	let current: ChangelogVersion | null = null;

	for (const line of raw.split("\n")) {
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

// Text renderers with inline `code`

/**
 * Transforms backticks into <code> elements within a container.
 * Ex: "Renamed `faviconSource`" → "Renamed <code>faviconSource</code>"
 */
function renderInlineCode(container: HTMLElement, text: string): void {
	const parts = text.split(/(`[^`]+`)/g);
	for (const part of parts) {
		if (part.startsWith("`") && part.endsWith("`")) {
			const code = container.createEl("code", {
				cls: "typify-inline-code",
				text: part.slice(1, -1),
			});
			container.appendChild(code);
		} else {
			container.appendChild(document.createTextNode(part));
		}
	}
}

// Modal

export class ChangelogModal extends Modal {
	private manifest: PluginManifest;
	private onCloseCallback?: () => void;

	constructor(app: App, manifest: PluginManifest, onCloseCallback?: () => void) {
		super(app);
		this.manifest = manifest;
		this.onCloseCallback = onCloseCallback;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass("typify-changelog-modal");

		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
		const versions = parseChangelog(changelogText as any);
		if (versions.length === 0) {
			this.renderError(contentEl);
			return;
		}

		// Always displays only the current version (first in the file)
		const latest = versions[0] as ChangelogVersion;
		const githubUrl = `https://github.com/Leike-Dev/Obsidian-Typify/releases/tag/${latest.version}`;

		// Header
		this.titleEl.setText(t('changelog_modal_title').replace('{version}', latest.version));

		contentEl.createEl("p", {
			cls: "typify-modal-sub",
			text: t('changelog_modal_date').replace('{date}', latest.date),
		});

		// Body (Scrollable)
		const body = contentEl.createDiv({ cls: "typify-modal-body" });

		for (const group of TAG_GROUPS) {
			const groupEntries = latest.entries.filter((e) =>
				group.tags.includes(e.tag)
			);
			if (!groupEntries.length) continue;

			const box = body.createDiv({ cls: `typify-notice-box ${group.boxClass}` });

			// Group title
			const boxTitle = box.createDiv({ cls: "typify-box-title" });
			boxTitle.createSpan({ text: group.icon, cls: "typify-box-icon" });
			boxTitle.createSpan({
				// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
				text: t(group.labelKey as any), // Cast to bypass strict types without adding union string
				cls: "typify-box-title-text",
			});

			// Entries
			const list = box.createDiv({ cls: "typify-entry-list csi-manager-list" });
			for (const entry of groupEntries) {
				const row = list.createDiv({ cls: "typify-entry-row" });

				const meta = TAG_META[entry.tag];
				row.createEl("span", {
					cls: `typify-changelog-tag ${meta.cls}`,
					text: meta.label,
				});

				const textEl = row.createSpan({ cls: "typify-entry-text" });
				renderInlineCode(textEl, entry.text);
			}
		}

		// Footer
		const foot = contentEl.createDiv({ cls: "typify-modal-foot" });

		// Buttons (right-aligned)
		const btnGroup = foot.createDiv({ cls: "typify-btn-group" });

		const githubBtn = btnGroup.createEl("button", {
			text: t('btn_github'),
		});
		githubBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			window.open(githubUrl, "_blank");
		});

		const confirmBtn = btnGroup.createEl("button", {
			cls: "mod-cta",
			text: t('btn_understand'),
		});
		confirmBtn.addEventListener("click", () => {
			this.app.workspace.trigger("typify:version-seen", latest.version);
			this.close();
		});
	}

	onClose(): void {
		this.contentEl.empty();
		if (this.onCloseCallback) {
			this.onCloseCallback();
		}
	}

	private renderError(container: HTMLElement): void {
		container.createEl("p", {
			cls: "typify-modal-error",
			text: t('changelog_error'),
		});

		const closeBtn = container.createEl("button", {
			text: "Close",
		});
		closeBtn.addEventListener("click", () => this.close());
	}
}
