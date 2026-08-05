export function emailFromObfuscated(value) {
  return String(value).trim().split(' [at] ').join('@').split(' [dot] ').join('.');
}

export function mailtoHref(email, subject) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return `mailto:${email}${query}`;
}
