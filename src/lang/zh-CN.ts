export const zhCN = {
    // 设置标题
    'settings_title': 'Typify',
    'section_configuration_title': '配置',
    'section_data_management_title': '数据管理',

    // 目标属性
    'target_property_title': '目标属性',
    'target_property_desc': '要应用样式的属性名称（例如："status"、"priority"）',
    'target_property_placeholder': '属性',

    // 创建样式
    'add_status_title': '创建新样式',
    'add_status_desc': '为你的标签定义自定义颜色和图标。',
    'add_status_button': '创建样式',

    // 样式列表
    'new_status_name': '新样式',

    // 样式控件
    'status_name_title': '样式名称',
    'base_color_title': '基础颜色',
    'icon_title': '图标',
    'add_icon_tooltip': '选择图标',
    'remove_icon_tooltip': '移除图标',
    'applies_to_title': '应用于',
    'applies_to_all_option': '所有属性',

    // 预览
    'preview_light_context': '浅色模式预览',
    'preview_dark_context': '深色模式预览',

    // 删除
    'delete_button': '删除样式',

    // 图标选择器
    'icon_picker_placeholder': '输入以搜索图标…',
    'icon_picker_navigate': '导航',
    'icon_picker_select': '选择',
    'icon_picker_close': '关闭',

    // 导出/导入
    'export_title': '导出设置',
    'export_desc': '复制样式配置以便分享或备份。',
    'export_button': '导出',
    'import_title': '导入设置',
    'import_desc': '粘贴之前导出的 JSON 来恢复样式。',
    'import_button': '导入',
    'import_success': '样式导入成功！',
    'import_error': '导入样式时出错。文件格式无效。',

    // 自定义图标
    'custom_icons_toggle_title': '自定义图标',
    'custom_icons_toggle_desc': '在插件中启用自定义 SVG 图标。',
    'custom_icons_info': '仅支持不超过 100KB 的 .svg 文件。请将图标放在插件目录的 icons/ 文件夹中。',
    'custom_icons_loaded': '成功加载 {count} 个自定义图标！',
    'custom_icons_empty': '在 icons/ 文件夹中未找到 SVG 文件。请添加 .svg 文件后重新启用。',
    'custom_icons_error': '加载自定义图标时出错。',
    'custom_icons_missing': '{count} 个自定义图标未找到：{names}。',

    // 自定义图片
    'custom_images_oversized': '{count} 张图片已跳过（超过 50KB 限制）：{names}',
    'custom_images_missing': '{count} 张图片未在 img/ 文件夹中找到：{names}。',

    // 导出消息
    'export_success': '设置已复制到剪贴板。',
    'export_error': '导出设置失败。',

    // 导出/导入弹窗
    'export_modal_title': '导出设置',
    'copy_clipboard_button': '复制到剪贴板',
    'copy_clipboard_success': '设置已成功复制到剪贴板！',
    'import_modal_title': '导入设置',
    'import_paste_placeholder': '在此粘贴 JSON 配置…',
    'import_empty_notice': '请先粘贴您的配置。',
    'import_invalid_json': 'JSON 格式无效。请检查数据后重试。',
    'import_no_valid_styles': '导入的数据中未找到有效样式。',
    'import_partial_success': '已导入 {imported} 个样式。{skipped} 个无效样式已跳过。',

    // 样式管理
    'section_styles_title': '样式',
    'manage_styles_title': '管理样式',
    'manage_styles_desc': '编辑、排序或删除你的状态样式。',
    'manage_styles_button': '管理',

    // 创建样式弹窗
    'create_style_title': '创建样式',

    'status_name_placeholder': '请输入样式名称…',
    'save_button': '保存',
    'cancel_button': '取消',
    'style_name_required': '样式名称不能为空。',
    'style_saved': '样式「{name}」已保存！',
    'style_duplicate': '相同属性下已存在同名样式。',
    'style_overlap_warning': '注意：已存在同名样式但作用域不同。更具体的样式将优先应用。',

    // 样式管理器弹窗
    'manage_styles_modal_title': '管理样式',
    'manage_styles_search': '筛选…',
    'manage_styles_count': '共 {count} 个样式',
    'manage_styles_empty': '尚未创建任何样式。',
    'manage_styles_no_results': '没有匹配的样式。',
    'delete_style_confirm': '确定删除「{name}」？',
    'style_deleted': '样式「{name}」已删除。',
    'confirm_button': '确认',
    'scope_label': '作用域',
    'scope_all': '所有属性',
    'icon_label': '图标',

    // 形状
    'shape_title': '形状',
    'shape_pill': '胶囊',
    'shape_rectangle': '圆角矩形',
    'shape_flat': '直角矩形',
    'shape_label': '形状',

    // Tabs
    'tab_icons': '图标',
    'tab_custom': '自定义',
    'tab_images': '图片',

    // 颜色模式
    'color_mode_title': '颜色模式',
    'color_mode_subtle': '柔和',
    'color_mode_solid': '纯色',
    'color_mode_label': '颜色',

    // 编辑样式
    'edit_style_title': '编辑样式',
    'style_updated': '样式「{name}」已更新！',

    // Hide Remove Button
    'hide_remove_button_title': '隐藏标签上的“×”按钮',
    'hide_remove_button_desc': '隐藏删除图标，以获得更简洁的外观。',
    'hide_remove_button_none': '无（默认）',
    'hide_remove_button_properties': '仅在属性中',
    'hide_remove_button_bases': '仅在 Bases 中',
    'hide_remove_button_both': '两者都有',

    // 关联链接
    'link_styles_toggle_title': '关联链接',
    'link_styles_toggle_desc': '将药丸中的 URL 替换为样式名称，同时保留原生的链接点击行为。',
    'link_url_title': '关联链接',
    // UI Components
    'ui_components_title': '其他样式',
    'ui_components_desc': '启用或禁用标签的视觉组件。'
};
