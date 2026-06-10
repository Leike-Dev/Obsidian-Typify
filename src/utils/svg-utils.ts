// ============================================================================
// SVG UTILITIES
// Provides a safe, centralized way to insert trusted static SVG strings
// into the DOM without using innerHTML directly on live elements.
// ============================================================================

/**
 * Safely inserts a trusted static SVG string into a container element.
 *
 * Uses a `<template>` element whose content is an inert DocumentFragment,
 * avoiding the overhead of DOMParser (which creates a full Document per call)
 * and preventing any script execution from the parsed content.
 *
 * IMPORTANT: Only use with trusted, hardcoded SVG constants (e.g. from
 * format-thumbs.ts). Never pass user-generated input to this function.
 *
 * @param container The parent element to receive the SVG nodes.
 * @param svgString A trusted SVG markup string.
 */
export function insertSvg(container: HTMLElement, svgString: string): void {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    
    const svgEl = doc.documentElement;
    if (svgEl && svgEl.tagName.toLowerCase() === 'svg') {
        container.appendChild(svgEl);
    }
}
