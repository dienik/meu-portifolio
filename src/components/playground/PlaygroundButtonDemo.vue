<template>
  <div class="playground-buttons">


    <div class="button-row">
      <DsButton
        variant="primary"
        @click="handleClick('primary', $event)"
        :disabled="disabled.primary"
        :loading="loading.primary"
      >
        Primary
      </DsButton>
      <input type="checkbox" v-model="disabled.primary" /> Disabled
      <input type="checkbox" v-model="loading.primary" /> Loading
    </div>

    <div class="button-row">
      <DsButton
        variant="secondary"
        @click="handleClick('secondary', $event)"
        :disabled="disabled.secondary"
        :loading="loading.secondary"
      >
        Secondary
      </DsButton>
      <input type="checkbox" v-model="disabled.secondary" /> Disabled
      <input type="checkbox" v-model="loading.secondary" /> Loading
    </div>

    <div class="button-row">
      <DsButton
        variant="danger"
        @click="handleClick('danger', $event)"
        :disabled="disabled.danger"
        :loading="loading.danger"
      >
        Danger
      </DsButton>
      <input type="checkbox" v-model="disabled.danger" /> Disabled
      <input type="checkbox" v-model="loading.danger" /> Loading
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import DsButton from './DsButton.vue'

interface CounterMap {
  primary: number
  secondary: number
  danger: number
}

interface BoolMap {
  primary: boolean
  secondary: boolean
  danger: boolean
}

// Contadores
const counters = reactive<CounterMap>({
  primary: 0,
  secondary: 0,
  danger: 0
})

// Estado de disabled
const disabled = reactive<BoolMap>({
  primary: false,
  secondary: false,
  danger: false
})

// Estado de loading
const loading = reactive<BoolMap>({
  primary: false,
  secondary: false,
  danger: false
})

// Função wrapper para incrementar contador
function handleClick(type: keyof CounterMap, e: MouseEvent) {
  e.stopPropagation() // evita propagação
  if (!disabled[type] && !loading[type]) {
    counters[type]++
  }
}
</script>

<style scoped>
.playground-buttons {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: sans-serif;
}

h2 {
  color: #0f172a;
  margin-bottom: 1rem;
}

.button-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.counter {
  min-width: 80px;
  font-weight: bold;
  color: #111827;
}

input[type="checkbox"] {
  margin-left: 0.5rem;
}
</style>
