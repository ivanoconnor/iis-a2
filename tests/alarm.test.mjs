import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeAlarm, demoContext, days, timeString } from '../src/lib/alarm.ts';
import { alarmPolicy } from '../config/alarm.ts';

const schedule = { preferred: '07:00', latest: '08:00' };

test('no adjustment with enough sleep or a deficit below the configured threshold', () => {
  assert.equal(computeAlarm(21 * 60, 8 * 60, 60, schedule).time, '07:00');
  assert.equal(computeAlarm(23 * 60 + alarmPolicy.adjustmentThresholdMinutes - 1, 8 * 60, 60, schedule).time, '07:00');
});

test('configured threshold enables adjustment, rounded down to five minutes', () => {
  const threshold = alarmPolicy.adjustmentThresholdMinutes;
  const expectedAdjustment = Math.floor(Math.min(60, threshold * alarmPolicy.deficitScale) / 5) * 5;
  assert.equal(computeAlarm(23 * 60 + threshold, 8 * 60, 60, schedule).adjustment, expectedAdjustment);
  assert.equal(computeAlarm(23 * 60 + 55, 8 * 60, 60, schedule).adjustment, Math.floor(55 * alarmPolicy.deficitScale / 5) * 5);
});

test('alternative policy controls both threshold and deficit scaling', () => {
  const policy = { adjustmentThresholdMinutes: 30, deficitScale: 0.25 };
  assert.equal(computeAlarm(23 * 60 + 29, 8 * 60, 60, schedule, null, policy).adjustment, 0);
  assert.equal(computeAlarm(23 * 60 + 30, 8 * 60, 60, schedule, null, policy).adjustment, 5);
  assert.equal(computeAlarm(24 * 60, 8 * 60, 60, schedule, null, policy).adjustment, 15);
});

test('demo context uses the selected night before and after midnight, including Sunday rollover', () => {
  assert.deepEqual(demoContext(0, 23 * 60), { morning: 1, currentDay: 0, alarmDayLabel: 'Tomorrow' });
  assert.deepEqual(demoContext(0, 24 * 60), { morning: 1, currentDay: 1, alarmDayLabel: 'Today' });
  const sunday = demoContext(6, 25 * 60);
  assert.equal(days[sunday.currentDay], 'Monday');
  assert.equal(sunday.morning, 0);
  assert.equal(sunday.alarmDayLabel, 'Today');
});

test('shared home/demo alarm uses the selected wake-up schedule and simulated bedtime', () => {
  const week = days.map(() => ({ preferred: '07:00', latest: '08:00' }));
  week[5] = { preferred: '08:00', latest: '09:00' };
  const fridayNight = demoContext(4, 25 * 60);
  const result = computeAlarm(25 * 60, 8 * 60, 20, week[fridayNight.morning]);
  assert.equal(fridayNight.currentDay, 5);
  assert.equal(result.time, '08:20');
  assert.equal(result.sleep, 7 * 60 + 20);
  const manual = computeAlarm(25 * 60, 8 * 60, 20, week[fridayNight.morning], '09:15');
  assert.equal(manual.time, '09:15');
  assert.equal(manual.sleep, 8 * 60 + 15);
});

test('maximum adjustment and latest alarm both constrain the result', () => {
  assert.equal(computeAlarm(25 * 60, 8 * 60, 20, schedule).time, '07:20');
  const capped = computeAlarm(25 * 60, 8 * 60, 60, { preferred: '07:00', latest: '07:10' });
  assert.equal(capped.time, '07:10');
  assert.equal(capped.adjustment, 10);
  assert.equal(computeAlarm(25 * 60, 8 * 60, 0, schedule).time, '07:00');
});

test('bedtimes after midnight produce the correct sleep duration', () => {
  const result = computeAlarm(25 * 60, 8 * 60, 20, schedule);
  assert.equal(result.sleep, 6 * 60 + 20);
  assert.equal(timeString(25 * 60), '01:00');
  assert.equal(timeString(27 * 60), '03:00');
});

