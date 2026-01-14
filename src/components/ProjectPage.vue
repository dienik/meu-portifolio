<template>
  <div class="page">

    <!-- MENU -->
    <div class="menu">
      <button class="menu-btn" @click="menuOpen = !menuOpen">☰</button>
      <div v-if="menuOpen" class="dropdown">
        <router-link to="/">Início</router-link>
      </div>
    </div>

    <!-- CONTEÚDO -->
    <section class="projects">
      <h1>Meus Projetos</h1>

      <div class="grid">
        <DsCard title="Tabela" @open="open('table')">
          <TableDemo />
        </DsCard>

        <DsCard title="Lista" @open="open('list')">
          <ListDemo />
        </DsCard>

        <DsCard title="Seletor" @open="open('select')">
          <SelectorDemo />
        </DsCard>

        <DsCard title="Resize Box" @open="open('resize')">
          <ResizeBoxDemo />
        </DsCard>

 <DsCard title="Botão"  @open="open('button')">
          <DsButton />
        </DsCard>  

<DsCard title="Toggle" @open="open('toggle')">
  <DsToggle :model-value="true" />
</DsCard>

<DsCard title="Badge" @open="open('badge')">
  <DsBadge label="Novo" type="primary" />
</DsCard>

<DsCard title="Accordion" @open="open('accordion')">
  <DsAccordion title="Clique para Expandir">
    <p>Conteúdo dentro do accordion</p>
  </DsAccordion>
</DsCard>

<DsCard title="Tooltip" @open="open('tooltip')">
  <DsTooltip text="Esta é a dica">
    <button>Hover Aqui</button>
  </DsTooltip>
</DsCard>
    </div>

      <router-link to="/" class="back">← Voltar</router-link>
    </section>

    <!-- MODAL -->
    <DsModal v-if="active" @close="active = null">
      <component :is="components[active]" />
    </DsModal>

  </div>
</template>



<script setup lang="ts">
import { ref } from 'vue'

import DsCard from '../components/ui/DsCard.vue'
import DsModal from '../components/ui/DsModal.vue'

import TableDemo from '../components/playground/TableDemo.vue'
import ListDemo from '../components/playground/ListDemo.vue'
import SelectorDemo from '../components/playground/SelectorDemo.vue'
import ResizeBoxDemo from '../components/playground/ResizeBoxDemo.vue'
import PlaygroundPhotoGallery from './playground/PlaygroundPhotoGallery.vue'
import DsButton from '../components/playground/PlaygroundButtonDemo.vue'
import DsToggle from '../components/playground/PlaygroundToggleDemo.vue'
import DsBadge from '../components/playground/PlaygroundBadgeDemo.vue'
import DsAccordion from '../components/playground/PlaygroundAccordionDemo.vue'
import DsTooltip from '../components/playground/PlaygroundTooltipDemo.vue'
const active = ref<string | null>(null)

const components: Record<string, any> = {
  table: TableDemo,
  list: ListDemo,
  select: SelectorDemo,
  resize: ResizeBoxDemo,
  playgroundPhotoGallery: PlaygroundPhotoGallery,
     button: DsButton,
     toggle: DsToggle,
     badge: DsBadge,
     accordion: DsAccordion,
     tooltip: DsTooltip
}

function open(name: string) {
  active.value = name
}
const menuOpen = ref(false)

</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #675da3, #010d24);
  position: relative;
}

/* MENU */
.menu {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 20;
}

.menu-btn {
  background: transparent;
  border: none;
  font-size: 2.5rem;
  cursor: pointer;
  color: #c7d2fe;
  text-shadow: 0 0 20px rgba(99,102,241,1);
}

.dropdown {
  position: absolute;
  top: 3.5rem;
  right: 0;
  background: rgba(10,10,40,0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem 1.5rem;
  box-shadow: 0 0 40px rgba(99,102,241,0.6);
}

.dropdown a {
  display: block;
  font-size: 1.2rem;
  color: #e0f2ff;
  text-decoration: none;
  padding: 0.5rem 0;
  text-shadow: 0 0 12px rgba(96,165,250,0.9);
}

/* CONTEÚDO */
.projects {
  padding: 6rem 4rem 4rem;
}

h1 {
  text-align: center;
  font-size: 3rem;
  margin-bottom: 4rem;
  color: #e0f2ff;
  text-shadow: 0 0 20px rgba(99,102,241,0.9);
}

/* GRID DE COMPONENTES */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
}

/* BOTÃO VOLTAR */
.back {
  display: block;
  margin: 4rem auto 0;
  width: fit-content;
  color: #c7d2fe;
  text-decoration: none;
  font-size: 1.2rem;
  text-shadow: 0 0 12px rgba(99,102,241,0.8);
}
</style>

