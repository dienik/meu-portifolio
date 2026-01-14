<template>
  <div class="tooltip-wrapper" @mouseenter="show = true" @mouseleave="show = false">
    <slot />
    <span v-if="show" :class="['tooltip', placement]">{{ content }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  content: string
  placement?: 'top' | 'right' | 'bottom' | 'left'
}>()

const show = ref(false)
const placement = props.placement ?? 'top'
</script>

<style scoped>
.tooltip-wrapper {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  z-index: 100;
  opacity: 0;
  transform: translateY(0);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-wrapper:hover .tooltip {
  opacity: 1;
}

.tooltip.top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
}

.tooltip.right {
  top: 50%;
  left: 100%;
  transform: translateX(6px) translateY(-50%);
}

.tooltip.bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(6px);
}

.tooltip.left {
  top: 50%;
  right: 100%;
  transform: translateX(-6px) translateY(-50%);
}
</style>
