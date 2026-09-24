<template>
  <section class="stage">
    <div class="orb-wrap" :class="{ thinking }">
      <div class="orb" aria-hidden="true">
        <span class="halo" />
        <span class="track t1" />
        <span class="track t2" />
        <span class="track t3" />
        <span class="arc a1" />
        <span class="arc a2" />
        <span class="arc a3" />
        <span class="core">
          <span class="core-glow" />
          <span class="core-dot" />
        </span>
      </div>
      <p class="orb-status">{{ orbStatus }}</p>
    </div>

    <div class="chat">
      <header class="chat-head">
        <p class="kicker">Núcleo · portfólio</p>
        <h1>Console RAG</h1>
      </header>

      <div class="thread" ref="threadEl">
        <article v-for="item in messages" :key="item.id" class="bubble" :class="item.role">
          <strong>{{ item.role === 'user' ? 'Você' : 'Núcleo' }}</strong>
          <p>{{ item.content }}</p>
          <div v-if="item.hits?.length" class="hits">
            <span v-for="(hit, index) in item.hits" :key="hit.id">[{{ index + 1 }}] {{ hit.title }}</span>
          </div>
        </article>
      </div>

      <div class="chips">
        <button v-for="item in examples" :key="item" type="button" :disabled="thinking" @click="ask(item)">
          {{ item }}
        </button>
      </div>

      <form class="composer" @submit.prevent="submit">
        <input
          v-model="draft"
          class="line"
          type="text"
          :disabled="thinking"
          placeholder="Pergunte sobre design system, dashboard, layers, LinkedIn…"
        />
        <button class="send" type="submit" :disabled="thinking || !draft.trim()">Enviar</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { detectAction, runAction } from '../../lib/agent/actions'
import { composeAnswer, isRelevant } from '../../lib/agent/answer'
import { retrieve } from '../../lib/agent/retrieve'
import type { RetrievalHit } from '../../lib/agent/types'

type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  hits?: RetrievalHit[]
}

const draft = ref('')
const thinking = ref(false)
const threadEl = ref<HTMLElement | null>(null)
const messages = ref<ChatMessage[]>([
  {
    id: 'hello',
    role: 'assistant',
    content:
      'Olá, esse RAG responde perguntas sobre projetos nesse portfólio. Pergunte algo ou clique em um dos exemplos abaixo.',
  },
])
const examples = [
  'gere um pdf de chuva em Porto Alegre ontem das 15h às 17h',
  'o rag pode executar ações?',
  'como esse rag foi construído?',
  'o que é o design system?',
  'quem desenvolveu e qual o linkedin?',
]
const orbStatus = ref('RAG online')

async function scrollThread() {
  await nextTick()
  if (threadEl.value) threadEl.value.scrollTop = threadEl.value.scrollHeight
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function ask(text: string) {
  draft.value = text
  await submit()
}

async function submit() {
  const text = draft.value.trim()
  if (!text || thinking.value) return
  draft.value = ''
  messages.value.push({ id: crypto.randomUUID(), role: 'user', content: text })
  await scrollThread()
  thinking.value = true
  const action = detectAction(text)
  orbStatus.value = action ? 'executando ação…' : 'recuperando contexto…'
  await wait(action ? 400 : 900)

  if (action) {
    let content = ''
    try {
      content = await runAction(action)
    } catch {
      content = 'Não consegui gerar o PDF de chuva agora. Tente de novo em instantes.'
    }
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
    })
  } else {
    const hits = retrieve(text, 3)
    const scoped = hits.filter((hit) => isRelevant(hit, text))
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: composeAnswer(hits, text),
      hits: scoped,
    })
  }

  thinking.value = false
  orbStatus.value = 'RAG online'
  await scrollThread()
}
</script>

<style scoped>
.stage {
  width: min(1100px, calc(100% - 2rem));
  margin: 0 auto;
  min-height: calc(100vh - var(--ds-nav-h));
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 1.5rem;
  padding: 1.5rem 0 2rem;
  align-items: start;
}

.orb-wrap {
  position: sticky;
  top: calc(var(--ds-nav-h) + 1.5rem);
  display: grid;
  justify-items: center;
  gap: 1rem;
  padding-top: 2.4rem;
}

.orb {
  position: relative;
  width: 220px;
  height: 220px;
  filter: drop-shadow(0 0 22px rgba(34, 211, 238, 0.55));
}

.halo,
.track,
.arc,
.core {
  position: absolute;
  border-radius: 50%;
}

