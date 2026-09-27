export const toAuditTarget = (type: string, id: string | number) => `${type}#${id}`;

export const mergeWindowsMinutes = 30;

export const isWithinMergeWindow = (createdAt: string, now: string | Date = new Date()): boolean =>
  new Date(createdAt).getTime() + mergeWindowsMinutes * 60_000 >= new Date(now).getTime();

export const isoNow = (): string => new Date().toISOString();

export const dedupePhones = (phones: string[]): string[] => [...new Set(phones.filter(Boolean))];
