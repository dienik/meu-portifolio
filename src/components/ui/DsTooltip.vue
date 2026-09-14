<template>
  <span class="wrap">
    <slot />
    <span class="tip" :class="placement">{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    content?: string
    text?: string
    placement?: 'top' | 'right' | 'bottom' | 'left'
  }>(),
  {
    content: '',
    text: '',
    placement: 'top',
  },
)

const label = computed(() => props.content || props.text)
</script>

<style scoped>
.wrap {
  position: relative;
  display: inline-flex;
}

.tip {
  position: absolute;
  z-index: 20;
  padding: 0.4rem 0.65rem;
  border-radius: var(--ds-radius-sm);
  background: #0b1024;
  color: #fff;
  font-size: var(--ds-fs-xs);
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  box-shadow: var(--ds-shadow);
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.wrap:hover .tip,
.wrap:focus-within .tip {
  opacity: 1;
}

.top {
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.bottom {
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.right {
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}

.left {
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
}
</style>
