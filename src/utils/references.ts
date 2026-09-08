type ReferencedRecord = { id: string; createdAt: string; reference?: string };

const datePart = (value: string) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

const stableNumber = (value: string) => {
  let hash = 0;
  for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) % 1000000;
  return String(Math.max(1, hash)).padStart(6, '0');
};

export function createReference(prefix: string, createdAt: string, records: ReferencedRecord[]) {
  const date = datePart(createdAt);
  const pattern = new RegExp(`^[A-Z]+-${date}-(\\d+)$`);
  const greatestStoredSequence = records.reduce((greatest, record) => {
    const match = record.reference?.match(pattern);
    return Math.max(greatest, match ? Number(match[1]) : 0);
  }, 0);
  const recordsToday = records.filter((record) => datePart(record.createdAt) === date).length;
  return `${prefix}-${date}-${String(Math.max(greatestStoredSequence, recordsToday) + 1).padStart(3, '0')}`;
}

export function displayReference(prefix: string, record: ReferencedRecord) {
  if (record.reference) return replaceReferencePrefix(record.reference, prefix);
  return `${prefix}-${datePart(record.createdAt)}-${stableNumber(record.id)}`;
}

export function replaceReferencePrefix(reference: string, prefix: string) {
  const separator = reference.indexOf('-');
  return separator >= 0 ? `${prefix}${reference.slice(separator)}` : `${prefix}-${reference}`;
}
