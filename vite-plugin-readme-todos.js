import { readFileSync } from 'fs'
import { resolve } from 'path'

export function readmeTodosPlugin() {
  let todos = []
  let completedFeatures = []

  function parseFeatures() {
    try {
      const readmePath = resolve('README.md')
      const content = readFileSync(readmePath, 'utf-8')

      // 解析TODO项目
      const todoSection = content.match(/## TODO\s*([\s\S]*?)(?=\n##|\n---|\Z)/i)
      if (todoSection) {
        const todoContent = todoSection[1]
        todos = todoContent
          .split('\n')
          .filter(line => line.trim().startsWith('- [ ]') || line.trim().startsWith('- [x]'))
          .map(line => {
            const isCompleted = line.includes('- [x]')
            const text = line.replace(/^.*?\]\s*/, '').trim()
            return { text, completed: isCompleted }
          })
      } else {
        todos = []
      }

      // 解析已完成功能
      const completedSection = content.match(/## 已完成功能\s*([\s\S]*?)(?=\n##|\n---|\Z)/i)
      if (completedSection) {
        const completedContent = completedSection[1]
        completedFeatures = completedContent
          .split('\n')
          .filter(line => line.trim().startsWith('- [x]'))
          .map(line => {
            const text = line.replace(/^.*?\]\s*/, '').trim()
            return { text, completed: true }
          })
      } else {
        completedFeatures = []
      }

      console.log(`Parsed ${todos.length} TODO items and ${completedFeatures.length} completed features from README.md`)
    } catch (error) {
      console.warn('Failed to parse README features:', error.message)
      todos = []
      completedFeatures = []
    }
  }

  return {
    name: 'readme-todos',

    buildStart() {
      // 在构建开始时解析README
      parseFeatures()
    },

    configureServer(server) {
      // 开发模式下也解析README
      parseFeatures()

      // 监听README文件变化
      server.watcher.add(resolve('README.md'))
      server.watcher.on('change', (file) => {
        if (file.endsWith('README.md')) {
          console.log('README.md changed, re-parsing features...')
          parseFeatures()

          // 触发虚拟模块的热更新
          const module = server.moduleGraph.getModuleById('virtual:readme-todos')
          if (module) {
            server.reloadModule(module)
          }
        }
      })
    },

    resolveId(id) {
      if (id === 'virtual:readme-todos') {
        return id
      }
    },

    load(id) {
      if (id === 'virtual:readme-todos') {
        return `export const todos = ${JSON.stringify(todos, null, 2)}
export const completedFeatures = ${JSON.stringify(completedFeatures, null, 2)}`
      }
    }
  }
}