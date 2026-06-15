import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
    globalIgnores([
        "node_modules",
        "dist",
        "esbuild.config.mjs",
        "scripts/**",
        "dev/**",
        "main.js",
        "package.json",
        "package-lock.json",
        "tsconfig.json",
        "**/*.d.ts",
    ]),
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                activeDocument: "readonly",
                createEl: "readonly",
                createSpan: "readonly",
                createDiv: "readonly",
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    ...obsidianmd.configs.recommended,
);
