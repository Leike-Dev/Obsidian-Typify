## 1.6.0 | 23 août 2026

NEW | Mode de couleur "Contour" : style avec bordure uniquement et contraste subtil avec le fond du thème.
NEW | "Correspondance par préfixe" pour les liens associés : applique le style à toute URL commençant par la valeur configurée.
NEW | Duplication de styles : dupliquez rapidement un style existant depuis le Gestionnaire de styles.
NEW | Création de styles par lot : créez automatiquement des styles pour plusieurs valeurs d'un coup (jusqu'à 50).
NEW | Tri et filtres avancés dans le Gestionnaire de styles : Récent, Alphabétique, Forme, Icône, Remplissage, Lien.
NEW | Explications détaillées ajoutées à chaque option dans le modal "Créer un style".
NEW | Icône exclusive (sparkles) à côté du nom de Typify dans la recherche des paramètres.
NEW | Avis informatif sur la "Correspondance par préfixe" ajouté au panneau "Avis du plugin".
IMP | Migration vers la nouvelle API native de paramètres d'Obsidian (nécessite Obsidian 1.13.0+).
IMP | "Gérer les styles" et "Autres styles" migrés des modaux vers des sous-pages de paramètres dédiées.
IMP | Modal "Palette de couleurs" restructuré avec le design natif d'Obsidian, design responsive et icônes Lucide.
IMP | "Gérer les favicons" repensé : mise en page compacte avec sélecteur de fournisseur dans la barre de recherche.
IMP | Modaux "Quoi de neuf" et "Avis du plugin" redessinés avec navigation par onglets-pilule et hauteur fixe.
IMP | "Forme" et "Mode de couleur" préremplis par défaut lors de la création de nouveaux styles.
IMP | Terme "Toutes les propriétés" renommé en "Général" pour éviter la confusion avec le filtre "Tout afficher".
IMP | Styles appliqués immédiatement lors de l'ajout d'une propriété — pas de rechargement nécessaire.
IMP | Chargement parallèle des icônes, images et favicons pour un démarrage plus rapide.
IMP | Cache intelligent d'icônes Lucide pour des mises à jour visuelles plus rapides avec de nombreux styles.
IMP | Conversion interne des fichiers remplacée par la fonction native d'Obsidian.
IMP | READMEs restructurés dans 5 langues avec de nouveaux bannières et pages de fonctionnalités dédiées.
IMP | Badge de parrainage et badge de la page officielle Obsidian ajoutés aux READMEs.
FIX | CSS des tags disparaissant lors de la modification des couleurs dans la "Palette de couleurs" avec les paramètres ouverts.
FIX | SVGs sans `viewBox` cassant l'interface du modal "Créer un style".
FIX | Icônes/favicons personnalisés ne disparaissant pas à la désactivation ou apparaissant comme des carrés à la réactivation.
FIX | Vues dynamiques (Canvas, Bases) nécessitant un rechargement pour afficher les nouveaux styles.
FIX | Retard de rendu des styles dans les fenêtres non focalisées.
FIX | Supprimer une propriété efface maintenant ses styles immédiatement de la note ouverte.
FIX | "Liens associés" revient à afficher l'URL originale lorsque la propriété n'est plus stylisée.
FIX | Recherche de favicons différenciée d'un cache vide.
FIX | La recherche de favicons ne gèle plus le plugin sur les sites lents.
FIX | Ancien favicon préservé en cas de coupure internet pendant l'actualisation.
FIX | Bouton "Réessayer" fonctionne sur les sites marqués comme échecs permanents.
FIX | Taille des favicons stockés affichée correctement.
