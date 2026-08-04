export const en = {

    'section_configuration_title': 'General',
    'section_data_management_title': 'Data management',

    // Target Property
    'target_property_title': 'Target property',
    'target_property_desc': 'The property name(s) to apply styles to (e.g., "status", "priority")',
    'target_property_placeholder': 'Type a property, then select to add',

    // Create Style
    'add_status_title': 'Create a new style',
    'add_status_desc': 'Define custom colors and icons for your tags.',
    'add_status_button': 'Create style',

    // Styles List
    'new_status_name': 'New style',

    // Style Controls
    'status_name_title': 'Name',
    'base_color_title': 'Base color',
    'icon_title': 'Icon',

    'add_icon_tooltip': 'Choose icon',
    'remove_icon_tooltip': 'Remove icon',
    'applies_to_title': 'Applies to',
    'applies_to_all_option': 'All properties',

    // Delete
    'delete_button': 'Delete style',

    // Icon Picker
    'icon_picker_placeholder': 'Type to search icons...',
    'icon_picker_navigate': 'Navigate',
    'icon_picker_select': 'Select',
    'icon_picker_close': 'Close',

    // Export/Import
    'export_title': 'Export settings',
    'export_desc': 'Copy your styles configuration to share or backup.',
    'export_button': 'Export',
    'import_title': 'Import settings',
    'import_desc': 'Paste a previously exported JSON to restore your styles.',
    'import_button': 'Import',
    'import_success': 'Styles imported successfully!',
    'import_error': 'Error importing styles. Invalid file format.',

    // Custom Icons
    'custom_icons_toggle_title': 'Custom icons',
    'custom_icons_toggle_desc': 'Enable custom SVG icons in the plugin.',
    'custom_icons_info': 'Only .svg files up to 100KB are supported. Place your icons in the icons/ folder inside the plugin directory.',
    'custom_icons_loaded': '{count} custom icon(s) loaded successfully!',
    'custom_icons_empty': 'No SVG files found in the icons/ folder. Add .svg files and enable again.',
    'custom_icons_error': 'Error loading custom icons.',
    'custom_icons_missing': '{count} custom icon(s) not found: {names}.',

    // Custom Images
    'custom_images_oversized': '{count} image(s) skipped (exceeds 50KB limit): {names}',
    'custom_images_missing': '{count} image(s) not found in img/ folder: {names}.',

    // Export Messages

    'export_error': 'Failed to export settings.',

    // Export/Import Modals
    'export_modal_title': 'Export settings',
    'copy_clipboard_button': 'Copy to clipboard',
    'copy_clipboard_success': 'Settings copied to clipboard!',
    'import_modal_title': 'Import settings',
    'import_paste_placeholder': 'Paste your JSON configuration here...',
    'import_empty_notice': 'Please paste your configuration first.',
    'import_invalid_json': 'Invalid JSON format. Check your data and try again.',
    'import_no_valid_styles': 'No valid styles found in the imported data.',
    'import_partial_success': '{imported} style(s) imported. {skipped} invalid style(s) were skipped.',

    // Styles Management
    'section_styles_title': 'Styles',
    'manage_styles_title': 'Manage styles',
    'manage_styles_desc': 'Edit, reorder, or delete your status styles.',
    'manage_styles_button': 'Manage',

    // Create Style Modal
    'create_style_title': 'Create style',

    'status_name_placeholder': 'Enter style name...',
    'save_button': 'Save',
    'cancel_button': 'Cancel',
    'style_name_required': 'Style name is required.',
    'shape_color_required': 'Please select a shape and color mode.',
    'style_saved': 'Style "{name}" saved!',
    'style_duplicate': 'A style with this name already exists for the same property.',
    'style_overlap_warning': 'Note: a style with this name already exists with a different scope. The more specific style will take priority.',

    // Style Manager Modal
    'manage_styles_modal_title': 'Manage styles',
    'manage_styles_search': 'Filter...',
    'manage_styles_count': '{count} style(s)',
    'manage_styles_empty': 'No styles created yet.',
    'manage_styles_no_results': 'No styles match your search.',
    'delete_style_confirm': 'Delete "{name}"?',
    'style_deleted': 'Style "{name}" deleted.',
    'confirm_button': 'Confirm',
    'scope_all': 'All properties',

    'scope_show_all': 'Show all',
    'scope_specific': 'Specific property',
    'batch_create_detected_before': '{count} values of this property have not been styled yet. ',
    'batch_create_detected_action': 'Batch create',
    'batch_create_detected_after': '?',
    'batch_create_already_global_before': 'Among them, ',
    'batch_create_already_global_after': ' already exist in "All properties".',
    'batch_create_all_global_before': 'Among them, ',
    'batch_create_all_global_after': ' already exist in "All properties". No batch creation needed.',
    'batch_create_too_many': 'This property has {count} candidate values, which is too many for batch creation.',
    'batch_create_confirm_title': 'Confirm batch creation',
    'batch_create_confirm_desc': 'Styles will be created for the following values: {values}',
    'batch_create_success': '{count} style(s) created in batch.',
    'reorder_move_up': 'Move up',
    'reorder_move_down': 'Move down',
    'target_property_add': 'Add',
    'target_property_empty_input': 'Please enter a property name',

    // Shape
    'shape_title': 'Shape',
    'shape_pill': 'Pill',
    'shape_rectangle': 'Rectangle',
    'shape_flat': 'Flat',


    // Tabs
    'tab_icons': 'Icons',
    'tab_emoji': 'Emojis',
    'tab_custom': 'SVGs',
    'tab_images': 'Images',

    // Color Mode
    'color_mode_title': 'Color mode',
    'color_mode_subtle': 'Subtle',
    'color_mode_solid': 'Solid',


    // Edit Style
    'edit_style_title': 'Edit style',
    'style_updated': 'Style "{name}" updated!',
    // Hide Remove Button
    'hide_remove_button_title': 'Hide "x" button on tags',
    'hide_remove_button_desc': 'Hides the remove icon for a cleaner and more discreet look.',
    'hide_remove_button_hover_title': 'Reveal remove button on hover',
    'hide_remove_button_hover_desc': 'If enabled, the remove button will appear when you hover over the tag.',
    'hide_remove_button_none': 'None (Default)',

    'hide_remove_button_properties': 'Only in Properties',
    'hide_remove_button_bases': 'Only in Bases',
    'hide_remove_button_both': 'In both',

    // Link Styles
    'link_styles_toggle_title': 'Associated links',
    'link_styles_toggle_desc': 'Replaces URLs in pills with the style name, keeping the native link click behavior.',
    'link_url_title': 'Associated Link',
    'link_url_placeholder': 'Enter a URL\u2026',
    'prefix_match_title': 'Prefix match',
    'prefix_match_desc': 'When enabled, any URL starting with this value will match (case-insensitive).',
    // UI Components
    'ui_components_title': 'Other styles',
    'ui_components_desc': 'Enable or disable visual components for the tags.',

    // Experimental / Palette
    'section_experimental_title': 'Experimental',
    'experimental_tag': 'Experimental',
    'custom_palette_toggle_title': 'Custom color palette',
    'custom_palette_toggle_desc': 'Enables the palette manager (below) and adds color shortcuts when creating styles.',
    'palette_title': 'Color palette',
    'palette_manager_desc': 'Add, remove or automatically generate color combinations to use in your styles.',
    'palette_your_colors': 'My colors',
    'palette_saved_count': 'Saved colors: {count} / {max}',
    'palette_add_color': 'Add',
    'palette_max_reached': 'Maximum of {max} colors reached.',
    'palette_harmony_heading': 'Generate color palette',
    'palette_harmony_analogous': 'Analogous',
    'palette_harmony_complementary': 'Complementary',
    'palette_harmony_shades': 'Shades',
    'palette_harmony_random': 'Random',

    'palette_clear_tooltip': 'Clear all',
    'palette_add_color_aria': 'Add color',
    'palette_color_copied': 'Color copied!',
    'palette_copy_aria': 'Copy',
    'palette_remove_aria': 'Remove',
    'palette_add_to_palette_aria': 'Add to palette',
    'palette_regenerate_aria': 'Regenerate',

    // Favicons
    'favicon_manager_title': 'Manage favicons',
    'favicon_manager_desc': 'Manage, refresh or remove downloaded and cached favicons.',
    'favicon_manager_toggle_desc': 'Enable automatic favicon fetching and management for your associated links.',
    'favicon_refresh_all': 'Refresh all',
    'favicon_refreshing': 'Refreshing...',
    'favicon_refresh_success': '{count} favicon(s) refreshed.',
    'favicon_refresh_partial': '{count} favicon(s) refreshed. {failed} failed.',

    'favicon_provider_direct': 'Direct search',
    'favicon_provider_google': 'Google',
    'favicon_provider_duckduckgo': 'DuckDuckGo',
    'favicon_provider_heading': 'Favicon provider',

    'favicon_search_placeholder': 'Search domain...',
    'favicon_status_failed': 'Failed to fetch (previous attempt)',
    'favicon_status_outdated': 'Outdated (+30 days)',
    'favicon_status_cached': 'Cached',
    'favicon_meta_saved': 'Saved {days} {day_word} ago · {size}KB',
    'favicon_meta_today': 'Saved today · {size}KB',
    'favicon_meta_outdated': 'May be outdated · 30+ days',
    'favicon_meta_failed': 'Failed to download',
    'day_singular': 'day',
    'day_plural': 'days',
    'favicon_retry': 'Retry',
    'favicon_remove': 'Remove from cache',
    'favicon_empty_cache': 'No favicons in cache.',
    'favicon_fetch_tooltip': 'Fetch favicon',
    'favicon_invalid_url': 'Invalid or incomplete URL.',
    'favicon_fetch_failed': 'Failed to fetch favicon for {domain}',
    'favicon_fetch_success': 'Favicon for {domain} downloaded successfully!',

    // Changelog
    'changelog_title': 'Changelog',
    'changelog_desc': 'See what the latest update brought.',
    'changelog_button': 'View changelog',
    'changelog_badge_new': 'New version',
    'changelog_modal_title': "What's new — Typify {version}",
    'changelog_modal_date': 'Updated on {date}',
    'btn_github': 'View on GitHub',
    'btn_understand': 'I understand',
    'group_new': 'New features',
    'group_imp': 'Improvements',
    'group_fix': 'Fixes',
    'group_brk': 'Breaking changes',
    'changelog_error': 'Could not load update history.',

    // Plugin Notices
    'notices_title': 'Plugin notices',
    'notices_desc': 'Information and alerts about currently active features.',

    'notices_empty': 'No notices at the moment.',
    'notices_button': 'View notices',
    'notice_internet_title': 'Internet Connection',
    'notice_internet_desc': 'To fetch site favicons, this plugin needs internet access. The domain of the links you use in the associated links option is sent to an external service (like Google or DuckDuckGo) exclusively to locate the corresponding favicon.',
    'notice_favicon_title': 'Favicon providers',
    'notice_favicon_desc': 'Google: best coverage, best results. DuckDuckGo: privacy, variable quality. Direct fetch: often blocked by CORS, dubious quality.',
    'notice_custom_icons_title': 'Custom icons',
    'notice_custom_icons_desc': 'Place .svg files up to 100 KB in icons/ in the plugin directory.',
    'notice_cache_title': 'Local cache active',
    'notice_cache_desc': 'When a favicon is successfully downloaded, it is saved permanently on your machine. The plugin will no longer send the domain to the internet when you visit the same site again, unless you wish to update the favicon.',

    // Static Tips / Usage Tips
    'notice_usage_list_title': 'List Property',
    'notice_usage_list_desc': 'The style effect is only applied to List-type properties in Obsidian.',

    'notice_usage_case_title': 'Case Insensitive',
    'notice_usage_case_desc': 'The plugin is case-insensitive for both the target property name and the names defined for the tags. Example: `Status` and `status` are the same property.',

    'notice_usage_priority_title': 'Scope Priority',
    'notice_usage_priority_desc': 'If two styles have the same name but different scopes (e.g. one in "All properties" and another in a specific property), the more specific style will take precedence for that property.',

    'notice_usage_multiple_title': 'Multiple Target Properties',
    'notice_usage_multiple_desc': 'You can target more than one property. Just add a comma between the options. Example: `Status, Priority`.',

    'notice_custom_images_title': 'Custom Images',
    'notice_custom_images_desc': 'Place your image files (PNG, JPG, etc.) up to 50KB in the img/ folder in the plugin directory.',

    // Notices Tabs
    'notices_tab_all': 'All notices',
    'notices_tab_warning': 'Warning',
    'notices_tab_info': 'Info',
    'notices_tab_system': 'System'
};
