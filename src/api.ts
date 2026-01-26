import type { Trip, TripItinerary, Hotel, TripHotel, User, Booking, BookingItem, ContactMessage, BookingStatus, CustomRequestStatus, UnifiedRequest, AppNotification, DashboardData } from './Types/index';

// --- DASHBOARD ---
export const getDashboardStats = async (): Promise<DashboardData> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/dashbord', { // Note: using 'dashbord' as requested
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to fetch dashboard stats');
        }

        return result;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        throw error;
    }
};

// --- TRIPS ---
export const getTrips = async (): Promise<Trip[]> => {
    try {
        const response = await fetch('http://localhost:3000/api/trips');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trips:', error);
        throw error;
    }
};


// Removed TripDetails since we are fetching separately now, or we can keep it but with optional fields if we aggregate later.
// For now, let's keep it simple.

export const getTrip = async (id: string): Promise<Trip | null> => {
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${id}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trip:', error);
        throw error;
    }
};

export const getTripItinerary = async (tripId: string): Promise<TripItinerary[]> => {
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/itinerary`);
        if (!response.ok) {
            // It might return 404 if no itinerary exists, in which case we return empty array
            if (response.status === 404) return [];
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trip itinerary:', error);
        throw error;
    }
};

export const getTripHotels = async (tripId: string): Promise<TripHotel[]> => {
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/hotels`);
        if (!response.ok) {
            // It might return 404 if no hotels linked, in which case we return empty array
            if (response.status === 404) return [];
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching trip hotels:', error);
        throw error;
    }
};

// --- ADMIN TRIPS CRUD ---

import Cookies from 'js-cookie';
export const createTrip = async (tripData: FormData): Promise<Trip> => {
    const token = Cookies.get('token')
    try {
        const response = await fetch('http://localhost:3000/api/trips/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: tripData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to create trip');
        }

        return result;
    } catch (error) {
        console.error('Error creating trip:', error);
        throw error;
    }
};

export const updateTrip = async (id: string, tripData: FormData | Partial<Trip>): Promise<Trip> => {
    const token = Cookies.get('token');
    const isFormData = tripData instanceof FormData;

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
    };

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        let body: any = tripData;
        if (!isFormData) {
            // Handle options if present in Partial<Trip>
            const trip = tripData as Partial<Trip>;
            body = JSON.stringify(trip);
        }

        const response = await fetch(`http://localhost:3000/api/trips/${id}`, {
            method: 'PUT',
            headers: headers,
            body: body
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to update trip');
        }

        return result;
    } catch (error) {
        console.error('Error updating trip:', error);
        throw error;
    }
};

export const deleteTrip = async (id: string): Promise<void> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || result.message || 'Failed to delete trip');
        }
    } catch (error) {
        console.error('Error deleting trip:', error);
        throw error;
    }
};

export const addTripImages = async (tripId: string, imagesData: FormData): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: imagesData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to add images');
        }

        return result;
    } catch (error) {
        console.error('Error adding trip images:', error);
        throw error;
    }
};

export const deleteTripImages = async (tripId: string, names: string[]): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/images`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ names })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to delete images');
        }

        return result;
    } catch (error) {
        console.error('Error deleting trip images:', error);
        throw error;
    }
};

export interface CreateItineraryPayload {
    day_date: string;
    activities: string;
}

export const createTripItineraries = async (tripId: string, itineraries: CreateItineraryPayload[]): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/itinerary`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ itineraries })
        });
        const result = await response.json()
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to create itineraries');
        }

        return result;
    } catch (error) {
        console.error('Error creating itineraries:', error);
        throw error;
    }
};

export interface TripHotelLink {
    hotel_id: string;
    description?: string;
}

export const updateTripItinerary = async (tripId: string, itineraryId: string, data: Partial<CreateItineraryPayload>): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/itinerary/${itineraryId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update itinerary');
        }

        return result;
    } catch (error) {
        console.error('Error updating itinerary:', error);
        throw error;
    }
};

export const deleteTripItinerary = async (tripId: string, itineraryId: string): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/itinerary/${itineraryId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to delete itinerary');
        }

        return result;
    } catch (error) {
        console.error('Error deleting itinerary:', error);
        throw error;
    }
};

export const deleteAllTripItineraries = async (tripId: string): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/itinerary`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to delete all itineraries');
        }

        return result;
    } catch (error) {
        console.error('Error deleting all itineraries:', error);
        throw error;
    }
};

export const deleteTripHotel = async (tripId: string, hotelId: string): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to delete trip hotel linkage');
        }

        return result;
    } catch (error) {
        console.error('Error deleting trip hotel:', error);
        throw error;
    }
};

export const linkTripHotels = async (tripId: string, hotels: TripHotelLink[]): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/trips/${tripId}/hotels`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hotels })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to link hotels to trip');
        }

        return result;
    } catch (error) {
        console.error('Error linking hotels:', error);
        throw error;
    }
};

