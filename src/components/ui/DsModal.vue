<template>
  <Teleport to="body">
    <div class="overlay" @click.self="close">
      <section class="modal" :class="size" role="dialog" aria-modal="true">
        <header class="head">
          <slot name="header">
            <h2 v-if="title">{{ title }}</h2>
            <span v-else />
          </slot>
          <button class="close" type="button" aria-label="Fechar" @click="close">×</button>
        </header>
        <div class="body">
          <slot />
        </div>
        <footer v-if="$slots.footer" class="foot">
          <slot name="footer" />
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

withDefaults(
  defineProps<{
    title?: string
    size?: 'md' | 'lg'
  }>(),
  {
    title: '',
    size: 'md',
  },
)

const emit = defineEmits<{
  close: []
}>()

function close() {
  emit('close')
}

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(8px);
}

.modal {
  width: min(720px, 100%);
  max-height: min(88vh, 900px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #12182f;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-lg);
  box-shadow: var(--ds-shadow);
  color: var(--ds-text);
}

.modal.lg {
  width: min(980px, 100%);
}

.head,
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.head {
  border-bottom: 1px solid var(--ds-border);
}

.foot {
  border-top: 1px solid var(--ds-border);
  justify-content: flex-end;
}

.head h2 {
  margin: 0;
  font-size: var(--ds-fs-xl);
}

.body {
  padding: 1.25rem;
  overflow: auto;
  min-height: 0;
}

.close {
  border: 0;
  background: transparent;
  color: var(--ds-text-muted);
  font-size: 1.8rem;
  line-height: 1;
  cursor: pointer;
}

.close:hover {
  color: var(--ds-text);
}
</style>
