export function normalizeSyrianWhatsAppNumber(value: string): string | undefined {
  let number = value.replace(/[\s()+-]/g, "");

  if (!/^\d+$/.test(number)) return undefined;
  if (number.startsWith("00")) number = number.slice(2);
  if (/^09\d{8}$/.test(number)) number = `963${number.slice(1)}`;
  else if (/^9\d{8}$/.test(number)) number = `963${number}`;

  return /^9639\d{8}$/.test(number) ? number : undefined;
}
