import TypifyPlugin from '../main';
import { DOMMutationObserver } from './dom-mutation-observer';
import { StyleManager } from './style-manager';

export class DOMManager {
    private plugin: TypifyPlugin;
    private styleManager: StyleManager;
    private observer: DOMMutationObserver | null = null;

    constructor(plugin: TypifyPlugin, styleManager: StyleManager) {
        this.plugin = plugin;
        this.styleManager = styleManager;
    }

    init() {
        this.observer = new DOMMutationObserver(node => this.processNode(node));

        this.plugin.registerEvent(this.plugin.app.workspace.on('layout-change', () => {
            this.refreshProcessing();
        }));

        this.plugin.registerEvent(this.plugin.app.workspace.on('active-leaf-change', () => {
            this.refreshProcessing();
        }));

        // Robust fallback for dynamic views like Canvas that lazy-load elements without triggering workspace events.
        // The scan only discovers new root containers; mutation work inside observed roots is event-driven.
        this.plugin.registerInterval(window.setInterval(() => {
            this.refreshProcessing();
        }, 1500));

        this.refreshProcessing();
    }

    private processNode(node: Node) {
        let element: HTMLElement | null = null;

        if (node.instanceOf(HTMLElement)) {
            element = node;
        } else if (node.parentElement?.instanceOf(HTMLElement)) {
            element = node.parentElement;
        }

        if (!element) return;

        // Mutations may originate from nested content (for example, link text).
        // Normalize those mutations to the nearest renderable Typify element.
        const closestPill = element.closest('.multi-select-pill');
        if (closestPill?.instanceOf(HTMLElement)) {
            this.processLeafPill(closestPill);
            return;
        }

        const closestValue = element.closest('.value-list-element');
        if (closestValue?.instanceOf(HTMLElement)) {
            this.processLeafValue(closestValue);
            return;
        }

        const closestRenderedValue = element.closest('.bases-rendered-value');
        if (closestRenderedValue?.instanceOf(HTMLElement)) {
            // List cards are handled at the property level; single-value cards can
            // be processed directly without scanning the whole Bases view.
            if (closestRenderedValue.querySelector('.value-list-element')) {
                const property = closestRenderedValue.closest('.bases-cards-property');
                if (property?.instanceOf(HTMLElement)) {
                    this.processBasesCardProperty(property, this.plugin.getTargetProperties());
                }
            } else {
                this.processLeafRenderedValue(closestRenderedValue);
            }
            return;
        }

        const targetProps = this.plugin.getTargetProperties();

        // CONTEXT 1: Metadata Properties
        if (element.classList.contains('metadata-property')) {
            this.processMetadataProperty(element, targetProps);
        } else {
            element.findAll('.metadata-property').forEach(row => {
                this.processMetadataProperty(row, targetProps);
            });
        }

        // CONTEXT 2: Bases Plugin (Table View)
        if (element.classList.contains('bases-td')) {
            this.processBasesCell(element, targetProps);
        } else {
            element.findAll('.bases-td').forEach(cell => {
                this.processBasesCell(cell, targetProps);
            });
        }

        // CONTEXT 3: Bases Plugin (Cards View)
        if (element.classList.contains('bases-cards-property')) {
            this.processBasesCardProperty(element, targetProps);
        } else {
            element.findAll('.bases-cards-property').forEach(property => {
                this.processBasesCardProperty(property, targetProps);
            });
        }
    }

    private processMetadataProperty(row: Element, targetProps: string[]) {
        const propertyKey = row.getAttribute('data-property-key');
        if (!propertyKey || !targetProps.includes(propertyKey.toLowerCase())) return;

        row.findAll('.multi-select-pill').forEach(pill => {
            this.processPill(pill, propertyKey);
        });
    }

    private processBasesCell(cell: Element, targetProps: string[]) {
        const dataProperty = cell.getAttribute('data-property');
        if (!dataProperty) return;

        const match = targetProps.find(property => dataProperty.toLowerCase() === `note.${property}`);
        if (!match) return;

        cell.findAll('.multi-select-pill').forEach(pill => {
            this.processPill(pill, match);
        });
    }

