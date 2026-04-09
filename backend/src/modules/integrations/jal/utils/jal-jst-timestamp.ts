/**
 * JAL JOHN RetrieveProcedure requires `in1` as current time in JST (Japan Standard Time, UTC+9),
 * format `YYYY-MM-DDTHH:mm:ss+09:00` per JAL SOAP API documentation.
 */
export function formatNowJstIso8601(reference: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(reference);

  const v = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '00';

  const pad = (s: string) => s.padStart(2, '0');

  const year = v('year');
  const month = pad(v('month'));
  const day = pad(v('day'));
  const hour = pad(v('hour'));
  const minute = pad(v('minute'));
  const second = pad(v('second'));

  return `${year}-${month}-${day}T${hour}:${minute}:${second}+09:00`;
}
