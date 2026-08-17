export function recentDayBuckets(count = 7) {
  const buckets: { key: string; label: string }[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - offset);
    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString('en-NG', { weekday: 'short', timeZone: 'UTC' }).slice(0, 2),
    });
  }
  return buckets;
}

export function recentMonthBuckets(count = 6) {
  const buckets: { key: string; label: string }[] = [];
  const today = new Date();

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - offset, 1));
    buckets.push({
      key: date.toISOString().slice(0, 7),
      label: date.toLocaleDateString('en-NG', { month: 'short', timeZone: 'UTC' }),
    });
  }
  return buckets;
}

export function sumByBuckets<T>(items: T[], buckets: { key: string }[], dateOf: (item: T) => string, valueOf: (item: T) => number) {
  return buckets.map(({ key }) => items
    .filter((item) => dateOf(item).startsWith(key))
    .reduce((total, item) => total + valueOf(item), 0));
}
