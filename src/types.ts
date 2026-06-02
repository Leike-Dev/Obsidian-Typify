// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StatusStyle {
    name: string;
    matchValue?: string; // Optional: Value used for matching instead of name (e.g., a URL). Display uses name.
    baseColor: string;
    icon: string;
    appliesTo?: string[]; // Optional: List of properties this style applies to. If empty/undefined, applies to all.
    shape?: 'pill' | 'rectangle' | 'flat'; // Optional: Visual shape. Default is 'pill'.
    colorMode?: 'subtle' | 'solid'; // Optional: Color intensity. Default is 'subtle' (transparent).
}

export interface CustomStatusIconsSettings {
    targetProperty: string;
    statusStyles: StatusStyle[];
    recentIcons: string[];
    enableCustomIcons: boolean;
    hideRemoveButton: 'none' | 'properties' | 'bases' | 'both';
    enableLinkStyles: boolean;
    enableCustomPalette: boolean;
    customPalette: string[];
}

export const DEFAULT_SETTINGS: CustomStatusIconsSettings = {
    targetProperty: 'Status',
    statusStyles: [],
    recentIcons: [],
    enableCustomIcons: false,
    hideRemoveButton: 'none',
    enableLinkStyles: false,
    enableCustomPalette: false,
    customPalette: []
};

// Default color for new status styles
export const DEFAULT_STATUS_COLOR = '#6366f1';
