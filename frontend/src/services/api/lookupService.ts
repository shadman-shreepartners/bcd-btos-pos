import { apiClient } from "./client";

export type HotelAmenityOption = { id: number; name: string };

export type HotelAmenitiesLookupData = {
  numberOfRoomsOptions: HotelAmenityOption[];
  smokingCondition: HotelAmenityOption[];
  mealPlanOptions: HotelAmenityOption[];
  bedTypeOptions: string[];
};

type HotelAmenitiesApiBody = {
  success: boolean;
  message: string;
  data?: {
    numberOfRooms?: HotelAmenityOption[];
    smokingCondition?: HotelAmenityOption[];
    mealPlan?: HotelAmenityOption[];
    bedType?: string[];
  };
};

export const lookupService = {
  async getHotelAmenities(): Promise<HotelAmenitiesLookupData> {
    const { data: body } = await apiClient.get<HotelAmenitiesApiBody>(
      "/lookup/hotels/amenities",
    );

    if (body?.success === false) {
      throw new Error(
        body.message?.trim() || "Hotel amenities lookup unsuccessful",
      );
    }

    const d = body?.data ?? {};
    return {
      numberOfRoomsOptions: Array.isArray(d.numberOfRooms)
        ? d.numberOfRooms
        : [],
      smokingCondition: Array.isArray(d.smokingCondition)
        ? d.smokingCondition
        : [],
      mealPlanOptions: Array.isArray(d.mealPlan) ? d.mealPlan : [],
      bedTypeOptions: Array.isArray(d.bedType) ? d.bedType : [],
    };
  },
};
