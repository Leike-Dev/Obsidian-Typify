// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StatusStyle {
    name: string;
    baseColor: string;
    icon: string;
    appliesTo?: string[]; // Optional: List of properties this style applies to. If empty/undefined, applies to all.
}

export interface CustomStatusIconsSettings {
    targetProperty: string;
    statusStyles: StatusStyle[];
    recentIcons: string[];
}

export const DEFAULT_SETTINGS: CustomStatusIconsSettings = {
    targetProperty: 'Status',
    statusStyles: [],
    recentIcons: []
};

// Default color for new status styles
export const DEFAULT_STATUS_COLOR = '#6366f1';
