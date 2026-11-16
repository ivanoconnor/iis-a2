/** Alarm policy configuration, shared with the static demo at build time. */
export type AlarmPolicy = {
  adjustmentThresholdMinutes: number;
  deficitScale: number;
};

export const alarmPolicy: Readonly<AlarmPolicy> = {
  adjustmentThresholdMinutes: 45,
  deficitScale: 0.5
};
