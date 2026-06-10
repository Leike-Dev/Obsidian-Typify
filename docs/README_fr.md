

<div align="center">
  <img src="./assets/images/banner_1.jpg"/>
  
   ![License](https://img.shields.io/badge/license-MIT-lightblue.svg)
   ![Version](https://img.shields.io/badge/version-1.5.0-lightgreen.svg)

</div>

<div align="center">

   [English](../README.md) | [Português](./README_pt.md) | [Español](./README_es.md) | Français | [简体中文](./README_zh-CN.md)

</div>

---

Transformez l'affichage de vos métadonnées ennuyeuses en un affichage dynamique et coloré ! 🎨✨

Typify est un plugin pour Obsidian qui vous permet de créer des styles uniques pour vos métadonnées. Ce qui était autrefois limité aux tags peut désormais être personnalisé pour n'importe quelle propriété Obsidian.

## Fonctionnalités

- **🎨 Styles personnalisables** : Créez des styles uniques pour vos métadonnées.

- **✨ 1700+ icônes** : Recherche floue intégrée pour toute la bibliothèque d'icônes Lucide.

- **🌑 Mode clair/sombre** : Les couleurs s'adaptent automatiquement à votre thème Obsidian.

- **🚫 Icônes optionnelles** : Support des pilules en texte seul (supprimez simplement l'icône !).

- **🧩 Icônes personnalisées** : Pas assez d'icônes ? Vous pouvez facilement utiliser les vôtres.

- **🌍 Internationalisation** : Entièrement traduit en anglais, portugais (Brésil), espagnol, français et chinois simplifié.

- **💾 Exporter/Importer** : Sauvegardez et partagez facilement vos configurations.

- **📋 Plugin Bases** : Les styles s'appliquent aussi aux vues Bases (tableau et cartes).

- **🎯 Styles ciblés** : Limitez un style à des propriétés spécifiques avec « S'applique à ».

- **🖼️ Étiquettes d'images** : Téléchargez vos propres images locales (PNG, JPG, SVG) pour les utiliser comme avatars de contact ou icônes personnalisées.

- **👁️ Masquer le bouton de suppression** : Masquez esthétiquement le bouton « X » globalement ou par vue pour créer des pilules en lecture seule.

- **♾️ Support Canvas** : Entièrement compatible avec Obsidian Canvas, avec un rendu dynamique des styles.

- **🔗 Liens Associés** : Remplace les URL dans les pilules par le nom du style, en conservant le comportement de clic natif du lien.

- **😀 Icônes d'Emojis** : Permettre de sélectionner et d'utiliser directement des emojis natifs comme icônes sur les pilules.

- **🎨 Palette de couleurs** : Sauvegardez vos couleurs préférées ou utilisez les préréglages d'harmonie intelligente pour créer des palettes parfaites en temps réel.

- **🌐 Favicons de liens** : Associez automatiquement de vrais favicons de sites Web à vos balises de liens associés, avec un gestionnaire de cache local sécurisé.

- **📰 Panneau des nouveautés** : Suivez les mises à jour et les améliorations de Typify directement depuis les paramètres du plugin, dans votre propre langue.

## Comment utiliser

C'est très simple de transformer vos propriétés !

1. **Dans les paramètres Typify :** Ajoutez la propriété pour laquelle vous allez créer des styles personnalisés (ex: `Statut`).
2. **Personnalisez :** Cliquez sur **Créer un style** et définissez le nom qui sera utilisé pour l'étiquette, ainsi que la couleur, l'icône (Lucide, emoji ou image), la forme et bien d'autres options.
3. **Dans vos Notes :** En utilisant la propriété cible définie précédemment, insérez à côté d'elle le nom du style créé et la magie opère instantanément ! ✨

![Comment utiliser Typify](assets/gifs/how-to-use-demo.gif)

### 🔗 Liens Associados

Typify vous permet de créer des liens de propriétés beaucoup plus propres. Au lieu de voir une URL laide `https://...`, vous pouvez l'associer à un Style !
Si le nom de votre style est "Google Traduction" et la valeur correspondante dans *Valeur Correspondante* est l'URL `https://translate.google.com/`, le plugin masquera l'URL et affichera parfaitement le nom "Google Traduction" sous forme de pilule cliquable.

![Démo des Liens Associés](assets/gifs/associated-links-demo.gif)

## Installation

### Installation manuelle
1. Téléchargez la dernière version : `main.js`, `manifest.json` et `styles.css`.

2. Créez un dossier `typify` dans le répertoire `.obsidian/plugins/`.

3. Collez-y les fichiers.

4. Rechargez Obsidian et activez le plugin.

## Avis

> [!Warning]  
> L'importation des paramètres **remplace tous les styles existants**. Les styles créés après la sauvegarde seront perdus.

> [!Warning]  
> Le thème **Minimal** présente des incohérences de mise en page connues lorsqu'il est utilisé avec Typify (telles que des tailles de police disproportionnées ou des éléments tronqués). Bien que je travaille activement à atténuer et à résoudre ces limitations dans chaque mise à jour, veuillez être conscient de ces incohérences temporaires lors de l'utilisation de ce thème.

## Roadmap

Voici quelques-unes des fonctionnalités et améliorations prévues pour les futures mises à jour :

- **🎨 Pilules Simples** : Styles minimalistes et sans couleur. Peuvent être configurés ou appliqués automatiquement aux valeurs non définies dans les propriétés stylisées.

- **🪤 Diagnostic d'Erreurs** : Un panneau pour diagnostiquer les problèmes du plugin et générer un rapport pour faciliter le dépannage.

- **🏳️‍🌈 Couleurs Multiples** : Nouveau panneau pour avoir et gérer plusieurs cartes de couleurs.

- **🔮 Rembourrage de la Pilule** : Ajustez la taille et la longueur des pilules, ainsi que la taille de la police et de l'icône.

- **🎲 Balises Numériques** : Expansion du style Typify au type nombre, permettant la création de styles personnalisés pour les balises de nombre.

- **📊 Pilules de Référence** : Afficher la quantité totale de références de cette information dans votre coffre au lieu de montrer une icône (ex. : une balise d'auteur affichant "X" références).

- ~~**🔗 Simplification des Liens** : Nettoyer et raccourcir automatiquement les URL externes affichées dans les pilules (ex. : `www.google.com` simplifié en `google.com`).~~ --> Implémenté différemment ! :D
- ~~**🌐 Prise en charge des Favicons** : Option pour récupérer et afficher automatiquement le favicon du site pour les liens externes sans icône personnalisée configurée.~~ --> Implémenté ! :D
- ~~**🗂️ Nouvelle Interface de Gestion** : Remplacer la longue liste de styles par une disposition par onglets (tabs) similaire à celle du modal de recherche d'icônes, avec prise en charge du défilement horizontal.~~ --> Implémenté ! :D
- ~~**😀 Icônes d'Emojis** : Permettre de sélectionner et d'utiliser directement des emojis natifs comme icônes sur les pilules.~~ --> Implémenté ! :3

## Développement

Si vous souhaitez compiler le plugin vous-même, procédez comme suit :

1. Clonez ce dépôt.
2. Exécutez `npm install`.
3. Exécutez `npm run dev` pour démarrer la compilation en mode watch.


## Avertissement

Ce plugin est né de mon désir d'avoir plus d'options de personnalisation pour les propriétés, similaire à Notion, mais à la manière d'Obsidian.

Il convient de mentionner que sans la grande aide d'[Antigravity](https://antigravity.google/), rien de tout cela n'aurait été possible. Bien sûr, il n'y a pas eu de magie en un clic, mais un soin apporté à chaque prompt, en plus de beaucoup de révision et de tests.

Cela n'a pas été « vibécodé » n'importe comment. J'ai dû modifier plusieurs choses manuellement, mais ce n'est pas infaillible. Si vous trouvez un bug, veuillez ouvrir une issue et je ferai de mon mieux pour le corriger.

Si vous souhaitez contribuer au projet, n'hésitez pas à ouvrir une pull request. Ou si vous ne vous sentez pas à l'aise avec du code généré par machine et souhaitez faire votre propre version artisanale, n'hésitez pas non plus. Prévenez-moi simplement, car j'adore les nouveaux plugins 😉.
