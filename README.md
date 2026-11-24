# Daybreak

A responsive adaptive alarm demo built with Svelte 5, TypeScript, and Tailwind CSS 4.

## Run

```sh
yarn
yarn dev
```

## Verify

```sh
yarn run check
yarn test
yarn build
```

## Policy configuration

Preferences includes an **Advanced** section for the adjustment threshold (default `45` minutes, range 0–180) and deficit scale (default `0.334`, range 0–100%). Changes apply immediately and persist locally with the other preferences. Defaults are defined in `src/lib/alarm.ts`.

For sleep deficit D, adjustment is zero below the configured threshold. Otherwise it is the smaller of the user's automatic maximum and `deficitScale * D`, rounded down to five minutes, then capped at the latest alarm.

A separate confirmation maximum defaults to 45 minutes and can be set from 0 to 60 minutes. The same calculation using this limit produces a proposal only if it is later than the automatic alarm after applying the latest-time cap. Rejecting or ignoring the proposed alarm keeps the automatic alarm. Manual overrides always have the highest precedence.

`src/lib/alarm.ts` implements this calculation and the simulated day context. `tests/alarm.test.mjs` covers default and alternative policies, boundaries, manual overrides, day rollover, and all demo slider combinations.

See `DESIGN.md` for project UI design guidelines.

## Development record

- **13 November 2026:** Created the Svelte project and configured the static adapter.
- **16 November 2026:** Implemented the adaptive alarm and tests, aligned the home screen with demo settings, extracted policy configuration, and improved code readability and documentation.
- **17 November 2026:** Refined the UI and added user approval for proposed alarm adjustments, with tests for the confirmation policy.
- **24 November 2026:** Moved policy configuration into Preferences, with locally persisted advanced settings.
