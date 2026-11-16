import { alarmPolicy, type AlarmPolicy } from '../../config/alarm.ts';

export type DaySchedule = { preferred: string; latest: string };
export const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const defaultSchedule = (): DaySchedule[] => days.map((_, i) => ({ preferred: i < 5 ? '07:00' : '08:00', latest: i < 5 ? '07:45' : '09:00' }));
export const minutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
export const timeString = (value: number) => `${String(Math.floor(((value % 1440) + 1440) % 1440 / 60)).padStart(2, '0')}:${String(((value % 60) + 60) % 60).padStart(2, '0')}`;
export const duration = (value: number) => { const n = Math.max(0, Math.round(value)); return `${Math.floor(n / 60)}h${n % 60 ? ` ${n % 60}m` : ''}`; };
export function demoContext(night: number, bedtime: number) {
  const morning = (night + 1) % 7;
  return {
    morning,
    currentDay: bedtime >= 1440 ? morning : night,
    alarmDayLabel: bedtime >= 1440 ? 'Today' : 'Tomorrow'
  };
}

export function computeAlarm(bedtime: number, target: number, maximum: number, schedule: DaySchedule, override: string | null = null, policy: Readonly<AlarmPolicy> = alarmPolicy) {
  const preferred = minutes(schedule.preferred) + 1440;
  const latest = minutes(schedule.latest) + 1440;
  const deficit = Math.max(0, target - (preferred - bedtime));
  const adjustment = deficit < policy.adjustmentThresholdMinutes ? 0 : Math.floor(Math.min(maximum, policy.deficitScale * deficit) / 5) * 5;
  const scheduled = override ? minutes(override) + 1440 : Math.min(preferred + adjustment, latest);
  return { time: timeString(scheduled), adjustment: override ? 0 : scheduled - preferred, sleep: Math.max(0, scheduled - bedtime), deficit };
}
