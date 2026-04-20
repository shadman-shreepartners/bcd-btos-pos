import { SupplierKind } from '../constants/jal.constants';

/**
 * Generates a project number in the legacy format: {CorpCode}{SupplierKind}{YYMM}{Seq5}
 *
 * Example: M5555J260300059
 *  - M5555  = corp code (from request)
 *  - J      = supplier kind (JAL)
 *  - 2603   = YYMM (March 2026)
 *  - 00059  = 5-digit sequence (timestamp-based, no DB)
 *
 * The sequence is derived from the current timestamp (HHMMSSmmm mod 99999 + 1)
 * to produce a near-unique 5-digit number without requiring a database counter.
 */
export function generateProjectNumber(
  corpCode: string,
  supplierKind: SupplierKind,
  reference: Date = new Date(),
): string {
  const yymm = getYymm(reference);
  const seq = getTimestampSeq(reference);
  return `${corpCode}${supplierKind}${yymm}${seq}`;
}

/** Returns YYMM from a date in JST (Asia/Tokyo) */
function getYymm(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: '2-digit',
    month: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value ?? '00';
  const month = parts.find((p) => p.type === 'month')?.value ?? '00';
  return `${year}${month}`;
}

/** Generates a 5-digit zero-padded sequence from timestamp (HHMMSSmmm % 99999 + 1) */
function getTimestampSeq(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const ms = date.getMilliseconds();
  const raw = h * 10_000_000 + m * 100_000 + s * 1_000 + ms;
  const seq = (raw % 99999) + 1;
  return String(seq).padStart(5, '0');
}
