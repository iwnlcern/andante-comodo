type RecaptchaClient = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

type NewsletterWindow = Window & {
  grecaptcha?: RecaptchaClient;
  __newsletterRecaptchaPromise?: Promise<RecaptchaClient>;
  __newsletterSubmitBound?: boolean;
};

const newsletterWindow = window as NewsletterWindow;

function getRecaptchaPromise(siteKey: string): Promise<RecaptchaClient> {
  if (!siteKey) return Promise.reject(new Error('Missing reCAPTCHA site key.'));
  if (newsletterWindow.grecaptcha?.ready && newsletterWindow.grecaptcha.execute) {
    return Promise.resolve(newsletterWindow.grecaptcha);
  }
  if (newsletterWindow.__newsletterRecaptchaPromise) {
    return newsletterWindow.__newsletterRecaptchaPromise;
  }

  newsletterWindow.__newsletterRecaptchaPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;
    script.dataset.newsletterRecaptcha = 'true';
    script.onload = () => {
      if (newsletterWindow.grecaptcha?.ready && newsletterWindow.grecaptcha.execute) {
        resolve(newsletterWindow.grecaptcha);
      } else {
        reject(new Error('Unable to load reCAPTCHA script.'));
      }
    };
    script.onerror = () => reject(new Error('Unable to load reCAPTCHA script.'));
    document.head.appendChild(script);
  });

  return newsletterWindow.__newsletterRecaptchaPromise;
}

const forms = Array.from(document.querySelectorAll<HTMLFormElement>('form[data-newsletter-form]'));

for (const form of forms) {
  if (form.dataset.recaptchaEnabled !== 'true') continue;
  form.addEventListener(
    'focusin',
    () => {
      getRecaptchaPromise(form.dataset.recaptchaSitekey || '').catch(() => {});
    },
    { once: true },
  );
}

if (!newsletterWindow.__newsletterSubmitBound && forms.length > 0) {
  newsletterWindow.__newsletterSubmitBound = true;
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-newsletter-form]')) return;

    event.preventDefault();

    const statusText = form.querySelector<HTMLElement>('[data-newsletter-status]');
    const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const tokenInput = form.querySelector<HTMLInputElement>('[data-recaptcha-response]');
    const recaptchaErrorText = form.querySelector<HTMLElement>('[data-recaptcha-error]');
    const recaptchaLoadErrorText = form.querySelector<HTMLElement>('[data-recaptcha-load-error]');

    if (statusText) {
      statusText.classList.add('hidden');
      statusText.classList.remove('text-red-300', 'text-green-300');
      statusText.textContent = '';
    }
    recaptchaErrorText?.classList.add('hidden');
    recaptchaLoadErrorText?.classList.add('hidden');
    if (submitButton) submitButton.disabled = true;

    if (form.dataset.recaptchaEnabled === 'true') {
      try {
        const siteKey = form.dataset.recaptchaSitekey || '';
        const action = form.dataset.recaptchaAction || 'newsletter_subscribe';
        const grecaptcha = await getRecaptchaPromise(siteKey);
        const token = await grecaptcha.execute(siteKey, { action });
        if (!token || typeof token !== 'string') throw new Error('Empty reCAPTCHA token.');
        if (tokenInput) tokenInput.value = token;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'reCAPTCHA verification failed.';
        const isLoadError =
          message.includes('Unable to load reCAPTCHA script.') ||
          message.includes('Missing reCAPTCHA site key.');
        if (isLoadError) recaptchaLoadErrorText?.classList.remove('hidden');
        else if (recaptchaErrorText) {
          recaptchaErrorText.textContent = message;
          recaptchaErrorText.classList.remove('hidden');
        }
        if (submitButton) submitButton.disabled = false;
        return;
      }
    }

    try {
      const response = await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json')
        ? await response.json().catch(() => null)
        : null;
      const ok = Boolean(response.ok && payload?.ok);
      const fallbackError = `Subscription failed (${response.status}). Please try again.`;

      if (statusText) {
        statusText.classList.remove('hidden');
        statusText.classList.add(ok ? 'text-green-300' : 'text-red-300');
        statusText.textContent = ok
          ? payload.message || 'Subscription successful. Please check your inbox.'
          : payload?.error || fallbackError;
      }

      if (ok) {
        form.reset();
        if (tokenInput) tokenInput.value = '';
      }
    } catch {
      if (statusText) {
        statusText.classList.remove('hidden');
        statusText.classList.add('text-red-300');
        statusText.textContent = 'Network error. Please try again.';
      }
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
