<template>
  <div class="field">

    <!-- Select simples com search -->
    <label>Escolha uma tecnologia</label>
    <div class="custom-select" v-click-outside="() => openSingle = false">
      <input
        type="text"
        v-model="searchSingle"
        placeholder="Buscar..."
        @focus="openSingle = true"
      />
      <ul v-if="openSingle" class="options">
        <li
          v-for="tech in filteredSingle"
          :key="tech"
          @click="selectSingle(tech)"
          :class="{ selected: tech === selectedSingle }"
        >
          {{ tech }}
        </li>
      </ul>
    </div>
    <div v-if="selectedSingle" class="counter">
      Selecionado: <strong>{{ selectedSingle }}</strong>
    </div>

    <hr />

    <!-- Multiselect com search e chips -->
    <label>Seleção múltipla</label>
    <div class="custom-select" v-click-outside="() => openMulti = false">
      <input
        type="text"
        v-model="searchMulti"
        placeholder="Buscar..."
        @focus="openMulti = true"
      />
      <ul v-if="openMulti" class="options">
        <li
          v-for="tech in filteredMulti"
          :key="tech"
          @click="toggleMulti(tech)"
        >
          {{ tech }}
        </li>
      </ul>
    </div>

    <!-- Chips -->
    <div class="chips" v-if="selectedMulti.length">
      <span v-for="tech in selectedMulti" :key="tech" class="chip">
        {{ tech }}
        <button @click="removeMulti(tech)">×</button>
      </span>
      <button class="clear-btn" @click="selectedMulti = []">Limpar</button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type {Directive} from 'vue'

const technologies = ['Vue', 'React', 'Angular', 'Svelte', 'SolidJS']

// Single select
const searchSingle = ref('')
const selectedSingle = ref<string | null>(null)
const openSingle = ref(false)
const filteredSingle = computed(() =>
  technologies.filter(t =>
    t.toLowerCase().includes(searchSingle.value.toLowerCase())
  )
)
function selectSingle(tech: string) {
  selectedSingle.value = tech
  searchSingle.value = tech
  openSingle.value = false
}

// Multiselect
const searchMulti = ref('')
const selectedMulti = ref<string[]>([])
const openMulti = ref(false)
const filteredMulti = computed(() =>
  technologies.filter(t =>
    t.toLowerCase().includes(searchMulti.value.toLowerCase()) &&
    !selectedMulti.value.includes(t)
  )
)
function toggleMulti(tech: string) {
  selectedMulti.value.push(tech)
  searchMulti.value = ''
}
function removeMulti(tech: string) {
  selectedMulti.value = selectedMulti.value.filter(t => t !== tech)
}

// Diretiva click outside sem erros de TS
type HTMLElementWithHandler = HTMLElement & { __clickOutsideHandler__?: (event: Event) => void }

const clickOutside: Directive<HTMLElementWithHandler> = {
  beforeMount(el, binding) {
    el.__clickOutsideHandler__ = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.__clickOutsideHandler__)
  },
  unmounted(el) {
    if (el.__clickOutsideHandler__) {
      document.removeEventListener('click', el.__clickOutsideHandler__)
      delete el.__clickOutsideHandler__
    }
  },
}

defineExpose({ clickOutside })
</script>

<style scoped>
.field {
  width: 100%;
  max-width: 400px;
  font-family: sans-serif;
}

label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #4b5563;
  font-weight: 600;
}

.custom-select {
  position: relative;
  margin-bottom: 0.5rem;
}

.custom-select input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 0.9rem;
  cursor: pointer;
  background: #fff;
}

.options {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  margin-top: 0.25rem;
  z-index: 10;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  list-style: none;
  padding: 0;
}

.options li {
  padding: 0.5rem;
  cursor: pointer;
  transition: 0.2s;
}

.options li:hover {
  background: #025f4b;
  color: #eef3f3;
  border-radius: 6px;
}

.options li.selected {
  font-weight: bold;
  background: #e0f2fe;
  border-radius: 6px;
  color: #045753;
}

.counter {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #1f2937;
}

hr {
  margin: 1rem 0;
  border: 0.5px solid #e5e7eb;
}

/* Chips */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.chip {
  display: flex;
  align-items: center;
  background: #3b82f6;
  color: #fff;
  padding: 0.25rem 0.6rem;
  border-radius: 16px;
  font-size: 0.85rem;
}

.chip button {
  background: transparent;
  border: none;
  color: #fff;
  margin-left: 0.25rem;
  cursor: pointer;
  font-weight: bold;
}

.clear-btn {
  padding: 0.25rem 0.6rem;
  background: #ef4444;
  color: #fff;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
}
</style>