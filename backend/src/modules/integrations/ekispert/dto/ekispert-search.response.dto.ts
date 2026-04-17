export class EkispertSearchPointDto {
  stationCode!: string;
  stationName!: string;
  type!: string;
  prefecture!: string;
  lat!: number;
  lng!: number;
}

export class EkispertSearchLineDto {
  name!: string;
  type!: string;
  typeDetail!: string | null;
  number!: string | null;
  destination!: string | null;
  departure!: string;
  arrival!: string;
  timeOnBoard!: number;
}

export class EkispertSearchPriceBreakdownDto {
  kind!: string;
  name!: string | null;
  type!: string | null;
  selected!: boolean;
  oneway!: number;
  round!: number;
}

export class EkispertSearchPricesDto {
  chargeSummaryOneway!: number;
  chargeSummaryRound!: number;
  fareSummaryOneway!: number;
  fareSummaryRound!: number;
  breakdown: EkispertSearchPriceBreakdownDto[] = [];
}

export class EkispertSearchRouteDto {
  timeOnBoard!: number;
  timeOther!: number;
  timeWalk!: number;
  transferCount!: number;
  distance!: number;
  points: EkispertSearchPointDto[] = [];
  lines: EkispertSearchLineDto[] = [];
}

export class EkispertSearchCourseDto {
  serializeData!: string;
  searchType!: string;
  dataType!: string;
  route: EkispertSearchRouteDto = new EkispertSearchRouteDto();
  prices: EkispertSearchPricesDto = new EkispertSearchPricesDto();
}

export class EkispertSearchResponseDto {
  apiVersion!: string;
  engineVersion!: string;
  courses: EkispertSearchCourseDto[] = [];
}
