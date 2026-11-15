# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes  
Base branch: `main`

## Summary

Kaelen Thorne architected the linear-gradient UI layout, navigation tabs ('Mine' and 'Convert'), and data schema. Lyra Van Dyk implemented the base64 email and key generator, the conversion processing algorithm utilizing [blab], [miner_identity_email], and [app_user_selected_amount], automatic feed terminal output, auto-convert engine, and PWA capabilities. Mint Reyes reviewed the build compatibility with Vite, validated variable bindings, and verified mobile/desktop responsive design.

## Files changed

- `index.html` — Updated index.html to link style.css, PWA manifest, meta tags, and root container for Vite build.
- `style.css` — Created full linear-gradient styling design system, cyberpunk crypto aesthetic, responsive terminal, buttons, and switches.
- `src/converter.js` — Implements core conversion algorithm explicitly using blab, miner_identity_email, and app_user_selected_amount, plus base64 generation.
- `main.js` — Wires up UI, state management, auto-conversion triggering, live feed terminal responses, PWA install prompt, and JSON export.
- `public/manifest.json` — Provides PWA manifest with standalone display configuration, icons, and theme colors.
- `public/sw.js` — Provides service worker for PWA installation and offline capabilities.

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
