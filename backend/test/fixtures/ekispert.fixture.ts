import { EkispertSearchRequestDto } from '../../src/modules/integrations/ekispert/dto/ekispert-search.request.dto';

export const EKISPERT_CONFIG_ENV: Record<string, string> = {
  EKISPERT_API_KEY: 'TEST_EKISPERT_API_KEY',
  EKISPERT_BASE_URL: 'http://api.ekispert.jp/v1/json',
};

export const EKISPERT_SEARCH_REQUEST: EkispertSearchRequestDto = {
  origin: '東京',
  destination: '大阪',
  date: '20260501',
  time: '0900',
};

export const EKISPERT_SEARCH_REQUEST_ARRIVAL: EkispertSearchRequestDto = {
  origin: '東京',
  destination: '大阪',
  date: '20260501',
  time: '0900',
  searchType: 'arrival',
  answerCount: 9,
};

const EKISPERT_BASE_ROUTE = {
  timeOnBoard: '60',
  timeOther: '15',
  timeWalk: '5',
  transferCount: '1',
  distance: '1234',
  Point: [
    {
      Station: {
        code: '1130101',
        name: '東京',
        type: 'station',
        prefecture: '東京都',
        lat: '35.681236',
        lng: '139.767125',
      },
    },
    {
      Station: {
        code: '2200111',
        name: '大阪',
        type: 'station',
        prefecture: '大阪府',
        lat: '34.702485',
        lng: '135.495951',
      },
    },
  ],
  Line: {
    name: '東海道新幹線',
    Type: { text: 'train', detail: 'shinkansen' },
    number: 'Nozomi 123',
    destination: '新大阪',
    departure: '0900',
    arrival: '1015',
    timeOnBoard: '60',
  },
};

const EKISPERT_BASE_PRICES = [
  { kind: 'ChargeSummary', oneway: '13370', round: '26740' },
  { kind: 'FareSummary', oneway: '1490', round: '2980' },
  {
    kind: 'Fare',
    name: 'IC',
    type: 'adult',
    selected: 'true',
    oneway: '1490',
    round: '2980',
  },
  {
    kind: 'Charge',
    name: 'Base fare',
    type: 'adult',
    selected: 'false',
    oneway: '11880',
    round: '23760',
  },
];

const EKISPERT_BASE_COURSE = {
  SerializeData: 'SerializeData=viaList%3D%E6%9D%B1%E4%BA%AC%3A%E5%A4%A7%E9%98%AA&token=abc123',
  searchType: 'departure',
  dataType: 'route',
  Route: EKISPERT_BASE_ROUTE,
  Price: EKISPERT_BASE_PRICES,
};

const EKISPERT_ARRIVAL_COURSE = {
  SerializeData:
    'SerializeData=viaList%3D%E6%9D%B1%E4%BA%AC%3A%E5%A4%A7%E9%98%AA&token=def456',
  searchType: 'arrival',
  dataType: 'route',
  Route: {
    ...EKISPERT_BASE_ROUTE,
    timeOnBoard: '90',
    timeOther: '20',
    timeWalk: '10',
    transferCount: '2',
    distance: '4321',
    Line: {
      name: '中央線快速',
      Type: 'train',
      number: '1234',
      destination: '名古屋',
      departure: '1200',
      arrival: '1320',
      timeOnBoard: '80',
    },
  },
  Price: [
    { kind: 'ChargeSummary', oneway: '5000', round: '10000' },
    { kind: 'FareSummary', oneway: '6200', round: '12400' },
    {
      kind: 'Fare',
      name: 'IC',
      type: 'adult',
      selected: 'false',
      oneway: '6200',
      round: '12400',
    },
    {
      kind: 'Charge',
      name: 'Base fare',
      type: 'adult',
      selected: 'true',
      oneway: '5000',
      round: '10000',
    },
  ],
};

export const EKISPERT_RAW_SINGLE_RESPONSE = {
  ResultSet: {
    apiVersion: '1.0',
    engineVersion: '2.3',
    Course: EKISPERT_BASE_COURSE,
  },
};

export const EKISPERT_RAW_MULTIPLE_RESPONSE = {
  ResultSet: {
    apiVersion: '1.0',
    engineVersion: '2.3',
    Course: [EKISPERT_BASE_COURSE, EKISPERT_ARRIVAL_COURSE],
  },
};