# Daybreak

A responsive adaptive alarm demo built with Svelte 5, TypeScript, and Tailwind CSS 4.

## Run

```sh
npm install
npm run dev
```

## Verify

```sh
npm run check
npm test
npm run build
```

The static build is written to `build/`. Tests use Node 22.6 or newer for TypeScript stripping.

## Behavior

- Home and Demo share the same computed alarm, using the selected night, bedtime, preferences, and manual override. Home's clock and highlighted wake-up day follow that result. The header shows the simulated current weekday and bedtime, rather than the real date.
- Schedule sets each morning's preferred and latest alarm. Editing a time keeps latest at or after preferred.
- Preferences sets the sleep target and maximum automatic adjustment. Changes save immediately in local storage.
- Demo simulates a selected night and the following morning's schedule. Bedtime ranges from 21:00 to 03:00 in five-minute steps. Before midnight, Home labels the alarm Tomorrow; at or after midnight, Today. Its countdown measures from the simulated bedtime. Sunday night rolls over to Monday morning.
- The selected night and bedtime also persist locally. A fresh demo starts on Monday night at 23:00.
- A manual override takes precedence over all preferences on both screens and remains active until cleared on Home. Previously saved time/date overrides migrate to the new time-only format.

## Policy configuration

`config/alarm.ts` defines `alarmPolicy.adjustmentThresholdMinutes` (default `45`) and `alarmPolicy.deficitScale` (default `0.5`, or 50%). These are code-level policy settings, separate from user preferences. This static demo shares the configuration with its client at build time; rebuild after editing it.

For sleep deficit D, adjustment is zero below the configured threshold. Otherwise it is the smaller of the user's maximum and `deficitScale * D`, rounded down to five minutes, then capped at the latest alarm. The preference explanation reads the threshold from the same config.

`src/lib/alarm.ts` implements this calculation and the simulated day context. `tests/alarm.test.mjs` covers default and alternative policies, boundaries, manual overrides, day rollover, and all demo slider combinations.

See `DESIGN.md` for the persistent visual guidelines.
