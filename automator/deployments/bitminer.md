# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes  
Base branch: `main`

## Summary

Implemented the BitMiner cryptocurrency miner and blab conversion application as specified in engineering blueprints. Kaelen Thorne structured the modular architecture, PWA configuration, and tabs ('Mine' and 'Convert'). Lyra Van Dyk implemented the linear-gradient design system, base64 email/key blab generator, auto-convert engine with feed terminal outputs using core variables [blab], [miner_identity_email], and [app_user_selected_amount]. Mint Reyes audited the algorithms, reactive data synchronization, terminal feeds, and verified error-free Vite compilation.

## Files changed

- `index.html` — Enhanced index.html with meta tags, Google Fonts (Inter and Fira Code for terminal display), PWA manifest linkage, and theme-color.
- `manifest.json` — Created web app manifest to fulfill PWA functionality for app downloading and installation.
- `sw.js` — Service worker implementation for offline capability and standard PWA compliance.
- `style.css` — Created cohesive linear-gradient design system with cyber/cryptocurrency terminal styling, responsive layouts, badges, and code fonts.
- `main.js` — Implemented complete cryptocurrency miner and converter application logic with variables [blab], [miner_identity_email], [app_user_selected_amount], base64 email and key pair generator, auto-convert engine, terminal feed logger, JSON data exporter, and PWA registration.

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
- automator/it-skokos@mail.com/bitminer/work-assets/engineering/use-the-following-updated-uploaded-resource-docu.md
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
- app: Engineering — add retry queue to job runner (Mint Reyes)
- app: Engineering — refactor auth service (Mint Reyes)
- app: Engineering — refactor auth service (Halo Adeyemi)
- app: Engineering — cache hot query path (Lyra Van Dyk)
- app: Engineering — add retry queue to job runner (Torq Hale)
- app: DevOps — autoscale worker pool (Nova Marlow)
- app: Engineering — cache hot query path (Jax Adeyemi)
- app: DevOps — wire log tracing (Quill Cross)
- app: Engineering — split monolith module (Lyra Van Dyk)
- app: Engineering — split monolith module (Mint Reyes)
- app: Engineering — refactor auth service (Pixel Hale)
- app: Engineering — refactor auth service (Lyra Van Dyk)
- app: Engineering — add retry queue to job runner (Rune Okafor)
- app: Engineering — add retry queue to job runner (Lyra Van Dyk)
- app: Engineering — cache hot query path (Juno Nkosi)
- app: Engineering — add retry queue to job runner (Jax Adeyemi)
- app: Engineering — migrate to typed API client (Nova Okafor)
- app: Engineering — migrate to typed API client (Rune Nkosi)
- app: Engineering — split monolith module (Jax Adeyemi)
- app: Engineering — cache hot query path (Rune Okafor)
- app: Engineering — cache hot query path (Mint Reyes)
