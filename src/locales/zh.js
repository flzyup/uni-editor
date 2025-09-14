export default {
  // 头部导航
  header: {
    logo: 'Uni Editor',
    github: 'GitHub',
    feedback: '意见反馈',
    features: '已支持功能',
    todo: '待完善功能',
    theme: '页面主题',
    themeLight: '浅色',
    themeDark: '深色',
    language: '语言'
  },

  // 主要功能区域
  main: {
    editor: '编辑器',
    preview: '内容预览',
    articleMode: '长文模式',
    cardMode: '卡片模式',
    copyAll: '全部复制',
    saveCards: '保存卡片',
    theme: '主题'
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
    exportFailed: '导出失败，请重试'
  },


  // 底部版权
  footer: {
    copyright: '© 2025 Uni Editor. All rights reserved.'
  },

  // 主题名称
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

  // 通用
  common: {
    expand: '展开',
    collapse: '收起',
    close: '关闭',
    confirm: '确认',
    cancel: '取消',
    loading: '加载中...',
    error: '错误',
    success: '成功'
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