/**
 * SwatchStrip — faixa de cores V3 (touch-friendly)
 * Obsidian plugin component — sem dependências externas
 */
import { setIcon, Notice } from "obsidian";
import { t } from '../lang/helpers';

export interface SwatchStripOptions {
  colors: string[];
  maxColors?: number;
  onChange?: (colors: string[]) => void;
  onPickColor?: (callback: (hex: string) => void) => void; // abre seu color picker
}

export class SwatchStrip {
  private container: HTMLElement;
  private colors: string[];
  private maxColors: number;
  private selectedIndex: number | null = null;
  private options: SwatchStripOptions;

  // Elementos reutilizados
  private stripEl!: HTMLElement;
  private panelEl!: HTMLElement;
  private panelDot!: HTMLElement;
  private panelHex!: HTMLElement;

  constructor(container: HTMLElement, options: SwatchStripOptions) {
    this.container = container;
    this.colors = [...options.colors];
    this.maxColors = options.maxColors ?? 10;
    this.options = options;
    this.render();
  }

  // ─── Render principal ────────────────────────────────────────────────────

  private render() {
    this.container.empty();
    this.container.addClass("typify-swatch-strip-container");

    this.stripEl = this.container.createDiv({ cls: "typify-swatch-strip" });

    this.panelEl = this.container.createDiv({ cls: "typify-swatch-panel" });
    this.buildPanel();

    this.renderSegments();
    this.updatePanel();
  }

  // ─── Faixa de segmentos ──────────────────────────────────────────────────

  private renderSegments() {
    this.stripEl.empty();

    this.colors.forEach((hex, i) => {
      const seg = this.stripEl.createDiv({ cls: "typify-swatch-seg" });
      seg.setAttribute("role", "button");
      seg.setAttribute("tabindex", "0");
      seg.style.backgroundColor = hex;
      if (i === this.selectedIndex) seg.addClass("is-active");

      // Tick de seleção
      const tick = seg.createDiv({ cls: "typify-swatch-tick" });
      setIcon(tick, "circle-check");

      // Touch/click — área mínima 44px garantida pelo height da faixa
      seg.addEventListener("click", () => this.select(i));
      seg.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.select(i);
        }
      });
    });

    // Botão adicionar
    if (this.colors.length < this.maxColors) {
      const addBtn = this.stripEl.createDiv({ cls: "typify-swatch-add" });
      addBtn.setAttribute("role", "button");
      addBtn.setAttribute("tabindex", "0");
      addBtn.setAttribute("aria-label", t('palette_add_color_aria'));
      addBtn.setText("+");
      
      // Encapsulate hidden color input INSIDE the add button for perfect popup positioning
      const hiddenColorInput = addBtn.createEl("input", { type: "color", cls: "typify-hidden-color-input" });
      hiddenColorInput.addEventListener("change", (e) => {
        const hex = (e.target as HTMLInputElement).value;
        if (this.options.onPickColor) {
           // Se houver callback nativo legado, use ele
           this.options.onPickColor((h) => {
              this.colors.push(h);
              this.options.onChange?.(this.colors);
              this.render();
           });
        } else {
           this.colors.push(hex);
           this.options.onChange?.(this.colors);
           this.render();
        }
      });

      addBtn.addEventListener("click", (e) => {
        if (e.target === hiddenColorInput) return; // ignore native clicks to prevent loops
        if (this.colors.length >= this.maxColors) {
          new Notice(t('palette_max_reached').replace('{max}', String(this.maxColors)));
          return;
        }
        hiddenColorInput.click();
      });
      addBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          hiddenColorInput.click();
        }
      });
    }
  }

  // ─── Painel de detalhes ──────────────────────────────────────────────────

  private buildPanel() {
    this.panelEl.empty();

    this.panelDot = this.panelEl.createDiv({ cls: "typify-panel-dot" });

    this.panelHex = this.panelEl.createEl("span", { cls: "typify-panel-hex" });

    const actions = this.panelEl.createDiv({ cls: "typify-panel-actions" });

    const copyBtn = actions.createDiv({ cls: "clickable-icon" });
    setIcon(copyBtn, "copy");
    copyBtn.setAttribute("aria-label", t('palette_copy_aria'));
    copyBtn.addEventListener("click", () => { void this.copySelected(); });

    const removeBtn = actions.createDiv({ cls: "clickable-icon typify-palette-clear-btn" });
    setIcon(removeBtn, "trash-2");
    removeBtn.setAttribute("aria-label", t('palette_remove_aria'));
    removeBtn.addEventListener("click", () => this.removeSelected());
  }

  private updatePanel() {
    const visible = this.selectedIndex !== null;
    if (visible) this.panelEl.addClass("is-visible");
    else this.panelEl.removeClass("is-visible");

    if (visible && this.selectedIndex !== null) {
      const hex = this.colors[this.selectedIndex];
      if (hex) {
        this.panelDot.style.background = hex;
        this.panelHex.setText(hex);
      }
    }
  }

  // ─── Ações ───────────────────────────────────────────────────────────────

  private select(i: number) {
    this.selectedIndex = this.selectedIndex === i ? null : i;
    this.renderSegments();
    this.updatePanel();
  }

  private removeSelected() {
    if (this.selectedIndex === null) return;
    this.colors.splice(this.selectedIndex, 1);
    this.selectedIndex = null;
    this.options.onChange?.(this.colors);
    this.renderSegments();
    this.updatePanel();
  }

  private async copySelected() {
    if (this.selectedIndex === null) return;
    const hex = this.colors[this.selectedIndex];
    if (hex) {
      await navigator.clipboard.writeText(hex);
      new Notice(t('palette_color_copied'));
    }
  }

  public setColors(colors: string[]) {
    this.colors = [...colors];
    this.selectedIndex = null;
    this.render();
  }

}
