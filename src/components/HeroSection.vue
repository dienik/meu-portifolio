<template>
  <section class="hero">
    <div class="copy">
      <p class="kicker">Portfólio · Front-end</p>
      <h1>
        <span>{{ displayedText }}</span>
        <span class="caret" aria-hidden="true">|</span>
      </h1>
      <p class="bio">
        Desenvolvedora Front-end com experiência em Vue.js, JavaScript, TypeScript, HTML, CSS
        e integração com APIs REST. Resolvo problemas de usabilidade, performance e manutenção
        aplicando Clean Code, arquitetura modular e CI/CD. O que me diferencia é a combinação
        de visão técnica e foco no usuário.
      </p>

      <div class="skills">
        <span v-for="skill in skills" :key="skill">{{ skill }}</span>
      </div>

      <div class="actions">
        <DsButton size="lg" @click="go('/projects')">Ver design system</DsButton>
        <DsButton size="lg" variant="ghost" @click="go('/dashboard')">Abrir dashboard</DsButton>
        <DsButton size="lg" variant="ghost" @click="go('/mapa')">Mapa de polígonos</DsButton>
        <DsButton size="lg" variant="ghost" @click="go('/chuva')">Chuva interpolada</DsButton>
      </div>

      <SocialCarousel />
    </div>

    <aside class="portrait">
      <div class="photo">
        <img v-if="photoOk" :src="photoSrc" alt="Dieni Kielermann" @error="photoOk = false" />
        <span v-else>DK</span>
      </div>
      <ul class="highlights">
        <li>
          <strong>Interfaces</strong>
          <span>Componentes reutilizáveis e acessíveis</span>
        </li>
        <li>
          <strong>Produto</strong>
          <span>Cadastro, mapas GeoJSON e chuva interpolada</span>
        </li>
        <li>
          <strong>Entrega</strong>
          <span>Vue, TypeScript e CI/CD</span>
        </li>
      </ul>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SocialCarousel from './SocialCarousel.vue'
import DsButton from './ui/DsButton.vue'

const router = useRouter()
const fullText = 'Olá, eu sou a Dieni :)\nDesenvolvedora Front End\nVue | Node.js | Angular'
const displayedText = ref('')
const photoOk = ref(false)
const photoSrc = `${import.meta.env.BASE_URL}profile.jpeg`
const skills = ['Vue.js', 'TypeScript', 'Node.js', 'Angular', 'HTML/CSS', 'REST APIs', 'CI/CD']
let index = 0
let timer: number | undefined

onMounted(() => {
  const img = new Image()
  img.onload = () => {
    photoOk.value = true
  }
  img.src = photoSrc

  timer = window.setInterval(() => {
    if (index < fullText.length) {
      displayedText.value += fullText[index]
      index += 1
    } else if (timer) {
      window.clearInterval(timer)
    }
  }, 42)
})

onUnmounted(() => {
  if (timer) window.clearInterval(timer)
})

function go(path: string) {
  void router.push(path)
}
</script>

<style scoped>
.hero {
  width: min(1180px, calc(100% - 2rem));
  margin: 0 auto;
  min-height: calc(100vh - var(--ds-nav-h));
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 3rem;
  align-items: center;
  padding: 2.5rem 0 4rem;
}

.kicker {
  margin: 0 0 0.8rem;
  color: var(--ds-accent);
  font-size: var(--ds-fs-xs);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.25;
  white-space: pre-wrap;
  text-shadow: 0 0 24px rgba(96, 165, 250, 0.35);
}

.caret {
  color: var(--ds-accent);
  animation: blink 1s step-end infinite;
}

.bio {
  margin: 1.4rem 0 0;
  max-width: 62ch;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-lg);
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1.4rem;
}

.skills span {
  padding: 0.35rem 0.7rem;
  border-radius: var(--ds-radius-full);
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
  font-size: var(--ds-fs-xs);
  font-weight: 700;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.6rem;
}

.portrait {
  display: grid;
  justify-items: center;
  gap: 1.4rem;
}

.photo {
  width: 240px;
  height: 240px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--ds-primary), var(--ds-accent));
  box-shadow: var(--ds-shadow-glow);
  font-size: 4rem;
  font-weight: 800;
  color: #071018;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.highlights {
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.75rem;
}

.highlights li {
  padding: 0.9rem 1rem;
  border-radius: var(--ds-radius-md);
  border: 1px solid var(--ds-border);
  background: var(--ds-surface);
}

.highlights strong,
.highlights span {
  display: block;
}

.highlights span {
  margin-top: 0.2rem;
  color: var(--ds-text-muted);
  font-size: var(--ds-fs-sm);
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 1.5rem;
  }

  .portrait {
    order: -1;
  }

  .photo {
    width: 180px;
    height: 180px;
  }
}
</style>
