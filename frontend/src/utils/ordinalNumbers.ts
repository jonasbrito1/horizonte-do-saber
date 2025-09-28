/**
 * Utilitários para formatação de números ordinais em português brasileiro
 * Suporta caracteres especiais como 1º, 2ª, 3º, 4ª, etc.
 */

/**
 * Converte um número para sua representação ordinal em português
 * @param num - Número a ser convertido
 * @param feminine - Se deve usar terminação feminina (ª) ou masculina (º)
 * @returns String com o número ordinal formatado
 */
export function formatOrdinalNumber(num: number, feminine: boolean = false): string {
  if (isNaN(num) || num < 1) {
    return num.toString()
  }

  const suffix = feminine ? 'ª' : 'º'
  return `${num}${suffix}`
}

/**
 * Formata uma série escolar com número ordinal correto
 * @param serie - Nome da série (ex: "1 Ano", "2 Serie")
 * @returns Série formatada com ordinal correto
 */
export function formatSerieWithOrdinal(serie: string): string {
  if (!serie) return serie

  // Padrões para identificar séries e anos
  const patterns = [
    // "1 Ano" -> "1º Ano"
    { regex: /^(\d+)\s*(Ano|ano)(.*)$/i, feminine: false },
    // "2 Serie" -> "2ª Série"
    { regex: /^(\d+)\s*(Serie|série|series|séries)(.*)$/i, feminine: true },
    // "3 Fundamental" -> "3º Fundamental"
    { regex: /^(\d+)\s*(Fundamental|fundamental)(.*)$/i, feminine: false },
    // "1 Médio" -> "1º Médio"
    { regex: /^(\d+)\s*(Médio|medio|Medio)(.*)$/i, feminine: false }
  ]

  for (const pattern of patterns) {
    const match = serie.match(pattern.regex)
    if (match) {
      const number = parseInt(match[1])
      const term = match[2]
      const rest = match[3] || ''

      return `${formatOrdinalNumber(number, pattern.feminine)} ${term}${rest}`
    }
  }

  return serie
}

/**
 * Valida se um texto contém números ordinais válidos
 * @param text - Texto a ser validado
 * @returns true se contém ordinais válidos
 */
export function hasValidOrdinals(text: string): boolean {
  const ordinalPattern = /\d+[ºª]/g
  return ordinalPattern.test(text)
}

/**
 * Extrai números ordinais de um texto
 * @param text - Texto para extrair ordinais
 * @returns Array com os números ordinais encontrados
 */
export function extractOrdinals(text: string): string[] {
  const ordinalPattern = /\d+[ºª]/g
  return text.match(ordinalPattern) || []
}

/**
 * Sugestões de séries/anos comuns no sistema educacional brasileiro
 */
export const SERIES_SUGESTOES = [
  '1º Ano',
  '2º Ano',
  '3º Ano',
  '4º Ano',
  '5º Ano',
  '6º Ano',
  '7º Ano',
  '8º Ano',
  '9º Ano',
  '1ª Série',
  '2ª Série',
  '3ª Série',
  '1º Fundamental',
  '2º Fundamental',
  '3º Fundamental',
  '4º Fundamental',
  '5º Fundamental',
  '6º Fundamental',
  '7º Fundamental',
  '8º Fundamental',
  '9º Fundamental',
  '1º Médio',
  '2º Médio',
  '3º Médio'
]

/**
 * Normaliza o nome de uma turma garantindo caracteres ordinais corretos
 * @param nome - Nome da turma
 * @returns Nome normalizado com ordinais corretos
 */
export function normalizeTurmaName(nome: string): string {
  if (!nome) return nome

  // Primeiro, tenta corrigir caracteres corrompidos comuns
  let normalized = nome
    .replace(/1\?/g, '1º')    // 1? -> 1º
    .replace(/2\?/g, '2ª')    // 2? -> 2ª
    .replace(/3\?/g, '3º')    // 3? -> 3º
    .replace(/4\?/g, '4ª')    // 4? -> 4ª
    .replace(/5\?/g, '5º')    // 5? -> 5º
    .replace(/(\d+)\s*o\b/gi, '$1º')    // "1o" -> "1º"
    .replace(/(\d+)\s*a\b/gi, '$1ª')    // "2a" -> "2ª"

  // Aplica formatação automática para séries conhecidas
  normalized = formatSerieWithOrdinal(normalized)

  return normalized
}