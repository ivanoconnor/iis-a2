import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeAlarm, timeString } from '../src/lib/alarm.ts';

const schedule = { preferred: '07:00', latest: '08:00' };

test('no adjustment with enough sleep or a deficit below 45 minutes', () => {
  assert.equal(computeAlarm(21 * 60, 480, 60, schedule).time, '07:00');
  assert.equal(computeAlarm(23 * 60 + 44, 480, 60, schedule).time, '07:00');
});

test('45-minute threshold enables adjustment, rounded down to five minutes', () => {
  assert.equal(computeAlarm(23 * 60 + 45, 480, 60, schedule).time, '07:20');
  assert.equal(computeAlarm(23 * 60 + 55, 480, 60, schedule).time, '07:25');
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
  for (let bed = 1260; bed <= 1620; bed += 30) {
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
