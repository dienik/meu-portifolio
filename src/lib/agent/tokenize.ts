const STOP = new Set([
  'a',
  'o',
  'os',
  'as',
  'um',
  'uma',
  'de',
  'da',
  'do',
  'das',
  'dos',
  'em',
  'na',
  'no',
  'por',
  'para',
  'com',
  'que',
  'e',
  'ou',
  'se',
  'é',
  'como',
])

export function fold(text: string) {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

export function tokenize(text: string) {
  return fold(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length > 1 && !STOP.has(token))
}
