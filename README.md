

<div align="center">
  <img src="./docs/assets/images/banner_1.jpg"/>
  
   ![License](https://img.shields.io/badge/license-MIT-lightblue.svg)
   ![Version](https://img.shields.io/badge/version-1.5.1-lightgreen.svg)

</div>

<div align="center">

   English | [Português](./docs/README_pt.md) | [Español](./docs/README_es.md) | [Français](./docs/README_fr.md) | [简体中文](./docs/README_zh-CN.md)

</div>

---

Transform your boring metadata into a dynamic and colorful display! 🎨✨

Typify is an Obsidian plugin that allows you to create unique styles for your metadata. What was once limited to tags can now be customized for any Obsidian property.

## Features

- **🎨 Customizable Styles**: Create unique styles for your metadata.

- **✨ 1700+ Icons**: Built-in fuzzy search for the entire Lucide icon library.

- **🌑 Dark/Light Mode**: Colors automatically adapt to your Obsidian theme.

- **🚫 Optional Icons**: Support for text-only pills (just remove the icon!).

- **🧩 Custom Icons**: Not enough icons? You can easily use your own.

- **🌍 Internationalization**: Fully translated into English, Portuguese (Brazil), Spanish, French, and Simplified Chinese.

- **💾 Export/Import**: Easily backup and share your configurations.

- **📋 Bases Plugin**: Styles also apply to Bases views (table and cards).

- **🎯 Scoped Styles**: Limit a style to specific properties using "Applies To".

- **🖼️ Image Tags**: Upload your own local images (PNG, JPG, SVG) to use as contact avatars or custom icons.

- **👁️ Hide Remove Button**: Aesthetically hide the 'X' button globally or per view to create read-only badges.

- **♾️ Canvas Support**: Fully compatible with Obsidian Canvas, rendering styles dynamically.

- **🔗 Associated Links**: Replaces URLs in pills with the style name, keeping the native link click behavior.

- **😀 Emoji Icons**: Support for selecting and using native emojis directly as icons in pills.

- **🎨 Color Palette**: Save your favorite colors or use the smart harmony presets to create perfect palettes in real-time.

- **🌐 Link Favicons**: Automatically associate real website favicons to your associated link tags, with a secure local cache manager.

- **📰 Changelog Board**: Keep track of Typify updates and improvements directly from within the plugin settings, in your own language.

## How to Use

It's very simple to transform your properties!

1. **In Typify Settings:** Add the property for which you will create custom styles (e.g., `Status`).
2. **Customize:** Click **Create style** and define the name that will be used for the tag, as well as the color, icon (Lucide, emoji or image), shape, and many more options.
3. **In your Notes:** Using the target property defined earlier, insert the created style name next to it and the magic happens instantly! ✨

![How to Use Typify](docs/assets/gifs/how-to-use-demo.gif)

### 🔗 Associated Links

Typify allows you to create much cleaner property links. Instead of seeing an ugly `https://...` URL, you can associate it with a Style!
If your style name is "Google Translate" and the matched value in *Match Value* is the URL `https://translate.google.com/`, the plugin will hide the URL and perfectly render the name "Google Translate" as a clickable pill.

![Associated Links Demo](docs/assets/gifs/associated-links-demo.gif)

## Installation

### Manual Installation
1. Download the latest release: `main.js`, `manifest.json`, and `styles.css`.

2. Create a folder called `typify` inside your `.obsidian/plugins/` directory.

3. Paste the files there.

4. Reload Obsidian and enable the plugin.

## Notices

> [!Warning]  
> Importing settings **replaces all existing styles**. Styles created after the backup will be lost.

> [!Warning]  
> The **Minimal** theme has some known layout inconsistencies when used alongside Typify (such as disproportionate font sizes or clipped elements). While I am actively working to mitigate and resolve these limitations in each update, please be aware of these temporary inconsistencies when using this theme.

## Roadmap

Here are some of the features and improvements planned for future updates:

- **🎨 Simple Pills**: Minimalist and colorless styles. Can be configured or automatically applied to undefined values in styled properties.

- **🪤 Error Diagnostics**: A panel to diagnose plugin issues and generate a report to facilitate troubleshooting.

- **🏳️‍🌈 Multiple Colors**: New panel to have and manage multiple color cards.

- **🔮 Pill Padding**: Adjust the size and length of the pills, as well as the font and icon size.

- **🎲 Numeric Tags**: Expansion of Typify style to the number type, allowing the creation of custom styles for number tags.

- **📊 Reference Pills**: Display the total amount of references that information has in your vault instead of showing an icon (e.g., an author tag showing "X" references).

- ~~**🔗 Link Simplification**: Automatically clean and shorten external URLs displayed in pills (e.g., `www.google.com` simplified to `google.com`).~~ --> Implemented differently! :D
- ~~**🌐 Favicon Support**: Automatically fetch and display website favicons for external links that do not have a custom icon configured.~~ --> Implemented! :D
- ~~**🗂️ Tabbed Management UI**: Overhaul the settings panel to replace the long list of styles with a tab-based organization system (matching the icon search layout), complete with horizontal scrolling.~~ --> Implemented! :D
- ~~**😀 Emoji Icons**: Support selecting and using native emojis as pill icons directly.~~ --> Implemented! :3

## Development

If you want to build the plugin yourself, do the following:

1. Clone this repository.
2. Run `npm install`.
3. Run `npm run dev` to start compilation in watch mode.


## Disclaimer

This plugin was born from my desire to have more customization options for properties, similar to Notion, but the Obsidian way.

It's worth mentioning that without the great help of [Antigravity](https://antigravity.google/) none of this would have been possible. Of course, there was no magic done with a single click—it took careful prompting, lots of review, and testing.

This wasn't "vibe-coded" carelessly. I had to change many things manually, but it's not bulletproof. If you find any bugs, please open an issue and I'll do my best to fix it.

If you want to contribute to the project, feel free to open a pull request. Or if you don't feel comfortable using machine-generated code and want to make your own handcrafted version, feel free to do that too. Just let me know, because I love new plugins 😉.
