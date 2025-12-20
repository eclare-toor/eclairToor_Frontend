import { MOCK_TRIPS, MOCK_ITINERARIES, MOCK_TRIP_HOTELS, MOCK_HOTELS, MOCK_USERS, MOCK_BOOKINGS, MOCK_CUSTOM_REQUESTS, MOCK_HOTEL_REQUESTS, MOCK_FLIGHT_REQUESTS, MOCK_MESSAGES } from './mock_data';
import type { Trip, TripItinerary, Hotel, User, Booking, CustomRequest, HotelRequest, FlightRequest, ContactMessage, ContactMessageStatus, BookingStatus, CustomRequestStatus } from './Types/index';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- TRIPS ---
export const getTrips = async (): Promise<Trip[]> => {
    await delay(1000);
    return MOCK_TRIPS;
};

export const getTripsByType = async (type: string): Promise<Trip[]> => {
    await delay(800);
    if (type === 'ALL') return MOCK_TRIPS;
    return MOCK_TRIPS.filter(t => t.type === type);
};

export interface TripDetails extends Trip {
    itinerary: TripItinerary[];
    hotels: Hotel[];
}

export const getTrip = async (id: string): Promise<TripDetails | null> => {
    await delay(1000);
    const trip = MOCK_TRIPS.find(t => t.id === id);
    if (!trip) return null;

    const itinerary = MOCK_ITINERARIES.filter(i => i.trip_id === id).sort((a, b) => a.day_number - b.day_number);

    const tripHotels = MOCK_TRIP_HOTELS.filter(th => th.trip_id === id).map(th => th.hotel_id);
    const hotels = MOCK_HOTELS.filter(h => tripHotels.includes(h.id));

    return {
        ...trip,
        itinerary,
        hotels
    };
};

// --- ADMIN TRIPS CRUD ---
export const createTrip = async (trip: Trip): Promise<Trip> => {
    await delay(1000);
    MOCK_TRIPS.unshift(trip);
    return trip;
};

export const updateTrip = async (trip: Trip): Promise<Trip> => {
    await delay(1000);
    const index = MOCK_TRIPS.findIndex(t => t.id === trip.id);
    if (index !== -1) {
        MOCK_TRIPS[index] = trip;
    }
    return trip;
};

export const deleteTrip = async (id: string): Promise<void> => {
    await delay(800);
    const index = MOCK_TRIPS.findIndex(t => t.id === id);
    if (index !== -1) {
        MOCK_TRIPS.splice(index, 1);
    }
};

// --- HOTELS ---
export const getHotels = async (): Promise<Hotel[]> => {
    await delay(800);
    return MOCK_HOTELS;
};

export const createHotel = async (hotel: Hotel): Promise<Hotel> => {
    await delay(800);
    MOCK_HOTELS.unshift(hotel);
    return hotel;
};

export const deleteHotel = async (id: string): Promise<void> => {
    await delay(800);
    const index = MOCK_HOTELS.findIndex(h => h.id === id);
    if (index !== -1) {
        MOCK_HOTELS.splice(index, 1);
    }
};


// --- AUTH & USERS ---
export interface AuthResponse { 
    message: string;
    user: User;
    token: string;
}

export interface RegisterPayload {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    linkFacebook: string;
    nationalite: string;
    phone: string;
    role: string;
}


export const register = async (data: RegisterPayload): Promise<AuthResponse> => {
    console.log('🔄 API: Calling register endpoint with data:', data);

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        console.log('📡 API: Response status:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('🔴 API: Error response:', errorData);
            throw new Error(errorData.message || errorData.error || `Registration failed (${response.status})`);
        }

        const result = await response.json();
        console.log('✅ API: Registration successful:', result);
        return result;
    } catch (error) {
        console.error('🔴 API: Fetch error:', error);
        throw error;
    }
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
   try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    console.log(response.status,response.statusText)

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'login failed');
    }

    const result = await response.json();
    console.log(result)
    return result;
   } catch (error) {
    console.error('🔴 API: Fetch error:', error);
    throw error;
   }
};

export const getUserById = async (id: string): Promise<User | null> => {
    await delay(500);
    const user = MOCK_USERS.find(u => u.id === id);
    return user || null;
};

export const getUsers = async (): Promise<User[]> => {
    await delay(800);
    return MOCK_USERS;
};

export const deleteUser = async (id: string): Promise<void> => {
    await delay(800);
    const index = MOCK_USERS.findIndex(u => u.id === id);
    if (index !== -1) {
        MOCK_USERS.splice(index, 1);
    }
};

// --- RESERVATIONS & BOOKINGS ---
export const createReservation = async (reservationData: Omit<Booking, 'id' | 'created_at' | 'status' | 'description'>): Promise<Booking> => {
    await delay(1500);
    console.log("Reservation Created:", reservationData);

    const newBooking: Booking = {
        id: `RES-${Date.now()}`,
        status: 'PENDING',
        description: '',
        created_at: new Date().toISOString(),
        ...reservationData
    };
    MOCK_BOOKINGS.unshift(newBooking);
    return newBooking;
};

export const getAllBookings = async (): Promise<Booking[]> => {
    await delay(800);
    return MOCK_BOOKINGS;
};

export const updateBookingStatus = async (id: string, status: BookingStatus, description?: string): Promise<Booking | null> => {
    await delay(800);
    const booking = MOCK_BOOKINGS.find(b => b.id === id);
    if (booking) {
        booking.status = status;
        if (description !== undefined) booking.description = description;
        return booking;
    }
    return null;
};


// --- CUSTOM REQUESTS ---
export const getCustomRequests = async (): Promise<CustomRequest[]> => {
    await delay(800);
    return MOCK_CUSTOM_REQUESTS;
};

export const updateCustomRequestStatus = async (id: string, status: CustomRequestStatus): Promise<void> => {
    await delay(500);
    const req = MOCK_CUSTOM_REQUESTS.find(r => r.id === id);
    if (req) req.status = status;
};

// --- SERVICE REQUESTS ---
export const getServiceRequests = async (): Promise<{ hotels: HotelRequest[], flights: FlightRequest[] }> => {
    await delay(800);
    return {
        hotels: MOCK_HOTEL_REQUESTS,
        flights: MOCK_FLIGHT_REQUESTS
    };
};

// --- MESSAGES ---
export const getContactMessages = async (): Promise<ContactMessage[]> => {
    await delay(500);
    return MOCK_MESSAGES;
};

export const updateMessageStatus = async (id: string, status: ContactMessageStatus): Promise<void> => {
    await delay(300);
    const msg = MOCK_MESSAGES.find(m => m.id === id);
    if (msg) msg.status = status;
};
