<template>
  <div v-if="features.length > 0" class="features-toolbar">
    <button class="features-btn" @click="showDropdown = !showDropdown">
      <span class="features-icon">✅</span>
      <span class="features-title">{{ $t('header.features') }}</span>
      <span class="features-arrow" :class="{ rotated: showDropdown }">▼</span>
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

<style scoped>
.features-toolbar {
  position: relative;
}

.features-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid var(--border);
  color: var(--text);
  cursor: pointer;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
  outline: none;
}

.features-btn:hover {
  background: color-mix(in srgb, #22c55e 15%, transparent);
  border-color: #22c55e;
}

.features-icon {
  font-size: 14px;
}

.features-title {
  font-weight: 500;
}

.features-arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.features-arrow.rotated {
  transform: rotate(180deg);
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