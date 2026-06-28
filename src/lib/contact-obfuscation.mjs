/** @param {string} email @returns {string} */
export function obfuscateEmail(email) {
  return String(email).replace(/\./g, ' [dot] ').replace(/@/g, ' [at] ');
}

/** @param {string} phone @returns {string} */
export function obfuscatePhone(phone) {
  return String(phone).replace(/-/g, ' [dash] ');
}
