export const fr = {
    'section_data_management_title': 'Gestion des données',

    // Commandes et Menus contextuels
    'command_create_style': 'Créer un style',
    'command_manage_styles': 'Gérer les styles',
    'command_manage_favicons': 'Gérer les favicons',
    'command_plugin_notices': 'Avis du plugin',
    'context_create_link_style': 'Créer un style pour ce lien',
    'context_edit_link_style': 'Modifier le style de ce lien',

    // Propriété Cible
    'target_property_title': 'Propriété cible',
    'target_property_desc': 'Nom(s) de propriété(s) auxquelles appliquer les styles (ex : « status », « priority »)',
    'target_property_placeholder': 'Propriété',

    // Créer un Style
    'add_status_title': 'Créer un nouveau style',
    'add_status_desc': 'Définissez des couleurs et icônes personnalisées pour vos étiquettes.',
    'add_status_button': 'Créer un style',

    // Liste des Styles
    'new_status_name': 'Nouveau style',

    // Contrôles de Style
    'status_name_title': 'Nom du style',
    'status_name_desc': 'Identifie le style dans la liste des styles. Sert aussi de texte affiché pour les liens associés lorsque cette fonctionnalité est activée.',
    'style_value_title': 'Valeur à styliser',
    'style_value_desc': 'Valeur de la propriété à laquelle appliquer le style. Si ce champ reste vide, le nom du style sera utilisé lors de l’enregistrement.',
    'base_color_title': 'Couleur de base',
    'base_color_desc': 'Définit la couleur utilisée pour générer les variations visuelles du style.',
    'icon_title': 'Icône',
    'icon_desc': 'Icône affichée à côté des valeurs et des liens qui utilisent ce style.',
    'add_icon_tooltip': 'Choisir une icône',
    'remove_icon_tooltip': 'Supprimer l\'icône',
    'applies_to_title': 'S\'applique à',
    'applies_to_desc': 'Limite le style à une propriété spécifique ou l\'applique à toutes les propriétés cibles.',
    'applies_to_all_option': 'Toutes les propriétés',
    'catch_all_title': 'Appliquer à toutes les valeurs',
    'catch_all_desc': 'Choisissez d’abord une propriété précise. Applique ce style aux valeurs sans style plus spécifique ; le lien associé reste indépendant.',

    // Supprimer
    'delete_button': 'Supprimer le style',
    'duplicate_style': 'Dupliquer le style',
    'copy_suffix': 'copie',

    // Sélecteur d'Icônes
    'icon_picker_placeholder': 'Tapez pour rechercher des icônes...',
    'icon_picker_navigate': 'Naviguer',
    'icon_picker_select': 'Sélectionner',
    'icon_picker_close': 'Fermer',

    // Exporter/Importer
    'export_title': 'Exporter les paramètres',
    'export_desc': 'Copiez votre configuration de styles pour la partager ou la sauvegarder.',
    'export_button': 'Exporter',
    'import_title': 'Importer les paramètres',
    'import_desc': 'Collez un JSON précédemment exporté pour restaurer vos styles.',
    'import_button': 'Importer',
    'import_success': 'Styles importés avec succès !',
    'import_error': 'Erreur lors de l\'importation des styles. Format de fichier invalide.',

    // Icônes Personnalisées
    'custom_icons_toggle_title': 'Icônes personnalisées',
    'custom_icons_toggle_desc': 'Activer les icônes SVG personnalisées dans le plugin.',
    'custom_icons_loaded': '{count} icône(s) personnalisée(s) chargée(s) avec succès !',
    'custom_icons_empty': 'Aucun fichier SVG trouvé dans le dossier icons/. Ajoutez des fichiers .svg et réactivez.',
    'custom_icons_error': 'Erreur lors du chargement des icônes personnalisées.',
    'custom_icons_missing': '{count} icône(s) personnalisée(s) introuvable(s) : {names}.',

    // Images personnalisées
    'custom_images_oversized': '{count} image(s) ignorée(s) (dépasse la limite de 50 Ko) : {names}',
    'custom_images_missing': '{count} image(s) introuvable(s) dans le dossier img/ : {names}.',

    // Messages d'Exportation
    'export_error': 'Échec de l\'exportation des paramètres.',

    // Modales d'Exportation/Importation
    'export_modal_title': 'Exporter les paramètres',
    'copy_clipboard_button': 'Copier dans le presse-papiers',
    'copy_clipboard_success': 'Paramètres copiés dans le presse-papiers !',
    'import_modal_title': 'Importer les paramètres',
    'import_paste_placeholder': 'Collez votre configuration JSON ici...',
    'import_empty_notice': 'Veuillez d\'abord coller votre configuration.',
    'import_invalid_json': 'Format JSON invalide. Vérifiez vos données et réessayez.',
    'import_no_valid_styles': 'Aucun style valide trouvé dans les données importées.',
    'import_partial_success': '{imported} style(s) importé(s). {skipped} style(s) invalide(s) ont été ignorés.',

    // Gestion des Styles
    'section_styles_title': 'Styles',
    'manage_styles_title': 'Gérer les styles',
    'manage_styles_desc': 'Modifiez, réorganisez ou supprimez vos styles de statut.',
    'manage_styles_button': 'Gérer',

    // Modal Créer un Style
    'create_style_title': 'Créer un style',
    'status_name_placeholder': 'Entrez le nom du style...',
    'style_value_placeholder': 'Entrez la valeur telle qu’elle apparaît dans la propriété...',
    'save_button': 'Enregistrer',
    'cancel_button': 'Annuler',
    'style_name_required': 'Le nom du style est requis.',
    'shape_color_required': 'Veuillez s\u00e9lectionner une forme et un mode de couleur.',
    'style_saved': 'Style « {name} » enregistré !',
    'style_duplicate': 'Un style avec ce nom ou cette valeur existe déjà pour cette propriété.',
    'style_overlap_warning': 'Un style avec le même nom ou la même valeur couvre aussi une autre portée. Le plus spécifique est prioritaire.',

    // Modal Gestionnaire de Styles
    'manage_styles_modal_title': 'Gérer les styles',
    'manage_styles_search': 'Rechercher...',
    'manage_styles_count': '{count} style(s)',
    'manage_styles_empty': 'Aucun style créé pour le moment.',
    'manage_styles_no_results': 'Aucun style ne correspond à votre recherche.',
    'sort_recent': 'Récent',
    'sort_alpha': 'Alphabétique',
    'sort_icon': 'Icône',
    'sort_hasicon': 'Avec icône',
    'sort_noicon': 'Sans icône',
    'sort_icon_lucide': 'Lucide',
    'sort_icon_emoji': 'Emoji',
    'sort_icon_custom': 'Personnalisé',
    'sort_icon_img': 'Image',
    'sort_colormode': 'Remplissage',
    'sort_link': 'Lien',
    'sort_hasurl': 'Avec lien',
    'sort_nourl': 'Sans lien',
    'manage_styles_sort_label': 'Tri',
    'manage_styles_filter_label': 'Filtres',
    'delete_style_confirm': 'Supprimer « {name} » ?',
    'style_deleted': 'Style « {name} » supprimé.',
    'confirm_button': 'Confirmer',
    'scope_all': 'Général',
    'scope_show_all': 'Afficher tout',
    'batch_create_detected_before': '{count} valeur(s) sans style pour cette propriété. ',
    'batch_create_detected_action': 'Tout créer',
    'batch_create_detected_after': '\u00a0?',
    'batch_create_already_global_before': 'Note : ',
    'batch_create_already_global_after': ' existent déjà en tant que styles globaux.',
    'batch_create_all_global_before': 'Note : ',
    'batch_create_all_global_after': ' existent déjà en tant que styles globaux. Aucune création n\'est nécessaire.',
    'batch_create_too_many': 'Trouvé {count} valeurs pour cette propriété (dépasse la limite de 50 pour la création par lots).',
    'batch_create_confirm_desc': 'Des styles seront créés pour les valeurs suivantes : {values}',
    'batch_create_success': '{count} style(s) créé(s) par lots.',

    // Forme
    'shape_title': 'Forme',
    'shape_pill': 'Pilule',
    'shape_rectangle': 'Rectangle',
    'shape_flat': 'Plat',

    // Tabs
    'tab_icons': 'Icônes',
    'tab_emoji': 'Emojis',
    'tab_custom': 'SVG',
    'tab_images': 'Images',

    // Mode de Couleur
    'color_mode_title': 'Mode de couleur',
    'color_mode_subtle': 'Subtil',
    'color_mode_solid': 'Solide',
    'color_mode_simple': 'Contour',

    // Modifier le Style
    'edit_style_title': 'Modifier le style',
    'style_updated': 'Style « {name} » mis à jour !',

    // Hide Remove Button
    'hide_remove_button_title': 'Masquer le bouton "x" sur les étiquettes',
    'hide_remove_button_desc': 'Masque l\'icône de suppression pour un aspect plus épuré et discret.',
    'hide_remove_button_hover_title': 'Révéler le bouton "x" au survol',
    'hide_remove_button_hover_desc': 'S\'il est activé, le bouton de suppression apparaîtra lorsque vous survolez l\'étiquette.',
    'hide_remove_button_none': 'Aucun (par défaut)',
    'hide_remove_button_properties': 'Uniquement dans Propriétés',
    'hide_remove_button_bases': 'Uniquement dans Bases',
    'hide_remove_button_both': 'Dans les deux',

    // Liens Associés
    'link_styles_toggle_title': 'Liens associés',
    'link_styles_toggle_desc': 'Remplace les URL dans les pilules par le nom du style, en conservant le comportement de clic natif du lien.',
    'link_url_title': 'Lien associé',
    'link_url_desc': 'URL facultative, indépendante de la valeur de la propriété. Si les liens associés sont activés, les liens correspondants affichent le nom du style et restent cliquables.',
    'link_url_placeholder': 'Entrez une URL…',
    'prefix_match_title': 'Correspondance par préfixe',
    'prefix_match_desc': 'Applique le style à toute URL qui commence par l’adresse du champ « Lien associé », sans distinction entre majuscules et minuscules.',

    // UI Components
    'ui_components_title': 'Autres styles',
    'ui_components_desc': 'Activer ou désactiver les composants visuels des étiquettes.',

    // Expérimental / Palette
    'section_experimental_title': 'Expérimental',
    'experimental_tag': 'Expérimental',
    'custom_palette_toggle_title': 'Palette de couleurs personnalisée',
    'custom_palette_toggle_desc': 'Active le gestionnaire de palettes (ci-dessous) et ajoute des raccourcis de couleur lors de la création de styles.',
    'palette_title': 'Palette de couleurs',
    'palette_manager_desc': 'Ajoutez, supprimez ou générez automatiquement des combinaisons de couleurs pour vos styles.',
    'palette_your_colors': 'Mes couleurs',
    'palette_saved_count': 'Couleurs enregistrées : {count} / {max}',
    'palette_max_reached': 'Maximum de {max} couleurs atteint.',
    'palette_harmony_heading': 'Générer une palette',
    'palette_harmony_analogous': 'Analogues',
    'palette_harmony_complementary': 'Complémentaires',
    'palette_harmony_shades': 'Nuances',
    'palette_harmony_random': 'Aléatoires',
    'palette_clear_tooltip': 'Tout effacer',
    'palette_add_color_aria': 'Ajouter une couleur',
    'palette_color_copied': 'Couleur copiée !',
    'palette_copy_aria': 'Copier',
    'palette_remove_aria': 'Supprimer',
    'palette_add_to_palette_aria': 'Ajouter à la palette',
    'palette_regenerate_aria': 'Régénérer',

    // Favicons
    'favicon_manager_title': 'Gérer les favicons',
    'favicon_manager_desc': 'Gérez, actualisez ou supprimez les favicons téléchargés et mis en cache.',
    'favicon_manager_toggle_desc': 'Active la recherche et la gestion automatiques des favicons pour vos liens associés.',
    'favicon_refresh_all': 'Tout actualiser',
    'favicon_refreshing': 'Actualisation...',
    'favicon_refresh_success': '{count} favicon(s) actualisé(s).',
    'favicon_refresh_partial': '{count} favicon(s) actualisé(s). {failed} ont échoué.',
    'favicon_provider_direct': 'Recherche directe',
    'favicon_provider_google': 'Google',
    'favicon_provider_duckduckgo': 'DuckDuckGo',
    'favicon_provider_heading': 'Fournisseur de favicons',
    'favicon_search_placeholder': 'Rechercher un domaine...',
    'favicon_meta_saved': 'Enregistré il y a {days} {day_word} · {size} Ko',
    'favicon_meta_today': 'Enregistré aujourd\'hui · {size} Ko',
    'favicon_meta_outdated': 'Peut-être obsolète · 30+ jours',
    'favicon_meta_failed': 'Échec du téléchargement',
    'day_singular': 'jour',
    'day_plural': 'jours',
    'favicon_retry': 'Réessayer',
    'favicon_remove': 'Supprimer du cache',
    'favicon_empty_cache': 'Aucun favicon dans le cache.',
    'favicon_no_results': 'Aucun domaine trouvé.',
    'favicon_fetch_tooltip': 'Obtenir le favicon',
    'favicon_invalid_url': 'URL invalide ou incomplète.',
    'favicon_fetch_failed': 'Échec du téléchargement du favicon pour {domain}',

    // Journal des modifications
    'changelog_tab_all': 'Tout',
    'changelog_title': 'Journal des modifications',
    'changelog_desc': 'Découvrez les nouveautés de la dernière mise à jour.',
    'changelog_button': 'Voir les nouveautés',
    'changelog_badge_new': 'Nouveautés',
    'changelog_modal_title': 'Quoi de neuf — Typify {version}',
    'changelog_modal_date': 'Mis à jour le {date}',
    'btn_github': 'Voir sur GitHub',
    'btn_understand': 'Compris',
    'group_new': 'Nouveautés',
    'group_imp': 'Améliorations',
    'group_fix': 'Corrections',
    'group_brk': 'Changements majeurs',
    'changelog_error': "Impossible de charger l'historique des mises à jour.",

    // Plugin Notices
    'notices_title': 'Avis du plugin',
    'notices_desc': 'Informations et alertes sur les fonctionnalités actuellement actives.',
    'notices_empty': 'Aucun avis pour le moment.',
    'notices_button': 'Voir les avis',
    'notice_internet_title': 'Connexion Internet',
    'notice_internet_desc': 'Pour récupérer les favicons des sites, cette extension nécessite un accès à Internet. Le domaine des liens que vous utilisez dans l\'option des liens associés est envoyé à un service externe (comme Google ou DuckDuckGo) exclusivement pour localiser le favicon correspondant.',
    'notice_favicon_title': 'Fournisseurs de favicon',
    'notice_favicon_desc': 'Google : meilleure couverture, meilleurs résultats. DuckDuckGo : confidentialité, qualité variable. Récupération directe : souvent bloquée par CORS, qualité douteuse.',
    'notice_custom_icons_title': 'Icônes personnalisées',
    'notice_custom_icons_desc': 'Placez des fichiers .svg jusqu\'à 100 Ko dans icons/ dans le répertoire du plugin.',
    'notice_cache_title': 'Cache local actif',
    'notice_cache_desc': 'Lorsqu\'un favicon est téléchargé avec succès, il est enregistré de façon permanente sur votre machine. Le plugin n\'enverra plus le domaine sur Internet lors de vos futures visites sur ce même site, sauf si vous souhaitez mettre à jour le favicon.',

    // Static Tips / Usage Tips
    'notice_usage_list_title': 'Propriété de liste',
    'notice_usage_list_desc': 'L\'effet de style n\'est appliqué qu\'aux propriétés de type Liste dans Obsidian.',
    'notice_usage_case_title': 'Correspondance insensible à la casse',
    'notice_usage_case_desc': 'La correspondance des noms de propriétés, des valeurs à styliser et des URL des liens associés ne distingue pas les majuscules des minuscules. Exemple : `Status` et `status` sont la même propriété.',
    'notice_usage_priority_title': 'Priorité de portée',
    'notice_usage_priority_desc': 'Lorsque deux styles correspondent à la même valeur exacte, l’un dans « Toutes les propriétés » et l’autre dans une propriété précise, le style de cette propriété est prioritaire. Les styles peuvent avoir des noms différents.',
    'notice_usage_multiple_title': 'Cibles multiples',
    'notice_usage_multiple_desc': 'Vous pouvez cibler plus d\'une propriété. Ajoutez simplement une virgule entre les options. Exemple : `Status, Priority`.',
    'notice_custom_images_title': 'Images personnalisées',
    'notice_custom_images_desc': 'Placez vos fichiers image (PNG, JPG, etc.) d\'une taille maximale de 50 Ko dans le dossier img/ du répertoire du plugin.',
    'notice_usage_prefix_title': 'Correspondance par préfixe',
    'notice_usage_prefix_desc': 'Applique le style aux URL qui commencent par l’adresse du champ « Lien associé », sans distinction entre majuscules et minuscules.',

    // Notices Tabs
    'notices_tab_all': 'Tous les avis',
    'notices_tab_warning': 'Avertissement',
    'notices_tab_info': 'Info',
    'notices_tab_system': 'Système',
    'group_design_title': 'Apparence',
    'group_behavior_title': 'Comportement',
    'group_preview_title': 'Aperçu'
};
