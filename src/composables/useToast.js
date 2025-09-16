import { createApp, h, ref } from 'vue'
import ToastMessage from '../components/ToastMessage.vue'

// Toast队列管理
const toastQueue = []
let currentToastApp = null

export function useToast() {
  const showToast = (message, type = 'info', options = {}) => {
    // 如果有当前显示的toast，先销毁它
    if (currentToastApp) {
      try {
        currentToastApp.unmount()
      } catch (e) {
        // 忽略unmount错误
      }
      currentToastApp = null
    }

    // 创建新的toast实例
    const toastApp = createApp({
      render() {
        return h(ToastMessage, {
          message,
          type,
          duration: options.duration || 3000,
          dismissible: options.dismissible !== false,
          onClose: () => {
            // 销毁当前toast
            if (currentToastApp === toastApp) {
              currentToastApp = null
            }
            try {
              toastApp.unmount()
            } catch (e) {
              // 忽略unmount错误
            }

            // 处理队列中的下一个toast
            if (toastQueue.length > 0) {
              const next = toastQueue.shift()
              setTimeout(() => {
                showToast(next.message, next.type, next.options)
              }, 100)
            }
          }
        })
      }
    })

    // 挂载到body
    const container = document.createElement('div')
    toastApp.mount(container)
    currentToastApp = toastApp

    return toastApp
  }

  const success = (message, options = {}) => {
    return showToast(message, 'success', options)
  }

  const error = (message, options = {}) => {
    return showToast(message, 'error', options)
  }

  const warning = (message, options = {}) => {
    return showToast(message, 'warning', options)
  }

  const info = (message, options = {}) => {
    return showToast(message, 'info', options)
  }

  return {
    showToast,
    success,
    error,
    warning,
    info
  }
}