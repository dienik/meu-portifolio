export interface CorpusDoc {
  id: string
  title: string
  source: string
  text: string
}

export interface RetrievalHit {
  id: string
  title: string
  source: string
  text: string
  bm25: number
  cosine: number
  score: number
}
