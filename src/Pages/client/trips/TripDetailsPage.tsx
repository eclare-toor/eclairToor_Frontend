import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip, getTripItinerary, getTripHotels } from '../../../api';
import type { Trip, TripItinerary, TripHotel } from '../../../Types';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { Button } from '../../../components/ui/button';
import { MapPin, Clock, CheckCircle2, Hotel as HotelIcon, ArrowLeft, Share2, Heart, ExternalLink, ShieldCheck, Zap, Star, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslation } from 'react-i18next';

const TripDetailsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<TripItinerary[]>([]);
  const [hotels, setHotels] = useState<TripHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery States
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchTripData = async () => {

      if (!id) return;
      try {
        setLoading(true);
        // Use allSettled to prevent the whole page from crashing if itinerary or hotels are missing
        const results = await Promise.allSettled([
          getTrip(id),
          getTripItinerary(id),
          getTripHotels(id)
        ]);

        const tripResult = results[0];
        const itineraryResult = results[1];
        const hotelsResult = results[2];

        if (tripResult.status === 'fulfilled' && tripResult.value) {
          setTrip(tripResult.value);

          if (itineraryResult.status === 'fulfilled') {
            setItinerary(itineraryResult.value || []);
          }

          if (hotelsResult.status === 'fulfilled') {
            setHotels(hotelsResult.value || [])
          }
        } else {
          setError(t('trip_details.not_found'));
        }
      } catch (err) {
        console.error("Error loading details:", err);
        setError(t('trip_details.load_error'));
      } finally {
        setLoading(false);
      }
    };

    fetchTripData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-52 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen pt-52 flex flex-col justify-center items-center gap-4">
        <h2 className="text-2xl font-bold text-destructive">{error || t('trip_details.not_found')}</h2>
        <Link to="/voyages">
          <Button variant="outline">{t('trip_details.back_link')}</Button>
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const startDate = trip?.start_date ? new Date(trip.start_date) : null;
  const endDate = trip?.end_date ? new Date(trip.end_date) : null;
  const durationDays = (startDate && endDate)
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-transparent pb-20 pt-52">
      {/* Navigation Bar for Details */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/voyages" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 font-medium">
          <ArrowLeft className="w-4 h-4" />
          {t('trip_details.back_link')}
        </Link>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Image Gallery with Smooth Scroll */}
      <div className="container mx-auto px-4 mb-12">
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-[50vh] md:h-[70vh] rounded-[3rem] active:cursor-grabbing gap-4 shadow-2xl shadow-slate-200">
          {trip.images && trip.images.map((img, idx) => (
            <div
              key={idx}
              className="min-w-full snap-center relative cursor-zoom-in group"
              onClick={() => {
                setCurrentImageIndex(idx);
                setIsGalleryOpen(true);
              }}
            >
              <img
                src={img && typeof img === 'string' ? (img.startsWith('http') ? img : `http://localhost:3000/api${img}`) : 'https://via.placeholder.com/800x600'}
                alt={`${trip.title} ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="absolute top-8 right-8 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30 shadow-xl">
                  <Maximize2 className="w-6 h-6" />
                </div>
              </div>

              <div className="absolute bottom-8 left-8 text-white">
                <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-black uppercase tracking-widest border border-white/30 mb-2 inline-block shadow-xl">
                  {t('trip_details.gallery.click_to_expand', { index: idx + 1, total: trip.images.length })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Screen Lightbox */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 md:p-12"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-8 right-8 z-[110] p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-white/10"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Navigation Controls */}
            <div className="absolute inset-x-4 md:inset-x-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-[110]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : trip.images.length - 1));
                }}
                className="p-6 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] border border-white/10 transition-all pointer-events-auto backdrop-blur-xl group"
              >
                <ChevronLeft className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev < trip.images.length - 1 ? prev + 1 : 0));
                }}
                className="p-6 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] border border-white/10 transition-all pointer-events-auto backdrop-blur-xl group"
              >
                <ChevronRight className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Image Display */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                <img
                  src={trip.images[currentImageIndex] && typeof trip.images[currentImageIndex] === 'string'
                    ? (trip.images[currentImageIndex].startsWith('http') ? trip.images[currentImageIndex] : `http://localhost:3000/api${trip.images[currentImageIndex]}`)
                    : 'https://via.placeholder.com/800x600'}
                  alt={`Full view ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-3xl md:rounded-[3rem] shadow-2xl"
                />
              </motion.div>
            </div>

            {/* Footer / Thumbnails */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 w-full px-8">
              <div className="bg-white/10 backdrop-blur-2xl px-6 py-2 rounded-full border border-white/10 text-white font-black text-sm uppercase tracking-[0.3em]">
                {currentImageIndex + 1} / {trip.images.length}
              </div>

              <div className="flex gap-3 overflow-x-auto max-w-full no-scrollbar px-4 pb-2">
                {trip.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "relative w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all shrink-0",
                      currentImageIndex === idx ? "border-primary scale-110 shadow-lg shadow-primary/20" : "border-transparent opacity-40 hover:opacity-100"
                    )}
                  >
                    <img
                      src={img && typeof img === 'string' ? (img.startsWith('http') ? img : `http://localhost:3000/api${img}`) : 'https://via.placeholder.com/800x600'}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">

          {/* Header Info */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4 text-primary font-medium">
              <span className="bg-primary/10 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase">
                {trip.type === 'national' ? 'Tourisme National' : trip.type === 'international' ? 'Tourisme International' : 'Tourisme Religieux'}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-full">
                <Clock className="w-4 h-4" />
                {t('trip_details.days', { count: durationDays })}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-slate-600 font-semibold bg-slate-100 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                {trip.destination_wilaya || trip.destination_country || trip.omra_category || trip.type}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-heading font-bold text-slate-900 leading-tight">
              {trip.title}
            </h1>
          </div>

          {/* Description */}
          <div className="prose prose-lg max-w-none text-slate-600">
            <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              {t('trip_details.about_title')}
            </h3>
            <p className="leading-relaxed">{trip.description}</p>
          </div>

          {/* Itinerary */}
          {itinerary && itinerary.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                {t('trip_details.itinerary_title')}
              </h3>
              <div className="space-y-8 border-l-2 border-primary/20 ml-3 pl-8 relative">
                {Array.isArray(itinerary) && itinerary.map((item, index) => (
                  <div key={item.id || index} className="relative group">
                    <span className="absolute -left-[43px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold ring-4 ring-background transition-transform group-hover:scale-110">
                      {index + 1}
                    </span>
                    <h4 className="text-xl font-bold text-slate-800 mb-3">{t('trip_details.day', { day: item.day_date ? (item.day_date.includes('T') ? item.day_date.split('T')[0] : item.day_date) : index + 1 })}</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                      <ul className="space-y-3">
                        {Array.isArray(item.activities) ? (
                          item.activities.map((activity, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="font-medium">{activity}</span>
                            </li>
                          ))
                        ) : (
                          item.activities && (
                            <li className="flex items-start gap-3 text-slate-600">
                              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                              <span className="font-medium">{item.activities}</span>
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotels */}
          {hotels && hotels.length > 0 && (
            <div className="space-y-10">
              <h3 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <HotelIcon className="w-8 h-8 text-primary" />
                {t('trip_details.accommodation_title')}
              </h3>

              <div className="grid grid-cols-1 gap-12">
                {hotels.map((hotel) => (
                  <motion.div
                    key={hotel.hotel_id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Image Section */}
                      <div className="lg:w-2/5 relative h-72 lg:h-auto overflow-hidden">
                        {hotel.images && hotel.images.length > 0 ? (
                          <div className="h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing">
                            {hotel.images.map((img, idx) => (
                              <div key={idx} className="min-w-full h-full snap-center relative">
                                <img
                                  src={img.startsWith('http') ? img : `http://localhost:3000/api${img}`}
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  alt={`${hotel.name} ${idx + 1}`}
                                />
                                <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-wider border border-white/20">
                                  {t('trip_details.gallery.photo_count', { index: idx + 1, total: hotel.images?.length || 0 })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : hotel.image ? (
                          <div className="h-full relative">
                            <img
                              src={hotel.image.startsWith('http') ? hotel.image : `http://localhost:3000/api${hotel.image}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              alt={hotel.name}
                            />
                            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-wider border border-white/20">
                              {t('trip_details.gallery.main_photo')}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full bg-slate-100 flex flex-col items-center justify-center gap-3 text-slate-400">
                            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center">
                              <HotelIcon className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">{t('trip_details.no_images')}</span>
                          </div>
                        )}

                        {/* Status/Badge */}
                        <div className="absolute top-6 left-6">
                          <div className="bg-white/95 backdrop-blur shadow-lg px-4 py-1.5 rounded-full flex items-center gap-2 border border-white">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-black text-slate-900">{hotel.stars} {t('trip_details.stars')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="lg:w-3/5 p-8 lg:p-10 flex flex-col justify-between">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <h4 className="text-3xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                              {hotel.name}
                            </h4>
                            <p className="text-slate-500 flex items-center gap-2 font-medium">
                              <MapPin className="w-4 h-4 text-primary" />
                              {hotel.city} {hotel.address && `• ${hotel.address}`}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('trip_details.location')}</p>
                              <p className="text-sm font-bold text-slate-700">{hotel.city || t('trip_details.unspecified')}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('trip_details.category')}</p>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < (Number(hotel.stars) || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-8 flex items-center gap-4">
                          <a
                            href={hotel.maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 hover:bg-primary text-white rounded-2xl font-bold transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-primary/20 group/btn"
                          >
                            <MapPin className="w-5 h-5 group-hover/btn:animate-bounce" />
                            {t('trip_details.maps_btn')}
                          </a>
                          <div className="hidden sm:flex w-14 h-14 items-center justify-center border-2 border-slate-100 rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all cursor-help">
                            <ExternalLink className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-8">

            {/* Booking Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-secondary" />

              <div className="space-y-2">
                <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider">{t('trip_details.sidebar.price_label')}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-slate-900">
                    {Number(trip.base_price || 0).toLocaleString('fr-DZ')}
                  </span>
                  <span className="text-lg font-semibold text-slate-500">DZD</span>
                </div>
                <div className="inline-flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-md">
                  <ShieldCheck className="w-4 h-4" />
                  {t('trip_details.sidebar.best_price')}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{t('trip_details.sidebar.start_date')}</span>
                  <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    {formatDate(trip.start_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{t('trip_details.sidebar.end_date')}</span>
                  <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                    {formatDate(trip.end_date)}
                  </span>
                </div>
              </div>
              <Link to={`/voyages/${trip.id}/reservation`} state={{ trip }}>
                <Button className="w-full text-lg py-7 font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300 rounded-xl">
                  {t('trip_details.sidebar.book_btn')}
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 pt-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{t('trip_details.sidebar.benefits.confirmation')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{t('trip_details.sidebar.benefits.payment')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{t('trip_details.sidebar.benefits.support')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{t('trip_details.sidebar.benefits.cancellation')}</span>
                </div>
              </div>
            </div>

            {/* Equipment List */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                {t('trip_details.equipment_title')}
              </h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  let equipment: string[] = [];
                  if (Array.isArray(trip.equipment_list)) {
                    equipment = trip.equipment_list;
                  } else if (typeof trip.equipment_list === 'string') {
                    try {
                      const parsed = JSON.parse(trip.equipment_list);
                      equipment = Array.isArray(parsed) ? parsed : [trip.equipment_list];
                    } catch {
                      equipment = trip.equipment_list.split(',').map(s => s.trim()).filter(Boolean);
                    }
                  }

                  return equipment.map((item, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors cursor-default">
                      {item}
                    </span>
                  ));
                })()}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetailsPage;