const OBSERVED_ATTRIBUTES = ['class', 'data-property', 'data-property-key'];

const TYPOGRAPHY_LEAF_CLASSES = [
    'multi-select-pill',
    'value-list-element',
    'bases-rendered-value',
    'typify-single-value',
    'custom-status-icon-pill',
    'custom-status-icon-value'
];

/**
 * Observes Obsidian-owned DOM containers while keeping mutation bursts cheap.
 *
 * Obsidian can emit many related mutations during a single render. Processing
 * every record synchronously causes the same subtree to be scanned repeatedly.
 * This observer batches affected nodes into the next animation frame and drops
 * descendants when an ancestor is already queued.
 */
export class DOMMutationObserver {
    private observer: MutationObserver;
    private pendingNodes = new Set<Node>();
    private animationFrame: number | null = null;

    constructor(private readonly processNode: (node: Node) => void) {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => this.handleMutation(mutation));
            this.scheduleFlush();
        });
    }

    observe(target: Node) {
        this.observer.observe(target, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: OBSERVED_ATTRIBUTES
        });
    }

    disconnect() {
        this.observer.disconnect();
        this.pendingNodes.clear();

        if (this.animationFrame !== null) {
            window.cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    private handleMutation(mutation: MutationRecord) {
        if (mutation.type === 'childList') {
            // Queue the parent as well as added nodes. Text replacement commonly
            // produces Text nodes; processing their parent lets DOMManager resolve
            // the surrounding pill/card without observing characterData globally.
            this.queueNode(mutation.target);
            mutation.addedNodes.forEach(node => this.queueNode(node));
            return;
        }

        if (mutation.type === 'attributes' && !this.isTypifyOwnedMutation(mutation)) {
            this.queueNode(mutation.target);
        }
    }

    private isTypifyOwnedMutation(mutation: MutationRecord) {
        if (!mutation.target.instanceOf(HTMLElement)) return false;
        if (mutation.attributeName !== 'class' && mutation.attributeName !== 'data-property-key') return false;

        return TYPOGRAPHY_LEAF_CLASSES.some(className => mutation.target.classList.contains(className));
    }

    private queueNode(node: Node) {
        // If an ancestor is already queued, processing this node separately would
        // just rescan the same subtree.
        for (const pending of this.pendingNodes) {
            if (pending === node || pending.contains(node)) return;
        }

        // Prefer the broader node when it supersedes descendants queued earlier.
        for (const pending of Array.from(this.pendingNodes)) {
            if (node.contains(pending)) this.pendingNodes.delete(pending);
        }

        this.pendingNodes.add(node);
    }

    private scheduleFlush() {
        if (this.animationFrame !== null || this.pendingNodes.size === 0) return;

        this.animationFrame = window.requestAnimationFrame(() => {
            this.animationFrame = null;
            const nodes = Array.from(this.pendingNodes);
            this.pendingNodes.clear();
            nodes.forEach(node => this.processNode(node));
        });
    }
}