// --- HOTELS ---
export const getHotels = async (): Promise<Hotel[]> => {
    try {
        const response = await fetch('http://localhost:3000/api/hotels');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hotels:', error);
        throw error;
    }
};

export const getHotel = async (id: string): Promise<Hotel> => {
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching hotel:', error);
        throw error;
    }
};

export const getHotelsByType = async (type: string): Promise<Hotel[]> => {
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/type/${type}`);
        if (!response.ok) {
            // If 404, maybe return empty list or throw? Let's return empty list for 404 as it is safer for UI.
            if (response.status === 404) return [];
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching hotels of type ${type}:`, error);
        throw error;
    }
};

export const createHotel = async (hotel: Partial<Hotel>): Promise<Hotel> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(hotel)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to create hotel');
        }

        return result;
    } catch (error) {
        console.error('Error creating hotel:', error);
        throw error;
    }
};

export const updateHotel = async (id: string, hotel: Partial<Hotel>): Promise<Hotel> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(hotel)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update hotel');
        }

        return result;
    } catch (error) {
        console.error('Error updating hotel:', error);
        throw error;
    }
};

export const deleteHotel = async (id: string): Promise<void> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || result.message || 'Failed to delete hotel');
        }
    } catch (error) {
        console.error('Error deleting hotel:', error);
        throw error;
    }
};

export const addHotelImages = async (hotelId: string, imagesData: FormData): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}/images`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: imagesData
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to add hotel images');
        }

        return result;
    } catch (error) {
        console.error('Error adding hotel images:', error);
        throw error;
    }
};

export const deleteHotelImages = async (hotelId: string, names: string[]): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/${hotelId}/images`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ names })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to delete hotel images');
        }

        return result;
    } catch (error) {
        console.error('Error deleting hotel images:', error);
        throw error;
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

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'login failed');
        }

        return result;
    } catch (error) {
        console.error('🔴 API: Fetch error:', error);
        throw error;
    }
};



export const getUsers = async (): Promise<User[]> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/auth/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to fetch users');
        }

        return result.users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const deleteUser = async (id: string): Promise<void> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/auth/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || result.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export const updateUserStatus = async (userId: string, status: boolean): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/auth/activate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId, status })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update user status');
        }

        return result;
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

export const updateProfile = async (data: any): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/auth/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update profile');
        }

        return result;
    } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
};


export const adminUpdateUser = async (userId: string, data: any): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/auth/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_user: userId, ...data })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update user');
        }

        return result;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// --- RESERVATIONS & BOOKINGS ---
// Payload matches the user request: trip_id, passengers counts.
// Backend response matches Booking interface.
export interface CreateBookingPayload {
    trip_id: string;
    user_id?: string; // Optional for admin to specify a user
    passengers_adult: number;
    passengers_child: number;
    passengers_baby: number;
    prix_calculer?: number;
    options?: {
        "champre-2"?: number;
        "champre-3"?: number;
        "champre-4"?: number;
    };
}

export const createReservation = async (data: CreateBookingPayload): Promise<Booking> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to create reservation');
        }

        return result;
    } catch (error) {
        console.error('Error creating reservation:', error);
        throw error;
    }
};

export const adminCreateBooking = async (data: CreateBookingPayload): Promise<Booking> => {
    // Re-using createReservation since the endpoint is the same and depends on token
    return createReservation(data);
};

// Replaced mock getAllBookings with real fetch
export const getAllBookings = async (): Promise<BookingItem[]> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/bookings/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to fetch bookings');
        }

        return result;
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
};

export const updateBookingStatus = async (id: string, status: BookingStatus, extraData: any = {}): Promise<Booking | null> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/bookings/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, ...extraData })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update booking status');
        }

        return result;
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
};

export const getTripBookings = async (tripId: string): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/bookings/trip/${tripId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to fetch trip bookings');
        }

        return result;
    } catch (error) {
        console.error('Error fetching trip bookings:', error);
        throw error;
    }
};

export const getUserBookings = async (): Promise<BookingItem[]> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/bookings/mine', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to fetch user bookings');
        }

        return result;
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
    }
};

export interface UpdateBookingPayload {
    passengers_adult?: number;
    passengers_child?: number;
    passengers_baby?: number;
    options?: {
        "champre-2"?: number;
        "champre-3"?: number;
        "champre-4"?: number;
    };
}

export const updateBooking = async (bookingId: string, data: UpdateBookingPayload): Promise<Booking> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update booking');
        }

        return result;
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
};

export const getUserProfile = async (): Promise<User> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/auth/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to fetch user profile');
        }

        return result.user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};


export interface CustomTripRequestPayload {
    category: 'voyage';
    details: {
        type: 'international' | 'national';
        destination: string;
        duree: number;
        date_debut: string;
        hebergement: string;
        options: {
            restauration: string;
            transport: string;
        }
    }
}