    private processBasesCardProperty(property: Element, targetProps: string[]) {
        const dataProperty = property.getAttribute('data-property');
        if (!dataProperty) return;

        const match = targetProps.find(target => dataProperty.toLowerCase() === `note.${target}`);
        if (!match) return;

        const valueElements = property.findAll('.value-list-element');
        if (valueElements.length > 0) {
            valueElements.forEach(value => {
                this.processValueListElement(value, match);
            });
            return;
        }

        const renderedValue = property.find('.bases-rendered-value');
        if (renderedValue?.instanceOf(HTMLElement)) {
            this.processSingleCardValue(renderedValue, match);
        }
    }

    private processLeafPill(pill: HTMLElement) {
        const targetProps = this.plugin.getTargetProperties();
        const metadataProperty = pill.closest('.metadata-property');

        if (metadataProperty) {
            const propertyKey = metadataProperty.getAttribute('data-property-key');
            if (propertyKey && targetProps.includes(propertyKey.toLowerCase())) {
                this.processPill(pill, propertyKey);
                return;
            }
        }

        const basesCell = pill.closest('.bases-td');
        const dataProperty = basesCell?.getAttribute('data-property');
        if (!dataProperty) return;

        const match = targetProps.find(property => dataProperty.toLowerCase() === `note.${property}`);
        if (match) this.processPill(pill, match);
    }

    private processLeafValue(element: HTMLElement) {
        const targetProps = this.plugin.getTargetProperties();
        const property = element.closest('.bases-cards-property');
        const dataProperty = property?.getAttribute('data-property');
        if (!dataProperty) return;

        const match = targetProps.find(target => dataProperty.toLowerCase() === `note.${target}`);
        if (match) this.processValueListElement(element, match);
    }

    private processLeafRenderedValue(element: HTMLElement) {
        const targetProps = this.plugin.getTargetProperties();
        const property = element.closest('.bases-cards-property');
        const dataProperty = property?.getAttribute('data-property');
        if (!dataProperty) return;

        const match = targetProps.find(target => dataProperty.toLowerCase() === `note.${target}`);
        if (match) this.processSingleCardValue(element, match);
    }

    /**
     * Forces a re-evaluation of all existing pills.
     * This is useful when settings/styles change and we need to update classes (e.g. adding typify-is-image).
     */
    reprocessAllPills() {
        // 1. Reprocess all currently styled pills (in case their style changed or was removed)
        activeDocument.body.findAll('.custom-status-icon-pill').forEach(pill => {
            const propertyKey = pill.getAttribute('data-property-key');
            if (propertyKey) {
                this.processPill(pill, propertyKey);
            }
        });
        activeDocument.body.findAll('.custom-status-icon-value').forEach(el => {
            const propertyKey = el.getAttribute('data-property-key');
            if (propertyKey) {
                this.processValueListElement(el, propertyKey);
            }
        });

        // 2. Process any unstyled pills that might now match a newly imported or modified style
        activeDocument.body.findAll('[data-typify-observed]').forEach(container => {
            if (container.classList.contains('metadata-container')) {
                this.processMetadataContainer(container);
            } else if (container.classList.contains('bases-view')) {
                this.processBasesView(container);
                this.processBasesCardsView(container);
            }
        });
    }

    refreshProcessing() {
        if (!this.observer) return;

        // Re-attach <style> if it was removed externally
        this.styleManager.ensureAttached();

        // Only query elements that haven't been observed yet to keep the polling extremely lightweight
        const unobservedContainers = activeDocument.body.findAll('.metadata-container:not([data-typify-observed])');
        unobservedContainers.forEach(container => {
            this.processMetadataContainer(container);
            container.setAttribute('data-typify-observed', 'true');
            this.observer?.observe(container);
        });

        const unobservedBasesViews = activeDocument.body.findAll('.bases-view:not([data-typify-observed])');
        unobservedBasesViews.forEach(view => {
            this.processBasesView(view);
            this.processBasesCardsView(view);
            view.setAttribute('data-typify-observed', 'true');
            this.observer?.observe(view);
        });
    }

