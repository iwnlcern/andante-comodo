# Contributing

`andante-comodo` is a **template**. The most common way to "use" it is to click
**Use this template** on GitHub (or fork it) and make it your own — start with the
[README](./README.md) and the guides in [`docs/`](./docs/).

Improvements to the template itself are welcome.

## Development

```bash
npm install
npm run dev          # local dev server at http://localhost:4321
```

Before opening a pull request, verify the build and smoke tests pass:

```bash
npm run build
npm test             # node --test tests/smoke.mjs
```

Requirements: Node 20.3 or newer.

## Guidelines

- Keep changes focused and match the surrounding code style.
- The demo content (the Gustav Mahler persona) is intentionally generic — keep it
  identity-neutral and replaceable.
- Do not commit `.env`, build output (`dist/`), or other generated files.
- By contributing, you agree your contributions are licensed under the project's
  [MIT License](./LICENSE).
