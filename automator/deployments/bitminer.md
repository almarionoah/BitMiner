# Automator deployment — BitMiner

Project type: **vite**  
Build: `.: npx vite build --mode development`  
Developers: Kaelen Thorne, Lyra Van Dyk, Mint Reyes  
Base branch: `main`

## Summary

Kaelen Thorne planned the structure and core cryptographic miner simulation using base64 generation and linear gradients, Lyra Van Dyk implemented the frontend application with Mine and Convert tabs, inputs for [blab], [miner_identity_email], and [app_user_selected_amount], feed terminal outputs, and PWA manifest support, and Mint Reyes verified the code against standards and ensured correct build with Vite.

## Files changed

- `package.json` — Ensure package.json remains valid and retains vite dependency and build script.
- `vite.config.js` — Retain standard Vite configuration.
- `index.html` — Update index.html with appropriate title, meta tags, PWA manifest link, and root app container.
- `manifest.json` — Add PWA manifest for app downloading capability as specified in engineering work assets.
- `main.js` — Implement the complete BitMiner application logic with Mine and Convert tabs, base64 encryption generation, core variables ([blab], [miner_identity_email], [app_user_selected_amount]), and feed terminal responses.
- `style.css` — Provide comprehensive styling utilizing linear gradients, dark mode aesthetics, and responsive layout for the application.

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
- app: Engineering — migrate to typed API client (Mint Reyes)
- app: Engineering — refactor auth service (Mint Reyes)
- app: Engineering — refactor auth service (Nyx Petrov)
- app: Engineering — migrate to typed API client (Byte Bishop)
- app: Engineering — add retry queue to job runner (Volt Marlow)
- app: DevOps — harden CI pipeline (Cipher Bishop)
- app: Engineering — refactor auth service (Lyra Van Dyk)
- app: Engineering — split monolith module (Mint Reyes)
- app: Engineering — refactor auth service (Juno Bishop)
- app: Engineering — add retry queue to job runner (Mint Reyes)
- app: Engineering — split monolith module (Iris Marlow)
- app: Engineering — migrate to typed API client (Lyra Van Dyk)
- app: DevOps — autoscale worker pool (Volt Marlow)
- app: Engineering — add retry queue to job runner (Pixel Hale)
- app: Engineering — cache hot query path (Torq Hale)
- app: Engineering — add retry queue to job runner (Rune Nkosi)
- app: Engineering — cache hot query path (Mint Reyes)
- app: DevOps — add blue/green deploy (Quill Cross)
- app: Engineering — cache hot query path (Rune Nkosi)
- app: DevOps — wire log tracing (Quill Cross)
- app: Engineering — refactor auth service (Pixel Hale)
- app: DevOps — cut container image size (Onyx Van Dyk)
- app: Engineering — split monolith module (Volt Marlow)
- app: Engineering — cache hot query path (Volt Marlow)
- app: Engineering — add retry queue to job runner (Iris Reyes)
- app: Engineering — split monolith module (Rune Nkosi)