test('manual override takes precedence over preferred, latest, and adjustment limits', () => {
  assert.equal(computeAlarm(23 * 60, 8 * 60, 0, schedule, '09:30').time, '09:30');
  const early = computeAlarm(23 * 60, 8 * 60, 60, schedule, '06:00');
  assert.equal(early.time, '06:00');
  assert.equal(early.sleep, 7 * 60);
  assert.equal(early.adjustment, 0);
});

test('automatic alarms stay within preferred and latest for every demo slider combination', () => {
  for (let bed = 21 * 60; bed <= 27 * 60; bed += 5) {
    for (let target = 4 * 60; target <= 12 * 60; target += 15) {
      for (let max = 0; max <= 60; max += 5) {
        const result = computeAlarm(bed, target, max, schedule);
        assert.ok(result.time >= schedule.preferred && result.time <= schedule.latest);
        assert.ok(result.adjustment >= 0 && result.adjustment <= max);
        assert.equal(result.adjustment % 5, 0);
      }
    }
  }
});

test('a 90-minute deficit proposes 30 minutes while keeping 20 until accepted', () => {
  const policy = { adjustmentThresholdMinutes: 45, deficitScale: 1 / 3 };
  for (const accepted of [undefined, false, true]) {
    const result = computeAlarm(24 * 60 + 30, 8 * 60, 20, schedule, null, policy, { maximumConfirmed: 60, accepted });
    assert.deepEqual(result.proposal, { time: '07:30', adjustment: 30, sleep: 7 * 60 });
    assert.equal(result.time, accepted ? '07:30' : '07:20');
    assert.equal(result.adjustment, accepted ? 30 : 20);
    assert.equal(result.sleep, accepted ? 7 * 60 : 6 * 60 + 50);
  }
});

test('proposals respect latest time and disappear when they cannot improve the automatic alarm', () => {
  const limited = computeAlarm(24 * 60 + 30, 8 * 60, 20, { preferred: '07:00', latest: '07:25' }, null, alarmPolicy, { maximumConfirmed: 60, accepted: true });
  assert.equal(limited.proposal.adjustment, 25);
  assert.equal(limited.time, '07:25');
  for (const latest of ['07:20', '07:10']) {
    const result = computeAlarm(24 * 60 + 30, 8 * 60, 20, { preferred: '07:00', latest }, null, alarmPolicy, { maximumConfirmed: 60, accepted: true });
    assert.equal(result.proposal, null);
    assert.equal(result.time, latest);
  }
});

test('confirmation defaults to 45 minutes, caps at 60, and respects smaller limits', () => {
  assert.equal(computeAlarm(27 * 60, 8 * 60, 20, schedule).proposal.adjustment, 45);
  assert.equal(computeAlarm(27 * 60, 8 * 60, 20, schedule, null, alarmPolicy, { maximumConfirmed: 90 }).proposal.adjustment, 60);
  assert.equal(computeAlarm(27 * 60, 8 * 60, 20, schedule, null, alarmPolicy, { maximumConfirmed: 25 }).proposal.adjustment, 25);
  for (const maximumConfirmed of [0, 15, 20]) {
    const result = computeAlarm(27 * 60, 8 * 60, 20, schedule, null, alarmPolicy, { maximumConfirmed, accepted: true });
    assert.equal(result.proposal, null);
    assert.equal(result.time, '07:20');
  }
});

test('threshold and manual overrides also apply to confirmed adjustments', () => {
  assert.equal(computeAlarm(23 * 60 + 44, 8 * 60, 0, schedule).proposal, null);
  const manual = computeAlarm(27 * 60, 8 * 60, 20, schedule, '06:30', alarmPolicy, { maximumConfirmed: 60, accepted: true });
  assert.equal(manual.time, '06:30');
  assert.equal(manual.proposal, null);
});
