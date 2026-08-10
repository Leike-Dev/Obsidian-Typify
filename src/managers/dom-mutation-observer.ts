const OBSERVED_ATTRIBUTES = ['class', 'data-property', 'data-property-key'];

const TYPOGRAPHY_LEAF_CLASSES = [
    'multi-select-pill',
    'value-list-element',
    'bases-rendered-value',
    'typify-single-value',
    'custom-status-icon-pill',
    'custom-status-icon-value'
];

const TYPOGRAPHY_MANAGED_CLASSES = new Set([
    'custom-status-icon-pill',
    'custom-status-icon-value',
    'typify-is-image',
    'typify-is-emoji'
]);

interface ObserverState {
    observer: MutationObserver;
    pendingNodes: Set<Node>;
    animationFrame: number | null;
    win: Window;
}

/**
 * Observes Obsidian-owned DOM containers while keeping mutation bursts cheap.
 *
 * Obsidian can emit many related mutations during one render. Processing every
 * record synchronously causes the same subtree to be scanned repeatedly. This
 * observer batches work per Window into the next animation frame and removes
 * redundant descendant nodes before processing.
 */
export class DOMMutationObserver {
    private states = new Map<Window, ObserverState>();

    constructor(private readonly processNode: (node: Node) => void) {}

    observe(target: Node) {
        const state = this.getState(target.win);
        state.observer.observe(target, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: OBSERVED_ATTRIBUTES,
            attributeOldValue: true
        });
    }

    disconnect() {
        this.states.forEach(state => {
            state.observer.disconnect();
            state.pendingNodes.clear();

            if (state.animationFrame !== null) {
                state.win.cancelAnimationFrame(state.animationFrame);
            }
        });

        this.states.clear();
    }

    private getState(win: Window): ObserverState {
        const existing = this.states.get(win);
        if (existing) return existing;

        const MutationObserverCtor = (win as Window & typeof globalThis).MutationObserver;
        let state: ObserverState;
        const observer = new MutationObserverCtor(mutations => {
            mutations.forEach(mutation => this.handleMutation(state, mutation));
            this.scheduleFlush(state);
        });

        state = {
            observer,
            pendingNodes: new Set<Node>(),
            animationFrame: null,
            win
        };

        this.states.set(win, state);
        return state;
    }

    private handleMutation(state: ObserverState, mutation: MutationRecord) {
        if (mutation.type === 'childList') {
            // Text replacement is exposed as child-list mutations. Queueing the
            // target guarantees we re-evaluate removals as well as insertions.
            this.queueNode(state, mutation.target);
            return;
        }

        if (mutation.type === 'attributes' && !this.isTypifyOwnedMutation(mutation)) {
            this.queueNode(state, mutation.target);
        }
    }

    private isTypifyOwnedMutation(mutation: MutationRecord): boolean {
        const target = mutation.target;
        if (!target.instanceOf(HTMLElement)) return false;

        if (mutation.attributeName === 'data-property-key') {
            return TYPOGRAPHY_LEAF_CLASSES.some(className => target.classList.contains(className));
        }

        if (mutation.attributeName !== 'class') return false;

        const before = new Set((mutation.oldValue ?? '').split(/\s+/).filter(Boolean));
        const after = new Set(Array.from(target.classList));
        const changedClasses = new Set<string>();

        before.forEach(className => {
            if (!after.has(className)) changedClasses.add(className);
        });
        after.forEach(className => {
            if (!before.has(className)) changedClasses.add(className);
        });

        return changedClasses.size > 0 && Array.from(changedClasses).every(className =>
            TYPOGRAPHY_MANAGED_CLASSES.has(className) || className.startsWith('typify-style-')
        );
    }

    private queueNode(state: ObserverState, node: Node) {
        for (const pending of state.pendingNodes) {
            if (pending === node || pending.contains(node)) return;
        }

        for (const pending of Array.from(state.pendingNodes)) {
            if (node.contains(pending)) state.pendingNodes.delete(pending);
        }

        state.pendingNodes.add(node);
    }

    private scheduleFlush(state: ObserverState) {
        if (state.animationFrame !== null || state.pendingNodes.size === 0) return;

        state.animationFrame = state.win.requestAnimationFrame(() => {
            state.animationFrame = null;
            const nodes = Array.from(state.pendingNodes);
            state.pendingNodes.clear();
            nodes.forEach(node => this.processNode(node));
        });
    }
}
