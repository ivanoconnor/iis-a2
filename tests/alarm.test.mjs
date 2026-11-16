import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeAlarm, demoContext, days, timeString } from '../src/lib/alarm.ts';
import { alarmPolicy } from '../config/alarm.ts';

const schedule = { preferred: '07:00', latest: '08:00' };

test('no adjustment with enough sleep or a deficit below the configured threshold', () => {
  assert.equal(computeAlarm(21 * 60, 480, 60, schedule).time, '07:00');
  assert.equal(computeAlarm(23 * 60 + alarmPolicy.adjustmentThresholdMinutes - 1, 480, 60, schedule).time, '07:00');
});

test('configured threshold enables adjustment, rounded down to five minutes', () => {
  const threshold = alarmPolicy.adjustmentThresholdMinutes;
  const expectedAdjustment = Math.floor(Math.min(60, threshold * alarmPolicy.deficitScale) / 5) * 5;
  assert.equal(computeAlarm(23 * 60 + threshold, 480, 60, schedule).adjustment, expectedAdjustment);
  assert.equal(computeAlarm(23 * 60 + 55, 480, 60, schedule).time, '07:25');
});

test('alternative policy controls both threshold and deficit scaling', () => {
  const policy = { adjustmentThresholdMinutes: 30, deficitScale: 0.25 };
  assert.equal(computeAlarm(23 * 60 + 29, 480, 60, schedule, null, policy).adjustment, 0);
  assert.equal(computeAlarm(23 * 60 + 30, 480, 60, schedule, null, policy).adjustment, 5);
  assert.equal(computeAlarm(24 * 60, 480, 60, schedule, null, policy).adjustment, 15);
});

test('demo context uses the selected night before and after midnight, including Sunday rollover', () => {
  assert.deepEqual(demoContext(0, 1380), { morning: 1, currentDay: 0, alarmDayLabel: 'Tomorrow' });
  assert.deepEqual(demoContext(0, 1440), { morning: 1, currentDay: 1, alarmDayLabel: 'Today' });
  const sunday = demoContext(6, 1500);
  assert.equal(days[sunday.currentDay], 'Monday');
  assert.equal(sunday.morning, 0);
  assert.equal(sunday.alarmDayLabel, 'Today');
});

test('shared home/demo alarm uses the selected wake-up schedule and simulated bedtime', () => {
  const week = days.map(() => ({ preferred: '07:00', latest: '08:00' }));
  week[5] = { preferred: '08:00', latest: '09:00' };
  const fridayNight = demoContext(4, 1500);
  const result = computeAlarm(1500, 480, 20, week[fridayNight.morning]);
  assert.equal(fridayNight.currentDay, 5);
  assert.equal(result.time, '08:20');
  assert.equal(result.sleep, 440);
  const manual = computeAlarm(1500, 480, 20, week[fridayNight.morning], '09:15');
  assert.equal(manual.time, '09:15');
  assert.equal(manual.sleep, 495);
});

test('maximum adjustment and latest alarm both constrain the result', () => {
  assert.equal(computeAlarm(25 * 60, 480, 20, schedule).time, '07:20');
  const capped = computeAlarm(25 * 60, 480, 60, { preferred: '07:00', latest: '07:10' });
  assert.equal(capped.time, '07:10');
  assert.equal(capped.adjustment, 10);
  assert.equal(computeAlarm(25 * 60, 480, 0, schedule).time, '07:00');
});

test('bedtimes after midnight produce the correct sleep duration', () => {
  const result = computeAlarm(25 * 60, 480, 20, schedule);
  assert.equal(result.sleep, 380);
  assert.equal(timeString(25 * 60), '01:00');
  assert.equal(timeString(27 * 60), '03:00');
});

test('manual override takes precedence over preferred, latest, and adjustment limits', () => {
  assert.equal(computeAlarm(23 * 60, 480, 0, schedule, '09:30').time, '09:30');
  const early = computeAlarm(23 * 60, 480, 60, schedule, '06:00');
  assert.equal(early.time, '06:00');
  assert.equal(early.sleep, 420);
  assert.equal(early.adjustment, 0);
});

test('automatic alarms stay within preferred and latest for every demo slider combination', () => {
  for (let bed = 1260; bed <= 1620; bed += 5) {
    for (let target = 240; target <= 720; target += 15) {
      for (let max = 0; max <= 60; max += 5) {
        const result = computeAlarm(bed, target, max, schedule);
        assert.ok(result.time >= schedule.preferred && result.time <= schedule.latest);
        assert.ok(result.adjustment >= 0 && result.adjustment <= max);
        assert.equal(result.adjustment % 5, 0);
      }
    }
  }
});
