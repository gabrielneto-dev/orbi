/**
 * CPF e CNPJ (REQ-005): normalização, validação dos dígitos verificadores e máscara.
 *
 * O CNPJ aceita o formato alfanumérico da Receita Federal (emitido desde julho de 2026,
 * IN RFB 2.229/2024): 12 posições `[0-9A-Z]` + 2 dígitos verificadores numéricos. Cada caractere
 * vale seu código ASCII − 48 no cálculo módulo 11, o que mantém o CNPJ numérico compatível.
 */

const SEPARATORS = /[\s./-]/g;

const CPF_PATTERN = /^\d{11}$/;
const CNPJ_PATTERN = /^[0-9A-Z]{12}\d{2}$/;

/** Remove máscara e espaços. Não remove outros caracteres: texto inválido continua inválido. */
function stripMask(value: string): string {
  return value.replace(SEPARATORS, "");
}

/** Dígito verificador módulo 11 (regra comum a CPF e CNPJ). */
function mod11CheckDigit(values: number[], weights: number[]): number {
  const sum = values.reduce((total, value, index) => total + value * (weights[index] ?? 0), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function allSameCharacter(value: string): boolean {
  return /^(.)\1*$/.test(value);
}

/** CPF só com dígitos (forma gravada no banco), ou `null` se o formato não for de CPF. */
export function normalizeCpf(value: string): string | null {
  const stripped = stripMask(value);
  return CPF_PATTERN.test(stripped) ? stripped : null;
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);
  if (!cpf || allSameCharacter(cpf)) return false;

  const digits = [...cpf].map(Number);
  const first = mod11CheckDigit(digits.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = mod11CheckDigit(digits.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits[9] === first && digits[10] === second;
}

/** CNPJ sem máscara e em maiúsculas (forma gravada no banco), ou `null` se o formato não for de CNPJ. */
export function normalizeCnpj(value: string): string | null {
  const stripped = stripMask(value).toUpperCase();
  return CNPJ_PATTERN.test(stripped) ? stripped : null;
}

const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

export function isValidCnpj(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (!cnpj || allSameCharacter(cnpj)) return false;

  const values = [...cnpj].map((char) => char.charCodeAt(0) - 48);
  const first = mod11CheckDigit(values.slice(0, 12), CNPJ_FIRST_WEIGHTS);
  const second = mod11CheckDigit(values.slice(0, 13), CNPJ_SECOND_WEIGHTS);
  return values[12] === first && values[13] === second;
}

/** `000.000.000-00`. Devolve o texto original se não for um CPF bem formado. */
export function formatCpf(value: string): string {
  const cpf = normalizeCpf(value);
  if (!cpf) return value;
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

/** `00.000.000/0000-00` (também para CNPJ alfanumérico). Devolve o texto original se malformado. */
export function formatCnpj(value: string): string {
  const cnpj = normalizeCnpj(value);
  if (!cnpj) return value;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
}
