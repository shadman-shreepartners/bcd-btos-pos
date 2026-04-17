import {
  EkispertSearchCourseDto,
  EkispertSearchLineDto,
  EkispertSearchPointDto,
  EkispertSearchPriceBreakdownDto,
  EkispertSearchPricesDto,
  EkispertSearchResponseDto,
  EkispertSearchRouteDto,
} from '../dto/ekispert-search.response.dto';

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asRecord(value: unknown): RawRecord | null {
  return isRecord(value) ? value : null;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

function getValue(
  record: RawRecord | null | undefined,
  keys: readonly string[],
): unknown {
  if (!record) return undefined;

  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) {
      return record[key];
    }
  }

  return undefined;
}

function toString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

function toNullableString(value: unknown): string | null {
  const result = toString(value);
  return result.length > 0 ? result : null;
}

function toInt(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value.trim(), 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function toFloat(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.trim());
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
  return false;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function formatJstIso(reference: Date): string {
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

  const value = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '00';

  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}:${value('second')}+09:00`;
}

function parseDateParts(dateString: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const compact = dateString.replace(/[^0-9]/g, '');

  if (compact.length !== 8) return null;

  const year = Number.parseInt(compact.slice(0, 4), 10);
  const month = Number.parseInt(compact.slice(4, 6), 10);
  const day = Number.parseInt(compact.slice(6, 8), 10);

  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return null;
  }

  return { year, month, day };
}

function buildJstIso(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): string {
  return `${year.toString().padStart(4, '0')}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}+09:00`;
}

function normalizeDateTime(value: unknown, fallbackDate?: string): string {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/Z$|[+-]\d{2}:?\d{2}$/.test(trimmed) || trimmed.includes('T')) {
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return formatJstIso(parsed);
    }
  }

  const dateTimeMatch = trimmed.match(
    /^(\d{4})[/-]?(\d{2})[/-]?(\d{2})[ T]?(\d{2}):?(\d{2})(?::?(\d{2}))?$/,
  );
  if (dateTimeMatch) {
    return buildJstIso(
      Number.parseInt(dateTimeMatch[1], 10),
      Number.parseInt(dateTimeMatch[2], 10),
      Number.parseInt(dateTimeMatch[3], 10),
      Number.parseInt(dateTimeMatch[4], 10),
      Number.parseInt(dateTimeMatch[5], 10),
      Number.parseInt(dateTimeMatch[6] ?? '0', 10),
    );
  }

  const compact = trimmed.replace(/[^0-9]/g, '');
  if (compact.length === 14) {
    return buildJstIso(
      Number.parseInt(compact.slice(0, 4), 10),
      Number.parseInt(compact.slice(4, 6), 10),
      Number.parseInt(compact.slice(6, 8), 10),
      Number.parseInt(compact.slice(8, 10), 10),
      Number.parseInt(compact.slice(10, 12), 10),
      Number.parseInt(compact.slice(12, 14), 10),
    );
  }

  if (compact.length === 12) {
    return buildJstIso(
      Number.parseInt(compact.slice(0, 4), 10),
      Number.parseInt(compact.slice(4, 6), 10),
      Number.parseInt(compact.slice(6, 8), 10),
      Number.parseInt(compact.slice(8, 10), 10),
      Number.parseInt(compact.slice(10, 12), 10),
      0,
    );
  }

  if (compact.length === 8 && fallbackDate === undefined) {
    return buildJstIso(
      Number.parseInt(compact.slice(0, 4), 10),
      Number.parseInt(compact.slice(4, 6), 10),
      Number.parseInt(compact.slice(6, 8), 10),
    );
  }

  const fallbackParts = fallbackDate ? parseDateParts(fallbackDate) : null;
  if (fallbackParts) {
    const timeOnlyMatch = trimmed.match(/^(\d{2}):?(\d{2})(?::?(\d{2}))?$/);
    if (timeOnlyMatch) {
      return buildJstIso(
        fallbackParts.year,
        fallbackParts.month,
        fallbackParts.day,
        Number.parseInt(timeOnlyMatch[1], 10),
        Number.parseInt(timeOnlyMatch[2], 10),
        Number.parseInt(timeOnlyMatch[3] ?? '0', 10),
      );
    }
  }

  return '';
}

function normalizeTypeValue(value: unknown): {
  type: string;
  typeDetail: string | null;
} {
  if (typeof value === 'string') {
    return { type: value, typeDetail: null };
  }

  const record = asRecord(value);
  if (!record) {
    return { type: '', typeDetail: null };
  }

  return {
    type: toString(getValue(record, ['text', 'Text', 'type', 'Type'])),
    typeDetail:
      toNullableString(
        getValue(record, ['detail', 'Detail', 'typeDetail', 'TypeDetail']),
      ) ?? null,
  };
}

function normalizePoint(raw: unknown): EkispertSearchPointDto {
  const record = asRecord(raw);
  const station = asRecord(getValue(record, ['Station', 'station'])) ?? record;

  const point = new EkispertSearchPointDto();
  point.stationCode = toString(
    getValue(station, [
      'code',
      'Code',
      'stationCode',
      'StationCode',
      'id',
      'Id',
    ]),
  );
  point.stationName = toString(
    getValue(station, ['name', 'Name', 'stationName', 'StationName']),
  );
  point.type = toString(getValue(station, ['type', 'Type']));
  point.prefecture = toString(
    getValue(station, ['prefecture', 'Prefecture', 'province', 'Province']),
  );
  point.lat = toFloat(
    getValue(station, ['lat', 'Lat', 'latitude', 'Latitude']),
  );
  point.lng = toFloat(
    getValue(station, ['lng', 'Lng', 'lon', 'Lon', 'longitude', 'Longitude']),
  );
  return point;
}

function normalizeLine(
  raw: unknown,
  searchDate: string,
): EkispertSearchLineDto {
  const record = asRecord(raw);
  const departureState = asRecord(
    getValue(record, ['DepartureState', 'departureState']),
  );
  const arrivalState = asRecord(
    getValue(record, ['ArrivalState', 'arrivalState']),
  );

  const line = new EkispertSearchLineDto();
  line.name = toString(
    getValue(record, ['name', 'Name', 'lineName', 'LineName']),
  );
  const type = normalizeTypeValue(getValue(record, ['Type', 'type']));
  line.type = type.type;
  line.typeDetail = type.typeDetail;
  line.number = toNullableString(getValue(record, ['number', 'Number']));
  line.destination = toNullableString(
    getValue(record, ['destination', 'Destination']),
  );
  line.departure =
    normalizeDateTime(
      getValue(record, [
        'departure',
        'Departure',
        'departureTime',
        'DepartureTime',
        'departureDateTime',
        'DepartureDateTime',
      ]) ?? getValue(departureState, ['time', 'Time', 'dateTime', 'DateTime']),
      searchDate,
    ) || normalizeDateTime(searchDate);
  line.arrival =
    normalizeDateTime(
      getValue(record, [
        'arrival',
        'Arrival',
        'arrivalTime',
        'ArrivalTime',
        'arrivalDateTime',
        'ArrivalDateTime',
      ]) ?? getValue(arrivalState, ['time', 'Time', 'dateTime', 'DateTime']),
      searchDate,
    ) || normalizeDateTime(searchDate);
  line.timeOnBoard = toInt(getValue(record, ['timeOnBoard', 'TimeOnBoard']));
  return line;
}

function normalizePrice(raw: unknown): EkispertSearchPriceBreakdownDto {
  const record = asRecord(raw);
  const price = new EkispertSearchPriceBreakdownDto();
  price.kind = toString(getValue(record, ['kind', 'Kind']));
  price.name = toNullableString(getValue(record, ['name', 'Name']));
  price.type = toNullableString(getValue(record, ['type', 'Type']));
  price.selected = toBoolean(getValue(record, ['selected', 'Selected']));
  price.oneway = toInt(getValue(record, ['oneway', 'Oneway']));
  price.round = toInt(getValue(record, ['round', 'Round']));
  return price;
}

function normalizePrices(rawPrices: unknown): EkispertSearchPricesDto {
  const prices = new EkispertSearchPricesDto();
  const list = asArray(rawPrices).map((item) => asRecord(item));

  const chargeSummary = list.find(
    (item) => toString(getValue(item, ['kind', 'Kind'])) === 'ChargeSummary',
  );
  const fareSummary = list.find(
    (item) => toString(getValue(item, ['kind', 'Kind'])) === 'FareSummary',
  );

  prices.chargeSummaryOneway = toInt(
    getValue(chargeSummary, ['oneway', 'Oneway']),
  );
  prices.chargeSummaryRound = toInt(
    getValue(chargeSummary, ['round', 'Round']),
  );
  prices.fareSummaryOneway = toInt(getValue(fareSummary, ['oneway', 'Oneway']));
  prices.fareSummaryRound = toInt(getValue(fareSummary, ['round', 'Round']));
  prices.breakdown = list
    .filter((item) => {
      const kind = toString(getValue(item, ['kind', 'Kind']));
      return kind === 'Charge' || kind === 'Fare';
    })
    .map((item) => normalizePrice(item));
  return prices;
}

function normalizeRoute(
  rawRoute: unknown,
  searchDate: string,
): EkispertSearchRouteDto {
  const record = asRecord(rawRoute);
  const route = new EkispertSearchRouteDto();
  route.timeOnBoard = toInt(getValue(record, ['timeOnBoard', 'TimeOnBoard']));
  route.timeOther = toInt(getValue(record, ['timeOther', 'TimeOther']));
  route.timeWalk = toInt(getValue(record, ['timeWalk', 'TimeWalk']));
  route.transferCount = toInt(
    getValue(record, ['transferCount', 'TransferCount']),
  );
  route.distance = toInt(getValue(record, ['distance', 'Distance']));
  route.points = asArray(
    getValue(record, ['Point', 'point', 'Points', 'points']),
  ).map((item) => normalizePoint(item));
  route.lines = asArray(
    getValue(record, ['Line', 'line', 'Lines', 'lines']),
  ).map((item) => normalizeLine(item, searchDate));
  return route;
}

function normalizeCourse(
  rawCourse: unknown,
  searchDate: string,
): EkispertSearchCourseDto {
  const record = asRecord(rawCourse);
  const course = new EkispertSearchCourseDto();
  course.serializeData = toString(
    getValue(record, ['SerializeData', 'serializeData']),
  );
  course.searchType =
    toString(getValue(record, ['searchType', 'SearchType'])) || 'departure';
  course.dataType = toString(getValue(record, ['dataType', 'DataType']));
  course.route = normalizeRoute(
    getValue(record, ['Route', 'route']),
    searchDate,
  );
  course.prices = normalizePrices(getValue(record, ['Price', 'price']));
  return course;
}

export function normalizeType(value: unknown): {
  type: string;
  typeDetail: string | null;
} {
  return normalizeTypeValue(value);
}

export function mapEkispertSearchResponse(
  raw: unknown,
  searchDate: string,
): EkispertSearchResponseDto {
  const dto = new EkispertSearchResponseDto();
  const root = asRecord(raw);
  const resultSet =
    asRecord(getValue(root, ['ResultSet', 'resultSet'])) ?? root;

  dto.apiVersion = toString(
    getValue(resultSet, ['apiVersion', 'ApiVersion', 'version', 'Version']),
  );
  dto.engineVersion = toString(
    getValue(resultSet, ['engineVersion', 'EngineVersion']),
  );
  dto.courses = asArray(getValue(resultSet, ['Course', 'course'])).map((item) =>
    normalizeCourse(item, searchDate),
  );

  return dto;
}
