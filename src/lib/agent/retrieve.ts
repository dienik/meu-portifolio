import { CORPUS } from './corpus'
import { tokenize } from './tokenize'
import type { CorpusDoc, RetrievalHit } from './types'

const K1 = 1.5
const B = 0.75
const RRF_K = 60
const EMBED_DIM = 256

type IndexedDoc = CorpusDoc & {
  tokens: string[]
  tf: Map<string, number>
  vector: Float32Array
}

type SearchIndex = {
  docs: IndexedDoc[]
  avgdl: number
  df: Map<string, number>
}

function hash32(value: string) {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function embed(text: string) {
  const vector = new Float32Array(EMBED_DIM)
  const tokens = tokenize(text)
  const grams = [...tokens]
  const compact = tokens.join('')
  for (let i = 0; i < compact.length - 2; i += 1) grams.push(compact.slice(i, i + 3))

  for (const gram of grams) {
    const slot = hash32(gram) % EMBED_DIM
    const sign = hash32(`${gram}#`) % 2 === 0 ? 1 : -1
    vector[slot] = (vector[slot] ?? 0) + sign
  }

  let norm = 0
  for (const value of vector) norm += value * value
  const scale = Math.sqrt(norm) || 1
  for (let i = 0; i < vector.length; i += 1) {
    vector[i] = (vector[i] ?? 0) / scale
  }
  return vector
}

function cosine(a: Float32Array, b: Float32Array) {
  let sum = 0
  for (let i = 0; i < a.length; i += 1) sum += (a[i] ?? 0) * (b[i] ?? 0)
  return sum
}

function buildIndex(docs: CorpusDoc[]): SearchIndex {
  const indexed = docs.map((doc) => {
    const tokens = tokenize(`${doc.title} ${doc.text}`)
    const tf = new Map<string, number>()
    for (const token of tokens) tf.set(token, (tf.get(token) ?? 0) + 1)
    return { ...doc, tokens, tf, vector: embed(`${doc.title} ${doc.text}`) }
  })
  const avgdl = indexed.reduce((sum, doc) => sum + doc.tokens.length, 0) / (indexed.length || 1)
  const df = new Map<string, number>()
  for (const doc of indexed) {
    for (const token of new Set(doc.tokens)) df.set(token, (df.get(token) ?? 0) + 1)
  }
  return { docs: indexed, avgdl, df }
}

function idf(index: SearchIndex, token: string) {
  const n = index.df.get(token) ?? 0
  return Math.log((index.docs.length - n + 0.5) / (n + 0.5) + 1)
}

function bm25(index: SearchIndex, queryTokens: string[], doc: IndexedDoc) {
  const dl = doc.tokens.length || 1
  return queryTokens.reduce((score, token) => {
    const tf = doc.tf.get(token) ?? 0
    if (!tf) return score
    const denom = tf + K1 * (1 - B + (B * dl) / index.avgdl)
    return score + (idf(index, token) * (tf * (K1 + 1))) / denom
  }, 0)
}

function rrf(rank: number) {
  return 1 / (RRF_K + rank)
}

function search(index: SearchIndex, query: string, k: number): RetrievalHit[] {
  const queryTokens = tokenize(query)
  if (!queryTokens.length) return []
  const queryVector = embed(query)

  const lexical = index.docs
    .map((doc) => ({ doc, value: bm25(index, queryTokens, doc) }))
    .sort((a, b) => b.value - a.value)
  const dense = index.docs
    .map((doc) => ({ doc, value: cosine(queryVector, doc.vector) }))
    .sort((a, b) => b.value - a.value)

  const fused = new Map<string, RetrievalHit>()
  lexical.forEach((item, rank) => {
    const titleTokens = tokenize(item.doc.title)
    const overlap = queryTokens.filter((token) => titleTokens.includes(token)).length
    const titleBoost = overlap ? (overlap / queryTokens.length) * 0.35 : 0
    fused.set(item.doc.id, {
      id: item.doc.id,
      title: item.doc.title,
      source: item.doc.source,
      text: item.doc.text,
      bm25: item.value,
      cosine: 0,
      score: rrf(rank + 1) + titleBoost,
    })
  })
  dense.forEach((item, rank) => {
    const current = fused.get(item.doc.id)
    if (!current) return
    current.cosine = item.value
    current.score += rrf(rank + 1)
  })

  return [...fused.values()].sort((a, b) => b.score - a.score).slice(0, k)
}

const portfolioIndex = buildIndex(CORPUS)

export function retrieve(query: string, k = 4) {
  return search(portfolioIndex, query, k)
}

export function retrieveFrom(docs: CorpusDoc[], query: string, k = 4) {
  return search(buildIndex(docs), query, k)
}
