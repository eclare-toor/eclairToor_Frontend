import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTrip, createReservation } from '../../../api';
import type { Trip } from '../../../Types';
import { useAuth } from '../../../Context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { Calendar, Users, MapPin, Minus, Plus, ShieldCheck, Mail, Phone, User as UserIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import BackgroundAura from '../../../components/Shared/BackgroundAura';

const Reservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isLoading: isAuthLoading } = useAuth();

  const { t } = useTranslation();
  const [trip, setTrip] = useState<Trip | null>(location.state?.trip || null);
  const [loading, setLoading] = useState(!location.state?.trip);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Passenger counts
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0); // 2-12 years (-20%)
  const [babies, setBabies] = useState(0); // < 2 years (-70%)

  // Omra Room Counts
  const [rooms2, setRooms2] = useState(0);
  const [rooms3, setRooms3] = useState(0);
  const [rooms4, setRooms4] = useState(0);

  useEffect(() => {
    // If we already have the trip from location state, we don't need to fetch it
    if (trip) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fallback fetch if accessed directly
        const tripData = await getTrip(id);
        if (!tripData) {
          setFetchError(t('reservation.errors.not_found'));
        } else {
          setTrip(tripData);
        }
      } catch (err) {
        setFetchError(t('reservation.errors.load_failed'));
      } finally {
        setLoading(false);
      }
    };

    if (!trip) {
      fetchData();
    }
  }, [id, trip]);

  if (loading || isAuthLoading) return <div className="min-h-screen pt-52 flex justify-center"><LoadingSpinner /></div>;
  if (fetchError || !trip) return (
    <div className="min-h-screen pt-52 flex flex-col items-center justify-center gap-8 px-4">
      <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl shadow-red-900/5">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 italic uppercase tracking-tight">{t('reservation.errors.fullscreen_title')}</h2>
        <p className="text-red-500 font-bold text-lg mb-8 leading-relaxed">{fetchError || t('reservation.errors.not_found')}</p>
        <Link to="/voyages">
          <Button variant="default" className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center gap-3 mx-auto">
            <ArrowLeft className="w-5 h-5" />
            {t('reservation.back_to_trips')}
          </Button>
        </Link>
      </div>
    </div>
  );

  // Pricing Logic
  const isOmra = trip.type?.toLowerCase() === 'religieuse' || trip.type?.toLowerCase() === 'omra';
  const promoFactor = trip.promotion ? (1 - trip.promotion / 100) : 1;
  let totalPrice = 0;
  let totalAdults = 0;
  let totalChildren = 0;
  let totalBabies = 0;

  if (isOmra) {
    // Omra Calculation Logic
    const slots: number[] = [];
    if (trip.options?.prix_2_chmpre) {
      const price = trip.options.prix_2_chmpre * promoFactor;
      for (let i = 0; i < rooms2; i++) { slots.push(price); slots.push(price); }
    }
    if (trip.options?.prix_3_chmpre) {
      const price = trip.options.prix_3_chmpre * promoFactor;
      for (let i = 0; i < rooms3; i++) { slots.push(price); slots.push(price); slots.push(price); }
    }
    if (trip.options?.prix_4_chmpre) {
      const price = trip.options.prix_4_chmpre * promoFactor;
      for (let i = 0; i < rooms4; i++) { slots.push(price); slots.push(price); slots.push(price); slots.push(price); }
    }

    // Sort slots descending (assign best/most expensive rooms first)
    slots.sort((a, b) => b - a);

    let currentSlotIndex = 0;

    // 1. Assign Adults
    for (let i = 0; i < adults; i++) {
      const price = slots[currentSlotIndex] || 0;
      totalAdults += price;
      currentSlotIndex++;
    }

    // 2. Assign Children (20% off)
    for (let i = 0; i < children; i++) {
      const price = slots[currentSlotIndex] || 0;
      totalChildren += price * 0.8;
      currentSlotIndex++;
    }

    // 3. Babies (70% off cheapest SELECTED room)
    let cheapestSelectedPrice = 0;
    const selectedPrices = [];
    if (rooms4 > 0 && trip.options?.prix_4_chmpre) selectedPrices.push(trip.options.prix_4_chmpre * promoFactor);
    if (rooms3 > 0 && trip.options?.prix_3_chmpre) selectedPrices.push(trip.options.prix_3_chmpre * promoFactor);
    if (rooms2 > 0 && trip.options?.prix_2_chmpre) selectedPrices.push(trip.options.prix_2_chmpre * promoFactor);

    if (selectedPrices.length > 0) {
      selectedPrices.sort((a, b) => a - b);
      cheapestSelectedPrice = selectedPrices[0];
    }

    totalBabies = babies * cheapestSelectedPrice * 0.3;

    totalPrice = totalAdults + totalChildren + totalBabies;
  } else {
    // Standard Calculation
    const priceAdult = trip.base_price * promoFactor;
    const priceChild = priceAdult * 0.8;
    const priceBaby = priceAdult * 0.3;

    totalAdults = adults * priceAdult;
    totalChildren = children * priceChild;
    totalBabies = babies * priceBaby;
    totalPrice = totalAdults + totalChildren + totalBabies;
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      navigate('/connexion');
      return;
    }

    // Validation for Omra
    if (isOmra) {
      const totalCapacity = (rooms2 * 2) + (rooms3 * 3) + (rooms4 * 4);
      const totalBedPeople = adults + children;

      if (totalCapacity < totalBedPeople) {
        setReservationError(t('reservation.omra.capacity_insufficient', { count: totalBedPeople - totalCapacity }));
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }
    }

    setLoading(true);
    setReservationError(null);
    try {
      const reservationData: any = {
        trip_id: id || '',
        passengers_adult: adults,
        passengers_child: children,
        passengers_baby: babies,
        prix_calculer: totalPrice,
        options: isOmra ? {
          "champre-2": rooms2,
          "champre-3": rooms3,
          "champre-4": rooms4
        } : null
      };

      if (isOmra) {
        // We do NOT touch prix_vrai_paye, backend handles it or it's not sent
      }

      const result = await createReservation(reservationData);
      navigate('/congratulation', {
        state: {
          reservationId: result.id,
          trip,
          totalPrice,
          passengers: { adults, children, babies }
        }
      });
    } catch (err: any) {
      console.error("Reservation Error:", err);
      // Since api.ts now throws descriptive errors, err.message contains the backend message
      const errorMessage = err.message || t('reservation.errors.generic');
      setReservationError(errorMessage);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent pt-52 pb-32 px-4 relative overflow-hidden">
      <BackgroundAura />
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-primary mb-4"
          >
            <div className="h-px w-8 bg-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('reservation.step_title')}</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            {t('reservation.title_start')} <span className="text-primary italic">{t('reservation.title_span')}</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-2xl">{t('reservation.description')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* LEFT COLUMN: Form (Occupies 7/12) */}
          <div className="lg:col-span-7 space-y-8">

            {/* Section 1: Coordonnée */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <UserIcon className="w-6 h-6 text-primary" />
                  </div>
                  {t('reservation.sections.details')}
                </h2>
                <div className="hidden md:block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('reservation.sections.profile_info')}</span>
                </div>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('reservation.fields.full_name')}</Label>
                  <div className="relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input id="fullName" value={authUser?.nom || (authUser ? `${authUser.nom} ${authUser.prenom}` : '')} readOnly={!!authUser} className="h-14 pl-12 bg-slate-50/50 border-slate-200 rounded-2xl font-bold focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input id="email" type="email" value={authUser?.email || ''} readOnly={!!authUser} className="h-14 pl-12 bg-slate-50/50 border-slate-200 rounded-2xl font-bold focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Téléphone</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input id="phone" type="tel" value={authUser?.phone || ''} readOnly={!!authUser} className="h-14 pl-12 bg-slate-50/50 border-slate-200 rounded-2xl font-bold focus:ring-primary focus:border-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{t('reservation.fields.nationality')}</Label>
                  <div className="relative group">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input id="nationality" value={authUser?.nationalite || ''} readOnly={!!authUser} className="h-14 pl-12 bg-slate-50/50 border-slate-200 rounded-2xl font-bold focus:ring-primary focus:border-primary" />
                  </div>
                </div>
              </form>
            </motion.div>

            {/* Section 2: Passagers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                {t('reservation.sections.passenger_count')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Adultes */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-colors group">
                  <div className="mb-6 text-center">
                    <div className="h-[26px] mb-2" /> {/* Spacer for alignment */}
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{t('reservation.passengers.adults')}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('reservation.passengers.adults_desc')}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-2xl p-2 border shadow-sm">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="h-10 w-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <span className="font-black text-xl text-slate-900">{adults}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setAdults(adults + 1)}
                      className="h-10 w-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Enfants */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-colors group">
                  <div className="mb-6 text-center">
                    <div className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-md mb-2">-20%</div>
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{t('reservation.passengers.children')}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('reservation.passengers.children_desc')}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-2xl p-2 border shadow-sm">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="h-10 w-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <span className="font-black text-xl text-slate-900">{children}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setChildren(children + 1)}
                      className="h-10 w-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Bébés */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-colors group">
                  <div className="mb-6 text-center">
                    <div className="inline-block px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] font-black rounded-md mb-2">-70%</div>
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{t('reservation.passengers.babies')}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('reservation.passengers.babies_desc')}</p>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-2xl p-2 border shadow-sm">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setBabies(Math.max(0, babies - 1))}
                      className="h-10 w-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <span className="font-black text-xl text-slate-900">{babies}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setBabies(babies + 1)}
                      className="h-10 w-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Omra Room Selection Step */}
            {trip && (trip.type.toLowerCase() === 'religieuse' || trip.type.toLowerCase() === 'omra') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isShaking && reservationError?.includes(t('reservation.omra.capacity_insufficient', { count: 0 }).split(':')[0]) ? { x: [-10, 10, -10, 10, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-8"
              >
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  {t('reservation.omra.room_selection')}
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {/* Chambre Double */}
                  {trip.options?.prix_2_chmpre && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-black text-slate-900">{t('reservation.omra.double_room')}</p>
                        <p className="text-xs font-bold text-primary">{trip.options.prix_2_chmpre.toLocaleString('fr-DZ')} DZD <span className="text-slate-400">/ pers</span></p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border self-start sm:self-auto">
                        <Button variant="ghost" size="icon" onClick={() => setRooms2(Math.max(0, rooms2 - 1))} className="h-8 w-8"><Minus className="w-4 h-4" /></Button>
                        <span className="font-black w-4 text-center">{rooms2}</span>
                        <Button variant="ghost" size="icon" onClick={() => setRooms2(rooms2 + 1)} className="h-8 w-8"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )}

                  {/* Chambre Triple */}
                  {trip.options?.prix_3_chmpre && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-black text-slate-900">{t('reservation.omra.triple_room')}</p>
                        <p className="text-xs font-bold text-primary">{trip.options.prix_3_chmpre.toLocaleString('fr-DZ')} DZD <span className="text-slate-400">/ pers</span></p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border self-start sm:self-auto">
                        <Button variant="ghost" size="icon" onClick={() => setRooms3(Math.max(0, rooms3 - 1))} className="h-8 w-8"><Minus className="w-4 h-4" /></Button>
                        <span className="font-black w-4 text-center">{rooms3}</span>
                        <Button variant="ghost" size="icon" onClick={() => setRooms3(rooms3 + 1)} className="h-8 w-8"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )}

                  {/* Chambre Quadruple */}
                  {trip.options?.prix_4_chmpre && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-black text-slate-900">{t('reservation.omra.quadruple_room')}</p>
                        <p className="text-xs font-bold text-primary">{trip.options.prix_4_chmpre.toLocaleString('fr-DZ')} DZD <span className="text-slate-400">/ pers</span></p>
                      </div>
                      <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border self-start sm:self-auto">
                        <Button variant="ghost" size="icon" onClick={() => setRooms4(Math.max(0, rooms4 - 1))} className="h-8 w-8"><Minus className="w-4 h-4" /></Button>
                        <span className="font-black w-4 text-center">{rooms4}</span>
                        <Button variant="ghost" size="icon" onClick={() => setRooms4(rooms4 + 1)} className="h-8 w-8"><Plus className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Validation Message */}
                <div className="text-center">
                  {(rooms2 * 2 + rooms3 * 3 + rooms4 * 4) < (adults + children) ? (
                    <p className="text-red-500 font-bold text-sm">
                      {t('reservation.omra.capacity_insufficient', { count: (adults + children) - (rooms2 * 2 + rooms3 * 3 + rooms4 * 4) })}
                    </p>
                  ) : (
                    <p className="text-emerald-500 font-bold text-sm flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> {t('reservation.omra.selection_valid')}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

          </div>

          {/* RIGHT COLUMN: Summary (Occupies 5/12) */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="sticky top-32"
            >
              <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden">
                {/* Trip Header */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={trip.images[0] ? (trip.images[0].startsWith('http') ? trip.images[0] : `http://localhost:3000/api${trip.images[0]}`) : 'https://via.placeholder.com/600x400'}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8">
                    <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-3 border border-white/20">
                      {trip.type}
                    </span>
                    <h3 className="text-2xl font-black text-white leading-tight">{trip.title}</h3>
                  </div>
                </div>

                <div className="p-8 md:p-10 space-y-8">
                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">{t('reservation.summary.duration')}</p>
                        <p className="font-bold text-slate-900">{Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (86400000))} {t('common.days')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Destination</p>
                        <p className="font-bold text-slate-900 truncate">{trip.destination_wilaya || trip.destination_country || trip.omra_category || trip.type}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown - Beautifully Structured */}
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">{t('reservation.summary.cost_breakdown')}</p>

                    <div className="flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                          {adults}
                        </div>
                        <span className="font-bold text-slate-600">Adultes</span>
                      </div>
                      <span className="font-black text-slate-900">{totalAdults.toLocaleString('fr-DZ')} DZD</span>
                    </div>

                    {children > 0 && (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                            {children}
                          </div>
                          <span className="font-bold text-slate-600">Enfants <small className="ml-1 opacity-50">(-20%)</small></span>
                        </div>
                        <span className="font-black text-slate-900">{totalChildren.toLocaleString('fr-DZ')} DZD</span>
                      </div>
                    )}

                    {babies > 0 && (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            {babies}
                          </div>
                          <span className="font-bold text-slate-600">Bébés <small className="ml-1 opacity-50">(-70%)</small></span>
                        </div>
                        <span className="font-black text-slate-900">{totalBabies.toLocaleString('fr-DZ')} DZD</span>
                      </div>
                    )}
                  </div>

                  {/* Total & Button Section */}
                  <div className="pt-8 border-t-2 border-dashed border-slate-100 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-black text-slate-900">{t('reservation.summary.total')}</span>
                      <div className="text-right">
                        {trip.promotion && trip.promotion > 0 && (
                          <p className="text-sm font-bold text-slate-400 line-through decoration-red-400/50 mb-1">
                            {(totalPrice / promoFactor).toLocaleString('fr-DZ')} DZD
                          </p>
                        )}
                        <p className="text-4xl font-black text-primary leading-none mb-1 tracking-tighter">
                          {totalPrice.toLocaleString('fr-DZ')}
                        </p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">DZD</p>
                      </div>
                    </div>

                    <motion.div
                      animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="w-full h-16 text-lg font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                      >
                        {loading ? <LoadingSpinner /> : (
                          <>
                            <span>{t('confirm_button', { defaultValue: 'Valider la réservation' })}</span>
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </Button>
                    </motion.div>

                    {reservationError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm font-bold text-center mt-2"
                      >
                        {reservationError}
                      </motion.p>
                    )}

                    <div className="flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        {t('reservation.summary.secure_platform')}<br />
                        <span className="text-emerald-500">{t('reservation.summary.customer_service')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;