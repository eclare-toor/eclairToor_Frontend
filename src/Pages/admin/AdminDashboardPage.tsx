import React, { useState, useEffect, Suspense } from 'react';
import { Users, Map, TrendingUp, Calendar, Bell, Clock, AlertCircle, Plus, User, Plane, ChevronRight, PieChart, Activity, DollarSign, Briefcase, ShieldCheck, Minus, Search } from '../../components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { getNotifications, getTrips, adminCreateBooking, getDashboardStats, getUsers } from '../../api';
import type { AppNotification, Trip, DashboardData, User as UserType } from '../../Types';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { toast } from 'react-toastify';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
const UsersBookingsChart = React.lazy(() => import('../../components/Charts/UsersBookingsChart'));
const RevenueChart = React.lazy(() => import('../../components/Charts/RevenueChart'));
const TripsTypeChart = React.lazy(() => import('../../components/Charts/TripsTypeChart'));
const BookingsStatusChart = React.lazy(() => import('../../components/Charts/BookingsStatusChart'));

const StatCard = ({ icon: Icon, title, value, subtext, color }: { icon: any, title: string, value: string, subtext: string, color: string }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-slate-500 font-medium text-sm mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mb-2">{value}</h3>
      <p className="text-xs text-slate-400">{subtext}</p>
    </div>
    <div className={cn("p-4 rounded-xl bg-opacity-10", color)}>
      <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
    </div>
  </div>
);



