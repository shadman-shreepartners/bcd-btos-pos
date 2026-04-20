/** Single source of truth for hotel offline selects + Yup `oneOf` validation. */
export const HOTEL_ROOM_CONDITION_OPTIONS = ["Non-smoking", "Smoking"] as const;

export const HOTEL_AMENITIES_OPTIONS = [
  "Room Only (no meal)",
  "Breakfast",
  "Breakfast and Dinner",
] as const;

export const HOTEL_ROOM_QUANTITY_OPTIONS = [1, 2, 3, 4, 5] as const;

export const HOTEL_ROOM_TYPE_OPTIONS = ["1 Bed", "2 Beds", "Others"] as const;

export type HotelRoomCondition = (typeof HOTEL_ROOM_CONDITION_OPTIONS)[number];
export type HotelAmenity = (typeof HOTEL_AMENITIES_OPTIONS)[number];
export type HotelRoomType = (typeof HOTEL_ROOM_TYPE_OPTIONS)[number];
