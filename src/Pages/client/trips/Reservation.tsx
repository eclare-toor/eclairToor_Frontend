import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getTrip, createReservation } from '../../../api';
import type { TripDetails } from '../../../api';
import { useAuth } from '../../../Context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import LoadingSpinner from '../../../components/Shared/LoadingSpinner';
import { Calendar, Users, MapPin, CheckCircle2, Minus, Plus, Wallet, ShieldCheck, Mail, Phone, User as UserIcon } from 'lucide-react';

const Reservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [trip, setTrip] = useState<TripDetails | null>(location.state?.trip || null);
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

  if (loading || isAuthLoading) return <div className="min-h-screen pt-32 flex justify-center"><LoadingSpinner /></div>;
  if (error || !trip) return <div className="min-h-screen pt-32 text-center text-red-500 font-bold text-xl">{error}</div>;

  // Pricing Logic
  const priceAdult = trip.base_price;
  const priceChild = trip.base_price * 0.7; // -30%
  const priceBaby = trip.base_price * 0.3; // -70% => pay 30%

  const totalPrice = (adults * priceAdult) + (children * priceChild) + (babies * priceBaby);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      // Force login if not authenticated (or handle as guest)
      navigate('/connexion');
      return;
    }

    setLoading(true);
    try {
      const reservationData = {
        user_id: authUser.id,
        trip_id: id || '',
        passengers_adult: adults,
        passengers_child: children,
        passengers_baby: babies,
        total_price: totalPrice
      };

      const result = await createReservation(reservationData);
      // Navigate to success page with reservation details
      navigate(`/voyages/${id}/congratulationReservation`, {
        state: {
          reservationId: result.id,
          trip,
          totalPrice,
          passengers: { adults, children, babies }
        }
      });
    } catch (err) {
      setError("Une erreur est survenue lors de la réservation.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 mb-8">
          Finaliser votre réservation
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Form */}
          <div className="lg:col-span-2 space-y-8">

            {/* Section 1: Coordonnées */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                Vos Coordonnées
              </h2>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" value={authUser?.nom || (authUser ? `${authUser.nom} ${authUser.prenom}` : '')} readOnly={!!authUser} placeholder="Votre nom" className="pl-10 bg-slate-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={authUser?.email || ''} readOnly={!!authUser} placeholder="email@exemple.com" className="pl-10 bg-slate-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" value={authUser?.phone || ''} readOnly={!!authUser} placeholder="055..." className="pl-10 bg-slate-50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationalité</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="nationality" value={authUser?.nationalite || ''} readOnly={!!authUser} placeholder="Algérienne" className="pl-10 bg-slate-50" />
                  </div>
                </div>
              </form>
              {!isAuthenticated && (
                <p className="text-sm text-yellow-600 mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                  Vous n'êtes pas connecté. Connectez-vous pour pré-remplir ces informations et gagner des points de fidélité.
                </p>
              )}
            </div>

            {/* Section 2: Passagers */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Nombre de passagers
              </h2>

              <div className="space-y-6">
                {/* Adultes */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Adultes</p>
                    <p className="text-sm text-slate-500">Plus de 12 ans</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-1 border shadow-sm">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="h-8 w-8 text-slate-600 hover:text-primary"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold w-4 text-center">{adults}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setAdults(adults + 1)}
                      className="h-8 w-8 text-slate-600 hover:text-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Enfants */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Enfants (-30%)</p>
                    <p className="text-sm text-slate-500">De 2 à 12 ans</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-1 border shadow-sm">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="h-8 w-8 text-slate-600 hover:text-primary"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold w-4 text-center">{children}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setChildren(children + 1)}
                      className="h-8 w-8 text-slate-600 hover:text-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Bébés */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Bébés (-70%)</p>
                    <p className="text-sm text-slate-500">Moins de 2 ans</p>
                  </div>
                  <div className="flex items-center gap-3 bg-white rounded-lg p-1 border shadow-sm">
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setBabies(Math.max(0, babies - 1))}
                      className="h-8 w-8 text-slate-600 hover:text-primary"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="font-bold w-4 text-center">{babies}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => setBabies(babies + 1)}
                      className="h-8 w-8 text-slate-600 hover:text-primary"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">

              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Trip Image Header */}
                <div className="relative h-32">
                  <img src={trip.images[0]} alt={trip.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <p className="text-xs font-bold uppercase opacity-90">{trip.type}</p>
                    <h3 className="font-bold truncate w-60">{trip.title}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Trip Info */}
                  <div className="flex items-center justify-between text-sm text-slate-600 pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (86400000))} Jours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.personalized_fields}</span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Adultes ({adults}x)</span>
                      <span className="font-medium">{(adults * priceAdult).toLocaleString('fr-DZ')} DZD</span>
                    </div>
                    {children > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Enfants ({children}x)</span>
                        <span className="font-medium">{(children * priceChild).toLocaleString('fr-DZ')} DZD</span>
                      </div>
                    )}
                    {babies > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Bébés ({babies}x)</span>
                        <span className="font-medium">{(babies * priceBaby).toLocaleString('fr-DZ')} DZD</span>
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-slate-500 font-medium">Total à payer</span>
                      <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString('fr-DZ')} <span className="text-sm text-slate-400 font-normal">DZD</span></span>
                    </div>
                  </div>

                  <Button onClick={handleConfirm} className="w-full py-6 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                    Confirmer la réservation
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium bg-green-50 py-2 rounded-lg">
                    <ShieldCheck className="w-3 h-3" />
                    Paiement 100% Sécurisé
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;