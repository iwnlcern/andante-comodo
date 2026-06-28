# Security Policy

## Scope

This policy covers the **template code** in this repository. Sites built from the
template are the responsibility of their own maintainers.

The template ships an optional newsletter endpoint
(`src/pages/api/newsletter-subscribe.ts`) that handles a reCAPTCHA secret and posts
to a [listmonk](https://listmonk.app/) instance. If you enable it, keep your
secrets in `.env` (never commit it), and rotate any keys you expose.

## Reporting a Vulnerability

Please report security issues **privately** — do not include exploit details in
public issues. Use GitHub's private
[security advisories](https://github.com/iwnlcern/andante-comodo/security/advisories/new),
or open a minimal issue asking for a private channel.

We aim to acknowledge reports within a few days.
