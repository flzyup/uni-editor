export default {
  plugins: {
    // 自动添加浏览器前缀
    autoprefixer: {},
    // CSS压缩和优化
    cssnano: {
      preset: ['default', {
        // 移除注释
        discardComments: { removeAll: true },
        // 合并规则
        mergeRules: true,
        // 移除未使用的CSS
        discardUnused: true,
        // 压缩颜色值
        colormin: true,
        // 优化字体权重
        minifyFontValues: true,
        // 合并媒体查询
        mergeIdents: true,
        // 规范化空白
        normalizeWhitespace: true
      }]
    }
  }
}