export interface CustomOmraRequestPayload {
    category: 'omra';
    details: {
        duree: number;
        date_debut: string;
        hebergement_makka: string;
        hebergement_madina: string;
        options: {
            restauration: string;
            transport: string;
        }
    }
}

export interface CustomHotelRequestPayload {
    category: 'hotel';
    details: {
        wilaya: string;
        lieu_exact: string;
        nbre_etoile: number;
        date_debut: string;
        date_fin: string;
        passengers: {
            adult: number;
            child: number;
            baby: number;
        };
    };
}

export interface CustomFlightRequestPayload {
    category: 'vol';
    details: {
        type_vol: 'aller_retour' | 'aller_simple';
        ville_depart: string;
        ville_arrivee: string;
        date_depart: string;
        date_retour?: string;
        categorie: 'economique' | 'affaires' | 'premiere';
        passengers: {
            adult: number;
            child: number;
            baby: number;
        };
    };
}

export interface CustomTransportRequestPayload {
    category: 'transport';
    details: {
        date_depart: string;
        aeroport: string;
        hotel: string;
        nbre_person: number;
        bagages: string;
        remarques: string;
    }
}
export interface CustomVisaRequestPayload {
    category: 'visa';
    details: {
        pays_destination: string,
        type_visa: string,
        date_depart: string,
        date_retour: string,
        duree_sejour: string,
        ville_entree: string,
        ville_sortie: string,
        remarques: string
    }
}

export type CustomRequestPayload =
    | CustomTripRequestPayload
    | CustomOmraRequestPayload
    | CustomHotelRequestPayload
    | CustomFlightRequestPayload
    | CustomTransportRequestPayload
    | CustomVisaRequestPayload;

export const createCustomTripRequest = async (data: CustomRequestPayload): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to create request');
        }

        return result;
    } catch (error) {
        console.error('Error creating request:', error);
        throw error;
    }
};


// --- CUSTOM REQUESTS ---


export const updateRequest = async (id: string, data: any): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/requests/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to update request');
        }
        return result;
    } catch (error) {
        console.error('Error updating request:', error);
        throw error;
    }
};

export const updateCustomRequestStatus = async (id: string, status: CustomRequestStatus): Promise<void> => {
    await updateRequest(id, { status });
};

export const getAllRequests = async (): Promise<UnifiedRequest[]> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/requests', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching all requests:', error);
        throw error;
    }
};

export const getUserRequests = async (): Promise<UnifiedRequest[]> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/requests/mine', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching user requests:', error);
        throw error;
    }
};

export const getRequestDetails = async (id: string): Promise<UnifiedRequest> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/requests/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // The API returns { success: true, data: [...] }
        return result.data[0];
    } catch (error) {
        console.error('Error fetching request details:', error);
        throw error;
    }
};

export const submitRequestResponse = async (requestId: string, offer: string): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/responses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ requestId, offer })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to submit response');
        }

        return result;
    } catch (error) {
        console.error('Error submitting request response:', error);
        throw error;
    }
};

export const getAdminResponses = async (): Promise<any[]> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/responses', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching admin responses:', error);
        throw error;
    }
};

export const deleteResponse = async (requestId: string): Promise<any> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/responses', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids: [requestId] })
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to delete response');
        }
        return result;
    } catch (error) {
        console.error('Error deleting response:', error);
        throw error;
    }
};

// --- SERVICE REQUESTS ---


// --- CONTACTS ---
export interface ContactPayload {
    full_name: string;
    email: string;
    phone: string;
    message: string;
}

export const sendContactMessage = async (data: ContactPayload): Promise<any> => {
    try {
        const response = await fetch('http://localhost:3000/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || result.message || 'Failed to send contact message');
        }

        return result;
    } catch (error) {
        console.error('Error sending contact message:', error);
        throw error;
    }
};

export const getContactMessages = async (): Promise<ContactMessage[]> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/contacts', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        throw error;
    }
};

// --- NOTIFICATIONS ---
export interface NotificationFilters {
    limit?: number;
    offset?: number;
    unread_only?: boolean;
    include_expired?: boolean;
}

export const getNotifications = async (filters: NotificationFilters = {}): Promise<AppNotification[]> => {
    const token = Cookies.get('token');
    try {
        const { limit = 10, offset = 0, unread_only = false, include_expired = false } = filters;
        const queryParams = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString(),
            unread_only: unread_only.toString(),
            include_expired: include_expired.toString()
        });

        const response = await fetch(`http://localhost:3000/api/notif?${queryParams}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const result = await response.json();
        return result.data.notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const deleteNotification = async (id: string): Promise<void> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/notif/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || result.message || 'Failed to delete notification');
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

export const getUnreadNotificationsCount = async (): Promise<number> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch('http://localhost:3000/api/notif/unread-count', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch unread count');
        const result = await response.json();
        return result.data.unread_count;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/notif/${id}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
    const token = Cookies.get('token');
    try {
        const response = await fetch(`http://localhost:3000/api/notif/read-all`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to mark all notifications as read');
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};


