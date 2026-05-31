import TypifyPlugin from '../main';
import { StyleManager } from './style-manager';

export class DOMManager {
    private plugin: TypifyPlugin;
    private styleManager: StyleManager;
    private observer: MutationObserver | null = null;

    constructor(plugin: TypifyPlugin, styleManager: StyleManager) {
        this.plugin = plugin;
        this.styleManager = styleManager;
    }

    init() {
        const processNode = (node: Node) => {
            if (!node.instanceOf(HTMLElement)) return;

            const targetProps = this.plugin.getTargetProperties();

            // CONTEXT 1: Metadata Properties
            if (node.classList.contains('metadata-property')) {
                const propertyKey = node.getAttribute('data-property-key');
                if (propertyKey && targetProps.includes(propertyKey.toLowerCase())) {
                    const pills = node.findAll('.multi-select-pill');
                    pills.forEach((pill: Element) => { this.processPill(pill, propertyKey); });
                }
            } else {
                const propertyRows = node.findAll('.metadata-property');
                propertyRows.forEach(row => {
                    const propertyKey = row.getAttribute('data-property-key');
                    if (!propertyKey || !targetProps.includes(propertyKey.toLowerCase())) return;
                    const pills = row.findAll('.multi-select-pill');
                    pills.forEach((pill: Element) => { this.processPill(pill, propertyKey); });
                });
            }

            // CONTEXT 2: Bases Plugin (Table View)
            if (node.classList.contains('bases-td')) {
                const dataProperty = node.getAttribute('data-property');
                if (dataProperty) {
                    const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                    if (match) {
                        const pills = node.findAll('.multi-select-pill');
                        pills.forEach((pill: Element) => { this.processPill(pill, match); });
                    }
                }
            } else {
                const basesCells = node.findAll('.bases-td');
                basesCells.forEach(cell => {
                    const dataProperty = cell.getAttribute('data-property');
                    if (!dataProperty) return;
                    const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                    if (!match) return;
                    const pills = cell.findAll('.multi-select-pill');
                    pills.forEach((pill: Element) => { this.processPill(pill, match); });
                });
            }

            // CONTEXT 3: Bases Plugin (Cards View)
            if (node.classList.contains('bases-cards-property')) {
                const dataProperty = node.getAttribute('data-property');
                if (dataProperty) {
                    const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                    if (match) {
                        const valueElements = node.findAll('.value-list-element');
                        if (valueElements.length > 0) {
                            valueElements.forEach((el: Element) => { this.processValueListElement(el, match); });
                        } else {
                            const renderedValue = node.find('.bases-rendered-value');
                            if (renderedValue.instanceOf(HTMLElement)) {
                                this.processSingleCardValue(renderedValue, match);
                            }
                        }
                    }
                }
            } else {
                const basesCardsProperties = node.findAll('.bases-cards-property');
                basesCardsProperties.forEach(prop => {
                    const dataProperty = prop.getAttribute('data-property');
                    if (!dataProperty) return;
                    const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                    if (!match) return;
                    const valueElements = prop.findAll('.value-list-element');
                    if (valueElements.length > 0) {
                        valueElements.forEach((el: Element) => { this.processValueListElement(el, match); });
                    } else {
                        const renderedValue = prop.find('.bases-rendered-value');
                        if (renderedValue.instanceOf(HTMLElement)) {
                            this.processSingleCardValue(renderedValue, match);
                        }
                    }
                });
            }

            // Leaf nodes itself
            if (node.classList.contains('multi-select-pill')) {
                const metadataProperty = node.closest('.metadata-property');
                if (metadataProperty) {
                    const propertyKey = metadataProperty.getAttribute('data-property-key');
                    if (propertyKey && targetProps.includes(propertyKey.toLowerCase())) {
                        this.processPill(node, propertyKey);
                        return;
                    }
                }
                const basesCell = node.closest('.bases-td');
                if (basesCell) {
                    const dataProperty = basesCell.getAttribute('data-property');
                    if (dataProperty) {
                        const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                        if (match) {
                            this.processPill(node, match);
                        }
                    }
                }
            }

            if (node.classList.contains('value-list-element')) {
                const basesCardsProp = node.closest('.bases-cards-property');
                if (basesCardsProp) {
                    const dataProperty = basesCardsProp.getAttribute('data-property');
                    if (dataProperty) {
                        const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                        if (match) {
                            this.processValueListElement(node, match);
                        }
                    }
                }
            }

            if (node.classList.contains('bases-rendered-value')) {
                const basesCardsProp = node.closest('.bases-cards-property');
                if (basesCardsProp) {
                    const dataProperty = basesCardsProp.getAttribute('data-property');
                    if (dataProperty) {
                        const match = targetProps.find(p => dataProperty.toLowerCase() === `note.${p}`);
                        if (match) {
                            this.processSingleCardValue(node, match);
                        }
                    }
                }
            }
        };

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => { processNode(node); });
                }
                if (mutation.type === 'attributes' || mutation.type === 'characterData') {
                    if (mutation.target.instanceOf(HTMLElement)) {
                        if (
                            (mutation.target.classList.contains('multi-select-pill') ||
                                mutation.target.classList.contains('value-list-element') ||
                                mutation.target.classList.contains('bases-rendered-value') ||
                                mutation.target.classList.contains('typify-single-value') ||
                                mutation.target.classList.contains('custom-status-icon-pill') ||
                                mutation.target.classList.contains('custom-status-icon-value')) &&
                            (mutation.attributeName === 'data-value' ||
                                mutation.attributeName === 'data-property-key' ||
                                mutation.attributeName === 'class')
                        ) {
                            return; 
                        }
                        processNode(mutation.target);
                    }
                }
            });
        });

        this.plugin.registerEvent(this.plugin.app.workspace.on('layout-change', () => {
            this.refreshProcessing();
        }));

        this.plugin.registerEvent(this.plugin.app.workspace.on('active-leaf-change', () => {
            this.refreshProcessing();
        }));

        // Robust fallback for dynamic views like Canvas that lazy-load elements without triggering workspace events
        this.plugin.registerInterval(window.setInterval(() => {
            this.refreshProcessing();
        }, 1500));

        this.refreshProcessing();
    }

    /**
     * Forces a re-evaluation of all existing pills.
     * This is useful when settings/styles change and we need to update classes (e.g. adding typify-is-image).
     */
    reprocessAllPills() {
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
            this.observer?.observe(container, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
        });

        const unobservedBasesViews = activeDocument.body.findAll('.bases-view:not([data-typify-observed])');
        unobservedBasesViews.forEach(view => {
            this.processBasesView(view);
            this.processBasesCardsView(view);
            view.setAttribute('data-typify-observed', 'true');
            this.observer?.observe(view, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
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
                wrapper = createSpan();
                wrapper.classList.add('typify-single-value');
                wrapper.textContent = value;
                container.textContent = '';
                container.appendChild(wrapper);
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
                if (renderedValue.instanceOf(HTMLElement)) {
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
            if (linkContent instanceof HTMLElement) {
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
            if (linkContent instanceof HTMLElement) {
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
