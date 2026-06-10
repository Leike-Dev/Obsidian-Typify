import { App, Modal, PluginManifest, setIcon } from "obsidian";
import changelogEn from "../../changelogs/en.md";
import changelogPt from "../../changelogs/pt-br.md";
import changelogEs from "../../changelogs/es.md";
import changelogFr from "../../changelogs/fr.md";
import changelogZh from "../../changelogs/zh-cn.md";
import { t, locale, type TranslationKey } from "../lang/helpers";

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
	labelKey: TranslationKey;
	boxClass: string;
	titleColor: string;
	icon: string;
}[] = [
		{
			tags: ["NEW"],
			labelKey: "group_new",
			boxClass: "typify-box-ok",
			titleColor: "var(--typify-ok)",
			icon: "sparkles",
		},
		{
			tags: ["IMP"],
			labelKey: "group_imp",
			boxClass: "typify-box-warn",
			titleColor: "var(--typify-warn)",
			icon: "zap",
		},
		{
			tags: ["FIX"],
			labelKey: "group_fix",
			boxClass: "typify-box-info",
			titleColor: "var(--typify-info)",
			icon: "wrench",
		},
		{
			tags: ["BRK"],
			labelKey: "group_brk",
			boxClass: "typify-box-brk",
			titleColor: "var(--typify-brk)",
			icon: "alert-triangle",
		},
	];

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
			container.appendChild(activeDocument.createTextNode(part));
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

		let changelogText = changelogEn;
		const lowerLocale = locale.toLowerCase();
		if (lowerLocale.startsWith('pt')) changelogText = changelogPt;
		else if (lowerLocale.startsWith('es')) changelogText = changelogEs;
		else if (lowerLocale.startsWith('fr')) changelogText = changelogFr;
		else if (lowerLocale.startsWith('zh')) changelogText = changelogZh;

		const versions = parseChangelog(changelogText);
		if (versions.length === 0) {
			this.renderError(contentEl);
			return;
		}

		// Always displays only the current version (first in the file)
		const latest = versions[0] as ChangelogVersion;
		const currentVersion = this.manifest.version;
		const githubUrl = `https://github.com/Leike-Dev/Obsidian-Typify/releases/tag/${currentVersion}`;

		// Header
		this.titleEl.setText(t('changelog_modal_title').replace('{version}', currentVersion));

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
			boxTitle.style.color = group.titleColor;

			const iconSpan = boxTitle.createSpan({ cls: "typify-box-icon" });
			setIcon(iconSpan, group.icon);

			boxTitle.createSpan({
				text: t(group.labelKey),
				cls: "typify-box-title-text",
			});

			// Entries
			const list = box.createDiv({ cls: "typify-entry-list typify-manager-list" });
			for (const entry of groupEntries) {
				const row = list.createDiv({ cls: "typify-entry-row" });

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
			this.app.workspace.trigger("typify:version-seen", currentVersion);
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
			text: t('cancel_button'),
		});
		closeBtn.addEventListener("click", () => this.close());
	}
}