.halo {
  inset: 18px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.28), rgba(99, 102, 241, 0.08) 55%, transparent 70%);
}

.track {
  border: 2px solid rgba(34, 211, 238, 0.35);
}

.t1 {
  inset: 6px;
}

.t2 {
  inset: 28px;
  border-color: rgba(129, 140, 248, 0.4);
}

.t3 {
  inset: 50px;
  border-style: dashed;
  border-color: rgba(34, 211, 238, 0.7);
}

.arc {
  border: 3px solid transparent;
  animation: spin 3.6s linear infinite;
}

.a1 {
  inset: 6px;
  border-top-color: #22d3ee;
  border-right-color: #67e8f9;
}

.a2 {
  inset: 28px;
  border-bottom-color: #818cf8;
  border-left-color: #a5b4fc;
  animation-duration: 5.4s;
  animation-direction: reverse;
}

.a3 {
  inset: 50px;
  border-top-color: #22d3ee;
  animation-duration: 7s;
}

.core {
  inset: 74px;
  display: grid;
  place-items: center;
}

.core-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.85), rgba(99, 102, 241, 0.2) 62%, transparent 72%);
  animation: pulse 2.4s ease-in-out infinite;
}

.core-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e0f7ff;
  box-shadow: 0 0 26px #22d3ee;
}

.orb-status {
  margin: 0;
  font-family: var(--ds-mono);
  font-size: var(--ds-fs-xs);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ds-accent);
}

.thinking .orb {
  filter: drop-shadow(0 0 36px rgba(34, 211, 238, 0.95));
}

.thinking .a1,
.thinking .a2,
.thinking .a3 {
  animation-duration: 0.55s;
}

.thinking .a2 {
  animation-duration: 0.75s;
}

.thinking .core-glow {
  animation-duration: 0.5s;
}

.thinking .core-dot {
  transform: scale(1.3);
}

.chat {
  min-height: 620px;
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  gap: 0.8rem;
  padding: 1.2rem;
  border: 1px solid rgba(34, 211, 238, 0.22);
  border-radius: 28px;
  background:
    radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.08), transparent 40%),
    rgba(8, 12, 28, 0.72);
  box-shadow: 0 0 80px rgba(34, 211, 238, 0.08);
}

.kicker {
  margin: 0 0 0.3rem;
  color: var(--ds-accent);
  font-size: var(--ds-fs-xs);
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: var(--ds-fs-2xl);
}

.thread {
  overflow: auto;
  display: grid;
  align-content: start;
  gap: 0.75rem;
  padding-right: 0.25rem;
}

.bubble {
  max-width: 86%;
  padding: 0.85rem 1rem;
  border: 1px solid var(--ds-border);
  border-radius: 18px;
  background: rgba(15, 20, 42, 0.85);
}

.bubble.user {
  justify-self: end;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(34, 211, 238, 0.12));
}

.bubble p {
  margin: 0.4rem 0 0;
  white-space: pre-wrap;
}

.hits {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.55rem;
}

.hits span {
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.12);
  color: var(--ds-accent);
  font-size: 0.7rem;
  font-family: var(--ds-mono);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.chips button,
.send {
  border: 1px solid rgba(34, 211, 238, 0.35);
  background: transparent;
  color: var(--ds-text);
  border-radius: var(--ds-radius-full);
  padding: 0.4rem 0.75rem;
  font-size: var(--ds-fs-xs);
  font-weight: 700;
  cursor: pointer;
}

.send {
  background: linear-gradient(135deg, #22d3ee, #6366f1);
  color: #041018;
  border: 0;
  min-height: 44px;
  padding: 0 1.1rem;
}

.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
}

.line {
  min-height: 44px;
  padding: 0 1rem;
  border-radius: var(--ds-radius-full);
  border: 1px solid rgba(34, 211, 238, 0.28);
  background: rgba(5, 8, 22, 0.65);
  color: var(--ds-text);
  font: inherit;
}

.line:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.22);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  50% {
    transform: scale(1.12);
    opacity: 0.75;
  }
}

@media (max-width: 860px) {
  .stage {
    grid-template-columns: 1fr;
    padding-top: 0.5rem;
  }

  .orb-wrap {
    position: static;
    padding-top: 0.4rem;
  }

  .orb {
    width: 168px;
    height: 168px;
  }

  .core {
    inset: 56px;
  }

  .chat {
    min-height: 520px;
  }
}
</style>
