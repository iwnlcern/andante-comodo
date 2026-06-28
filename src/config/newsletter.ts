export function isRecaptchaRequired(
  runtimeEnv: Record<string, unknown>,
  isProdBuild: boolean,
): boolean {
  const raw = String(runtimeEnv?.RECAPTCHA_REQUIRED ?? '').trim().toLowerCase();
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return isProdBuild;
}

export const newsletter = {
  provider: 'listmonk',
  emailFieldName: 'EMAIL',
  title: 'Get new posts by email',
  description: 'A short email when a new blog post goes live. No spam.',
  placeholder: 'you@example.com',
  buttonLabel: 'Subscribe',
  recaptchaSiteKey: import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY ?? '',
  recaptchaAction: 'newsletter_subscribe',
  honeypotFieldName: 'website',
};
