# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes  
Base branch: `main`

## Summary

Kaelen Thorne planned the structure and set up core cryptocurrency miner app features including base64 email auto-generation and key generation. Lyra Van Dyk implemented the conversion processing with inputs for [blab], [miner_identity_email], and [app_user_selected_amount], automatic feed terminal output, and PWA capabilities using a clean linear-gradient design system. Mint Reyes verified correctness, ensuring core variables are correctly handled and the project builds successfully with Vite.

## Files changed

- `index.html` — Update index.html to include PWA manifest link, correct title, and proper app root structure.
- `package.json` — Ensure package.json is fully valid and retains existing build configuration.
- `manifest.json` — Add PWA manifest.json for app download and standalone capability.
- `main.js` — Implement core frontend logic with mining, base64 encryption, feed terminal outputs, navigation, and conversion processing utilizing [blab], [miner_identity_email], and [app_user_selected_amount].
- `style.css` — Add comprehensive linear-gradient styling matching modern cryptocurrency miner aesthetic and dark theme design requirements.

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
