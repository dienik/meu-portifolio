<template>
  <section class="tokens">
    <div>
      <p class="kicker">Fundação</p>
      <h2>Tokens do sistema</h2>
      <p>Cor, tipo e raio compartilham a mesma linguagem visual em todas as telas.</p>
    </div>

    <div class="swatches">
      <div v-for="color in colors" :key="color.name" class="swatch">
        <span class="chip" :style="{ background: color.value }" />
        <strong>{{ color.name }}</strong>
        <code>{{ color.value }}</code>
      </div>
    </div>

    <div class="type-row">
      <p class="display">Plus Jakarta Sans</p>
      <p class="mono">IBM Plex Mono · 12 / 8 / 20</p>
    </div>
  </section>
</template>

<script setup lang="ts">
const colors = [
  { name: 'Primary', value: '#818cf8' },
  { name: 'Accent', value: '#22d3ee' },
  { name: 'Success', value: '#34d399' },
  { name: 'Warning', value: '#fbbf24' },
  { name: 'Danger', value: '#f87171' },
  { name: 'Surface', value: '#151b36' },
]
</script>

<style scoped>
.tokens {
  display: grid;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.kicker {
  margin: 0 0 0.4rem;
  color: var(--ds-accent);
  font-size: var(--ds-fs-xs);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
}

p {
  margin: 0.4rem 0 0;
  color: var(--ds-text-muted);
}

.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
}

.swatch {
  padding: 0.9rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
}

.chip {
  display: block;
  height: 42px;
  border-radius: 10px;
  margin-bottom: 0.7rem;
}

.swatch strong,
.swatch code {
  display: block;
}

.swatch code {
  margin-top: 0.2rem;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-xs);
}

.type-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.display {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--ds-text);
}

.mono {
  font-family: var(--ds-mono);
}
</style>
