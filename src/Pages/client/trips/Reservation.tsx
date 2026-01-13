import { useState, useEffect } from 'react';
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

const Reservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(location.state?.trip || null);
  const [loading, setLoading] = useState(!location.state?.trip);
  const [error, setError] = useState<string | null>(null);

  // Passenger counts
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0); // 2-12 years (-30%)
  const [babies, setBabies] = useState(0); // < 2 years (-70%)

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
          setError('Voyage non trouvé');
        } else {
          setTrip(tripData);
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    if (!trip) {
      fetchData();
    }
  }, [id, trip]);

  if (loading || isAuthLoading) return <div className="min-h-screen pt-52 flex justify-center"><LoadingSpinner /></div>;
  if (error || !trip) return (
    <div className="min-h-screen pt-52 flex flex-col items-center justify-center gap-8 px-4">
      <div className="bg-red-50 border-2 border-red-100 rounded-[2rem] p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl shadow-red-900/5">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 italic uppercase tracking-tight">Oups ! Une erreur est survenue</h2>
        <p className="text-red-500 font-bold text-lg mb-8 leading-relaxed">{error || "Nous n'avons pas pu trouver ce voyage."}</p>
        <Link to="/voyages">
          <Button variant="default" className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] flex items-center gap-3 mx-auto">
            <ArrowLeft className="w-5 h-5" />
            Retour à la liste des voyages
          </Button>
        </Link>
      </div>
    </div>
  );

  // Pricing Logic
  const priceAdult = trip.base_price;
  const priceChild = trip.base_price * 0.8; // -20% AS REQUESTED
  const priceBaby = trip.base_price * 0.3; // -70% => pay 30%

  const totalAdults = adults * priceAdult;
  const totalChildren = children * priceChild;
  const totalBabies = babies * priceBaby;
  const totalPrice = totalAdults + totalChildren + totalBabies;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      navigate('/connexion');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        trip_id: id || '',
        passengers_adult: adults,
        passengers_child: children,
        passengers_baby: babies
      };

      const result = await createReservation(reservationData);
      navigate(`/voyages/${id}/congratulationReservation`, {
        state: {
          reservationId: result.id,
          trip,
          totalPrice,
          passengers: { adults, children, babies }
        }
      });
    } catch (err: any) {
      console.error("Reservation Error:", err);
      const backendMessage = err.response?.data?.error || err.message;
      setError(backendMessage || "Une erreur est survenue lors de la réservation.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-52 pb-32 px-4 relative overflow-hidden">
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Étape Finale</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-4">
            Finaliser votre <span className="text-primary italic">Réservation</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-2xl">Veuillez vérifier vos informations et le nombre de passagers avant de confirmer votre départ pour cette magnifique aventure.</p>
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
                  Vos Coordonnées
                </h2>
                <div className="hidden md:block px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informations du profil</span>
                </div>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nom complet</Label>
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
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nationalité</Label>
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
                Nombre de passagers
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Adultes */}
                <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-colors group">
                  <div className="mb-6 text-center">
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">Adultes</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+12 Ans</p>
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
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">Enfants</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2 à 12 Ans</p>
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
                    <p className="font-black text-slate-900 text-lg uppercase tracking-tight">Bébés</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">-2 Ans</p>
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
                        <p className="text-[10px] font-black text-slate-400 uppercase">Durée</p>
                        <p className="font-bold text-slate-900">{Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (86400000))} Jours</p>
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
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Récapitulatif des coûts</p>

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
                      <span className="text-lg font-black text-slate-900">Total Général</span>
                      <div className="text-right">
                        <p className="text-4xl font-black text-primary leading-none mb-1 tracking-tighter">
                          {totalPrice.toLocaleString('fr-DZ')}
                        </p>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Dinars Algériens</p>
                      </div>
                    </div>

                    <Button
                      onClick={handleConfirm}
                      className="w-full h-16 text-lg font-black uppercase tracking-[0.15em] rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                      <span>Valider la réservation</span>
                      <ArrowRight className="w-6 h-6" />
                    </Button>

                    <div className="flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        Plateforme 100% sécurisée<br />
                        <span className="text-emerald-500">Service client disponible 24/7</span>
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