import React, { useState, useEffect } from 'react';
import { Users, Map, BedDouble, TrendingUp, Calendar, Bell, Clock, AlertCircle, Plus, User, Plane, Users as UsersIcon, ChevronRight, Hash } from 'lucide-react';
import { getNotifications, getTrips, adminCreateBooking } from '../../api';
import type { AppNotification, Trip } from '../../Types';
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
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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
        const [notifsData, tripsData] = await Promise.all([
          getNotifications(),
          getTrips()
        ]);

        // Sort by latest first and take top 5
        const lastFive = (notifsData || []).sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 5);

        setActivities(lastFive);
        setTrips(tripsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.user_id || !bookingForm.trip_id) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await adminCreateBooking(bookingForm);
      toast.success("Réservation créée avec succès");
      setIsBookingModalOpen(false);
      setBookingForm({
        user_id: '',
        trip_id: '',
        passengers_adult: 1,
        passengers_child: 0,
        passengers_baby: 0
      });
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

  return (
    <div className="space-y-8">
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
                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">ID de l'Utilisateur</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    required
                    placeholder="Coller l'ID utilisateur ici..."
                    value={bookingForm.user_id}
                    onChange={e => setBookingForm({ ...bookingForm, user_id: e.target.value })}
                    className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:bg-white transition-colors shadow-sm"
                  />
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
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
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

              <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="space-y-2 text-center">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Adultes</Label>
                  <Input
                    type="number" min="1" required
                    value={bookingForm.passengers_adult}
                    onChange={e => setBookingForm({ ...bookingForm, passengers_adult: parseInt(e.target.value) })}
                    className="h-12 text-center rounded-xl bg-white border-slate-200 font-black text-primary"
                  />
                </div>
                <div className="space-y-2 text-center">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Enfants</Label>
                  <Input
                    type="number" min="0" required
                    value={bookingForm.passengers_child}
                    onChange={e => setBookingForm({ ...bookingForm, passengers_child: parseInt(e.target.value) })}
                    className="h-12 text-center rounded-xl bg-white border-slate-200 font-black text-emerald-500"
                  />
                </div>
                <div className="space-y-2 text-center">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Bébés</Label>
                  <Input
                    type="number" min="0" required
                    value={bookingForm.passengers_baby}
                    onChange={e => setBookingForm({ ...bookingForm, passengers_baby: parseInt(e.target.value) })}
                    className="h-12 text-center rounded-xl bg-white border-slate-200 font-black text-orange-500"
                  />
                </div>
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Clients Inscrits"
          value="1,240"
          subtext="+12% ce mois"
          color="bg-blue-500"
        />
        <StatCard
          icon={Map}
          title="Voyages Actifs"
          value="24"
          subtext="8 destinations"
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Réservations"
          value="86"
          subtext="En attente de confirmation"
          color="bg-orange-500"
        />
        <StatCard
          icon={BedDouble}
          title="Hôtels Omra"
          value="12"
          subtext="Partenaires vérifiés"
          color="bg-purple-500"
        />
      </div>

      {/* Sections: Activities & Top Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Top Destinations */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Destinations Populaires
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1565552629477-gin-4d4c4ec9?auto=format&fit=crop&q=80)' }} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">La Mecque (Omra)</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-primary h-full w-[85%]" />
                </div>
              </div>
              <span className="font-bold text-slate-900">85%</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542401886-65d6c61db217?auto=format&fit=crop&q=80)' }} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">Sahara Algérien</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-orange-500 h-full w-[65%]" />
                </div>
              </div>
              <span className="font-bold text-slate-900">65%</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&q=80)' }} />
              <div className="flex-1">
                <h4 className="font-bold text-slate-800">Istanbul</h4>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-full w-[50%]" />
                </div>
              </div>
              <span className="font-bold text-slate-900">50%</span>
            </div>
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