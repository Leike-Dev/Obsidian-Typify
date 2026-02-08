# Custom Status Icons for Obsidian

Transform your mundane text statuses into beautiful, color-coded pills with icons! 🎨✨

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.3.0-green.svg)

## Features

- **🎨 Customizable Styles**: Create unlimited status styles with unique names and base colors.
- **✨ 1700+ Icons**: Built-in fuzzy search for the entire Lucide icon library.
- **🌑 Dark/Light Mode**: Colors automatically adapt to your Obsidian theme (light/dark).
- **🚫 Optional Icons**: Support for text-only pills (just remove the icon!).
- **🌍 Internationalization**: Fully translated into English and Portuguese (Brazil).
- **💾 Export/Import**: Easily backup and share your status configurations.

## How to Use

1. **Target Property**: In the plugin settings, define which property to target (default: `Status`).
2. **Add Value**: In your note's Properties (YAML), add the target property and set a value (e.g., `Status: In Progress`).
3. **Configure Style**:
   - Go to **Settings > Custom Status Icons**.
   - Click "Add Status Style".
   - Set the name to match your property value (e.g., `In Progress`).
   - Pick a base color and an icon.
   - Voilá! Your property is now a beautiful pill.

## Installation

### Manual Installation
1. Download the latest release `main.js`, `manifest.json`, and `styles.css`.
2. Create a folder `obsidian-custom-status-icons` in your `.obsidian/plugins/` directory.
3. Paste the files there.
4. Reload Obsidian and enable the plugin.

## Compatibility
Compatible with Obsidian v0.15.0+ and works seamlessly with:
- **Properties (Metadata)**
- **Dataview** (inline fields)
- **Bases (Airtable-like)** plugin

## Development

1. Clone this repository.
2. Run `npm install`.
3. Run `npm run dev` to start compilation in watch mode.

---
Made with ❤️ by Antigravity.