function AdminDashboardPage() {
  const [activities, setActivities] = useState<AppNotification[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Omra & Booking State
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [rooms2, setRooms2] = useState(0);
  const [rooms3, setRooms3] = useState(0);
  const [rooms4, setRooms4] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);

  const [bookingForm, setBookingForm] = useState({
    user_id: '',
    trip_id: '',
    passengers_adult: 1,
    passengers_child: 0,
    passengers_baby: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [notifsData, tripsData, dashboardStats, usersData] = await Promise.all([
          getNotifications(),
          getTrips(),
          getDashboardStats(),
          getUsers()
        ]);

        // Sort by latest first and take top 5
        const lastFive = (notifsData || []).sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 5);

        // Parse chart data to ensure numbers
        const parsedStats: DashboardData = {
          ...dashboardStats,
          usersPerMonth: dashboardStats.usersPerMonth.map(d => ({ ...d, total: Number(d.total) })),
          bookingsPerMonth: dashboardStats.bookingsPerMonth.map(d => ({ ...d, total: Number(d.total) })),
          revenuePerMonth: dashboardStats.revenuePerMonth.map(d => ({ ...d, total: Number(d.total) })),
          tripsByType: dashboardStats.tripsByType.map(d => ({ ...d, total: Number(d.total) })),
          bookingsByStatus: dashboardStats.bookingsByStatus.map(d => ({ ...d, total: Number(d.total) })),
        };

        setActivities(lastFive);
        setTrips(tripsData);
        setUsers(usersData);
        setDashboardData(parsedStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error("Erreur lors du chargement des données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update selected trip when ID changes
  useEffect(() => {
    if (bookingForm.trip_id) {
      const trip = trips.find(t => t.id === bookingForm.trip_id) || null;
      setSelectedTrip(trip);
      setRooms2(0);
      setRooms3(0);
      setRooms4(0);
      setReservationError(null);
    } else {
      setSelectedTrip(null);
    }
  }, [bookingForm.trip_id, trips]);

  // Calculate Price
  useEffect(() => {
    if (!selectedTrip) {
      setTotalPrice(0);
      return;
    }

    const { passengers_adult: adults, passengers_child: children, passengers_baby: babies } = bookingForm;
    let calculatedPrice = 0;
    const isOmra = selectedTrip.type.toLowerCase() === 'religieuse' || selectedTrip.type.toLowerCase() === 'omra';

    if (isOmra) {
      // Omra Logic (Strict Room Pricing)
      const slots: number[] = [];
      if (selectedTrip.options?.prix_2_chmpre) {
        for (let i = 0; i < rooms2; i++) { slots.push(selectedTrip.options.prix_2_chmpre); slots.push(selectedTrip.options.prix_2_chmpre); }
      }
      if (selectedTrip.options?.prix_3_chmpre) {
        for (let i = 0; i < rooms3; i++) { slots.push(selectedTrip.options.prix_3_chmpre); slots.push(selectedTrip.options.prix_3_chmpre); slots.push(selectedTrip.options.prix_3_chmpre); }
      }
      if (selectedTrip.options?.prix_4_chmpre) {
        for (let i = 0; i < rooms4; i++) { slots.push(selectedTrip.options.prix_4_chmpre); slots.push(selectedTrip.options.prix_4_chmpre); slots.push(selectedTrip.options.prix_4_chmpre); slots.push(selectedTrip.options.prix_4_chmpre); }
      }

      slots.sort((a, b) => b - a);
      let currentSlotIndex = 0;
      let totalAdults = 0;
      let totalChildren = 0;
      let totalBabies = 0;

      for (let i = 0; i < adults; i++) {
        const price = slots[currentSlotIndex] || 0;
        totalAdults += price;
        currentSlotIndex++;
      }

      for (let i = 0; i < children; i++) {
        const price = slots[currentSlotIndex] || 0;
        totalChildren += price * 0.8;
        currentSlotIndex++;
      }

      // Babies: 70% off CHEAPEST SELECTED room
      let cheapestSelectedPrice = 0;
      const selectedPrices = [];
      if (rooms4 > 0 && selectedTrip.options?.prix_4_chmpre) selectedPrices.push(selectedTrip.options.prix_4_chmpre);
      if (rooms3 > 0 && selectedTrip.options?.prix_3_chmpre) selectedPrices.push(selectedTrip.options.prix_3_chmpre);
      if (rooms2 > 0 && selectedTrip.options?.prix_2_chmpre) selectedPrices.push(selectedTrip.options.prix_2_chmpre);

      if (selectedPrices.length > 0) {
        selectedPrices.sort((a, b) => a - b);
        cheapestSelectedPrice = selectedPrices[0];
      }
      totalBabies = babies * cheapestSelectedPrice * 0.3;

      calculatedPrice = totalAdults + totalChildren + totalBabies;
    } else {
      // Standard Logic
      const priceAdult = selectedTrip.base_price;
      const priceChild = selectedTrip.base_price * 0.8;
      const priceBaby = selectedTrip.base_price * 0.3;
      calculatedPrice = (adults * priceAdult) + (children * priceChild) + (babies * priceBaby);
    }
    setTotalPrice(calculatedPrice);
  }, [bookingForm, selectedTrip, rooms2, rooms3, rooms4]);


  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.user_id || !bookingForm.trip_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Omra Validation
    if (selectedTrip && (selectedTrip.type.toLowerCase() === 'religieuse' || selectedTrip.type.toLowerCase() === 'omra')) {
      const totalCapacity = (rooms2 * 2) + (rooms3 * 3) + (rooms4 * 4);
      const totalBedPeople = bookingForm.passengers_adult + bookingForm.passengers_child;

      if (totalCapacity < totalBedPeople) {
        setReservationError(`Capacité insuffisante : ${totalBedPeople - totalCapacity} places manquantes.`);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        return;
      }
    }

    try {
      const payload: any = { ...bookingForm };

      if (selectedTrip && (selectedTrip.type.toLowerCase() === 'religieuse' || selectedTrip.type.toLowerCase() === 'omra')) {
        payload.options = {
          "champre-2": rooms2,
          "champre-3": rooms3,
          "champre-4": rooms4
        };
        payload.prix_calculer = totalPrice;
      }

      await adminCreateBooking(payload);
      toast.success("Réservation créée avec succès");
      setIsBookingModalOpen(false);
      setBookingForm({
        user_id: '',
        trip_id: '',
        passengers_adult: 1,
        passengers_child: 0,
        passengers_baby: 0
      });
      setRooms2(0); setRooms3(0); setRooms4(0); setTotalPrice(0);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de la réservation");
    }
  };

  const getActivityIcon = (type: string) => {
    if (type.includes('payment')) return { icon: TrendingUp, bg: 'bg-green-100', text: 'text-green-600' };
    if (type.includes('booking')) return { icon: Calendar, bg: 'bg-blue-100', text: 'text-blue-600' };
    if (type.includes('request')) return { icon: Bell, bg: 'bg-amber-100', text: 'text-amber-600' };
    return { icon: AlertCircle, bg: 'bg-slate-100', text: 'text-slate-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Admin <span className="text-primary italic">Dashboard</span></h2>
          <p className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Bienvenue sur votre espace d'administration.</p>
        </div>

        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest shadow-lg shadow-slate-200 flex items-center gap-3 transition-all hover:scale-[1.02]">
              <Plus className="w-5 h-5 border-2 border-white/30 rounded-full" />
              Nouvelle Réservation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-slate-900 mb-6">Créer une <span className="text-primary italic">Réservation</span></DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBooking} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sélectionner l'Utilisateur</Label>
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                    <Input
                      placeholder="Rechercher par nom ou prénom..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="h-12 pl-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white transition-colors shadow-sm"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-2xl border border-slate-100">
                    {users
                      .filter(user => {
                        const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
                        return fullName.includes(userSearchTerm.toLowerCase());
                      })
                      .map(user => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setBookingForm({ ...bookingForm, user_id: user.id });
                            setUserSearchTerm(`${user.nom} ${user.prenom}`);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition-all ${bookingForm.user_id === user.id
                              ? 'bg-primary text-white shadow-lg shadow-primary/20'
                              : 'bg-white hover:bg-slate-100 border border-slate-100'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${bookingForm.user_id === user.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                              {user.nom.charAt(0)}{user.prenom.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm uppercase tracking-tight truncate">
                                {user.nom} {user.prenom}
                              </p>
                              <p className={`text-[10px] font-bold truncate ${bookingForm.user_id === user.id ? 'text-white/70' : 'text-slate-400'
                                }`}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    {users.filter(user => {
                      const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
                      return fullName.includes(userSearchTerm.toLowerCase());
                    }).length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <User className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-xs font-bold">Aucun utilisateur trouvé</p>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sélectionner le Voyage</Label>
                <div className="relative">
                  <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <Select
                    onValueChange={(val) => setBookingForm({ ...bookingForm, trip_id: val })}
                    value={bookingForm.trip_id}
                  >
                    <SelectTrigger className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white transition-colors shadow-sm text-left">
                      <SelectValue placeholder="Choisir un voyage dans la liste..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-60 overflow-y-auto z-[9999]">
                      {trips.map(trip => (
                        <SelectItem key={trip.id} value={trip.id} className="p-4 focus:bg-primary/5 rounded-xl cursor-pointer">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 uppercase tracking-tight italic">{trip.title}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trip.type} • {Number(trip.base_price).toLocaleString()} DZD</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Omra Room Selection Step */}
              <AnimatePresence>
                {selectedTrip && (selectedTrip.type.toLowerCase() === 'religieuse' || selectedTrip.type.toLowerCase() === 'omra') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={isShaking && reservationError?.includes('Capacité') ? { x: [-10, 10, -10, 10, 0], opacity: 1, height: 'auto' } : { opacity: 1, height: 'auto', x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="flex items-center gap-3 py-2">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-black text-slate-900 text-lg">Choix des Chambres</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {/* Chambre Double */}
                      {selectedTrip.options?.prix_2_chmpre && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-black text-slate-900 text-sm">Chambre Double</p>
                            <p className="text-[10px] font-bold text-primary">{Number(selectedTrip.options.prix_2_chmpre).toLocaleString('fr-DZ')} DZD / pers</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow-sm border">
                            <Button type="button" variant="ghost" size="icon" onClick={() => setRooms2(Math.max(0, rooms2 - 1))} className="h-6 w-6"><Minus className="w-3 h-3" /></Button>
                            <span className="font-black w-4 text-center text-sm">{rooms2}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setRooms2(rooms2 + 1)} className="h-6 w-6"><Plus className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      )}

                      {/* Chambre Triple */}
                      {selectedTrip.options?.prix_3_chmpre && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-black text-slate-900 text-sm">Chambre Triple</p>
                            <p className="text-[10px] font-bold text-primary">{Number(selectedTrip.options.prix_3_chmpre).toLocaleString('fr-DZ')} DZD / pers</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow-sm border">
                            <Button type="button" variant="ghost" size="icon" onClick={() => setRooms3(Math.max(0, rooms3 - 1))} className="h-6 w-6"><Minus className="w-3 h-3" /></Button>
                            <span className="font-black w-4 text-center text-sm">{rooms3}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setRooms3(rooms3 + 1)} className="h-6 w-6"><Plus className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      )}

                      {/* Chambre Quadruple */}
                      {selectedTrip.options?.prix_4_chmpre && (
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div>
                            <p className="font-black text-slate-900 text-sm">Chambre Quadruple</p>
                            <p className="text-[10px] font-bold text-primary">{Number(selectedTrip.options.prix_4_chmpre).toLocaleString('fr-DZ')} DZD / pers</p>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg shadow-sm border">
                            <Button type="button" variant="ghost" size="icon" onClick={() => setRooms4(Math.max(0, rooms4 - 1))} className="h-6 w-6"><Minus className="w-3 h-3" /></Button>
                            <span className="font-black w-4 text-center text-sm">{rooms4}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => setRooms4(rooms4 + 1)} className="h-6 w-6"><Plus className="w-3 h-3" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Validation Message */}
                    <div className="text-center pt-2">
                      {(rooms2 * 2 + rooms3 * 3 + rooms4 * 4) < (bookingForm.passengers_adult + bookingForm.passengers_child) ? (
                        <p className="text-red-500 font-bold text-xs">
                          Capacité insuffisante : {(bookingForm.passengers_adult + bookingForm.passengers_child) - (rooms2 * 2 + rooms3 * 3 + rooms4 * 4)} places manquantes
                        </p>
                      ) : (
                        <p className="text-emerald-500 font-bold text-xs flex items-center justify-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Sélection valide
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="space-y-2 text-center">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Adultes</Label>
                  <Input
                    type="number" min="1" required
                    value={bookingForm.passengers_adult}
                    onChange={e => setBookingForm({ ...bookingForm, passengers_adult: parseInt(e.target.value) || 0 })}
                    className="h-12 text-center rounded-xl bg-white border-slate-200 font-black text-primary"
                  />
                </div>
                <div className="space-y-2 text-center">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Enfants</Label>
                  <Input
                    type="number" min="0" required
                    value={bookingForm.passengers_child}
                    onChange={e => setBookingForm({ ...bookingForm, passengers_child: parseInt(e.target.value) || 0 })}
                    className="h-12 text-center rounded-xl bg-white border-slate-200 font-black text-emerald-500"
                  />
                </div>
                <div className="space-y-2 text-center">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Bébés</Label>
                  <Input
                    type="number" min="0" required
                    value={bookingForm.passengers_baby}
                    onChange={e => setBookingForm({ ...bookingForm, passengers_baby: parseInt(e.target.value) || 0 })}
                    className="h-12 text-center rounded-xl bg-white border-slate-200 font-black text-orange-500"
                  />
                </div>
              </div>

              {/* Total Price Display */}
              <div className="flex justify-between items-center p-4 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200 overflow-hidden relative">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Prix Total Estimé</p>
                  <p className="text-2xl font-black text-white tracking-tight">{totalPrice.toLocaleString('fr-DZ')} <span className="text-sm font-bold text-slate-500">DZD</span></p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl relative z-10">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
              </div>

              <DialogFooter className="mt-8">
                <Button type="submit" className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-3">
                  Confirmer la réservation
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {dashboardData && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="Utilisateurs Total"
              value={dashboardData.kpis.total_users}
              subtext="Inscrits"
              color="bg-blue-500"
            />
            <StatCard
              icon={Map}
              title="Voyages Total"
              value={dashboardData.kpis.total_trips}
              subtext="Catalogués"
              color="bg-green-500"
            />
            <StatCard
              icon={Briefcase}
              title="Réservations"
              value={dashboardData.kpis.total_bookings}
              subtext={`${dashboardData.kpis.pending_bookings} en attente`}
              color="bg-orange-500"
            />
            <StatCard
              icon={DollarSign}
              title="Revenu Total"
              value={`${Number(dashboardData.kpis.total_revenue).toLocaleString()} DZD`}
              subtext={`Taux de conversion: ${dashboardData.conversion.conversion_rate}%`}
              color="bg-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart: Users & Bookings Per Month */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Croissance Utilisateurs & Réservations
              </h3>
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><LoadingSpinner /></div>}>
                <UsersBookingsChart data={dashboardData.usersPerMonth} />
              </Suspense>
            </div>

            {/* Chart: Revenue Per Month */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Revenus Mensuels
              </h3>
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><LoadingSpinner /></div>}>
                <RevenueChart data={dashboardData.revenuePerMonth} />
              </Suspense>
            </div>

            {/* Chart: Trips by Type */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" /> Répartition des Voyages
              </h3>
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><LoadingSpinner /></div>}>
                <TripsTypeChart data={dashboardData.tripsByType} />
              </Suspense>
            </div>

            {/* Chart: Bookings by Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-500" /> Statut des Réservations
              </h3>
              <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><LoadingSpinner /></div>}>
                <BookingsStatusChart data={dashboardData.bookingsByStatus} />
              </Suspense>
            </div>

          </div>
        </>
      )}


      {/* Sections: Activities & Top Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Top Destinations */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Destinations Populaires
          </h3>
          <div className="space-y-6">
            {dashboardData?.topDestinations && dashboardData.topDestinations.length > 0 ? (
              dashboardData.topDestinations.map((dest, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800">{dest.destination_country || "Destination inconnue"}</h4>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${Math.min(100, (parseInt(dest.bookings) / parseInt(dashboardData.kpis.total_bookings || "1")) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{dest.bookings}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-400 py-8">Aucune donnée disponible</div>
            )}
          </div>
        </div>

        {/* Recent Activities (Real Data) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Activités Récentes
          </h3>

          {loading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : activities.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Aucune activité récente.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => {
                const style = getActivityIcon(activity.type);
                const Icon = style.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors cursor-default border border-transparent hover:border-slate-100">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", style.bg, style.text)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 font-medium">
                        <span className="font-bold">{activity.title}</span>: {activity.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.created_at ? new Date(activity.created_at).toLocaleString() : 'Récemment'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default AdminDashboardPage