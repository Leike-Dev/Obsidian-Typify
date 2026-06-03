import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
    globalIgnores([
        "node_modules",
        "dist",
        "esbuild.config.mjs",
        "dev/**",
        "main.js",
        "package.json",
        "package-lock.json",
        "tsconfig.json",
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
