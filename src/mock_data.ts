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
    // --- NATIONAL TRIPS ---
    {
        id: 'trip-nat-1',
        type: 'NATIONAL',
        title: 'Sahara Magic Discovery',
        description: 'Experience the breathtaking sunset and dunes of the Algerian Sahara.',
        start_date: '2025-12-20',
        end_date: '2025-12-25',
        base_price: 45000,
        images: [
            'https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Sunscreen', 'Sunglasses', 'Scarf', 'Hiking boots', 'Water bottle'],
        personalized_fields: 'Adrar',
        created_at: '2025-12-05T10:00:00Z' // Recent (assuming current date is around 2025-12-08)
    },
    {
        id: 'trip-nat-2',
        type: 'NATIONAL',
        title: 'Algiers Historical Tour',
        description: 'Dive into the rich history of the Casbah and modern Algiers.',
        start_date: '2026-01-10',
        end_date: '2026-01-13',
        base_price: 25000,
        images: [
            'https://images.unsplash.com/photo-1612631535483-365269784747?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1572905380509-373322634d07?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Comfortable shoes', 'Camera', 'Hat', 'City map'],
        personalized_fields: 'Algiers',
        created_at: '2025-11-20T10:00:00Z' // Older
    },
    {
        id: 'trip-nat-3',
        type: 'NATIONAL',
        title: 'Oran Coastal Breeze',
        description: 'Relax by the Mediterranean sea and enjoy the vibrant city of Oran.',
        start_date: '2026-02-15',
        end_date: '2026-02-19',
        base_price: 30000,
        images: [
            'https://images.unsplash.com/photo-1580665343603-9b627704172f?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Swimsuit', 'Sunscreen', 'Beach towel', 'Flip flops'],
        personalized_fields: 'Oran',
        created_at: '2025-12-07T10:00:00Z' // Very recent
    },

    // --- INTERNATIONAL TRIPS ---
    {
        id: 'trip-int-1',
        type: 'INTERNATIONAL',
        title: 'Tunisian Blue & White',
        description: 'Explore Sidi Bou Said, Carthage, and the beautiful beaches of Hammamet.',
        start_date: '2026-03-01',
        end_date: '2026-03-08',
        base_price: 85000,
        images: [
            'https://images.unsplash.com/photo-1555992828-ca4dbe41d294?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1589878252382-72791ce68976?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Passport', 'Universal adapter', 'Beach gear', 'Walking shoes'],
        personalized_fields: 'Tunisia',
        created_at: '2025-10-15T10:00:00Z'
    },
    {
        id: 'trip-int-2',
        type: 'INTERNATIONAL',
        title: 'Malaysia Tropical Paradise',
        description: 'From the Petronas Towers to the rainforests and islands.',
        start_date: '2026-04-10',
        end_date: '2026-04-20',
        base_price: 220000,
        images: [
            'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1535202669324-9635e396695c?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Passport', 'Insect repellent', 'Light clothing', 'Raincoat'],
        personalized_fields: 'Malaysia',
        created_at: '2025-12-02T10:00:00Z' // Within a week of Dec 8
    },
    {
        id: 'trip-int-3',
        type: 'INTERNATIONAL',
        title: 'Istanbul & Cappadocia',
        description: 'A journey through history, bazaars, and hot air balloons.',
        start_date: '2026-05-05',
        end_date: '2026-05-13',
        base_price: 140000,
        images: [
            'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Passport', 'Comfortable shoes', 'Jacket (for evenings)', 'Camera'],
        personalized_fields: 'Turkey',
        created_at: '2025-09-01T10:00:00Z'
    },

    // --- OMRA TRIPS ---
    {
        id: 'trip-omra-1',
        type: 'OMRA',
        title: 'Omra VIP Experience',
        description: 'Perform your rituals with peace of mind and luxury accommodation close to Haram.',
        start_date: '2026-01-20',
        end_date: '2026-02-04',
        base_price: 350000,
        images: [
            'https://images.unsplash.com/photo-1565552629477-gin-4d4c4ec9?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Ihram', 'Unscented soap', 'Prayer mat', 'Quran', 'Vitamins'],
        personalized_fields: 'VIP',
        created_at: '2025-12-06T10:00:00Z' // Recent
    },
    {
        id: 'trip-omra-2',
        type: 'OMRA',
        title: 'Omra Economic Saver',
        description: 'Affordable Omra package focusing on the essentials.',
        start_date: '2026-02-10',
        end_date: '2026-02-25',
        base_price: 180000,
        images: [
            'https://images.unsplash.com/photo-1537181534458-38253294e854?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1548255926-259163e5d87a?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Ihram', 'Comfortable sandals', 'Basic meds', 'Small bag'],
        personalized_fields: 'ECONOMIC',
        created_at: '2025-11-01T10:00:00Z'
    },
    {
        id: 'trip-omra-3',
        type: 'OMRA',
        title: 'Omra Ramadan Special',
        description: 'Spend the holy month of Ramadan in the holy cities.',
        start_date: '2026-03-10',
        end_date: '2026-04-09',
        base_price: 450000,
        images: [
            'https://images.unsplash.com/photo-1551041777-ed02d7ef1415?auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1580418827493-f2b22c438544?auto=format&fit=crop&q=80'
        ],
        equipment_list: ['Ihram', 'Supplements', 'Extra clothing', 'Reading lamp'],
        personalized_fields: 'VIP',
        created_at: '2025-10-08T10:00:00Z'
    }
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
