export function isValidHttpUrl(value) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function parseEmailList(value) {
  const raw = value.split(/[,\s;]+/).map(v => v.trim().toLowerCase()).filter(Boolean);
  const unique = [...new Set(raw)];
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: unique.filter(email => emailRe.test(email)),
    invalid: unique.filter(email => !emailRe.test(email)),
  };
}
