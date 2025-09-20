export default {
  // 头部导航
  header: {
    logo: 'Uni Editor',
    github: 'GitHub',
    feedback: '意见反馈',
    features: '已支持功能',
    todo: '待完善功能',
    appearance: '外观',
    appearanceLight: '浅色',
    appearanceDark: '深色',
    language: '语言',
    // 兼容性：保持旧命名
    theme: '外观',
    themeLight: '浅色',
    themeDark: '深色'
  },

  // 主要功能区域
  main: {
    editor: '编辑器',
    preview: '内容预览',
    articleMode: '长文模式',
    cardMode: '卡片模式',
    copyAll: '全部复制',
    saveCards: '保存卡片',
    saveArticle: '保存长文',
    colorTheme: '色彩主题',
    theme: '色彩主题', // 兼容性
    scale: '缩放',
    exportMarkdown: '导出MD',
    importMarkdown: '导入MD'
  },

  // 卡片预览相关
  cardsPreview: {
    cover: '封面',
    cards: '卡片',
    coverImage: '封面图',
    title: '标题',
    titlePlaceholder: '请输入标题',
    summary: '摘要',
    summaryPlaceholder: '请输入摘要',
    clickToUpload: '点击上传图片',
    clickToReplace: '点击替换',
    imageFormats: '支持 JPG、PNG 格式，大小不超过 5MB',
    fillMode: '填充方式',
    fillCover: '覆盖（等比裁剪）',
    fillContain: '适应（等比留边）',
    alignPosition: '对齐位置',
    alignCenter: '居中',
    alignTop: '上',
    alignBottom: '下',
    alignLeft: '左',
    alignRight: '右',
    alignTopLeft: '左上',
    alignTopRight: '右上',
    alignBottomLeft: '左下',
    alignBottomRight: '右下',
    showMeta: '显示信息条',
    show: '显示',
    hide: '隐藏',
    wordCount: '全文 {count} 字',
    readingTime: '阅读需 {minutes} 分钟',
    syncTitle: '从编辑器同步标题',
    syncSummary: '从编辑器同步摘要',
    syncCoverImage: '从编辑器同步封面图',
    syncTitleSuccess: '标题同步成功',
    syncSummarySuccess: '摘要同步成功',
    syncCoverImageSuccess: '封面图同步成功',
    syncNoContent: '编辑器中未找到相应内容',
    generating: '正在生成卡片...'
  },

  // 封面布局
  coverLayouts: {
    minimal: '极简',
    minimalDesc: '仅显示标题，居中显示',
    center: '居中',
    centerDesc: '标题和摘要居中显示',
    imageTop: '图上',
    imageTopDesc: '图片上方，文字下方',
    imageBottom: '图下',
    imageBottomDesc: '文字上方，图片下方',
    magazine: '杂志',
    magazineDesc: '标题上方居中，摘要左侧'
  },

  // 编辑器相关
  editor: {
    welcome: '欢迎使用 Uni Editor',
    features: [
      '所见即所得 + Markdown 源码',
      '主题切换（编辑器与卡片）',
      '一键复制为公众号格式',
      '预览长文卡片并导出高清图片'
    ],
    saveSuccess: '内容已保存到本地',
    loadError: '加载内容失败'
  },

  // 功能列表（已完成）
  completedFeatures: {
    title: '已支持功能',
    list: [
      '所见即所得编辑器集成',
      'Markdown源码模式切换',
      '多主题编辑器支持',
      '公众号格式复制功能',
      '卡片预览与导出',
      '多种卡片主题切换',
      '暗色/浅色页面主题',
      '内容本地缓存',
      '长文自动分页',
      '高清PNG图片导出'
    ]
  },

  // 待办列表
  todoFeatures: {
    title: '待完善功能',
    list: [
      '完善图片上传功能',
      '添加导出PDF功能',
      '更多丰富和不同样式的主题'
    ]
  },

  // 消息提示
  messages: {
    copySuccess: '已复制为公众号格式（{theme} 主题）。',
    copyFailed: '复制失败：已尝试回退纯文本。',
    emptyContent: '编辑器内容为空',
    exportSuccess: '卡片导出成功',
    exportFailed: '导出失败，请重试',
    exportMarkdownSuccess: 'Markdown文件导出成功',
    exportMarkdownFailed: 'Markdown导出失败，请重试',
    importMarkdownSuccess: 'Markdown文件导入成功',
    importMarkdownFailed: 'Markdown导入失败，请重试',
    invalidMarkdownFile: '请选择有效的Markdown文件（.md）',
    imageUploadSuccess: '图片上传成功',
    imageUploadFailed: '图片上传失败',
    imageSizeExceeded: '图片大小不能超过5MB',
    invalidImageFormat: '请选择JPG或PNG格式的图片'
  },

  // Loading 文本
  loading: {
    // 长文导出
    articlePreparing: '正在准备导出...',
    articleAdjusting: '正在调整导出样式...',
    articleGenerating: '正在生成图片...',
    articleSaving: '正在保存文件...',
    articleSuccess: '长文保存成功',

    // 卡片导出
    cardsPreparing: '正在准备导出卡片...',
    cardsTotal: '准备导出 {count} 张卡片...',
    cardsExporting: '正在导出第 {current} 张卡片 ({current}/{total})...',
    cardsComplete: '导出完成！'
  },

  // 底部版权
  footer: {
    copyright: '© 2025 Uni Editor. All rights reserved.',
    exportCredit: '使用 Uni Editor 制造',
    ribbonCredit: 'Uni Editor',
    exportLink: 'https://uni-editor.com'
  },

  // 色彩主题名称
  colorThemes: {
    classic: '经典',
    minimal: '简约',
    paper: '纸质',
    ocean: '海洋',
    forest: '森林',
    sunset: '夕阳',
    grape: '葡萄',
    slate: '石板',
    sand: '沙漠'
  },

  // 兼容性：保持旧命名
  themes: {
    classic: '经典',
    minimal: '简约',
    paper: '纸张',
    ocean: '海洋',
    forest: '森林',
    sunset: '夕阳',
    grape: '葡萄',
    slate: '石板',
    sand: '沙漠'
  },

  // 文档管理
  documents: {
    newDocument: '新建文档',
    untitled: '无标题文档',
    welcome: '欢迎文档',
    copy: '副本',
    rename: '重命名',
    duplicate: '复制',
    close: '关闭',
    renameTitle: '重命名文档',
    renamePlaceholder: '请输入文档名称',
    exportAll: '导出所有文档',
    importDocuments: '导入文档',
    confirmClose: '确认关闭文档？',
    unsavedChanges: '文档有未保存的更改',
    // 多标签页管理
    manager: '文档管理器',
    documentCount: '{count} 个文档',
    charactersCount: '{count} 字符',
    closeTabTitle: '关闭标签',
    unsavedChangesTitle: '文档有未保存的更改',
    showManager: '显示文档管理器',
    hideManager: '隐藏文档管理器',
    // 文档操作
    openDocument: '打开文档',
    locateTab: '定位标签',
    duplicateDocument: '复制文档',
    deleteDocument: '删除文档',
    importMD: '导入MD文件',
    exportMD: '导出MD文件',
    // 确认对话框
    confirmDelete: '确认删除',
    confirmDeleteMessage: '确定要删除文档 "{title}" 吗？',
    confirmImport: '确认导入',
    confirmImportMessage: '文档 "{title}" 已有内容。',
    confirmImportSubMessage: '确定要用导入的内容覆盖当前文档吗？',
    warningNotRecoverable: '此操作不可恢复。',
    confirmImportAction: '确认导入',
    // 时间格式
    timeJustNow: '刚刚',
    timeMinutesAgo: '{minutes}分钟前',
    timeHoursAgo: '{hours}小时前',
    timeDaysAgo: '{days}天前'
  },

  // 通用
  common: {
    expand: '展开',
    collapse: '收起',
    close: '关闭',
    confirm: '确认',
    cancel: '取消',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    search: '搜索文档...',
    loadMore: '加载更多'
  },

  // 默认模板内容
  defaultTemplate: `# 欢迎使用 Uni Editor ✨

Uni Editor 是一个现代化的 Markdown 编辑器，专为**公众号排版**和**图片类平台发布**设计。

## 🚀 核心特性

### 📝 强大的编辑功能
- **所见即所得** + Markdown 源码模式一键切换
- 支持多种文本样式和格式
- 实时预览，即写即看

### 🎨 多样化主题系统
- **编辑器主题**：深色/浅色模式
- **卡片主题**：9种精美主题可选
- 实时切换，立即生效

### 📱 智能分页导出
1. **长文模式**：一键复制为公众号格式
2. **卡片模式**：自动分页为4:3比例卡片
3. **高清导出**：PNG格式，适合各大平台

## 💻 技术特性

> Uni Editor 基于现代Web技术构建，提供流畅的编辑体验

- [x] **本地存储**：内容自动缓存，防止意外丢失
- [x] **多语言支持**：中英文界面切换
- [x] **响应式设计**：适配各种屏幕尺寸
- [ ] 图片上传优化（开发中）
- [ ] PDF导出功能（计划中）

## 📊 功能对比表格

| 功能特性 | Uni Editor | 传统编辑器 |
|---------|------------|-----------|
| 所见即所得 | ✅ | ❌ |
| 卡片导出 | ✅ | ❌ |
| 公众号格式 | ✅ | ❌ |
| 多主题切换 | ✅ | ❌ |
| 本地缓存 | ✅ | ⚠️ |

## 🔗 常用链接

- **官网体验**：[uni-editor.com](https://uni-editor.com)
- **开源地址**：[GitHub仓库](https://github.com/flzyup/uni-editor)
- **问题反馈**：[Issues](https://github.com/flzyup/uni-editor/issues)

## 💡 使用技巧

\`\`\`markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文本** 和 *斜体文本*

> 这是一个引用块
> 可以包含多行内容

- 无序列表项1
- 无序列表项2
  - 嵌套列表项

1. 有序列表项1
2. 有序列表项2

[链接文本](https://example.com)

\`内联代码\`
\`\`\`

## 🖼️ 示例图片

![编辑器界面展示](https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=60)

---

## 🎯 开始创作

现在就开始你的创作之旅吧！删除这些示例内容，写下属于你的精彩文章。

**小贴士**：
1. 使用工具栏快速格式化文本
2. 切换到卡片模式预览分页效果
3. 选择合适的主题匹配内容风格
4. 导出前检查排版效果

Happy Writing! 🎉`
}