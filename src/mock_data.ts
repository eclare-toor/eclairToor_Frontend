import type { Trip, TripItinerary, Hotel, TripHotel, User, Booking, CustomRequest, HotelRequest, FlightRequest, ContactMessage } from './Types/index';

// --- USERS ---
export const MOCK_USERS: User[] = [
    {
        id: 'user-1',
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        password_hash: 'password123', // In real app, this would be hashed
        phone: '0555123456',
        nationalite: 'Algerian',
        role: 'CLIENT',
        created_at: '2025-01-01T10:00:00Z',
        is_active: true
    },
    {
        id: 'user-admin',
        nom: 'User',
        prenom: 'Admin',
        email: 'admin@eclair.com',
        password_hash: 'admin123',
        phone: '0777000000',
        nationalite: 'Algerienne',
        role: 'ADMIN',
        created_at: '2025-01-01T10:00:00Z',
        is_active: true
    }
];

// --- HOTELS ---
export const MOCK_HOTELS: Hotel[] = [
    // National Hotels
    {
        id: 'hotel-adrar',
        name: 'Touat Hotel',
        city: 'Adrar',
        stars: 4,
        maps_url: 'https://maps.google.com/?q=Adrar',
        address: 'Centre Ville, Adrar',
        created_at: '2025-01-01T10:00:00Z'
    },
    {
        id: 'hotel-algiers',
        name: 'Sofitel Algiers Hamma Garden',
        city: 'Algiers',
        stars: 5,
        maps_url: 'https://maps.google.com/?q=Algiers',
        address: 'Hamma, Algiers',
        created_at: '2025-01-01T10:05:00Z'
    },
    {
        id: 'hotel-oran',
        name: 'Royal Hotel Oran',
        city: 'Oran',
        stars: 5,
        maps_url: 'https://maps.google.com/?q=Oran',
        address: '1 Boulevard de la Soummam, Oran',
        created_at: '2025-01-01T10:10:00Z'
    },
    // International Hotels
    {
        id: 'hotel-tunisia',
        name: 'La Badira',
        city: 'Hammamet',
        stars: 5,
        maps_url: 'https://maps.google.com/?q=Hammamet',
        address: 'Hammamet Nord, Tunisia',
        created_at: '2025-01-01T10:15:00Z'
    },
    {
        id: 'hotel-malaysia',
        name: 'Mandarin Oriental',
        city: 'Kuala Lumpur',
        stars: 5,
        maps_url: 'https://maps.google.com/?q=Kuala+Lumpur',
        address: 'Kuala Lumpur City Centre',
        created_at: '2025-01-01T10:20:00Z'
    },
    {
        id: 'hotel-turkey',
        name: 'Swissotel The Bosphorus',
        city: 'Istanbul',
        stars: 5,
        maps_url: 'https://maps.google.com/?q=Istanbul',
        address: 'Besiktas, Istanbul',
        created_at: '2025-01-01T10:25:00Z'
    },
    // Omra Hotels
    {
        id: 'hotel-makkah-vip',
        name: 'Fairmont Makkah Clock Royal Tower',
        city: 'Makkah',
        stars: 5,
        maps_url: 'https://maps.google.com/?q=Makkah',
        address: 'King Abdul Aziz Endowment',
        created_at: '2025-01-01T10:30:00Z'
    },
    {
        id: 'hotel-madinah-vip',
        name: 'Dar Al Iman InterContinental',
        city: 'Madinah',
        stars: 5,
        maps_url: 'https://maps.google.com/?q=Madinah',
        address: 'Central Area, Madinah',
        created_at: '2025-01-01T10:35:00Z'
    },
    {
        id: 'hotel-makkah-eco',
        name: 'Le Meridien Makkah',
        city: 'Makkah',
        stars: 4,
        maps_url: 'https://maps.google.com/?q=Makkah',
        address: 'King Abdulaziz Road',
        created_at: '2025-01-01T10:40:00Z'
    },
    {
        id: 'hotel-madinah-eco',
        name: 'Anwar Al Madinah Mövenpick',
        city: 'Madinah',
        stars: 4,
        maps_url: 'https://maps.google.com/?q=Madinah',
        address: 'Central Zone',
        created_at: '2025-01-01T10:45:00Z'
    }
];

// --- TRIPS ---
export const MOCK_TRIPS: Trip[] = [

];

