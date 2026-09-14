<template>
  <div class="ds-field" ref="root">
    <span v-if="label" class="label">{{ label }}</span>
    <button class="control" type="button" :class="{ open, invalid: Boolean(error) }" @click="open = !open">
      <span class="value">{{ displayValue }}</span>
      <span class="chevron">▾</span>
    </button>
    <ul v-if="open" class="menu">
      <li>
        <input
          v-model="query"
          class="search"
          type="search"
          placeholder="Buscar..."
          @click.stop
        />
      </li>
      <li v-if="!filtered.length" class="empty">Nenhuma opção</li>
      <li
        v-for="option in filtered"
        :key="option.value"
        :class="{ selected: isSelected(option.value) }"
        @click="choose(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
    <div v-if="multiple && model.length" class="chips">
      <span v-for="value in model" :key="value" class="chip">
        {{ value }}
        <button type="button" @click.stop="remove(value)">×</button>
      </span>
    </div>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClickOutside } from '../../composables/useClickOutside'

export interface DsOption {
  label: string
  value: string
}

const model = defineModel<string | string[]>({ default: '' })
const props = withDefaults(
  defineProps<{
    label?: string
    options: DsOption[]
    placeholder?: string
    multiple?: boolean
    error?: string
  }>(),
  {
    label: '',
    placeholder: 'Selecione',
    multiple: false,
    error: '',
  },
)

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const query = ref('')

useClickOutside(root, () => {
  open.value = false
})

const filtered = computed(() =>
  props.options.filter((option) =>
    option.label.toLowerCase().includes(query.value.toLowerCase()),
  ),
)

const displayValue = computed(() => {
  if (props.multiple) {
    const selected = Array.isArray(model.value) ? model.value : []
    return selected.length ? `${selected.length} selecionado(s)` : props.placeholder
  }
  return (model.value as string) || props.placeholder
})

function isSelected(value: string) {
  if (props.multiple) return Array.isArray(model.value) && model.value.includes(value)
  return model.value === value
}

function choose(value: string) {
  if (props.multiple) {
    const current = Array.isArray(model.value) ? [...model.value] : []
    model.value = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value]
    query.value = ''
    return
  }
  model.value = value
  open.value = false
}

function remove(value: string) {
  if (!Array.isArray(model.value)) return
  model.value = model.value.filter((item) => item !== value)
}
</script>

<style scoped>
.ds-field {
  position: relative;
  display: grid;
  gap: 0.4rem;
}

.label {
  font-size: var(--ds-fs-sm);
  font-weight: 700;
}

.control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
  padding: 0.65rem 0.8rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: rgba(5, 8, 22, 0.45);
  color: var(--ds-text);
  font: inherit;
  cursor: pointer;
}

.control.open,
.control:focus-visible {
  outline: none;
  box-shadow: var(--ds-ring);
  border-color: var(--ds-primary);
}

.invalid {
  border-color: var(--ds-danger);
}

.value {
  color: var(--ds-text-muted);
}

.menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 12;
  margin: 0;
  padding: 0.4rem;
  list-style: none;
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  background: #10162d;
  box-shadow: var(--ds-shadow);
  max-height: 220px;
  overflow: auto;
}

.menu li {
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
}

.menu li:hover {
  background: var(--ds-primary-soft);
}

.selected {
  background: var(--ds-primary-soft);
  color: var(--ds-primary);
  font-weight: 700;
}

.search {
  width: 100%;
  margin-bottom: 0.3rem;
  padding: 0.5rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--ds-border);
  background: transparent;
  color: inherit;
  font: inherit;
}

.empty {
  color: var(--ds-text-muted);
  cursor: default;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.55rem;
  border-radius: var(--ds-radius-full);
  background: var(--ds-primary-soft);
  color: var(--ds-primary);
  font-size: var(--ds-fs-xs);
  font-weight: 700;
}

.chip button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.error {
  color: var(--ds-danger);
  font-size: var(--ds-fs-xs);
}
</style>
