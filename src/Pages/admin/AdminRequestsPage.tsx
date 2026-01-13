import { useEffect, useState } from 'react';
import type { BookingItem } from '../../Types';
import { getAllBookings, updateBookingStatus, getAllRequests, updateCustomRequestStatus, submitRequestResponse } from '../../api';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import {
  Clock,
  FileText,
  Plane,
  Check,
  CreditCard,
  X,
  Settings2,
  User,
  Calendar,
  MapPin,
  History,
  BedDouble,
  ArrowRight,
  TrendingUp,
  Inbox,
  Search
} from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'BOOKINGS' | 'CUSTOM' | 'SERVICES';

const AdminRequestsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('BOOKINGS');

  // Data States
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [unifiedRequests, setUnifiedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Management States
  const [selectedUnifiedRequest, setSelectedUnifiedRequest] = useState<any | null>(null);
  const [offerHTML, setOfferHTML] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userIdSearch, setUserIdSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bk, reqs] = await Promise.all([
        getAllBookings(),
        getAllRequests()
      ]);
      setBookings(bk);
      setUnifiedRequests(reqs);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBooking = async (id: string, status: 'CONFIRMED' | 'PAID' | 'CANCELLED') => {
    setBookings(prevBookings =>
      prevBookings.map(b => b.id === id ? { ...b, status } : b)
    );

    try {
      await updateBookingStatus(id, status);
    } catch (error) {
      console.error("Failed to update status", error);
      fetchData();
    }
  };

  const handleSendOffer = async () => {
    if (!selectedUnifiedRequest || !offerHTML) return;
    setIsSubmitting(true);
    try {
      await submitRequestResponse(selectedUnifiedRequest.id, offerHTML);
      await updateCustomRequestStatus(selectedUnifiedRequest.id, 'PROCESSED');

      setUnifiedRequests(prev => prev.map(r => r.id === selectedUnifiedRequest.id ? { ...r, status: 'PROCESSED' } : r));
      setSelectedUnifiedRequest(null);
      setOfferHTML('');
    } catch (error) {
      console.error("Failed to send offer", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefuseRequest = async (id: string) => {
    try {
      await updateCustomRequestStatus(id, 'REJECTED');
      setUnifiedRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
      setSelectedUnifiedRequest(null);
    } catch (error) {
      console.error("Failed to refuse request", error);
    }
  };

  const StatusBadge = ({ status }: { status: string | null }) => {
    if (!status) status = 'PENDING';
    const config: Record<string, { bg: string, text: string, icon: any }> = {
      PENDING: { bg: 'bg-amber-50 text-amber-700 ring-amber-600/20', text: 'En attente', icon: Clock },
      CONFIRMED: { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', text: 'Confirmée', icon: Check },
      PAID: { bg: 'bg-blue-50 text-blue-700 ring-blue-600/20', text: 'Payée', icon: CreditCard },
      PROCESSED: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', text: 'Traitée', icon: TrendingUp },
      REJECTED: { bg: 'bg-red-50 text-red-700 ring-red-600/10', text: 'Refusée', icon: X },
      CANCELLED: { bg: 'bg-slate-50 text-slate-600 ring-slate-500/10', text: 'Annulée', icon: X }
    };

    const style = config[status] || config.PENDING;
    const Icon = style.icon;

    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset shadow-sm transition-all", style.bg)}>
        <Icon className="w-3 h-3" />
        {style.text}
      </span>
    );
  };

  const RequestDetails = ({ req, full = false }: { req: any, full?: boolean }) => {
    const { category, info } = req;

    const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
      <h4 className={cn(
        "flex items-center gap-2 font-black uppercase tracking-widest mb-3",
        full ? "text-xs" : "text-[10px]",
        full ? "text-slate-400" : "text-slate-400"
      )}>
        <Icon className={cn(full ? "w-4 h-4" : "w-3 h-3")} /> {title}
      </h4>
    );

    if (category === 'voyage') {
      return (
        <div className={cn("grid gap-4", full ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1")}>
          <div className={cn("bg-slate-50 p-5 rounded-2xl border border-slate-100", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Destination" icon={MapPin} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-slate-900")}>{info.destination}</p>
            <p className={cn("font-bold capitalize", full ? "text-sm text-slate-400" : "text-xs text-slate-500")}>{info.type} • {info.duree} Jours</p>
          </div>
          <div className={cn("bg-slate-50 p-5 rounded-2xl border border-slate-100", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Dates & Hébergement" icon={Calendar} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-slate-900")}>{info.date_debut}</p>
            <p className={cn("font-bold", full ? "text-sm text-slate-400" : "text-xs text-slate-500")}>{info.hebergement}</p>
          </div>
          <div className={cn("bg-slate-50 p-5 rounded-2xl border border-slate-100", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Options" icon={Settings2} />
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={cn("px-3 py-1 rounded-xl font-bold border", full ? "bg-white/10 border-white/10 text-white text-xs" : "bg-white border-slate-200 text-[10px]")}>{info.options?.transport}</span>
              <span className={cn("px-3 py-1 rounded-xl font-bold border", full ? "bg-white/10 border-white/10 text-white text-xs" : "bg-white border-slate-200 text-[10px]")}>{info.options?.restauration}</span>
            </div>
          </div>
        </div>
      );
    }

    if (category === 'omra') {
      return (
        <div className={cn("grid gap-4", full ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1")}>
          <div className={cn("bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Parcours" icon={MapPin} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-indigo-900")}>{info.duree} Jours d'Omra</p>
            <p className={cn("font-bold", full ? "text-sm text-slate-400" : "text-xs text-indigo-600")}>Début: {info.date_debut}</p>
          </div>
          <div className={cn("bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Hotels" icon={BedDouble} />
            <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-indigo-700")}>Makkah: <span className={cn("font-black", full ? "text-indigo-200" : "text-slate-700")}>{info.hebergement_makka}</span></p>
            <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-indigo-700")}>Madina: <span className={cn("font-black", full ? "text-indigo-200" : "text-slate-700")}>{info.hebergement_madina}</span></p>
          </div>
          <div className={cn("bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Préférences" icon={Settings2} />
            <p className={cn("font-black", full ? "text-base text-white" : "text-xs text-indigo-700")}>{info.options?.transport} • {info.options?.restauration}</p>
          </div>
        </div>
      );
    }

    if (category === 'hotel') {
      return (
        <div className={cn("grid gap-4", full ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1")}>
          <div className={cn("bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Hôtel" icon={MapPin} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-emerald-900")}>{info.wilaya}</p>
            <p className={cn("font-bold", full ? "text-sm text-slate-400" : "text-xs text-emerald-600")}>{info.lieu_exact}</p>
            <p className={cn("font-black uppercase mt-2 tracking-tighter", full ? "text-xs text-emerald-400" : "text-[10px] text-emerald-700")}>{info.nbre_etoile} Étoiles souhaitées</p>
          </div>
          <div className={cn("bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Séjour" icon={Calendar} />
            <div className="flex items-center gap-3">
              <div><p className={cn("font-black uppercase", full ? "text-xs text-slate-500" : "text-[10px] text-slate-400")}>Du</p><p className={cn("font-black", full ? "text-xl text-white" : "text-sm")}>{info.date_debut}</p></div>
              <ArrowRight className={cn("text-slate-300", full ? "w-5 h-5" : "w-3 h-3")} />
              <div><p className={cn("font-black uppercase", full ? "text-xs text-slate-500" : "text-[10px] text-slate-400")}>Au</p><p className={cn("font-black", full ? "text-xl text-white" : "text-sm")}>{info.date_fin}</p></div>
            </div>
          </div>
          <div className={cn("bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Voyageurs" icon={User} />
            <div className="flex gap-6">
              <div><p className={cn("font-black uppercase", full ? "text-xs text-slate-500" : "text-[10px] text-slate-400")}>Ad</p><p className={cn("font-black", full ? "text-2xl text-white" : "text-base")}>{info.passengers?.adult}</p></div>
              <div><p className={cn("font-black uppercase", full ? "text-xs text-slate-500" : "text-[10px] text-slate-400")}>Enf</p><p className={cn("font-black", full ? "text-2xl text-white" : "text-base")}>{info.passengers?.child}</p></div>
              <div><p className={cn("font-black uppercase", full ? "text-xs text-slate-500" : "text-[10px] text-slate-400")}>Bb</p><p className={cn("font-black", full ? "text-2xl text-white" : "text-base")}>{info.passengers?.baby}</p></div>
            </div>
          </div>
        </div>
      );
    }

    if (category === 'vol') {
      return (
        <div className={cn("grid gap-4", full ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1")}>
          <div className={cn("bg-sky-50/50 p-5 rounded-2xl border border-sky-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Trajet" icon={Plane} />
            <div className="flex items-center gap-3">
              <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-sky-900")}>{info.ville_depart}</p>
              <ArrowRight className={cn("text-sky-300", full ? "w-5 h-5" : "w-3 h-3")} />
              <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-sky-900")}>{info.ville_arrivee}</p>
            </div>
            <p className={cn("font-black uppercase mt-2", full ? "text-xs text-sky-400" : "text-[10px] text-sky-700")}>{info.type_vol?.replace('_', ' ')}</p>
          </div>
          <div className={cn("bg-sky-50/50 p-5 rounded-2xl border border-sky-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Calendrier" icon={Calendar} />
            <div className="space-y-1">
              <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-slate-700")}>Départ: <span className={cn("font-black", full ? "text-sky-200" : "text-slate-500")}>{info.date_depart}</span></p>
              {info.date_retour && <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-slate-700")}>Retour: <span className={cn("font-black", full ? "text-sky-200" : "text-slate-500")}>{info.date_retour}</span></p>}
            </div>
          </div>
          <div className={cn("bg-sky-50/50 p-5 rounded-2xl border border-sky-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title="Précisions" icon={Settings2} />
            <p className={cn("font-black uppercase", full ? "text-xs text-sky-400" : "text-[10px] text-sky-700")}>{info.categorie}</p>
            <p className={cn("font-bold mt-2 tracking-tighter", full ? "text-sm text-slate-400" : "text-[10px] text-slate-500")}>
              {info.passengers?.adult} Adultes • {info.passengers?.child} Enfants
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">GESTION DES DEMANDES</h2>
          <p className="text-slate-500 text-sm mt-1">Supervisez et répondez aux réservations et demandes sur mesure.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Demandes</p>
              <p className="text-xl font-black italic">{bookings.length + unifiedRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit border border-slate-200">
        {[
          { id: 'BOOKINGS', label: 'Réservations', icon: FileText, color: 'text-slate-900 bg-white shadow-xl' },
          { id: 'CUSTOM', label: 'Projets Sur Mesure', icon: Clock, color: 'text-slate-900 bg-white shadow-xl' },
          { id: 'SERVICES', label: 'Vols & Hôtels', icon: Plane, color: 'text-slate-900 bg-white shadow-xl' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "px-6 py-3 text-sm font-black italic rounded-[1.5rem] transition-all flex items-center gap-2",
              activeTab === tab.id ? tab.color : "text-slate-500 hover:text-slate-800"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "animate-pulse" : "")} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50">
          <LoadingSpinner />
          <p className="text-slate-400 font-bold mt-4 animate-pulse">Chargement des dossiers...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* BOOKINGS TAB */}
            {activeTab === 'BOOKINGS' && (
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filtrer par ID Utilisateur..."
                      value={userIdSearch}
                      onChange={(e) => setUserIdSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/20 bg-white font-bold text-sm text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client / Dossier</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Voyage Sélectionné</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type & Pax</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Montant</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">État</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.length === 0 ? (
                        <tr><td colSpan={6} className="p-20 text-center font-bold text-slate-400">Aucune réservation pour le moment.</td></tr>
                      ) : bookings.filter(bk => userIdSearch ? bk.user_id?.toLowerCase().includes(userIdSearch.toLowerCase()) : true).map((bk) => (
                        <tr key={bk.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-slate-200">
                                {bk.nom?.charAt(0)}{bk.prenom?.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 text-base tracking-tight">{bk.nom} {bk.prenom}</span>
                                <span className="text-sm font-bold text-slate-400">{bk.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-6 font-bold text-slate-700 text-base truncate max-w-[200px]">
                            {bk.title || 'Voyage #' + bk.trip_id}
                          </td>
                          <td className="p-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-black text-primary uppercase tracking-widest">{bk.type}</span>
                              <span className="text-sm font-bold text-slate-500">
                                {bk.passengers_adult + bk.passengers_child + bk.passengers_baby} Personnes
                              </span>
                            </div>
                          </td>
                          <td className="p-6 font-black text-primary text-base whitespace-nowrap">
                            {bk.base_price ? `${Number(bk.base_price).toLocaleString()} DZD` : '-'}
                          </td>
                          <td className="p-6"><StatusBadge status={bk.status} /></td>
                          <td className="p-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {bk.status !== 'CONFIRMED' && bk.status !== 'PAID' && (
                                <Button
                                  variant="ghost" size="icon" className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                  onClick={() => handleUpdateBooking(bk.id, 'CONFIRMED')}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {bk.status !== 'PAID' && (
                                <Button
                                  variant="ghost" size="icon" className="h-9 w-9 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                  onClick={() => handleUpdateBooking(bk.id, 'PAID')}
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                              )}
                              {bk.status !== 'CANCELLED' && bk.status !== 'REJECTED' && (
                                <Button
                                  variant="ghost" size="icon" className="h-9 w-9 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                  onClick={() => handleUpdateBooking(bk.id, 'CANCELLED')}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CUSTOM & SERVICES TABS (Simplified Cards) */}
            {(activeTab === 'CUSTOM' || activeTab === 'SERVICES') && (
              <div className="grid grid-cols-1 gap-4">
                {unifiedRequests
                  .filter(r =>
                    activeTab === 'CUSTOM'
                      ? (r.category === 'voyage' || r.category === 'omra')
                      : (r.category === 'vol' || r.category === 'hotel')
                  )
                  .map((req) => (
                    <motion.div
                      layout
                      key={req.id}
                      className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 hover:shadow-2xl hover:shadow-primary/5 transition-all group overflow-hidden"
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner",
                            req.category === 'omra' ? "bg-indigo-50 text-indigo-600" :
                              req.category === 'hotel' ? "bg-emerald-50 text-emerald-600" :
                                req.category === 'vol' ? "bg-sky-50 text-sky-600" : "bg-slate-50 text-slate-600"
                          )}>
                            {req.category === 'omra' && <History className="w-8 h-8" />}
                            {req.category === 'voyage' && <MapPin className="w-8 h-8" />}
                            {req.category === 'hotel' && <BedDouble className="w-8 h-8" />}
                            {req.category === 'vol' && <Plane className="w-8 h-8" />}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Demande {req.category}</span>
                              <StatusBadge status={req.status} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                              Client #{req.user_id?.slice(0, 8)}
                              <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400">Reçu le {new Date(req.created_at || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="hidden lg:block text-right pr-6 border-r border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Détails</p>
                            <p className="text-sm font-bold text-slate-700">
                              {req.category === 'voyage' && req.info.destination}
                              {req.category === 'omra' && "Pèlerinage"}
                              {req.category === 'hotel' && req.info.wilaya}
                              {req.category === 'vol' && `${req.info.ville_depart} ➝ ${req.info.ville_arrivee}`}
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedUnifiedRequest(req);
                              setOfferHTML('');
                            }}
                            className="h-14 px-8 bg-slate-900 hover:bg-primary shadow-xl shadow-slate-900/10 rounded-2xl font-black transition-all gap-2"
                          >
                            <Settings2 className="w-4 h-4" />
                            GÉRER LE DOSSIER
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                }
                {unifiedRequests.filter(r => activeTab === 'CUSTOM' ? (r.category === 'voyage' || r.category === 'omra') : (r.category === 'vol' || r.category === 'hotel')).length === 0 && (
                  <div className="py-24 text-center text-slate-400 bg-slate-50 rounded-[3rem] border border-dotted border-slate-200">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">Aucun dossier trouvé dans cette catégorie.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Unified Request Management Modal */}
      <Dialog open={!!selectedUnifiedRequest} onOpenChange={(open) => !open && setSelectedUnifiedRequest(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          {selectedUnifiedRequest && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Modal Header */}
              <div className="bg-slate-900 text-white p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest">DOSSIER #{selectedUnifiedRequest.id.slice(0, 8)}</span>
                      <StatusBadge status={selectedUnifiedRequest.status} />
                    </div>
                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">Traitement de la Demande</h2>
                  </div>
                </div>

                {/* Summary of Request in Header */}
                <RequestDetails req={selectedUnifiedRequest} full={true} />
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      VOTRE PROPOSITION PERSONNALISÉE
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Interface de Rédaction</p>
                  </div>

                  <div className="relative group">
                    <Textarea
                      className="min-h-[250px] p-6 rounded-[2rem] border-2 border-slate-100 focus:border-primary/50 focus:ring-primary/5 transition-all font-medium text-slate-700 leading-relaxed"
                      placeholder="Rédigez ici les détails de l'offre (Prix, services inclus, détails des vols...)"
                      value={offerHTML}
                      onChange={(e) => setOfferHTML(e.target.value)}
                    />
                    <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                      <FileText className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-[10px] text-slate-400 italic">
                    <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                    <span>L'utilisateur verra cette offre instantanément dans son tableau de bord client. Soyez précis sur les tarifs et les conditions.</span>
                  </div>
                </div>

                {/* Actions Area */}
                <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-slate-100">
                  <Button
                    variant="outline"
                    className="h-16 px-8 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-2xl font-black italic gap-2 transition-all order-2 md:order-1"
                    onClick={() => handleRefuseRequest(selectedUnifiedRequest.id)}
                  >
                    <X className="w-5 h-5" /> REJETER LE DOSSIER
                  </Button>

                  <Button
                    className="flex-1 h-16 px-12 bg-slate-900 hover:bg-primary text-white shadow-xl shadow-slate-900/10 rounded-2xl font-black italic gap-3 transition-all order-1 md:order-2"
                    onClick={handleSendOffer}
                    disabled={isSubmitting || !offerHTML}
                  >
                    {isSubmitting ? (
                      <div className="h-6 w-6 border-4 border-white/30 border-t-white animate-spin rounded-full" />
                    ) : (
                      <>
                        <Check className="w-6 h-6" /> ENVOYER L'OFFRE AU CLIENT
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequestsPage;
