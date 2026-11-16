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

`config/alarm.ts` defines `alarmPolicy.adjustmentThresholdMinutes` (default `45`) and `alarmPolicy.deficitScale` (default `0.5`, or 50%).

For sleep deficit D, adjustment is zero below the configured threshold. Otherwise it is the smaller of the user's maximum and `deficitScale * D`, rounded down to five minutes, then capped at the latest alarm.

`src/lib/alarm.ts` implements this calculation and the simulated day context. `tests/alarm.test.mjs` covers default and alternative policies, boundaries, manual overrides, day rollover, and all demo slider combinations.

See `DESIGN.md` for project UI design guidelines.
