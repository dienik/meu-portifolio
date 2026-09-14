<template>
  <div class="playground-ui">

    <div class="tooltip-demo">
      <DsTooltip content="Essa é uma dica de tooltip!" placement="top">
        <button class="tooltip-btn">Passe o mouse aqui</button>
      </DsTooltip>
    </div>

    <div class="tooltip-demo">
      <DsTooltip content="Tooltip à direita" placement="right">
        <button class="tooltip-btn">Hover direita</button>
      </DsTooltip>
    </div>

    <div class="tooltip-demo">
      <DsTooltip content="Tooltip abaixo" placement="bottom">
        <button class="tooltip-btn">Hover abaixo</button>
      </DsTooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import DsTooltip from '../ui/DsTooltip.vue'
</script>

<style scoped>
.playground-ui {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
}

.tooltip-btn {
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  background: #3b82f6;
  color: #fff;
  cursor: pointer;
}
</style>
