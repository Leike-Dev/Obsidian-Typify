import TypifyPlugin from '../main';
import { DOMManager } from './dom-manager';
import { DOMMutationObserver } from './dom-mutation-observer';
import { StyleManager } from './style-manager';

/**
 * DOMManager variant that separates mutation observation/scheduling from the
 * context-specific render logic inherited from DOMManager.
 *
 * Keeping render methods in the existing manager makes this a low-risk
 * performance refactor: Metadata, Bases table/cards and style application keep
 * their current behavior while mutation bursts are deduplicated and batched.
 */
export class OptimizedDOMManager extends DOMManager {
    private pluginRef: TypifyPlugin;
    private styleManagerRef: StyleManager;
    private mutationObserver: DOMMutationObserver | null = null;

    constructor(plugin: TypifyPlugin, styleManager: StyleManager) {
        super(plugin, styleManager);
        this.pluginRef = plugin;
        this.styleManagerRef = styleManager;
    }

    override init() {
        this.mutationObserver = new DOMMutationObserver(node => this.processNode(node));

        this.pluginRef.registerEvent(this.pluginRef.app.workspace.on('layout-change', () => {
            this.refreshProcessing();
        }));

        this.pluginRef.registerEvent(this.pluginRef.app.workspace.on('active-leaf-change', () => {
            this.refreshProcessing();
        }));

        // Canvas and other dynamic views can still appear without a workspace
        // event. Keep the existing fallback, but the scan only attaches new
        // containers and no longer performs mutation work synchronously.
        this.pluginRef.registerInterval(window.setInterval(() => {
            this.refreshProcessing();
        }, 1500));

        this.refreshProcessing();
    }

    override refreshProcessing() {
        if (!this.mutationObserver) return;

        this.styleManagerRef.ensureAttached();

        const unobservedContainers = activeDocument.body.findAll('.metadata-container:not([data-typify-observed])');
        unobservedContainers.forEach(container => {
            this.processMetadataContainer(container);
            container.setAttribute('data-typify-observed', 'true');
            this.mutationObserver?.observe(container);
        });

        const unobservedBasesViews = activeDocument.body.findAll('.bases-view:not([data-typify-observed])');
        unobservedBasesViews.forEach(view => {
            this.processBasesView(view);
            this.processBasesCardsView(view);
            view.setAttribute('data-typify-observed', 'true');
            this.mutationObserver?.observe(view);
        });
    }

    override cleanup() {
        this.mutationObserver?.disconnect();
        this.mutationObserver = null;
        super.cleanup();
    }

    private processNode(node: Node) {
        if (!node.instanceOf(HTMLElement)) {
            const parent = node.parentElement;
            if (parent) this.processNode(parent);
            return;
        }

        const targetProps = this.pluginRef.getTargetProperties();

        // CONTEXT 1: Metadata Properties
        if (node.classList.contains('metadata-property')) {
            this.processMetadataProperty(node, targetProps);
        } else {
            node.findAll('.metadata-property').forEach(row => this.processMetadataProperty(row, targetProps));
        }

        // CONTEXT 2: Bases Plugin (Table View)
        if (node.classList.contains('bases-td')) {
            this.processBasesCell(node, targetProps);
        } else {
            node.findAll('.bases-td').forEach(cell => this.processBasesCell(cell, targetProps));
        }

        // CONTEXT 3: Bases Plugin (Cards View)
        if (node.classList.contains('bases-cards-property')) {
            this.processBasesCardProperty(node, targetProps);
        } else {
            node.findAll('.bases-cards-property').forEach(prop => this.processBasesCardProperty(prop, targetProps));
        }

        // Leaf nodes can be inserted without their full context subtree being new.
        if (node.classList.contains('multi-select-pill')) {
            this.processLeafPill(node, targetProps);
        }

        if (node.classList.contains('value-list-element')) {
            const propertyKey = this.getBasesPropertyKey(node.closest('.bases-cards-property'), targetProps);
            if (propertyKey) this.processValueListElement(node, propertyKey);
        }

        if (node.classList.contains('bases-rendered-value')) {
            const propertyKey = this.getBasesPropertyKey(node.closest('.bases-cards-property'), targetProps);
            if (propertyKey) this.processSingleCardValue(node, propertyKey);
        }
    }

    private processMetadataProperty(row: Element, targetProps: string[]) {
        const propertyKey = row.getAttribute('data-property-key');
        if (!propertyKey || !targetProps.includes(propertyKey.toLowerCase())) return;

        row.findAll('.multi-select-pill').forEach(pill => this.processPill(pill, propertyKey));
    }

    private processBasesCell(cell: Element, targetProps: string[]) {
        const propertyKey = this.getBasesPropertyKey(cell, targetProps);
        if (!propertyKey) return;

        cell.findAll('.multi-select-pill').forEach(pill => this.processPill(pill, propertyKey));
    }

    private processBasesCardProperty(prop: Element, targetProps: string[]) {
        const propertyKey = this.getBasesPropertyKey(prop, targetProps);
        if (!propertyKey) return;

        const values = prop.findAll('.value-list-element');
        if (values.length > 0) {
            values.forEach(value => this.processValueListElement(value, propertyKey));
            return;
        }

        const renderedValue = prop.find('.bases-rendered-value');
        if (renderedValue.instanceOf(HTMLElement)) {
            this.processSingleCardValue(renderedValue, propertyKey);
        }
    }

    private processLeafPill(pill: HTMLElement, targetProps: string[]) {
        const metadataProperty = pill.closest('.metadata-property');
        if (metadataProperty) {
            const propertyKey = metadataProperty.getAttribute('data-property-key');
            if (propertyKey && targetProps.includes(propertyKey.toLowerCase())) {
                this.processPill(pill, propertyKey);
                return;
            }
        }

        const propertyKey = this.getBasesPropertyKey(pill.closest('.bases-td'), targetProps);
        if (propertyKey) this.processPill(pill, propertyKey);
    }

    private getBasesPropertyKey(element: Element | null, targetProps: string[]) {
        const dataProperty = element?.getAttribute('data-property');
        if (!dataProperty) return null;

        const normalized = dataProperty.toLowerCase();
        return targetProps.find(property => normalized === `note.${property}`) ?? null;
    }
}
