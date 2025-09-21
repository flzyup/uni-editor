<template>
  <div v-if="todos.length > 0" class="todo-toolbar">
    <button class="todo-btn" :class="{ open: showDropdown }" @click="showDropdown = !showDropdown">
      <span class="todo-icon">📋</span>
      <span class="todo-title">{{ $t('header.todo') }}</span>
    </button>

    <div v-if="showDropdown" class="todo-dropdown">
      <div v-for="(todo, index) in todos" :key="index" class="todo-item">
        <span class="todo-checkbox" :class="{ completed: todo.completed }">
          {{ todo.completed ? '✓' : '○' }}
        </span>
        <span class="todo-text" :class="{ completed: todo.completed }">
          {{ todo.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { todos as readmeTodos } from 'virtual:readme-todos'

const todos = ref(readmeTodos || [])
const showDropdown = ref(false)
</script>

<style lang="less" scoped>
@import '../styles/less/variables/colors.less';
@import '../styles/less/variables/layout.less';
@import '../styles/less/variables/typography.less';
@import '../styles/less/mixins/common.less';
.todo-toolbar {
  position: relative;
}

.todo-btn {
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

.todo-icon {
  font-size: 14px;
}

.todo-title {
  font-weight: 600;
}

.todo-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 250px;
  max-width: 320px;
  z-index: 1000;
  font-size: 12px;
  padding: 8px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  line-height: 1.4;
  transition: background 0.2s ease;
}

.todo-item:hover {
  background: color-mix(in srgb, var(--accent) 8%, transparent);
}

.todo-checkbox {
  color: var(--accent);
  font-weight: bold;
  flex-shrink: 0;
  margin-top: 1px;
}

.todo-checkbox.completed {
  color: #22c55e;
}

.todo-text {
  color: var(--text);
  flex: 1;
}

.todo-text.completed {
  color: var(--muted);
  text-decoration: line-through;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .todo-dropdown {
    right: -10px;
    left: -10px;
    min-width: auto;
    max-width: none;
  }
}
</style>
