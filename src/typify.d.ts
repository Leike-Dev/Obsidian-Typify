// ============================================================================
// TYPIFY — Module augmentation for Obsidian APIs
// Extends Obsidian's type definitions for internal APIs and custom events
// used by the plugin. This file produces NO JavaScript output.
// ============================================================================

import 'obsidian';

declare module 'obsidian' {
    interface Workspace {
        /** Custom Typify event: fired when user acknowledges the changelog. */
        on(name: 'typify:version-seen', callback: (version: string) => void, ctx?: unknown): EventRef;
        /** Custom Typify event trigger. */
        trigger(name: 'typify:version-seen', version: string): void;
    }

    interface Vault {
        /** Internal Obsidian API — reads a config value by key (e.g. 'cssTheme'). */
        getConfig(key: string): unknown;
    }
}