// --- TRIP ITINERARIES ---
export const MOCK_ITINERARIES: TripItinerary[] = [
    // National 1 (5 days)
    { id: 'it-n1-1', trip_id: 'trip-nat-1', day_number: 1, activities: ['Arrival in Adrar', 'Check-in at hotel', 'Welcome dinner'] },
    { id: 'it-n1-2', trip_id: 'trip-nat-1', day_number: 2, activities: ['Desert excursion 4x4', 'Sunset watching'] },
    { id: 'it-n1-3', trip_id: 'trip-nat-1', day_number: 3, activities: ['Visit to Timimoun', 'Traditional lunch'] },
    { id: 'it-n1-4', trip_id: 'trip-nat-1', day_number: 4, activities: ['Camel ride', 'Star gazing night'] },
    { id: 'it-n1-5', trip_id: 'trip-nat-1', day_number: 5, activities: ['Breakfast', 'Departure'] },

    // National 2 (3 days)
    { id: 'it-n2-1', trip_id: 'trip-nat-2', day_number: 1, activities: ['Arrival', 'Casbah tour'] },
    { id: 'it-n2-2', trip_id: 'trip-nat-2', day_number: 2, activities: ['Botanical Garden Hamma', 'Martyrs Memorial'] },
    { id: 'it-n2-3', trip_id: 'trip-nat-2', day_number: 3, activities: ['Shopping', 'Departure'] },

    // National 3 (4 days)
    { id: 'it-n3-1', trip_id: 'trip-nat-3', day_number: 1, activities: ['Arrival in Oran', 'Santa Cruz Fort'] },
    { id: 'it-n3-2', trip_id: 'trip-nat-3', day_number: 2, activities: ['City Centre walk', 'Front de Mer'] },
    { id: 'it-n3-3', trip_id: 'trip-nat-3', day_number: 3, activities: ['Beach day at Les Andalouses'] },
    { id: 'it-n3-4', trip_id: 'trip-nat-3', day_number: 4, activities: ['Departure'] },

    // International 1 (Tunisia - 7 days - sample)
    { id: 'it-i1-1', trip_id: 'trip-int-1', day_number: 1, activities: ['Flight to Tunis', 'Transfer to Hammamet'] },
    { id: 'it-i1-2', trip_id: 'trip-int-1', day_number: 2, activities: ['Beach relaxation', 'Hotel entertainment'] },
    { id: 'it-i1-3', trip_id: 'trip-int-1', day_number: 3, activities: ['Excursion to Sidi Bou Said'] },
    // ... implied other days

    // International 2 (Malaysia - 10 days - sample)
    { id: 'it-i2-1', trip_id: 'trip-int-2', day_number: 1, activities: ['Arrival in KL', 'Check-in'] },
    { id: 'it-i2-2', trip_id: 'trip-int-2', day_number: 2, activities: ['Batu Caves', 'City Tour'] },
    // ...

    // International 3 (Turkey - 8 days - sample)
    { id: 'it-i3-1', trip_id: 'trip-int-3', day_number: 1, activities: ['Arrival in Istanbul'] },
    { id: 'it-i3-2', trip_id: 'trip-int-3', day_number: 2, activities: ['Blue Mosque', 'Hagia Sophia'] },
    // ...

    // Omra 1 (VIP)
    { id: 'it-o1-1', trip_id: 'trip-omra-1', day_number: 1, activities: ['Arrival in Jeddah', 'Transfer to Makkah', 'Umrah rituals'] },
    { id: 'it-o1-2', trip_id: 'trip-omra-1', day_number: 2, activities: ['Free time for Ibadah'] },
    { id: 'it-o1-8', trip_id: 'trip-omra-1', day_number: 8, activities: ['Transfer to Madinah', 'Ziyarat'] },
    // ...

    // Omra 2 (Eco)
    { id: 'it-o2-1', trip_id: 'trip-omra-2', day_number: 1, activities: ['Arrival', 'Umrah'] },
    // ...

    // Omra 3 (Ramadan)
    { id: 'it-o3-1', trip_id: 'trip-omra-3', day_number: 1, activities: ['Arrival', 'First Taraweeh'] },
    // ...
];

