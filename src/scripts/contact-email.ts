import { emailFromObfuscated, mailtoHref } from '#lib/contact-email.mjs';

export function initContactEmail(root: ParentNode = document) {
  for (const element of root.querySelectorAll<HTMLElement>('[data-contact-email]')) {
    if (element.dataset.contactEmailBound === 'true') continue;

    const email = emailFromObfuscated(element.textContent ?? '');
    element.dataset.contactEmailBound = 'true';
    element.setAttribute('href', mailtoHref(email, element.dataset.emailSubject));
    element.textContent = element.dataset.contactLabel ?? 'Email';
  }
}
