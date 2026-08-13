import { App, ButtonComponent, Modal, PluginManifest, setIcon } from 'obsidian';
import changelogEn from '../../changelogs/en.md';
import changelogPt from '../../changelogs/pt-br.md';
import changelogEs from '../../changelogs/es.md';
import changelogFr from '../../changelogs/fr.md';
import changelogZh from '../../changelogs/zh-cn.md';
import { t, locale } from '../lang/helpers';
import {
	parseChangelog,
	renderInlineCode,
	TAG_GROUPS,
	type EntryTag,
	type ChangelogVersion,
} from './changelog-parser';

export class ChangelogModal extends Modal {
	private manifest: PluginManifest;
	private onCloseCallback?: () => void;
	private activeTab: 'ALL' | EntryTag = 'ALL';
	private sortChipsContainerEl: HTMLElement | null = null;
	private listContainerEl: HTMLElement | null = null;

	constructor(app: App, manifest: PluginManifest, onCloseCallback?: () => void) {
		super(app);
		this.manifest = manifest;
		this.onCloseCallback = onCloseCallback;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('typify-changelog-modal');

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

		contentEl.createEl('p', {
			cls: 'typify-modal-sub',
			text: t('changelog_modal_date').replace('{date}', latest.date),
		});

		// Body (Scrollable)
		const body = contentEl.createDiv({ cls: 'typify-modal-body' });
		
		this.sortChipsContainerEl = body.createDiv({ cls: 'typify-sort-chips typify-changelog-tabs' });
		this.listContainerEl = body.createDiv({ cls: 'typify-manager-list typify-changelog-list' });

		this.renderTabs(latest);
		this.renderList(latest);

		// Footer
		const foot = contentEl.createDiv({ cls: 'typify-modal-foot' });
		const btnGroup = foot.createDiv({ cls: 'typify-btn-group' });

		new ButtonComponent(btnGroup)
			.setButtonText(t('btn_github'))
			.onClick((e) => {
				e.stopPropagation();
				window.open(githubUrl, '_blank');
			});

		new ButtonComponent(btnGroup)
			.setCta()
			.setButtonText(t('btn_understand'))
			.onClick(() => {
				this.app.workspace.trigger('typify:version-seen', currentVersion);
				this.close();
			});
	}

	onClose(): void {
		this.contentEl.empty();
		this.onCloseCallback?.();
	}

	private renderError(container: HTMLElement): void {
		container.createEl('p', {
			cls: 'typify-modal-error',
			text: t('changelog_error'),
		});

		new ButtonComponent(container)
			.setButtonText(t('cancel_button'))
			.onClick(() => this.close());
	}

	private renderTabs(latest: ChangelogVersion): void {
		if (!this.sortChipsContainerEl) return;
		this.sortChipsContainerEl.empty();

		const allCount = latest.entries.length;
		const isAllActive = this.activeTab === 'ALL';
		const allChip = this.sortChipsContainerEl.createSpan({
			cls: `typify-notice-tag typify-sort-chip${isAllActive ? ' is-active' : ''}`,
			attr: {
				role: 'button',
				tabindex: '0',
				'aria-pressed': isAllActive ? 'true' : 'false',
			}
		});
		allChip.createSpan({ text: t('changelog_tab_all') });
		allChip.createSpan({ text: allCount.toString(), cls: 'typify-tag-count' });
		
		allChip.addEventListener('click', () => {
			this.activeTab = 'ALL';
			this.renderTabs(latest);
			this.renderList(latest);
		});
		allChip.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				allChip.click();
			}
		});

		for (const group of TAG_GROUPS) {
			const groupEntries = latest.entries.filter((e) => group.tags.includes(e.tag));
			if (!groupEntries.length) continue;

			const isActive = this.activeTab === group.tags[0];
			const chip = this.sortChipsContainerEl.createSpan({
				cls: `typify-notice-tag typify-sort-chip${isActive ? ' is-active' : ''}`,
				attr: {
					role: 'button',
					tabindex: '0',
					'aria-pressed': isActive ? 'true' : 'false',
				}
			});
			setIcon(chip.createSpan({ cls: 'typify-sort-chip-icon' }), group.icon);
			chip.createSpan({ text: t(group.labelKey) });
			chip.createSpan({ text: groupEntries.length.toString(), cls: 'typify-tag-count' });
			
			chip.addEventListener('click', () => {
				this.activeTab = group.tags[0]!;
				this.renderTabs(latest);
				this.renderList(latest);
			});
			chip.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					chip.click();
				}
			});
		}
	}

	private renderList(latest: ChangelogVersion): void {
		if (!this.listContainerEl) return;
		this.listContainerEl.empty();

		let entriesToRender = latest.entries;
		if (this.activeTab !== 'ALL') {
			const activeGroup = TAG_GROUPS.find(g => g.tags[0] === this.activeTab);
			if (activeGroup) {
				entriesToRender = latest.entries.filter(e => activeGroup.tags.includes(e.tag));
			}
		}

		for (const entry of entriesToRender) {
			const group = TAG_GROUPS.find(g => g.tags.includes(entry.tag));
			const iconName = group ? group.icon : 'info';
			
			const item = this.listContainerEl.createDiv({ cls: 'typify-manager-item typify-changelog-item' });
			
			const iconContainer = item.createDiv({ cls: 'typify-manager-item-info' });
			const iconEl = iconContainer.createSpan({ cls: 'typify-box-icon' });
			if (group) {
				iconEl.setCssStyles({ color: group.titleColor });
			}
			setIcon(iconEl, iconName);
			
			const textEl = iconContainer.createSpan({ cls: 'typify-entry-text' });
			renderInlineCode(textEl, entry.text);
		}
	}
}
