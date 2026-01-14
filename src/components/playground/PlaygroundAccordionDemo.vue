<template>
  <div class="playground-ui">

    <DsAccordion>
      <template #title>Seção 1</template>
      <template #content>
        <p>Conteúdo da primeira seção. Pode ser qualquer HTML ou componente.</p>
      </template>
    </DsAccordion>

    <DsAccordion>
      <template #title>Seção 2</template>
      <template #content>
        <p>Conteúdo da segunda seção. Aqui você pode demonstrar mais conteúdo.</p>
      </template>
    </DsAccordion>

    <DsAccordion>
      <template #title>Seção 3</template>
      <template #content>
        <p>Terceira seção com conteúdo dinâmico ou explicativo.</p>
      </template>
    </DsAccordion>
  </div>
</template>

<script setup lang="ts">
import DsAccordion from './DsAccordion.vue'
</script>

<style scoped>
.playground-ui {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 600px;
  margin: auto;
  padding: 2rem;
  font-family: sans-serif;
}
</style>
