export default {
  // Header navigation
  header: {
    logo: 'Uni Editor',
    hint: 'Content is saved in the local cache only. Please feel free & safe to edit and use it.',
    github: 'GitHub',
    feedback: 'Feedback',
    features: 'Supported Features',
    todo: 'Pending Features',
    theme: 'Page Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    language: 'Language'
  },

  // Main functional areas
  main: {
    editor: 'Editor',
    preview: 'Content Preview',
    articleMode: 'Article Mode',
    cardMode: 'Card Mode',
    copyAll: 'Copy All',
    saveCards: 'Save Cards',
    theme: 'Theme'
  },

  // Editor related
  editor: {
    welcome: 'Welcome to Uni Editor',
    features: [
      'WYSIWYG + Markdown source code',
      'Theme switching (editor and cards)',
      'One-click copy to WeChat format',
      'Preview long articles as cards and export high-resolution images'
    ],
    saveSuccess: 'Content saved locally',
    loadError: 'Failed to load content'
  },

  // Feature list (completed)
  completedFeatures: {
    title: 'Supported Features',
    list: [
      'WYSIWYG editor integration',
      'Markdown source mode switching',
      'Multi-theme editor support',
      'WeChat format copy functionality',
      'Card preview and export',
      'Multiple card theme switching',
      'Dark/light page themes',
      'Local content caching',
      'Automatic long article pagination',
      'High-resolution PNG export'
    ]
  },

  // Todo list
  todoFeatures: {
    title: 'Pending Features',
    list: [
      'Improve image upload functionality',
      'Add PDF export feature',
      'More rich and diverse theme styles'
    ]
  },

  // Message prompts
  messages: {
    copySuccess: 'Copied to WeChat format ({theme} theme).',
    copyFailed: 'Copy failed: fallback to plain text.',
    emptyContent: 'Editor content is empty',
    exportSuccess: 'Cards exported successfully',
    exportFailed: 'Export failed, please try again'
  },


  // Footer copyright
  footer: {
    copyright: '© 2025 Uni Editor. All rights reserved.'
  },

  // Theme names
  themes: {
    classic: 'Classic',
    minimal: 'Minimal',
    paper: 'Paper',
    ocean: 'Ocean',
    forest: 'Forest',
    sunset: 'Sunset',
    grape: 'Grape',
    slate: 'Slate',
    sand: 'Sand'
  },

  // Common
  common: {
    expand: 'Expand',
    collapse: 'Collapse',
    close: 'Close',
    confirm: 'Confirm',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success'
  },

  // Default template content
  defaultTemplate: `# Welcome to Uni Editor ✨

Uni Editor is a modern Markdown editor designed specifically for **WeChat formatting** and **image platform publishing**.

## 🚀 Core Features

### 📝 Powerful Editing
- **WYSIWYG** + Markdown source mode with one-click switching
- Support for various text styles and formats
- Real-time preview, write and see instantly

### 🎨 Diverse Theme System
- **Editor Themes**: Dark/Light modes
- **Card Themes**: 9 beautiful themes to choose from
- Real-time switching with immediate effect

### 📱 Smart Pagination Export
1. **Article Mode**: One-click copy to WeChat format
2. **Card Mode**: Auto-paginate to 4:3 ratio cards
3. **HD Export**: PNG format, perfect for all platforms

## 💻 Technical Features

> Uni Editor is built on modern web technologies, providing a smooth editing experience

- [x] **Local Storage**: Content auto-cached to prevent accidental loss
- [x] **Multi-language**: Chinese/English interface switching
- [x] **Responsive Design**: Adapts to various screen sizes
- [ ] Image upload optimization (In Development)
- [ ] PDF export feature (Planned)

## 📊 Feature Comparison

| Feature | Uni Editor | Traditional Editors |
|---------|------------|-------------------|
| WYSIWYG | ✅ | ❌ |
| Card Export | ✅ | ❌ |
| WeChat Format | ✅ | ❌ |
| Multi-theme | ✅ | ❌ |
| Local Cache | ✅ | ⚠️ |

## 🔗 Useful Links

- **Official Site**: [uni-editor.com](https://uni-editor.com)
- **Open Source**: [GitHub Repository](https://github.com/flzyup/uni-editor)
- **Feedback**: [Issues](https://github.com/flzyup/uni-editor/issues)

## 💡 Usage Tips

\`\`\`markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text** and *italic text*

> This is a blockquote
> Can contain multiple lines

- Unordered list item 1
- Unordered list item 2
  - Nested list item

1. Ordered list item 1
2. Ordered list item 2

[Link text](https://example.com)

\`Inline code\`
\`\`\`

## 🖼️ Sample Image

![Editor Interface Demo](https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=60)

---

## 🎯 Start Creating

Now begin your creative journey! Delete these sample contents and write your amazing articles.

**Pro Tips**:
1. Use toolbar for quick text formatting
2. Switch to card mode to preview pagination
3. Choose appropriate themes to match content style
4. Check layout before exporting

Happy Writing! 🎉`
}