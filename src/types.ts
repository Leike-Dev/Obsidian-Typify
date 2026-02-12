// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StatusStyle {
    name: string;
    baseColor: string;
    icon: string;
    appliesTo?: string[]; // Optional: List of properties this style applies to. If empty/undefined, applies to all.
    shape?: 'pill' | 'rectangle'; // Optional: Visual shape. Default is 'pill'.
}

export interface CustomStatusIconsSettings {
    targetProperty: string;
    statusStyles: StatusStyle[];
    recentIcons: string[];
    enableCustomIcons: boolean;
}

export const DEFAULT_SETTINGS: CustomStatusIconsSettings = {
    targetProperty: 'Status',
    statusStyles: [],
    recentIcons: [],
    enableCustomIcons: false
};

// Default color for new status styles
export const DEFAULT_STATUS_COLOR = '#6366f1';
