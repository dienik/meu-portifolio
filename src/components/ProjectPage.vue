<template>
  <section class="page">
    <header class="intro">
      <div>
        <p class="kicker">Sistema de interface</p>
        <h1>Design System</h1>
        <p>
          Biblioteca viva dos componentes do portfólio. Cada card abre o playground completo;
          o dashboard de cadastro mostra os mesmos blocos em um fluxo real.
        </p>
      </div>
      <DsButton size="lg" @click="goDashboard">Ver dashboard</DsButton>
    </header>

    <TokenPreview />

    <div class="grid">
      <DsCard title="Tabela" hoverable @open="open('table')">
        <div class="preview"><TableDemo /></div>
      </DsCard>

      <DsCard title="Lista" hoverable @open="open('list')">
        <div class="preview"><ListDemo /></div>
      </DsCard>

      <DsCard title="Seletor" hoverable @open="open('select')">
        <div class="preview"><SelectorDemo /></div>
      </DsCard>

      <DsCard title="Resize Box" hoverable @open="open('resize')">
        <div class="preview"><ResizeBoxDemo /></div>
      </DsCard>

      <DsCard title="Botão" hoverable @open="open('button')">
        <div class="preview"><PlaygroundButtonDemo /></div>
      </DsCard>

      <DsCard title="Toggle" hoverable @open="open('toggle')">
        <div class="preview"><PlaygroundToggleDemo /></div>
      </DsCard>

      <DsCard title="Badge" hoverable @open="open('badge')">
        <div class="preview"><PlaygroundBadgeDemo /></div>
      </DsCard>

      <DsCard title="Accordion" hoverable @open="open('accordion')">
        <div class="preview"><PlaygroundAccordionDemo /></div>
      </DsCard>

      <DsCard title="Tooltip" hoverable @open="open('tooltip')">
        <div class="preview"><PlaygroundTooltipDemo /></div>
      </DsCard>
    </div>

    <DsAccordion title="Como usar este sistema">
      <p>
        Tokens em <code>src/styles/tokens.css</code>, componentes em
        <code>src/components/ui</code> e o caso de uso em
        <code>/dashboard</code>. O playground acima documenta estados, variantes e interações.
      </p>
    </DsAccordion>

    <DsModal v-if="active" size="lg" :title="titles[active]" @close="active = null">
      <component :is="components[active]" />
    </DsModal>
  </section>
</template>

<script setup lang="ts">
import { ref, type Component } from 'vue'
import { useRouter } from 'vue-router'
import DsCard from './ui/DsCard.vue'
import DsModal from './ui/DsModal.vue'
import DsButton from './ui/DsButton.vue'
import DsAccordion from './ui/DsAccordion.vue'
import TokenPreview from './design-system/TokenPreview.vue'
import TableDemo from './playground/TableDemo.vue'
import ListDemo from './playground/ListDemo.vue'
import SelectorDemo from './playground/SelectorDemo.vue'
import ResizeBoxDemo from './playground/ResizeBoxDemo.vue'
import PlaygroundButtonDemo from './playground/PlaygroundButtonDemo.vue'
import PlaygroundToggleDemo from './playground/PlaygroundToggleDemo.vue'
import PlaygroundBadgeDemo from './playground/PlaygroundBadgeDemo.vue'
import PlaygroundAccordionDemo from './playground/PlaygroundAccordionDemo.vue'
import PlaygroundTooltipDemo from './playground/PlaygroundTooltipDemo.vue'

const router = useRouter()
const active = ref<string | null>(null)

const components: Record<string, Component> = {
  table: TableDemo,
  list: ListDemo,
  select: SelectorDemo,
  resize: ResizeBoxDemo,
  button: PlaygroundButtonDemo,
  toggle: PlaygroundToggleDemo,
  badge: PlaygroundBadgeDemo,
  accordion: PlaygroundAccordionDemo,
  tooltip: PlaygroundTooltipDemo,
}

const titles: Record<string, string> = {
  table: 'Tabela',
  list: 'Lista',
  select: 'Seletor',
  resize: 'Resize Box',
  button: 'Botão',
  toggle: 'Toggle',
  badge: 'Badge',
  accordion: 'Accordion',
  tooltip: 'Tooltip',
}

function open(name: string) {
  active.value = name
}

function goDashboard() {
  void router.push('/dashboard')
}
</script>

<style scoped>
.page {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  padding: 2rem 0 4rem;
}

.intro {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.kicker {
  margin: 0 0 0.4rem;
  color: var(--ds-accent);
  font-size: var(--ds-fs-xs);
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: var(--ds-fs-3xl);
}

.intro p {
  max-width: 60ch;
  margin: 0.7rem 0 0;
  color: var(--ds-text-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.preview {
  height: 170px;
  overflow: hidden;
  margin-top: 0.8rem;
  pointer-events: none;
}

@media (max-width: 720px) {
  .intro {
    display: grid;
  }
}
</style>
