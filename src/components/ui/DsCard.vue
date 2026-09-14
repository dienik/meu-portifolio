<template>
  <article class="ds-card" :class="{ hoverable }" @click="$emit('open')">
    <header v-if="title || subtitle || $slots.header" class="head">
      <slot name="header">
        <div>
          <h3 v-if="title">{{ title }}</h3>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
      </slot>
    </header>
    <div class="body">
      <slot />
    </div>
    <footer v-if="$slots.footer" class="foot">
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    hoverable?: boolean
  }>(),
  {
    title: '',
    subtitle: '',
    hoverable: false,
  },
)

defineEmits<{
  open: []
}>()
</script>

<style scoped>
.ds-card {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  padding: 1.15rem;
  color: var(--ds-text);
  box-shadow: var(--ds-shadow);
  backdrop-filter: blur(16px);
}

.hoverable {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.hoverable:hover {
  transform: translateY(-6px);
  border-color: var(--ds-border-strong);
  box-shadow: var(--ds-shadow-glow);
}

.head h3 {
  margin: 0;
  font-size: var(--ds-fs-lg);
}

.head p {
  margin: 0.3rem 0 0;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-sm);
}

.body {
  min-height: 0;
}

.foot {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
