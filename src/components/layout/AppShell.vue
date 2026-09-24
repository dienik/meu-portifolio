<template>
  <div class="shell">
    <header class="nav">
      <router-link to="/" class="brand">
        <span class="mark">DK</span>
        <span class="name">Dieni Kielermann</span>
      </router-link>

      <button class="burger" type="button" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
        {{ menuOpen ? '✕' : '☰' }}
      </button>

      <nav :class="{ open: menuOpen }">
        <router-link to="/" :class="{ 'is-active': route.path === '/' }" @click="menuOpen = false">
          Início
        </router-link>
        <router-link to="/projects" active-class="is-active" @click="menuOpen = false">
          Design System
        </router-link>
        <router-link to="/dashboard" active-class="is-active" @click="menuOpen = false">
          Dashboard
        </router-link>
        <router-link to="/mapa" active-class="is-active" @click="menuOpen = false">
          Mapa
        </router-link>
        <router-link to="/comparar" active-class="is-active" @click="menuOpen = false">
          Comparar
        </router-link>
        <router-link to="/chuva" active-class="is-active" @click="menuOpen = false">
          Chuva
        </router-link>
        <router-link to="/rag" active-class="is-active" @click="menuOpen = false">
          RAG
        </router-link>
      </nav>
    </header>

    <main class="main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)
</script>

<style scoped>
.shell {
  min-height: 100%;
}

.nav {
  position: sticky;
  top: 0;
  z-index: 40;
  height: var(--ds-nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--ds-border);
  background: rgba(5, 8, 22, 0.78);
  backdrop-filter: blur(18px);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--ds-text);
  text-decoration: none;
  font-weight: 800;
}

.mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--ds-primary), var(--ds-accent));
  color: #061018;
  font-size: 0.85rem;
}

.nav nav {
  display: flex;
  gap: 0.4rem;
}

.nav nav a {
  padding: 0.55rem 0.9rem;
  border-radius: var(--ds-radius-full);
  color: var(--ds-text-muted);
  text-decoration: none;
  font-weight: 700;
  font-size: var(--ds-fs-sm);
}

.nav nav a.is-active,
.nav nav a:hover {
  color: var(--ds-text);
  background: var(--ds-primary-soft);
}

.burger {
  display: none;
  border: 0;
  background: transparent;
  color: var(--ds-text);
  font-size: 1.6rem;
  cursor: pointer;
}

@media (max-width: 760px) {
  .name {
    display: none;
  }

  .burger {
    display: block;
  }

  .nav nav {
    display: none;
    position: absolute;
    top: var(--ds-nav-h);
    right: 0.75rem;
    left: 0.75rem;
    flex-direction: column;
    padding: 0.75rem;
    border-radius: var(--ds-radius-lg);
    border: 1px solid var(--ds-border);
    background: #10162d;
  }

  .nav nav.open {
    display: flex;
  }
}
</style>
