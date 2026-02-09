

<div align="center">
  <img src="./docs/assets/images/banner_1.jpg"/>
  
   ![License](https://img.shields.io/badge/license-MIT-lightblue.svg)
   ![Version](https://img.shields.io/badge/version-1.4.2-lightgreen.svg)

</div>

<div align="center">

   English | [Português](./docs/README_pt.md)

</div>

---

Transform your boring metadata into a dynamic and colorful display! 🎨✨

Typify is an Obsidian plugin that allows you to create unique styles for your metadata. What was once limited to tags can now be customized for any Obsidian property.

## Features

- **🎨 Customizable Styles**: Create unique styles for your metadata.

- **✨ 1700+ Icons**: Built-in fuzzy search for the entire Lucide icon library.

- **🌑 Dark/Light Mode**: Colors automatically adapt to your Obsidian theme.

- **🚫 Optional Icons**: Support for text-only pills (just remove the icon!).

- **🌍 Internationalization**: Fully translated into English and Portuguese (Brazil).

- **💾 Export/Import**: Easily backup and share your configurations.

> [!Warning]  
> Importing settings **replaces all existing styles**. Styles created after the backup will be lost.

## How to Use

1. **Target Property**: In the plugin settings, define which property to target.

> [!Tip]  
> You can use multiple properties as targets. Just add a comma between them. Example: `Status, Priority`.

2. **Create a Style**:
   - Go to **Settings > Typify**.
   - Click "Create a new style".
   - Set the name to match your property value (e.g., `In Progress`).
   - Pick a base color and an icon, or leave it without an icon.
   - Voilá! Your property is now a beautiful colored pill.

3. **Use Your New Style**: In your note's Properties (YAML), add the target property and set a value (e.g., `Status: In Progress`).

> [!Important]  
> The plugin is case-insensitive. Example: `Status` and `status` are treated as the same property.

> [!Note]  
> The style effect only applies to properties of type **List** in Obsidian.

## Installation

### Manual Installation
1. Download the latest release: `main.js`, `manifest.json`, and `styles.css`.

2. Create a folder called `typify` inside your `.obsidian/plugins/` directory.

3. Paste the files there.

4. Reload Obsidian and enable the plugin.


## Development
1. Clone this repository.
2. Run `npm install`.
3. Run `npm run dev` to start compilation in watch mode.


## Disclaimer

This plugin was born from my desire to have more customization options for properties, similar to Notion, but the Obsidian way.

It's worth mentioning that without the great help of [Antigravity](https://antigravity.google/) none of this would have been possible. Of course, there was no magic done with a single click—it took careful prompting, lots of review, and testing.

This wasn't "vibe-coded" carelessly. I had to change many things manually, but it's not bulletproof. If you find any bugs, please open an issue and I'll do my best to fix it.

If you want to contribute to the project, feel free to open a pull request. Or if you don't feel comfortable using machine-generated code and want to make your own handcrafted version, feel free to do that too. Just let me know, because I love new plugins 😉.
