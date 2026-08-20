import { App, WorkspaceWindow } from 'obsidian';
import type TypifyPlugin from '../main';

export class WindowManager {
    private plugin: TypifyPlugin;
    private app: App;
    
    // Tracks all active Document instances across main window and pop-outs
    private activeDocuments: Set<Document> = new Set();

    constructor(plugin: TypifyPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
    }

    initialize(): void {
        // 1. Gather documents from already open windows/leaves
        this.app.workspace.iterateAllLeaves((leaf) => {
            const doc = leaf.view.containerEl.ownerDocument;
            if (doc) {
                this.activeDocuments.add(doc);
            }
        });
        
        // Ensure main document is always present
        this.activeDocuments.add(document);

        // 2. Listen for new pop-out windows
        this.plugin.registerEvent(
            this.app.workspace.on('window-open', (workspaceWindow: WorkspaceWindow, win: Window) => {
                const doc = win.document;
                this.activeDocuments.add(doc);
                // Immediately notify style manager to inject CSS into this new document
                this.plugin.styleManager?.injectIntoDocument(doc);
            })
        );

        // 3. Listen for closed pop-out windows to prevent memory leaks
        this.plugin.registerEvent(
            this.app.workspace.on('window-close', (workspaceWindow: WorkspaceWindow, win: Window) => {
                const doc = win.document;
                this.activeDocuments.delete(doc);
                this.plugin.styleManager?.removeFromDocument(doc);
            })
        );
    }

    /**
     * Returns an array of all currently active Document instances.
     */
    getDocuments(): Document[] {
        // Fallback cleanup: remove any documents that are no longer attached to a window or whose window is closed
        const validDocs: Document[] = [];
        for (const doc of this.activeDocuments) {
            if (doc.defaultView && !doc.defaultView.closed) {
                validDocs.push(doc);
            } else {
                this.activeDocuments.delete(doc);
                this.plugin.styleManager?.removeFromDocument(doc);
            }
        }
        return validDocs;
    }

    cleanup(): void {
        this.activeDocuments.clear();
    }
}
