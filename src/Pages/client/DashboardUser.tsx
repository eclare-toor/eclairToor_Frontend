import { useEffect, useState } from 'react';
import { getUserBookings, updateBooking, getUserRequests } from '../../api';
import type { BookingItem, UnifiedRequest } from '../../Types';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { MapPin, FileText, User, Plane, Settings, LogOut, Edit2, History, BedDouble, Calendar, CheckCircle2, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { toast } from 'react-toastify';
import { useAuth } from '../../Context/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

const DashboardUser = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'requests' | 'settings'>('bookings');
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    passengers_adult: 0,
    passengers_child: 0,
    passengers_baby: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (activeTab === 'bookings') {
          const data = await getUserBookings();
          setBookings(data);
        } else if (activeTab === 'requests') {
          const data = await getUserRequests();
          setRequests(data);
        }
      } catch (err: any) {
        setError(err.message || 'Impossible de charger vos données.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleEditClick = (booking: BookingItem) => {
    setEditingBooking(booking);
    setEditFormData({
      passengers_adult: booking.passengers_adult,
      passengers_child: booking.passengers_child,
      passengers_baby: booking.passengers_baby
    });
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;

    try {
      await updateBooking(editingBooking.id, editFormData);

      setBookings(bookings.map(b =>
        b.id === editingBooking.id
          ? { ...b, ...editFormData }
          : b
      ));

      setEditingBooking(null);
      toast.success("Réservation mise à jour avec succès !");
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la mise à jour de la réservation.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700 border-green-200';
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'CANCELLED':
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      case 'PAID':
      case 'PROCESSED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'Confirmée';
      case 'PENDING': return 'En attente';
      case 'CANCELLED': return 'Annulée';
      case 'REJECTED': return 'Refusée';
      case 'PAID': return 'Payée';
      case 'PROCESSED': return 'Traitée';
      default: return status;
    }
  };

  const renderBookings = () => {
    if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
    if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;
    if (bookings.length === 0) {
      return (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune réservation</h3>
          <p className="text-slate-500 mb-6">Vous n'avez pas encore effectué de réservation.</p>
          <Link to="/voyages">
            <Button>Découvrir nos voyages</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
            <div className={`h-2 w-full md:w-2 md:h-auto rounded-full shrink-0 ${getStatusColor(booking.status).split(' ')[0]}`} />

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{booking.title || 'Voyage'}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {booking.destination_country || booking.title}
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="uppercase text-xs font-semibold tracking-wider text-slate-400">
                      {booking.type}
                    </span>
                  </div>
                </div>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide w-fit", getStatusColor(booking.status))}>
                  {getStatusLabel(booking.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Passagers</p>
                  <p className="font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary/50" />
                    {booking.passengers_adult + booking.passengers_child + booking.passengers_baby}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Prix Total</p>
                  <p className="font-medium text-slate-700">
                    {booking.total_price ? booking.total_price.toLocaleString() : (booking.base_price ? Number(booking.base_price).toLocaleString() : 'N/A')} DZD
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Date réserv.</p>
                  <p className="font-medium text-slate-700">
                    {booking.created_at ? new Date(booking.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Référence</p>
                  <p className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                    {booking.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {booking.status === 'CONFIRMED' && (
                  <Button size="sm" className="gap-2">
                    <FileText className="w-4 h-4" /> Télécharger le billet
                  </Button>
                )}
                {booking.status === 'PENDING' && (
                  <Dialog open={editingBooking?.id === booking.id} onOpenChange={(open) => !open && setEditingBooking(null)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEditClick(booking)}>
                        <Edit2 className="w-4 h-4" /> Modifier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Modifier la réservation</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="adults" className="text-right">Adultes</Label>
                          <Input
                            id="adults"
                            type="number"
                            min="1"
                            className="col-span-3"
                            value={editFormData.passengers_adult}
                            onChange={(e) => setEditFormData({ ...editFormData, passengers_adult: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="children" className="text-right">Enfants</Label>
                          <Input
                            id="children"
                            type="number"
                            min="0"
                            className="col-span-3"
                            value={editFormData.passengers_child}
                            onChange={(e) => setEditFormData({ ...editFormData, passengers_child: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="babies" className="text-right">Bébés</Label>
                          <Input
                            id="babies"
                            type="number"
                            min="0"
                            className="col-span-3"
                            value={editFormData.passengers_baby}
                            onChange={(e) => setEditFormData({ ...editFormData, passengers_baby: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleUpdateBooking}>Enregistrer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRequests = () => {
    if (loading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;
    if (error) return <div className="text-center py-20 text-red-500 font-medium">{error}</div>;
    if (requests.length === 0) {
      return (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
          <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">Aucune demande</h3>
          <p className="text-slate-500 mb-6">Vous n'avez pas encore de demande sur mesure.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/voyages/CustomTripPage"><Button size="sm">Voyage</Button></Link>
            <Link to="/voyages/CustomOmraTripPage"><Button size="sm">Omra</Button></Link>
            <Link to="/request-hotel"><Button size="sm">Hôtel</Button></Link>
            <Link to="/request-flight"><Button size="sm">Vol</Button></Link>
          </div>
        </div>
      );
    }

    const getCategoryStyles = (category: string) => {
      switch (category) {
        case 'voyage': return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-100',
          iconBg: 'bg-indigo-100',
          icon: MapPin
        };
        case 'omra': return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-100',
          iconBg: 'bg-emerald-100',
          icon: History
        };
        case 'hotel': return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-100',
          iconBg: 'bg-blue-100',
          icon: BedDouble
        };
        case 'vol': return {
          bg: 'bg-sky-50',
          text: 'text-sky-700',
          border: 'border-sky-100',
          iconBg: 'bg-sky-100',
          icon: Plane
        };
        default: return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-100',
          iconBg: 'bg-slate-100',
          icon: FileText
        };
      }
    };

    return (
      <div className="space-y-6">
        {requests.map((req) => {
          const styles = getCategoryStyles(req.category);
          const Icon = styles.icon;

          return (
            <div key={req.id} className={cn("p-6 rounded-2xl border transition-all hover:shadow-sm", styles.bg, styles.border)}>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className={cn("p-3 rounded-xl", styles.iconBg, styles.text)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-slate-900 capitalize">Demande {req.category}</h3>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusColor(req.status || 'PENDING'))}>
                        {getStatusLabel(req.status || 'PENDING')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> ID: {req.id.slice(0, 8)}</span>
                      {req.category === 'voyage' && <span className="font-medium text-indigo-600 italic">{req.info.destination}</span>}
                      {req.category === 'hotel' && <span className="font-medium text-blue-600 italic">{req.info.wilaya} ({req.info.lieu_exact})</span>}
                      {req.category === 'vol' && <span className="font-medium text-sky-600 italic">{req.info.ville_depart} ➝ {req.info.ville_arrivee}</span>}
                    </div>
                  </div>
                </div>

                <div className="md:text-right space-y-2">
                  {req.status === 'PROCESSED' ? (
                    <div className="p-3 bg-white/60 rounded-xl border border-white/80">
                      <p className="text-xs text-slate-500 mb-1">Dernière mise à jour</p>
                      <p className="text-sm font-bold text-green-600 flex items-center justify-end gap-1.5">
                        Consultez votre email <CheckCircle2 className="w-4 h-4" />
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Clock className="w-4 h-4" />
                      En cours de traitement...
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                {req.category === 'voyage' && (
                  <>
                    <div><p className="text-slate-400 text-xs text-indigo-400">Durée</p><p className="font-bold">{req.info.duree} Jours</p></div>
                    <div><p className="text-slate-400 text-xs text-indigo-400">Début</p><p className="font-bold">{req.info.date_debut}</p></div>
                    <div><p className="text-slate-400 text-xs text-indigo-400">Hébergement</p><p className="font-bold">{req.info.hebergement}</p></div>
                    <div><p className="text-slate-400 text-xs text-indigo-400">Type</p><p className="font-bold capitalize">{req.info.type}</p></div>
                  </>
                )}
                {req.category === 'omra' && (
                  <>
                    <div><p className="text-slate-400 text-xs text-emerald-400">Durée</p><p className="font-bold">{req.info.duree} Jours</p></div>
                    <div><p className="text-slate-400 text-xs text-emerald-400">Début</p><p className="font-bold">{req.info.date_debut}</p></div>
                    <div className="col-span-2"><p className="text-slate-400 text-xs text-emerald-400">Hôtels</p><p className="font-bold text-[10px]">{req.info.hebergement_makka} / {req.info.hebergement_madina}</p></div>
                  </>
                )}
                {req.category === 'hotel' && (
                  <>
                    <div><p className="text-slate-400 text-xs text-blue-400">Dates</p><p className="font-bold text-[11px]">{req.info.date_debut} au {req.info.date_fin}</p></div>
                    <div><p className="text-slate-400 text-xs text-blue-400">Étoiles</p><p className="font-bold">{req.info.nbre_etoile} ★</p></div>
                    <div><p className="text-slate-400 text-xs text-blue-400">Passagers</p><p className="font-bold">{req.info.passengers.adult}A / {req.info.passengers.child}C / {req.info.passengers.baby}B</p></div>
                    <div><p className="text-slate-400 text-xs text-blue-400">Wilaya</p><p className="font-bold">{req.info.wilaya}</p></div>
                  </>
                )}
                {req.category === 'vol' && (
                  <>
                    <div><p className="text-slate-400 text-xs text-sky-400">Type</p><p className="font-bold capitalize">{req.info.type_vol.replace('_', ' ')}</p></div>
                    <div><p className="text-slate-400 text-xs text-sky-400">Dép/Ret</p><p className="font-bold text-[11px]">{req.info.date_depart} {req.info.date_retour ? `/ ${req.info.date_retour}` : ''}</p></div>
                    <div><p className="text-slate-400 text-xs text-sky-400">Classe</p><p className="font-bold capitalize">{req.info.categorie}</p></div>
                    <div><p className="text-slate-400 text-xs text-sky-400">Passagers</p><p className="font-bold">{req.info.passengers.adult} Ad, {req.info.passengers.child} Enf</p></div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent pt-40 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 shrink-0 space-y-4">
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl shadow-xl shadow-blue-900/5 border border-white/40 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-2xl font-bold">
                {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
              </div>
              <h2 className="font-bold text-slate-900">{user?.nom} {user?.prenom}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
            </div>

            <nav className="bg-white/60 backdrop-blur-xl p-4 rounded-2xl shadow-xl shadow-blue-900/5 border border-white/40 space-y-1">
              <button
                onClick={() => setActiveTab('bookings')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left",
                  activeTab === 'bookings' ? "bg-primary text-white shadow-md shadow-primary/25" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <FileText className="w-5 h-5" /> Mes Réservations
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left",
                  activeTab === 'requests' ? "bg-primary text-white shadow-md shadow-primary/25" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Plane className="w-5 h-5" /> Mes Demandes
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors text-left",
                  activeTab === 'settings' ? "bg-primary text-white shadow-md shadow-primary/25" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Settings className="w-5 h-5" /> Paramètres
              </button>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 font-heading">
                {activeTab === 'bookings' && 'Mes Réservations'}
                {activeTab === 'requests' && 'Mes Demandes'}
                {activeTab === 'settings' && 'Paramètres'}
              </h1>
              <p className="text-slate-500 mt-2">
                {activeTab === 'bookings' && 'Retrouvez ici toutes vos réservations de voyages.'}
                {activeTab === 'requests' && 'Suivez l\'état de vos demandes de devis sur mesure.'}
                {activeTab === 'settings' && 'Gérez vos informations personnelles et préférences.'}
              </p>
            </header>

            <div>
              {activeTab === 'bookings' && renderBookings()}
              {activeTab === 'requests' && renderRequests()}

              {activeTab === 'settings' && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dotted border-slate-300">
                  <Settings className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">Fonctionnalité à venir...</p>
                </div>
              )}
            </div>
          </main>

        </div>
      </div>
    </div>
  );
};

export default DashboardUser;