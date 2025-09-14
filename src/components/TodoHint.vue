<template>
  <div v-if="todos.length > 0" class="todo-toolbar">
    <button class="todo-btn" @click="showDropdown = !showDropdown">
      <span class="todo-icon">📋</span>
      <span class="todo-title">待完善功能</span>
      <span class="todo-arrow" :class="{ rotated: showDropdown }">▼</span>
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

<style scoped>
.todo-toolbar {
  position: relative;
}

.todo-btn {
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

.todo-btn:hover {
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  border-color: var(--accent);
}

.todo-icon {
  font-size: 14px;
}

.todo-title {
  font-weight: 500;
}

.todo-arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.todo-arrow.rotated {
  transform: rotate(180deg);
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