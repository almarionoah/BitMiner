# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes  
Base branch: `main`

## Summary

Implemented the BitMiner cryptocurrency miner and converter application. Kaelen Thorne structured the modular app layout, PWA setup, and core state model. Lyra Van Dyk designed the modern linear-gradient theme, Mine and Convert UI tabs, custom conversion amount input logic, and live Feed Terminal blab output logger. Mint Reyes verified edge cases, automatic blab processing, state persistence, and PWA service worker offline handling.

## Files changed

- `index.html` — Updated HTML template to support Mine and Convert tabbed structure, metric cards, PWA install trigger, custom conversion amount input form, and live feed terminal.
- `style.css` — Created styling rules with dark linear-gradient theme, responsive glassmorphism cards, feed terminal layout, and badging components.
- `main.js` — Implemented complete JS logic for email base64 encryption, key generation, blab output generation, feed terminal outputting, custom amount conversion, and PWA integration.
- `manifest.json` — Created web app manifest for PWA app downloading requirement.
- `sw.js` — Created service worker script for offline support and PWA functionality.

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
- app: Engineering — cache hot query path (Mint Reyes)
- app: Engineering — cache hot query path (Sable Ito)
- app: Engineering — cache hot query path (Byte Marlow)
- app: Engineering — migrate to typed API client (Jax Adeyemi)
- app: Engineering — refactor auth service (Mint Reyes)
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
- app: Engineering — migrate to typed API client (Mint Reyes)
- app: Engineering — add retry queue to job runner (Rune Van Dyk)
- app: Engineering — cache hot query path (Nova Marlow)
- app: Engineering — add retry queue to job runner (Mint Reyes)
- app: Engineering — split monolith module (Lyra Van Dyk)
- app: Engineering — migrate to typed API client (Rune Van Dyk)
- app: Engineering — refactor auth service (Byte Reyes)
