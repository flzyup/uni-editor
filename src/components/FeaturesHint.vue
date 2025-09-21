<template>
  <div v-if="features.length > 0" class="features-toolbar">
    <button class="features-btn" :class="{ open: showDropdown }" @click="showDropdown = !showDropdown">
      <span class="features-icon">✅</span>
      <span class="features-title">{{ $t('header.features') }}</span>
    </button>

    <div v-if="showDropdown" class="features-dropdown">
      <div v-for="(feature, index) in features" :key="index" class="feature-item">
        <span class="feature-checkbox completed">✓</span>
        <span class="feature-text">{{ feature.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { completedFeatures } from 'virtual:readme-todos'

const features = ref(completedFeatures || [])
const showDropdown = ref(false)
</script>

<style lang="less" scoped>
@import '../styles/less/variables/colors.less';
@import '../styles/less/variables/layout.less';
@import '../styles/less/variables/typography.less';
@import '../styles/less/mixins/common.less';
.features-toolbar {
  position: relative;
}

.features-btn {
  .button-base();
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 44px 8px 16px;
  min-height: 36px;
  font-size: @font-size-sm;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: color-mix(in srgb, var(--text) 94%, white);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 16px;
    top: 50%;
    width: 9px;
    height: 9px;
    box-sizing: border-box;
    transform: translateY(-50%) rotate(45deg);
    border-right: 2px solid color-mix(in srgb, var(--text) 78%, var(--accent) 22%);
    border-bottom: 2px solid color-mix(in srgb, var(--text) 78%, var(--accent) 22%);
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  &.open::after {
    transform: translateY(-50%) rotate(225deg);
    border-color: color-mix(in srgb, var(--accent) 70%, var(--text));
  }
}

.features-icon {
  font-size: 14px;
}

.features-title {
  font-weight: 600;
}

.features-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 280px;
  max-width: 350px;
  z-index: 1000;
  font-size: 12px;
  padding: 8px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  line-height: 1.4;
  transition: background 0.2s ease;
}

.feature-item:hover {
  background: color-mix(in srgb, #22c55e 8%, transparent);
}

.feature-checkbox {
  color: #22c55e;
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 1px;
}

.feature-text {
  color: var(--text);
  flex: 1;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .features-dropdown {
    right: -10px;
    left: -10px;
    min-width: auto;
    max-width: none;
  }
}
</style>
