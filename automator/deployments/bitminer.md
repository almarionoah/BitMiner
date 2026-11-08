# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes  
Base branch: `main`

## Summary

Kaelen Thorne planned the structure and core architecture of BitMiner using Vite, Tailwind/linear-gradient tokens, and responsive UI components. Lyra Van Dyk implemented the frontend features, including the 'Mine' and 'Convert' tabs, base64 email and key generation, feed terminal output, and custom user amount selection using variables [blab], [miner_identity_email], and [app_user_selected_amount]. Mint Reyes reviewed and verified the code against the design system and build requirements to ensure robust error handling and clean responsive markup.

## Files changed

- `index.html` — Update index.html with Google Fonts and proper metadata conforming to design specifications.
- `package.json` — Ensure package.json is fully valid and includes standard scripts.
- `vite.config.js` — Configure vite.config.js for optimal build targets and dev server settings.
- `src/style.css` — Provide design tokens, linear gradients, and styling rules required by design guidelines.
- `main.js` — Implement full client-side BitMiner functionality with Mine and Convert tabs, base64 encryption, live terminal feed, and core variables ([blab], [miner_identity_email], [app_user_selected_amount]).

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
- app: Engineering — refactor auth service (Fig Okafor)
- app: Engineering — refactor auth service (Lyra Van Dyk)
- app: Engineering — migrate to typed API client (Mint Reyes)
- app: Engineering — migrate to typed API client (Byte Marlow)
- app: Engineering — add retry queue to job runner (Lyra Van Dyk)
- app: Engineering — add retry queue to job runner (Rune Van Dyk)
- app: DevOps — add blue/green deploy (Rune Cross)
- app: Engineering — split monolith module (Lyra Van Dyk)
- app: Engineering — cache hot query path (Nova Marlow)
- app: Engineering — split monolith module (Kaelen Thorne)
- app: Engineering — cache hot query path (Mint Reyes)
- app: Engineering — refactor auth service (Volt Van Dyk)
- app: Engineering — cache hot query path (Lyra Van Dyk)
- app: Engineering — cache hot query path (Sable Ito)
- app: Engineering — cache hot query path (Byte Marlow)
- app: Engineering — migrate to typed API client (Byte Reyes)
- app: Engineering — migrate to typed API client (Jax Adeyemi)
- app: Engineering — add retry queue to job runner (Echo Adeyemi)
- app: Engineering — split monolith module (Mint Reyes)
- app: Engineering — refactor auth service (Rune Van Dyk)
- app: Engineering — add retry queue to job runner (Prism Ito)
- app: Engineering — migrate to typed API client (Echo Adeyemi)
