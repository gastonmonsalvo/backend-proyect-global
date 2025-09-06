// Normaliza: quita separadores y pasa a mayúsculas (mantiene "X" de ISBN-10)
const normIsbn = (s) =>
  String(s || "").toUpperCase().replace(/[^0-9X]/g, "");

const isIsbn10 = (s) => {
  const v = normIsbn(s);
  if (!/^[0-9]{9}[0-9X]$/.test(v)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += (i + 1) * parseInt(v[i], 10);
  sum += v[9] === "X" ? 10 * 10 : 10 * parseInt(v[9], 10);
  return sum % 11 === 0;
};

const isIsbn13 = (s) => {
  const v = normIsbn(s);
  if (!/^[0-9]{13}$/.test(v)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = parseInt(v[i], 10);
    sum += i % 2 === 0 ? n : n * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(v[12], 10);
};

// Convierte ISBN-10 válido a ISBN-13 (prefijo 978)
const toIsbn13 = (isbn10) => {
  const core = normIsbn(isbn10).slice(0, 9);
  const base = "978" + core;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const n = parseInt(base[i], 10);
    sum += i % 2 === 0 ? n : n * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return base + String(check);
};

// Dado un texto, intenta detectar un ISBN; devuelve 13 si lo detecta
const detectIsbnInText = (q) => {
  if (!q) return null;
  const tokens = String(q).match(/[0-9xX-]+/g) || [];
  for (const t of tokens) {
    const v = normIsbn(t);
    if (isIsbn13(v)) return v;
    if (isIsbn10(v)) return toIsbn13(v);
  }
  return null;
};

module.exports = { normIsbn, isIsbn10, isIsbn13, toIsbn13, detectIsbnInText };