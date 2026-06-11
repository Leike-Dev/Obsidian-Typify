// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StatusStyle {
    name: string;
    matchValue?: string;
    prefixMatch?: boolean;
    baseColor: string;
    icon: string;
    appliesTo?: string[];
    shape?: 'pill' | 'rectangle' | 'flat';
    colorMode?: 'subtle' | 'solid';
}

export interface CustomStatusIconsSettings {
    targetProperty: string;
    statusStyles: StatusStyle[];
    recentIcons: string[];
    enableCustomIcons: boolean;
    hideRemoveButton: 'none' | 'properties' | 'bases' | 'both';
    hideRemoveButtonHover: boolean;
    enableLinkStyles: boolean;
    enableCustomPalette: boolean;
    customPalette: string[];
    enableFavicons: boolean;
    autoFetchFavicons: boolean;
    faviconProvider: 'google' | 'duckduckgo' | 'direct';
    lastSeenVersion: string;
}

export const DEFAULT_SETTINGS: CustomStatusIconsSettings = {
    targetProperty: '',
    statusStyles: [],
    recentIcons: [],
    enableCustomIcons: false,
    hideRemoveButton: 'none',
    hideRemoveButtonHover: false,
    enableLinkStyles: false,
    enableCustomPalette: false,
    customPalette: [],
    enableFavicons: false,
    autoFetchFavicons: false,
    faviconProvider: 'direct',
    lastSeenVersion: ''
};

// Default color for new status styles
export const DEFAULT_STATUS_COLOR = '#6366f1';
