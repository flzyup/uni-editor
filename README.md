# Uni Editor

[![GitHub](https://img.shields.io/badge/GitHub-flzyup/uni--editor-blue?logo=github)](https://github.com/flzyup/uni-editor)
[![官网](https://img.shields.io/badge/官网-uni--editor.com-green?logo=web)](https://uni-editor.com)

Uni Editor 是一个现代化的、所见即所得的 Markdown 创作与发布工具。它面向「公众号排版」与「图片类平台发布」两大场景：在左侧编辑区进行 WYSIWYG/Markdown 编写与主题预览，右侧自动将长文拆分为 4:3 样式卡片，支持多主题实时预览与高清导出，可直接用于小红书等平台发布。

## 链接

- 🌐 **在线体验**：[https://uni-editor.com](https://uni-editor.com)
- 💻 **GitHub 仓库**：[https://github.com/flzyup/uni-editor](https://github.com/flzyup/uni-editor)
- 📚 **所有内容均缓存浏览器本地**

## 特性
- 所见即所得编辑
  - WYSIWYG 与 Markdown 源码模式一键切换
  - 可视化表格、常用格式工具栏
  - 6+ 预设编辑主题，切换即生效
- 公众号适配
  - 一键复制为「公众号图文」格式，保留主题风格（HTML 粘贴）
- 卡片预览与导出
  - 自动分块/分页为 4:3 卡片，不切割单段落/图片
  - 封面卡自动抽取标题/摘要，显示「全文字数」「阅读时长」
  - 8+ 卡片主题，实时切换
  - 一键导出全部卡片为高清 PNG
- 界面设计
  - 顶部 Banner（Logo：Uni Editor）、底部版权
  - 暗色、简洁、现代的页面布局

## 技术栈
- 构建：Vite + Vue 3
- 编辑器：[Vditor](https://github.com/Vanessa219/vditor)
- 导出图片：html-to-image
- 样式：原子化的自定义 CSS + 主题变量

## 快速开始
- 安装依赖并启动开发服务器：
  - `npm i`
  - `npm run dev`
- 生产构建与预览：
  - `npm run build`
  - `npm run preview`

## 目录结构（关键文件）
- `index.html`：入口页面
- `src/main.js`：应用入口
- `src/App.vue`：整体布局（编辑区 + 预览区）
- `src/components/EditorPane.vue`：编辑器、主题切换、复制公众号
- `src/components/CardsPreview.vue`：卡片封面生成、主题切换、图片导出
- `src/utils/article.js`：长文分块与卡片化、阅读时长估算
- `src/utils/copy.js`：构造公众号 HTML（带内联样式）
- `src/styles/base.css` / `src/styles/themes.css`：全局样式与主题变量

## 使用提示
- 复制为公众号格式：现代浏览器支持以 `text/html` 粘贴来保留样式；如遇限制将回退为纯文本复制。
- 分页策略：按段落/图片等块元素进行近似分页，尽量避免单块被切割；如内容密度差异较大，可适当调整文案以获得更佳版式。

## 已完成功能

- [x] 所见即所得编辑器集成
- [x] Markdown源码模式切换
- [x] 多主题编辑器支持
- [x] 公众号格式复制功能
- [x] 卡片预览与导出
- [x] 多种卡片主题切换
- [x] 暗色/浅色页面主题
- [x] 内容本地缓存
- [x] 长文自动分页
- [x] 高清PNG图片导出

## TODO

- [ ] 修复卡片保存时丢失模糊蒙版问题
- [ ] 编辑器支持同时管理多个文稿并可切换
- [ ] 完善图片上传功能
- [ ] 新增更多不同样式的主题
- [ ] 添加导出PDF功能

## 体验反馈

若您有更好的意见、建议或者Bug反馈，可以扫码添加如下的微信群进行沟通

![Uni Editor体验反馈微信群](raw/wechat_group.png)

## 许可证
本项目采用 Apache License 2.0，详见 `LICENSE`。

---
A modern WYSIWYG Markdown editor for WeChat-ready HTML and 4:3 card exports. Built with Vite + Vue 3, Vditor, and html-to-image.
