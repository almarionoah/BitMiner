# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes  
Base branch: `main`

## Summary

Implemented the BitMiner cryptocurrency miner application according to specifications. Kaelen Thorne structured the modular tab state and view layout; Lyra Van Dyk implemented the base64 email/key blab mining engine, customizable blab amount conversion process, feed terminal output logger, linear-gradient design system, and PWA capabilities; Mint Reyes reviewed edge cases, input state persistence, and cross-browser styling.

## Files changed

- `index.html` — Updated index.html to include metadata, font links, PWA web manifest link, stylesheet reference, and app container.
- `manifest.json` — Added PWA Web App Manifest file to enable downloadable app functionality.
- `sw.js` — Added PWA Service Worker for offline app support and install capability.
- `src/style.css` — Created styling rules with dark cyberpunk aesthetic, linear gradients, terminal components, and responsive cards.
- `main.js` — Implemented main JavaScript application engine including Mine and Convert tabs, Base64 email and key blab generation, input amount configuration per blab, conversion calculations, feed terminal output logging, PWA installer hooks, and view rendering.

## Work assets used

- automator/it-skokos@mail.com/bitminer/work-assets/engineering/add-retry-queue-to-job-runner.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/cache-hot-query-path.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/develop-an-app-that-looks-and-feels-using-linear.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/ensure-conversion-processing-works-and-gives-aut.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/ensure-the-conversion-functionality-allows-user-.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/migrate-to-typed-api-client.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/please-develop-the-application-according-to-the-.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/please-develop-the-application-as-stipulated-in-.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/refactor-auth-service.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/split-monolith-module.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/use-existing-application-and-add-a-email-input-f.md
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/use-the-existing-application-and-ensure-conversi.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/accessibility-pass.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/build-component-tokens.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/mobile-nav-overhaul.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/rework-onboarding-flow.md
- automator/it-skokos@mail.com/bitminer/work-assets/design/simplify-dashboard-density.md
- automator/it-skokos@mail.com/bitminer/work-assets/devops/add-blue-green-deploy.md
- automator/it-skokos@mail.com/bitminer/work-assets/devops/autoscale-worker-pool.md
- automator/it-skokos@mail.com/bitminer/work-assets/devops/cut-container-image-size.md
- automator/it-skokos@mail.com/bitminer/work-assets/devops/harden-ci-pipeline.md
- automator/it-skokos@mail.com/bitminer/work-assets/devops/wire-log-tracing.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/brief-the-case-study-post.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/cut-a-30s-product-demo.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/draft-launch-announcement.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/schedule-changelog-blast.md
- automator/it-skokos@mail.com/bitminer/work-assets/marketing/spin-up-comparison-landing-page.md
- automator/it-skokos@mail.com/bitminer/work-assets/qa/add-contract-tests.md
- automator/it-skokos@mail.com/bitminer/work-assets/qa/expand-regression-suite.md
- automator/it-skokos@mail.com/bitminer/work-assets/qa/fuzz-the-import-endpoint.md
- app: Engineering — cache hot query path (Nova Marlow)
- app: Engineering — split monolith module (Kaelen Thorne)
- app: Engineering — cache hot query path (Mint Reyes)
- app: Engineering — refactor auth service (Volt Van Dyk)
- app: Engineering — cache hot query path (Lyra Van Dyk)
- app: Engineering — cache hot query path (Sable Ito)
- app: Engineering — cache hot query path (Byte Marlow)
- app: Engineering — migrate to typed API client (Byte Reyes)
- app: Engineering — migrate to typed API client (Jax Adeyemi)
- app: Engineering — refactor auth service (Mint Reyes)
- app: Engineering — split monolith module (Mint Reyes)
- app: Engineering — refactor auth service (Rune Van Dyk)
- app: Engineering — add retry queue to job runner (Prism Ito)
- app: Engineering — migrate to typed API client (Echo Adeyemi)
- app: Engineering — add retry queue to job runner (Byte Marlow)
- app: Engineering — migrate to typed API client (Nova Marlow)
- app: Engineering — add retry queue to job runner (Byte Reyes)
- app: Engineering — migrate to typed API client (Volt Van Dyk)
- app: Engineering — split monolith module (Rune Van Dyk)
- app: Engineering — migrate to typed API client (Fig Okafor)
- app: Engineering — migrate to typed API client (Lyra Van Dyk)
- app: Engineering — cache hot query path (Prism Ito)
- app: Engineering — add retry queue to job runner (Lyra Van Dyk)
- app: Engineering — add retry queue to job runner (Nova Marlow)
