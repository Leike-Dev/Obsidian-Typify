

<div align="center">
  <img src="./assets/images/banner_1.jpg"/>
  
   ![License](https://img.shields.io/badge/license-MIT-lightblue.svg)
   ![Version](https://img.shields.io/badge/version-1.1.0-lightgreen.svg)

</div>

<div align="center">

   [English](../README.md) | [Português](./README_pt.md) | [Español](./README_es.md) | [Français](./README_fr.md) | 简体中文

</div>

---

将你无聊的元数据变成动态、多彩的展示！🎨✨

Typify 是一款 Obsidian 插件，让你可以为元数据创建独特的样式。以前仅限于标签的功能，现在可以应用于任何 Obsidian 属性。

## 功能特性

- **🎨 自定义样式**：为你的元数据创建独特的样式。

- **✨ 1700+ 图标**：内置模糊搜索，涵盖整个 Lucide 图标库。

- **🌑 明暗模式**：颜色自动适配你的 Obsidian 主题。

- **🚫 可选图标**：支持纯文本标签（只需移除图标！）。

- **🧩 自定义图标**：图标不够用？你可以轻松使用自己的图标。

- **🌍 国际化**：完整支持英语、巴西葡萄牙语、西班牙语、法语和简体中文。

- **💾 导出/导入**：轻松备份和分享你的配置。

- **📋 Bases 插件**：样式同样适用于 Bases 视图（表格和卡片）。

- **🎯 范围样式**：使用"应用于"将样式限定到特定属性。

## 使用方法

1. **设置目标属性**：在插件设置中，输入你想要添加样式的属性名称（例如：`Status`）。如需多个属性，用逗号分隔（例如：`Status, Priority`）。

2. **创建值样式**：
   - 前往 **设置 > Typify**。
   - 点击"创建样式"。
   - 在**样式名称**字段中，输入你想要变成标签的文本（例如：`完成`）。
   - 选择一个基础颜色和图标，或者不使用图标。
   - 可选地，使用**应用于**将样式限定到特定属性。

3. **使用新样式**：在笔记的属性（YAML）中，使用你配置的属性和值（例如：`Status: 进行中`）。

大功告成！你的属性现在变成了漂亮的彩色标签 ✨

## 安装

### 手动安装
1. 下载最新版本：`main.js`、`manifest.json` 和 `styles.css`。

2. 在 `.obsidian/plugins/` 目录中创建一个名为 `typify` 的文件夹。

3. 将文件粘贴到该文件夹中。

4. 重新加载 Obsidian 并启用插件。

## 注意事项

> [!Important]  
> 样式效果仅适用于 Obsidian 中**列表**类型的属性。

> [!Note]  
> 插件对属性名称和值不区分大小写。例如：`Status` 和 `status` 被视为同一属性。

> [!Note]  
> 如果两个样式名称相同但作用域不同（例如：一个设为"所有属性"，另一个设为特定属性），更具体的样式将在该属性上优先应用。

> [!Tip]  
> 你可以使用多个目标属性。只需在属性之间添加逗号。例如：`Status, Priority`。

> [!Warning]  
> 导入设置会**替换所有现有样式**。备份之后创建的样式将会丢失。

## 已知问题

### Bases 卡片视图 — Obsidian 移动端

在 Obsidian 移动端，Bases 卡片视图中的样式标签底部可能会出现轻微裁剪。这是由 Obsidian 内部对卡片属性容器的布局限制导致的，超出了插件的控制范围。

根据我的测试，可以通过自定义 CSS 增加卡片属性的行高来修复此问题，但这会影响所有项目，而不仅仅是有问题的行。

如果你想使用我测试过的解决方案，请在 **设置 > 外观 > CSS 代码片段** 中添加以下 CSS 片段：

```css
.bases-view .bases-cards-container .bases-cards-item .bases-cards-property .bases-cards-line {
    min-height: 26px !important;
    margin-top: 4px;
}
```

## 开发

如果你想自己构建插件，请执行以下操作：

1. 克隆此仓库。
2. 运行 `npm install`。
3. 运行 `npm run dev` 以启动监视模式编译。


## 免责声明

这个插件诞生于我对属性拥有更多自定义选项的渴望，类似于 Notion，但以 Obsidian 的方式实现。

值得一提的是，没有 [Antigravity](https://antigravity.google/) 的大力帮助，这一切都不可能实现。当然，这不是一键完成的魔法，而是对每个提示词的精心打磨，加上大量的审查和测试。

这不是随意"氛围编码"出来的。我不得不手动修改很多东西，但它也不是万无一失的。如果你发现任何 bug，请提交 issue，我会尽最大努力修复。

如果你想为项目做贡献，欢迎提交 pull request。或者如果你不习惯使用机器生成的代码，想要制作自己的手工版本，也完全可以。只是记得告诉我，因为我热爱新插件 😉。
