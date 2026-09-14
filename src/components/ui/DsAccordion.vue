<template>
  <div class="ds-accordion">
    <button class="header" type="button" :aria-expanded="open" @click="open = !open">
      <span><slot name="title">{{ title }}</slot></span>
      <span class="chevron">{{ open ? '▴' : '▾' }}</span>
    </button>
    <div v-if="open" class="body">
      <slot name="content">
        <slot />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    title?: string
  }>(),
  { title: '' },
)

const open = ref(false)
</script>

<style scoped>
.ds-accordion {
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  overflow: hidden;
  background: var(--ds-surface);
}

.header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1rem;
  border: 0;
  background: transparent;
  color: var(--ds-text);
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.header:hover {
  background: var(--ds-surface-strong);
}

.body {
  padding: 0 1rem 1rem;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-sm);
  line-height: 1.6;
  border-top: 1px solid var(--ds-border);
}

.chevron {
  color: var(--ds-primary);
}
</style>
