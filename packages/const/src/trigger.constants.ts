export const TRIGGER_WAIT_UNITS = ['minutes', 'hours', 'days', 'weeks'] as const;
export type TriggerWaitUnits = (typeof TRIGGER_WAIT_UNITS)[number];
