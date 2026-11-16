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

- Home shows the next preferred alarm or the active manual override, with a countdown when it is within ten hours.
- Schedule sets each morning's preferred and latest alarm. Editing a time keeps latest at or after preferred.
- Preferences sets the sleep target and maximum automatic adjustment. Changes save immediately in local storage.
- Demo simulates a selected night and the following morning's schedule. Bedtime ranges from 21:00 to 03:00 in half-hour steps. Simulation does not change the next real calendar alarm on Home.
- An override chooses the next occurrence of the entered time, takes precedence over all preferences, and expires after that time. Clear it on Home to resume the schedule.

`src/lib/alarm.ts` implements the requested sleep-deficit threshold, half-deficit adjustment, five-minute rounding, maximum adjustment, and latest-time cap. `tests/alarm.test.mjs` covers the boundaries and all demo slider combinations.

See `DESIGN.md` for the persistent visual guidelines.
