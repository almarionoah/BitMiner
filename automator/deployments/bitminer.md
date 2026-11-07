# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Lyra Van Dyk, Mint Reyes, Flashy Swift  
Base branch: `main`

## Summary

Lyra Van Dyk, Mint Reyes, and Flashy Swift collaborated to implement the complete BitMiner application. Lyra structured the Vite frontend and established the linear-gradient design tokens and UI architecture. Mint built out the core features including the 'Mine' section (generating base64 encrypted emails and keys) and 'Convert' section with responsive layouts, state management, and fully interactive workflows. Flashy reviewed correctness, styling consistency, and verified the build integrity.

## Files changed

- `index.html` — Updated index.html title and body class for the linear gradient theme.
- `main.js` — Initialized main entry point to mount the application component.
- `src/style.css` — Created comprehensive design token stylesheet with gradients, glassmorphism cards, and responsive layout classes.
- `src/app.js` — Created main application router and layout supporting 'Mine' and 'Convert' menu options.
- `src/mine.js` — Implemented the 'Mine' tab logic with animated status, stats, and base64 email & key generation.
- `src/convert.js` — Implemented the 'Convert' tab with token exchange calculations and responsive UI.

## Work assets used

- automator/it-skokos@mail.com/bitminer/work-assets/engineering/add-retry-queue-to-job-runner.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/cache-hot-query-path.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/develop-an-app-that-looks-and-feels-using-linear.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/migrate-to-typed-api-client.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/please-develop-the-application-according-to-the-.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/please-develop-the-application-as-stipulated-in-.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/refactor-auth-service.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/split-monolith-module.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/build-component-tokens.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/rework-onboarding-flow.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/simplify-dashboard-density.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/brief-the-case-study-post.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/schedule-changelog-blast.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/spin-up-comparison-landing-page.md
- automator/it-skokos@mail.com/bitminer/work-assets/qa/add-contract-tests.md
- automator/it-skokos@mail.com/bitminer/work-assets/qa/fuzz-the-import-endpoint.md
- automator/it-skokos@mail.com/bitminer/work-assets/qa/load-test-checkout.md
- automator/it-skokos@mail.com/bitminer/work-assets/research/benchmark-vector-store-options.md
- automator/it-skokos@mail.com/bitminer/work-assets/research/prototype-embeddings-dedupe.md
- app: Engineering — cache hot query path (Cipher Van Dyk)
- app: Engineering — add retry queue to job runner (Kaelen Thorne)
- app: Engineering — refactor auth service (Iris Marlow)
- app: Engineering — cache hot query path (Onyx Fontaine)
- app: Engineering — split monolith module (Jax Cross)
- app: Engineering — cache hot query path (Lyra Van Dyk)
- app: Engineering — migrate to typed API client (Iris Van Dyk)
- app: Engineering — migrate to typed API client (Prism Fontaine)
- app: Engineering — migrate to typed API client (Kaelen Thorne)
- app: Engineering — migrate to typed API client (Juno Ito)
- app: Engineering — cache hot query path (Volt Petrov)
- app: Engineering — split monolith module (Halo Fontaine)
- app: Engineering — split monolith module (Mint Reyes)
