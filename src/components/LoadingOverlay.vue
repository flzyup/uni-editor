<template>
  <teleport to="body">
    <div v-if="show" class="loading-overlay" :class="[pageTheme, 'card-theme', theme]" @click.stop :style="overlayStyle">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner-ring" :style="ring1Style"></div>
          <div class="spinner-ring ring-2" :style="ring2Style"></div>
          <div class="spinner-ring ring-3" :style="ring3Style"></div>
        </div>
        <div class="loading-text" :style="textStyle">{{ text }}</div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  text: { type: String, default: '处理中...' },
  theme: { type: String, default: 'classic' },
  pageTheme: { type: String, default: 'theme-dark' }
})

// 主题色映射
const themeColors = {
  classic: '#3b82f6',
  minimal: '#6b7280',
  paper: '#8b5cf6',
  ocean: '#0ea5e9',
  forest: '#10b981',
  sunset: '#f59e0b',
  grape: '#a855f7',
  slate: '#64748b',
  sand: '#d97706'
}

const accentColor = computed(() => {
  return themeColors[props.theme] || themeColors.classic
})

const overlayStyle = computed(() => ({
  background: `color-mix(in srgb, ${accentColor.value} 15%, rgba(0, 0, 0, 0.85))`
}))

const ring1Style = computed(() => ({
  borderTopColor: accentColor.value,
  boxShadow: `0 0 20px color-mix(in srgb, ${accentColor.value} 30%, transparent)`
}))

const ring2Style = computed(() => ({
  borderTopColor: `color-mix(in srgb, ${accentColor.value} 80%, white)`,
  boxShadow: `0 0 15px color-mix(in srgb, ${accentColor.value} 25%, transparent)`
}))

const ring3Style = computed(() => ({
  borderTopColor: `color-mix(in srgb, ${accentColor.value} 60%, white)`,
  boxShadow: `0 0 10px color-mix(in srgb, ${accentColor.value} 20%, transparent)`
}))

const textStyle = computed(() => ({
  textShadow: `0 2px 4px rgba(0, 0, 0, 0.5), 0 0 20px color-mix(in srgb, ${accentColor.value} 40%, transparent)`
}))
</script>

<style lang="less" scoped>
@import '../styles/less/variables/colors.less';
@import '../styles/less/variables/layout.less';
@import '../styles/less/variables/typography.less';
@import '../styles/less/mixins/common.less';
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.loading-content {
  text-align: center;
  color: white;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.45s;
}

.ring-2 {
  animation-delay: -0.3s;
  width: 90%;
  height: 90%;
  top: 5%;
  left: 5%;
}

.ring-3 {
  animation-delay: -0.15s;
  width: 80%;
  height: 80%;
  top: 10%;
  left: 10%;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 18px;
  font-weight: 500;
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
</style>