// --- TRIP HOTELS ---
export const MOCK_REVIEWS = [
    {
        id: 'rev-1',
        user_name: 'Amine Benali',
        rating: 5,
        comment: "Une expérience inoubliable avec Eclair Travel ! L'organisation était parfaite du début à la fin.",
        date: '2023-11-15'
    },
    {
        id: 'rev-2',
        user_name: 'Sarah Khelil',
        rating: 5,
        comment: "Le service client est très réactif. J'ai adoré mon séjour en Turquie, les hôtels étaient superbes.",
        date: '2023-12-02'
    },
    {
        id: 'rev-3',
        user_name: 'Karim Ziani',
        rating: 4,
        comment: "Bon rapport qualité/prix pour la Omra. Les guides étaient très compétents.",
        date: '2024-01-10'
    }
];

export const MOCK_TRIP_HOTELS: TripHotel[] = [
    // National
    { trip_id: 'trip-nat-1', hotel_id: 'hotel-adrar' },
    { trip_id: 'trip-nat-2', hotel_id: 'hotel-algiers' },
    { trip_id: 'trip-nat-3', hotel_id: 'hotel-oran' },

    // International
    { trip_id: 'trip-int-1', hotel_id: 'hotel-tunisia' },
    { trip_id: 'trip-int-2', hotel_id: 'hotel-malaysia' },
    { trip_id: 'trip-int-3', hotel_id: 'hotel-turkey' },

    // Omra (2 hotels each)
    // VIP
    { trip_id: 'trip-omra-1', hotel_id: 'hotel-makkah-vip' },
    { trip_id: 'trip-omra-1', hotel_id: 'hotel-madinah-vip' },
    // Eco
    { trip_id: 'trip-omra-2', hotel_id: 'hotel-makkah-eco' },
    { trip_id: 'trip-omra-2', hotel_id: 'hotel-madinah-eco' },
    // Ramadan (VIP)
    { trip_id: 'trip-omra-3', hotel_id: 'hotel-makkah-vip' },
    { trip_id: 'trip-omra-3', hotel_id: 'hotel-madinah-vip' },
];

// --- BOOKINGS & REQUESTS ---

export const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'bk-1',
        user_id: 'user-1',
        trip_id: 'trip-nat-1',
        passengers_adult: 2,
        passengers_child: 0,
        passengers_baby: 0,
        total_price: 90000,
        status: 'PENDING',
        description: '',
        created_at: '2025-12-08T14:00:00Z'
    },
    {
        id: 'bk-2',
        user_id: 'user-1',
        trip_id: 'trip-omra-1',
        passengers_adult: 1,
        passengers_child: 0,
        passengers_baby: 0,
        total_price: 350000,
        status: 'CONFIRMED',
        description: 'Veuillez préparer vos documents.',
        created_at: '2025-12-09T09:00:00Z'
    }
];

export const MOCK_CUSTOM_REQUESTS: CustomRequest[] = [
    {
        id: 'cr-1',
        user_id: 'user-1',
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '0555000000',
        destination: 'Maldives',
        type: 'INTERNATIONAL',
        status: 'PENDING',
        created_at: '2025-12-10T10:00:00Z',
        duration_days: 10,
        options_meals: { breakfast: true, lunch: false, dinner: false },
        budget: 500000,
        notes: 'Voyage de noces',
        description: ''
    }
];

export const MOCK_HOTEL_REQUESTS: HotelRequest[] = [
    {
        id: 'hr-1',
        wilaya: 'Oran',
        exact_location: 'Corniche',
        check_in_date: '2025-12-30',
        check_out_date: '2026-01-02',
        stars_preference: 5,
        rooms_count: 1,
        guests_adults: 2,
        guests_children: 0,
        guests_babies: 0,
        status: 'PENDING',
        created_at: '2025-12-11T08:00:00Z'
    }
];

export const MOCK_FLIGHT_REQUESTS: FlightRequest[] = [
    {
        id: 'fr-1',
        trip_type: 'ROUND_TRIP',
        departure_city: 'Alger',
        arrival_city: 'Paris',
        departure_date: '2026-02-01',
        return_date: '2026-02-15',
        flight_class: 'ECONOMY',
        passengers_adults: 1,
        passengers_children: 0,
        passengers_babies: 0,
        status: 'PENDING',
        created_at: '2025-12-11T09:00:00Z'
    }
];

export const MOCK_MESSAGES: ContactMessage[] = [
    {
        id: 'msg-1',
        full_name: 'Alice Smith',
        email: 'alice@example.com',
        phone: '0555998877',
        subject: 'Renseignement Omra',
        message: 'Bonjour, faites-vous des réductions pour les groupes ?',
        status: 'UNREAD',
        created_at: '2025-12-10T14:30:00Z'
    }
];