    processPill(pill: Element, propertyKey: string) {
        if (!pill.instanceOf(HTMLElement)) return;

        if (pill.getAttribute('data-property-key') !== propertyKey) {
            pill.setAttribute('data-property-key', propertyKey);
        }

        const content = pill.querySelector('.multi-select-pill-content');
        // For external links, use data-href (set by Obsidian, immutable) to avoid
        // MutationObserver loops after text replacement
        const isExternalLink = content?.classList.contains('external-link');
        const value = (isExternalLink
            ? content?.getAttribute('data-href')
            : content?.textContent?.trim()
        ) || '';

        if (pill.getAttribute('data-value') !== value) {
            pill.setAttribute('data-value', value);
        }

        const matchedClass = this.styleManager.findMatchingClass(value, propertyKey);
        if (matchedClass) {
            pill.classList.add('custom-status-icon-pill');
            this.styleManager.applyStyle(pill, matchedClass);

            // Link text replacement: swap URL for display name
            const info = this.styleManager.getStyleInfo(matchedClass);

            if (this.plugin.settings.enableLinkStyles && info?.hasMatchValue && isExternalLink && content?.instanceOf(HTMLElement)) {
                // Replace URL text with style display name
                if (content.textContent?.trim() !== info.name) {
                    content.textContent = info.name;
                }
            } else {
                // Toggle off or style lost matchValue — restore original URL
                if (isExternalLink && content?.instanceOf(HTMLElement)) {
                    const href = content.getAttribute('data-href');
                    if (href && content.textContent?.trim() !== href) {
                        content.textContent = href;
                    }
                }
            }
        } else {
            pill.classList.remove('custom-status-icon-pill');
            this.styleManager.clearStyle(pill);
            // Restore original URL if text was replaced by a now-removed style
            if (isExternalLink && content?.instanceOf(HTMLElement)) {
                const href = content.getAttribute('data-href');
                if (href && content.textContent?.trim() !== href) {
                    content.textContent = href;
                }
            }
        }
    }

    processValueListElement(element: Element, propertyKey: string) {
        if (!element.instanceOf(HTMLElement)) return;

        if (element.getAttribute('data-property-key') !== propertyKey) {
            element.setAttribute('data-property-key', propertyKey);
        }

        const linkContent = element.querySelector('.external-link');
        const isExternalLink = !!linkContent;
        const value = (isExternalLink
            ? linkContent?.getAttribute('href')
            : element.textContent?.trim()
        ) || '';

        if (element.getAttribute('data-value') !== value) {
            element.setAttribute('data-value', value);
        }

        const matchedClass = this.styleManager.findMatchingClass(value, propertyKey);
        if (matchedClass) {
            element.classList.add('custom-status-icon-value');
            this.styleManager.applyStyle(element, matchedClass);

            const info = this.styleManager.getStyleInfo(matchedClass);
            if (this.plugin.settings.enableLinkStyles && info?.hasMatchValue && isExternalLink && linkContent?.instanceOf(HTMLElement)) {
                if (linkContent.textContent?.trim() !== info.name) {
                    linkContent.textContent = info.name;
                }
            } else {
                if (isExternalLink && linkContent?.instanceOf(HTMLElement)) {
                    const href = linkContent.getAttribute('href');
                    if (href && linkContent.textContent?.trim() !== href) {
                        linkContent.textContent = href;
                    }
                }
            }
        } else {
            element.classList.remove('custom-status-icon-value');
            this.styleManager.clearStyle(element);

            if (isExternalLink && linkContent?.instanceOf(HTMLElement)) {
                const href = linkContent.getAttribute('href');
                if (href && linkContent.textContent?.trim() !== href) {
                    linkContent.textContent = href;
                }
            }
        }
    }

