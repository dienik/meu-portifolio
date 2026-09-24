import { tokenize } from './tokenize'
import type { RetrievalHit } from './types'

const OUT_OF_SCOPE = 'A resposta está fora do escopo do projeto.'

const WEAK = new Set([
  'quem',
  'foi',
  'esse',
  'essa',
  'isso',
  'este',
  'esta',
  'qual',
  'quais',
  'sobre',
  'tem',
  'algo',
  'onde',
  'quando',
  'porque',
  'porquê',
])

export function isRelevant(hit: RetrievalHit, query: string) {
  const queryTokens = tokenize(query)
  if (!queryTokens.length || hit.bm25 <= 0) return false

  const docTokens = new Set(tokenize(`${hit.title} ${hit.text}`))
  const overlap = queryTokens.filter((token) => docTokens.has(token))
  const strong = overlap.filter((token) => !WEAK.has(token))
  return strong.length > 0
}

export function composeAnswer(hits: RetrievalHit[], query: string) {
  const top = hits[0]
  if (!top || !isRelevant(top, query)) {
    return OUT_OF_SCOPE
  }

  const extras = hits.slice(1, 3).filter((hit) => {
    if (!isRelevant(hit, query)) return false
    const close = hit.score >= top.score * 0.8
    const sameSource = hit.source === top.source
    return close || sameSource
  })
  const used = [top, ...extras]

  const citations = used
    .map((hit, index) => `[${index + 1}] ${hit.title} (${hit.source})`)
    .join('\n')

  return `${used.map((hit) => hit.text).join('\n\n')}\n\nFontes:\n${citations}`
}
