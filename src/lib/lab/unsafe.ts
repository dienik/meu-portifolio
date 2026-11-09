// AST LAB — SAST: code injection and open redirect driven by the URL.

export function runFormula(): unknown {
  const formula = new URLSearchParams(window.location.search).get('formula') ?? '0'
  return eval(formula)
}

export function buildFilter(): (value: number) => boolean {
  const expr = new URLSearchParams(window.location.search).get('filter') ?? 'true'
  return new Function('value', `return ${expr}`) as (value: number) => boolean
}

export function redirectAfterLogin(): void {
  const next = new URLSearchParams(window.location.search).get('next')
  if (next) window.location.href = next
}

// AST LAB — Secret: hard-coded credentials (fake values, lab only).
export const GITHUB_TOKEN = 'ghp_8sK2Lm9Qw4Er7Ty1Ui3Op6As5Df0Gh2Jk4Lz'
export const STRIPE_SECRET_KEY = 'sk_live_51Hx9Kd2Lq8Zt4Vb7Nm3Pr6Ts0Wy5Ua8Hc2Je9Rf'
