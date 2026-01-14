<template>
  <div class="page">
    <section class="hero">

      <!-- MENU -->
      <div class="menu">
        <button class="menu-btn" @click="menuOpen = !menuOpen">☰</button>
        <div v-if="menuOpen" class="dropdown">
<router-link to="/projects">Meus Projetos</router-link>
        </div>
      </div>

      <!-- TEXTO -->
      <div class="text">
        <h1>{{ displayedText }}</h1>

        <!-- ME CONHEÇA MELHOR -->
        <div class="about">
          <h2>Me conheça melhor</h2>
   <h2>Desenvolvedora Front-end com experiência sólida em Vue.js, JavaScript, TypeScript, HTML, CSS e integração com APIs REST. Resolvo problemas de usabilidade, performance e manutenção de código aplicando Clean Code, arquitetura modular e CI/CD. O que me diferencia é a combinação de visão técnica e foco no usuário, garantindo interfaces eficientes e escaláveis que entregam valor real para o negócio.</h2>
          <SocialCarousel />
        </div>
      </div>

      <!-- FOTO -->
      <div class="photo">
        <img src="/src/assets/profile.jpeg" alt="Dieni" />
      </div>

    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SocialCarousel from './SocialCarousel.vue'

const menuOpen = ref(false)

const fullText = "Olá, eu sou a Dieni :)\nDesenvolvedora Front End\nVue | Node.js | Angular"
const displayedText = ref("")
let index = 0

onMounted(() => {
  const interval = setInterval(() => {
    if (index < fullText.length) {
      displayedText.value += fullText[index]
      index++
    } else {
      clearInterval(interval)
    }
  }, 60)
})
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #675da3, #010d24);
}

/* HERO */
.hero {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem;
  box-sizing: border-box;
  position: relative;
}

/* MENU */
.menu {
  position: absolute;
  top: 2rem;
  right: 2rem;
  z-index: 20;
}
.dropdown a, .dropdown router-link {
  color: #e0f2ff;
  text-decoration: none;
}

.menu-btn {
  background: transparent;
  border: none;
  font-size: 2.5rem;
  cursor: pointer;
  color: #c7d2fe;
  text-shadow: 0 0 20px rgba(99,102,241,1);
}

/* DROPDOWN */
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
  font-size: 1.4rem;
  color: #e0f2ff;
  text-decoration: none;
  padding: 0.5rem 0;
  text-shadow: 0 0 12px rgba(96,165,250,0.9);
}

.dropdown a:hover {
  transform: translateX(6px);
}

/* TEXTO */
.text {
  max-width: 55%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

h1 {
  font-size: 3.2rem;
  font-family: 'Poppins', 'Inter', system-ui, sans-serif;
  color: #e0f2ff;
  line-height: 1.3;
  white-space: pre-wrap;
  text-shadow:
    0 0 8px rgba(96, 165, 250, 0.8),
    0 0 16px rgba(59, 130, 246, 0.9),
    0 0 32px rgba(37, 99, 235, 0.8);
}

/* ABOUT */
.about h2 {
  font-size: 2rem;
  color: #c7d2fe;
  margin-bottom: 1.5rem;
  text-shadow: 0 0 20px rgba(99,102,241,0.9);
}

/* FOTO */
.photo {
  width: 260px;
  height: 260px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(255,255,255,0.3);
  padding: 6px;
  box-shadow: 0 0 40px rgba(99,102,241,0.6);
}

.photo img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}
</style>
