<template>
  <label class="ds-toggle">
    <input
      type="checkbox"
      :checked="model"
      :disabled="disabled"
      @change="onChange"
    />
    <span class="track" />
    <span v-if="label" class="text">{{ label }}</span>
  </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>({ default: false })

withDefaults(
  defineProps<{
    label?: string
    disabled?: boolean
  }>(),
  {
    label: '',
    disabled: false,
  },
)

function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  model.value = input.checked
}
</script>

<style scoped>
.ds-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
  user-select: none;
  color: var(--ds-text);
}

.ds-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.track {
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: var(--ds-radius-full);
  background: #3f4766;
  transition: background 0.2s ease;
}

.track::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

input:checked + .track {
  background: var(--ds-primary-strong);
}

input:checked + .track::before {
  transform: translateX(20px);
}

input:focus-visible + .track {
  box-shadow: var(--ds-ring);
}

.text {
  font-size: var(--ds-fs-sm);
  font-weight: 600;
}
</style>
