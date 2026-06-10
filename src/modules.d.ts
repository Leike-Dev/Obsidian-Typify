// ============================================================================
// AMBIENT MODULE DECLARATIONS
// This file MUST NOT contain any imports/exports to remain an ambient script.
// ============================================================================

/** esbuild imports .md files as plain text strings via the text loader. */
declare module '*.md' {
    const content: string;
    export default content;
}
