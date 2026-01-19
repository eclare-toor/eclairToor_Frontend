export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  is_active: boolean | null;
  created_at: string | null;
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
  type?: string;
  images?: string[] | null;
  created_at: string;
  updated_at?: string;
}



export type TripType = "national" | "international" | "religieuse";

export interface Trip {
  id: string;
  type: TripType;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  base_price: number;
  images: string[];
  equipment_list?: string[] | string;
  destination_wilaya?: string;
  destination_country?: string;
  omra_category?: string;
  omra_type?: 'classic' | 'vip';
  options?: {
    prix_2_chmpre?: number;
    prix_3_chmpre?: number;
    prix_4_chmpre?: number;
  };
  created_at: string;
}

export interface TripItinerary {
  id: string;
  trip_id: string;
  day_date: string;
  activities: string[] | string;
}


export interface TripHotel {
  trip_id: string;
  hotel_id: string;
  description?: string;
  name: string;
  city: string;
  stars: number;
  address?: string;
  image?: string;
  images?: string[] | null;
  maps_url?: string;
  type?: string;
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
  total_price?: number;
  status: BookingStatus;
  description?: string;
  created_at: string | null;
  updated_at: string | null;
  // New columns for Omra/Parity
  options?: {
    "champre-2"?: number;
    "champre-3"?: number;
    "champre-4"?: number;
  };
  prix_calculer?: number | string;
  prix_vrai_paye?: number | string;
}

export interface BookingItem extends Booking {
  nom?: string;
  prenom?: string;
  email?: string;
  title?: string;
  destination_country?: string | null;
  type?: TripType;
  omra_category?: string | null;
  base_price?: string | number;
}


export type CustomRequestType = "NATIONAL" | "INTERNATIONAL" | "OMRA";

export type CustomRequestStatus = "PENDING" | "PROCESSED" | "REJECTED" | "CANCELLED";

export type RequestCategory = 'voyage' | 'omra' | 'hotel' | 'vol';

export interface UnifiedRequest {
  id: string;
  user_id: string;
  category: RequestCategory;
  info: any;
  status: CustomRequestStatus | null;
  created_at: string | null;
  updated_at: string | null;
  response_id?: string | null;
  admin_id?: string | null;
  offer?: string | null;
  response_created_at?: string | null;
}

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
  id: string | number;
  user_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: ContactMessageStatus | null;
  created_at: string | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean | null;
  action_url?: string;
  metadata?: any;
  created_at: string | null;
  expires_at?: string | null;
}

// --- DASHBOARD INTERFACES ---

export interface DashboardKPIs {
  total_users: string;
  total_trips: string;
  total_bookings: string;
  pending_bookings: string;
  confirmed_bookings: string;
  paid_bookings: string;
  cancelled_bookings: string;
  total_revenue: string;
}

export interface MonthlyData {
  month: string;
  total: string | number;
}

export interface TypeData {
  type: string;
  total: string | number;
}

export interface StatusData {
  status: string;
  total: string | number;
}

export interface DestinationData {
  destination_country: string | null;
  bookings: string;
}

export interface ConversionData {
  conversion_rate: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  usersPerMonth: MonthlyData[];
  bookingsPerMonth: MonthlyData[];
  revenuePerMonth: MonthlyData[];
  tripsByType: TypeData[];
  bookingsByStatus: StatusData[];
  revenueByTrip: any[]; // Adjust if you know the structure
  topDestinations: DestinationData[];
  conversion: ConversionData;
}