    processSingleCardValue(container: HTMLElement, propertyKey: string) {
        if (container.querySelector('.value-list-element')) return;

        const value = container.textContent?.trim() || '';
        if (!value) return;

        const matchedClass = this.styleManager.findMatchingClass(value, propertyKey);

        let wrapper = container.querySelector<HTMLElement>('.typify-single-value');

        if (matchedClass) {
            if (!wrapper) {
                container.textContent = '';
                wrapper = container.createSpan({ cls: 'typify-single-value', text: value });
            }
            wrapper.classList.add('custom-status-icon-value');
            wrapper.setAttribute('data-property-key', propertyKey);
            wrapper.setAttribute('data-value', value);
            this.styleManager.applyStyle(wrapper, matchedClass);
        } else if (wrapper) {
            const text = wrapper.textContent || '';
            wrapper.remove();
            container.textContent = text;
        }
    }

    processMetadataContainer(container: HTMLElement) {
        const targetProps = this.plugin.getTargetProperties();
        const propertyRows = container.findAll('.metadata-property');
        propertyRows.forEach(row => {
            const propertyKey = row.getAttribute('data-property-key');
            if (!propertyKey || !targetProps.includes(propertyKey.toLowerCase())) return;

            const pills = row.findAll('.multi-select-pill');
            pills.forEach(pill => { this.processPill(pill, propertyKey); });
        });
    }

    processBasesView(view: HTMLElement) {
        const targetProps = this.plugin.getTargetProperties();
        const cells = view.findAll('.bases-td');
        cells.forEach(cell => {
            const dataProperty = cell.getAttribute('data-property');
            if (!dataProperty) return;

            const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
            if (!match) return;

            const pills = cell.findAll('.multi-select-pill');
            pills.forEach(pill => { this.processPill(pill, match); });
        });
    }

    processBasesCardsView(view: HTMLElement) {
        const targetProps = this.plugin.getTargetProperties();
        const cardsProperties = view.findAll('.bases-cards-property');
        cardsProperties.forEach(prop => {
            const dataProperty = prop.getAttribute('data-property');
            if (!dataProperty) return;

            const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
            if (!match) return;

            const valueElements = prop.findAll('.value-list-element');
            if (valueElements.length > 0) {
                valueElements.forEach(el => { this.processValueListElement(el, match); });
            } else {
                const renderedValue = prop.find('.bases-rendered-value');
                if (renderedValue?.instanceOf(HTMLElement)) {
                    this.processSingleCardValue(renderedValue, match);
                }
            }
        });
    }

    cleanup() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        activeDocument.body.findAll('[data-typify-observed]').forEach(el => {
            el.removeAttribute('data-typify-observed');
        });
        activeDocument.body.findAll('.custom-status-icon-pill').forEach(el => {
            el.classList.remove('custom-status-icon-pill');
            el.removeAttribute('data-value');
            el.removeAttribute('data-property-key');
            this.styleManager.clearStyle(el);

            // Restore external link text if it was modified
            const linkContent = el.querySelector('.multi-select-pill-content.external-link');
            if (linkContent?.instanceOf(HTMLElement)) {
                const href = linkContent.getAttribute('data-href');
                if (href && linkContent.textContent?.trim() !== href) {
                    linkContent.textContent = href;
                }
            }
        });
        activeDocument.body.findAll('.custom-status-icon-value').forEach(el => {
            el.classList.remove('custom-status-icon-value');
            el.removeAttribute('data-value');
            el.removeAttribute('data-property-key');
            this.styleManager.clearStyle(el);

            const linkContent = el.querySelector('.external-link');
            if (linkContent?.instanceOf(HTMLElement)) {
                const href = linkContent.getAttribute('href');
                if (href && linkContent.textContent?.trim() !== href) {
                    linkContent.textContent = href;
                }
            }
        });
        activeDocument.body.findAll('.typify-single-value').forEach(el => {
            const parent = el.parentElement;
            if (parent) {
                parent.textContent = el.textContent || '';
            }
        });
    }
}
