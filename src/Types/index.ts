export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  is_active?: boolean;
  created_at: string;
  linkfacebook?: string;
  nationalite: string;
  phone?: string;
  password_hash?: string;

}

export interface Hotel {
  id: string;
  name: string;
  city: string; // Makkah, Madinah, Alger...
  stars: number; // 1–5
  maps_url: string;
  address?: string;
  created_at: string;
}



export type TripType = "NATIONAL" | "INTERNATIONAL" | "OMRA";

export interface Trip {
  id: string;
  type: TripType;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: number;
  images: string[];
  equipment_list: string[];
  personalized_fields?: string;
  created_at: string;
}

export interface TripItinerary {
  id: string;
  trip_id: string;
  day_number: number;
  activities: string[] | string;
}


export interface TripHotel {
  trip_id: string;
  hotel_id: string;
}





export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PAID"
  | "CANCELLED"
  | "REJECTED";

export interface Booking {
  id: string;
  user_id: string;
  trip_id: string;
  passengers_adult: number;
  passengers_child: number;
  passengers_baby: number;
  total_price: number;
  status: BookingStatus;
  description: string;//admin add description
  created_at: string;
}


export type CustomRequestType = "NATIONAL" | "INTERNATIONAL" | "OMRA";

export type CustomRequestStatus = "PENDING" | "PROCESSED" | "REJECTED";

export interface CustomRequest {
  id: string;
  user_id?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  type: CustomRequestType;
  destination: string;
  duration_days?: number;
  budget?: number;
  notes?: string;
  hotel_preference_stars?: number;
  selected_hotels?: string[]; // hotel IDs
  options_meals?: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  options_transport?: string; // Bus | Train | Car (Omra)
  status: CustomRequestStatus;
  description: string;
  created_at: string;
}



export type FlightRequestType = "ONE_WAY" | "ROUND_TRIP";

export type FlightClass = "ECONOMY" | "BUSINESS" | "FIRST";

export type FlightRequestStatus = "PENDING" | "PROCESSED" | "REJECTED";

export interface FlightRequest {
  id: string;
  user_id?: string;
  trip_type: FlightRequestType;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  return_date?: string; // required if ROUND_TRIP
  flight_class: FlightClass;
  passengers_adults: number;
  passengers_children: number;
  passengers_babies: number;
  status: FlightRequestStatus;
  created_at: string;
}



export type HotelRequestStatus =
  | "PENDING"
  | "CONFIRMED"
  | "UNAVAILABLE";

export interface HotelRequest {
  id: string;
  user_id?: string;
  wilaya: string;
  exact_location?: string;
  check_in_date: string;
  check_out_date: string;
  stars_preference: number;
  rooms_count: number;
  guests_adults: number;
  guests_children: number;
  guests_babies: number;
  status: HotelRequestStatus;
  created_at: string;
}

export type ContactMessageStatus =
  | "UNREAD"
  | "READ"
  | "REPLIED"
  | "ARCHIVED";

export interface ContactMessage {
  id: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactMessageStatus;
  created_at: string;
}
