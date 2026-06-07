## 2.4.0 | 6 juin 2026

NEW | Prise en charge des fournisseurs personnalisés via `favicon-providers.json`
NEW | Tableau d'affichage centralisé avec état persistant dans les paramètres
IMP | Cache réécrit — lecture 3× plus rapide sur les grands coffres
FIX | Favicon vide lors de l'ouverture d'une note hors ligne avec DuckDuckGo
FIX | Les SVG personnalisés de plus de 80 Ko provoquaient un plantage silencieux
BRK | `faviconSource` renommé en `faviconProvider` — migration automatique à l'ouverture du coffre

## 2.3.1 | 14 avril 2026

FIX | Les icônes ne se chargeaient pas dans les coffres avec des caractères spéciaux dans le chemin
FIX | Conflit avec le plugin Iconize lors de l'utilisation d'icônes personnalisées

## 2.3.0 | 2 mars 2026

NEW | Prise en charge du repli en chaîne : Google → DuckDuckGo → Recherche directe
IMP | Taille maximale des SVG personnalisés augmentée de 50 Ko à 100 Ko
FIX | Le modal des paramètres ne se fermait pas correctement sur Obsidian 1.7+
