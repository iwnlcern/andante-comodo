import type { APIRoute } from 'astro';
// @astrojs/cloudflare v13 removed Astro.locals.runtime; worker env/secrets are
// imported from the workerd runtime module instead.
import { env as workersEnv } from 'cloudflare:workers';
import { isRecaptchaRequired, newsletter } from '#config/newsletter';
import { classifySubscriptionResponse, canonicalizeListmonkEnv } from '#lib/newsletter/listmonk.mjs';
import { toRedirectUrl } from '#lib/newsletter/newsletter-redirect';

export const prerender = false;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEMPORARILY_UNAVAILABLE = 'Newsletter is temporarily unavailable.';
const VERIFICATION_FAILED = 'Subscription could not be verified. Please try again.';

type ApiPayload = {
  ok: boolean;
  message?: string;
  error?: string;
};

function isJsonRequest(request: Request): boolean {
  const accept = request.headers.get('accept') ?? '';
  return accept.includes('application/json');
}

function respond(request: Request, status: number, payload: ApiPayload): Response {
  if (isJsonRequest(request)) {
    return new Response(JSON.stringify(payload), {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  return Response.redirect(toRedirectUrl(request, payload), 303);
}

async function verifyRecaptcha(
  request: Request,
  token: string,
  recaptchaSecret: string,
): Promise<{
  success: boolean;
  score?: number;
  action?: string;
  errorCodes?: string[];
  transportError?: string;
}> {
  const params = new URLSearchParams({
    secret: recaptchaSecret,
    response: token,
  });

  const ip =
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (ip) params.set('remoteip', ip);

  try {
    const verificationResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      },
    );

    if (!verificationResponse.ok) {
      return {
        success: false,
        transportError: `Google verification request failed with ${verificationResponse.status}.`,
      };
    }

    const verificationBody = (await verificationResponse.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
      'error-codes'?: string[];
    };

    return {
      success: Boolean(verificationBody.success),
      score: verificationBody.score,
      action: verificationBody.action,
      errorCodes: verificationBody['error-codes'] ?? [],
    };
  } catch {
    return {
      success: false,
      transportError: 'Unable to contact Google reCAPTCHA verification service.',
    };
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  // workersEnv is the v13+ source of bindings/secrets; the locals.runtime
  // spread is a no-op on v13 but keeps older adapter runtimes working.
  const runtimeEnv = {
    ...((workersEnv ?? {}) as Record<string, unknown>),
    ...((locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env ?? {}),
  } as Record<string, unknown>;
  const { baseUrl: listmonkBaseUrl, listUuids } = canonicalizeListmonkEnv([
    runtimeEnv,
    import.meta.env,
  ]);
  const emailFieldName = newsletter.emailFieldName ?? 'EMAIL';
  const honeypotFieldName = (newsletter.honeypotFieldName ?? '').trim();
  const recaptchaSiteKey = (newsletter.recaptchaSiteKey ?? '').trim();
  const recaptchaAction = (newsletter.recaptchaAction ?? 'newsletter_subscribe').trim();
  const recaptchaSecret = String(
    runtimeEnv.RECAPTCHA_SECRET_KEY ?? import.meta.env.RECAPTCHA_SECRET_KEY ?? '',
  ).trim();
  const minScoreRaw = Number(
    runtimeEnv.RECAPTCHA_MIN_SCORE ?? import.meta.env.RECAPTCHA_MIN_SCORE ?? '0.5',
  );
  const recaptchaMinScore = Number.isFinite(minScoreRaw) ? minScoreRaw : 0.5;
  const recaptchaRequired = isRecaptchaRequired(runtimeEnv, import.meta.env.PROD);

  if (!listmonkBaseUrl || listUuids.length === 0) {
    console.error('Newsletter subscribe is not configured.', {
      hasListmonkBaseUrl: Boolean(listmonkBaseUrl),
      listUuidCount: listUuids.length,
    });
    return respond(request, 503, {
      ok: false,
      error: TEMPORARILY_UNAVAILABLE,
    });
  }

  if (recaptchaRequired && (!recaptchaSiteKey || !recaptchaSecret)) {
    console.error('Required reCAPTCHA is not configured.', {
      hasSiteKey: Boolean(recaptchaSiteKey),
      hasSecret: Boolean(recaptchaSecret),
    });
    return respond(request, 503, {
      ok: false,
      error: TEMPORARILY_UNAVAILABLE,
    });
  }

  const formData = await request.formData();
  const rawEmail = formData.get(emailFieldName);
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : '';
  const rawName = formData.get('name');
  const name = typeof rawName === 'string' ? rawName.trim() : '';

  if (!email || !EMAIL_REGEX.test(email)) {
    return respond(request, 400, {
      ok: false,
      error: 'Please enter a valid email address.',
    });
  }

  if (honeypotFieldName) {
    const honeypotValue = formData.get(honeypotFieldName);
    if (typeof honeypotValue === 'string' && honeypotValue.trim().length > 0) {
      // Silently accept bot-like submissions to avoid signal leakage.
      return respond(request, 200, {
        ok: true,
        message: 'Subscription successful. Please check your inbox.',
      });
    }
  }

  const recaptchaTokenRaw = formData.get('g-recaptcha-response');
  const recaptchaToken =
    typeof recaptchaTokenRaw === 'string' ? recaptchaTokenRaw.trim() : '';
  if (recaptchaRequired || recaptchaSiteKey) {
    if (!recaptchaSecret) {
      console.error('reCAPTCHA site key is configured but server secret is missing.');
      return respond(request, 503, {
        ok: false,
        error: TEMPORARILY_UNAVAILABLE,
      });
    }
    if (!recaptchaToken) {
      console.error('reCAPTCHA token is missing.', { required: recaptchaRequired });
      return respond(request, 400, { ok: false, error: VERIFICATION_FAILED });
    }

    const verification = await verifyRecaptcha(request, recaptchaToken, recaptchaSecret);
    if (!verification.success) {
      console.error('reCAPTCHA verification failed.', {
        transportError: verification.transportError,
        errorCodes: verification.errorCodes,
      });
      return respond(request, 400, {
        ok: false,
        error: VERIFICATION_FAILED,
      });
    }

    if (verification.action && verification.action !== recaptchaAction) {
      console.error('reCAPTCHA action mismatch.', {
        expected: recaptchaAction,
        actual: verification.action,
      });
      return respond(request, 400, {
        ok: false,
        error: VERIFICATION_FAILED,
      });
    }

    if (
      typeof verification.score === 'number' &&
      verification.score < recaptchaMinScore
    ) {
      console.error('reCAPTCHA score below threshold.', {
        score: verification.score,
        minScore: recaptchaMinScore,
      });
      return respond(request, 400, {
        ok: false,
        error: VERIFICATION_FAILED,
      });
    }
  }

  const listmonkPayload = {
    email,
    name,
    list_uuids: listUuids,
  };

  try {
    const listmonkResponse = await fetch(
      `${listmonkBaseUrl}/api/public/subscription`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(listmonkPayload),
      },
    );

    const responseText = await listmonkResponse.text();
    const kind = classifySubscriptionResponse(listmonkResponse.status, responseText);

    if (kind === 'ok' || kind === 'already-subscribed') {
      return respond(request, 200, {
        ok: true,
        message: 'Subscription successful. Please check your inbox.',
      });
    }

    const errorMessage =
      kind === 'invalid-email'
        ? 'Please enter a valid email address.'
        : `${TEMPORARILY_UNAVAILABLE} Please try again.`;
    console.error('Listmonk rejected subscription.', {
      status: listmonkResponse.status,
      responseText: responseText.slice(0, 500),
    });

    return respond(request, 502, {
      ok: false,
      error: errorMessage,
    });
  } catch (error) {
    console.error('Unable to reach Listmonk.', error);
    return respond(request, 502, {
      ok: false,
      error: `${TEMPORARILY_UNAVAILABLE} Please try again.`,
    });
  }
};
