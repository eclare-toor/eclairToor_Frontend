import { useEffect, useState } from 'react';
import type { BookingItem } from '../../Types';
import { getAllBookings, updateBookingStatus, getAllRequests, updateCustomRequestStatus, submitRequestResponse, deleteResponse } from '../../api';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
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
  BedDouble,
  ArrowRight,
  TrendingUp,
  Inbox,
  Search,
  ExternalLink,
  Car,
  Users
} from '../../components/icons';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'BOOKINGS' | 'CUSTOM' | 'SERVICES' | 'TRANSPORT';

const AdminRequestsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('BOOKINGS');

  // Data States
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [unifiedRequests, setUnifiedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Management States
  const [selectedUnifiedRequest, setSelectedUnifiedRequest] = useState<any | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [actualPrice, setActualPrice] = useState<string>('');

  const [offerHTML, setOfferHTML] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientNameSearch, setClientNameSearch] = useState('');

  const [requestsLoaded, setRequestsLoaded] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const bk = await getAllBookings();
      setBookings(bk);
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      toast.error(t('admin.requests.modal.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    if (requestsLoaded) return;
    setLoading(true);
    try {
      const reqs = await getAllRequests();
      setUnifiedRequests(reqs);
      setRequestsLoaded(true);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      toast.error(t('admin.requests.modal.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (activeTab === 'CUSTOM' || activeTab === 'SERVICES' || activeTab === 'TRANSPORT') {
      fetchRequests();
    }
  }, [activeTab]);

  const handleUpdateBooking = async (id: string, status: 'CONFIRMED' | 'PAID' | 'CANCELLED', extraData?: any) => {
    try {
      await updateBookingStatus(id, status, extraData);

      setBookings(prevBookings =>
        prevBookings.map(b => b.id === id ? { ...b, status, ...extraData } : b)
      );

      toast.success(`Statut mis à jour : ${status}`);
      setSelectedBooking(null); // Close modal on success
    } catch (error: any) {
      console.error("Failed to update status", error);
      toast.error(error.message || "Erreur lors de la mise à jour du statut");
      fetchBookings();
    }
  };

  const handleSendOffer = async () => {
    if (!selectedUnifiedRequest || !offerHTML) return;
    setIsSubmitting(true);
    try {
      await submitRequestResponse(selectedUnifiedRequest.id, offerHTML);
      await updateCustomRequestStatus(selectedUnifiedRequest.id, 'PROCESSED');

      setUnifiedRequests(prev => prev.map(r => r.id === selectedUnifiedRequest.id ? { ...r, status: 'PROCESSED', offer: offerHTML } : r));
      toast.success(t('admin.requests.modal.offer_sent'));
      setSelectedUnifiedRequest(null);
      setOfferHTML('');
    } catch (error: any) {
      console.error("Failed to send offer", error);
      toast.error(error.message || t('admin.requests.modal.errors.send_failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResponse = async () => {
    if (!selectedUnifiedRequest) return;

    const confirmToast = toast(
      <div className="flex flex-col gap-3">
        <p className="font-bold">{t('admin.requests.modal.confirm_delete_offer')}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(confirmToast)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(confirmToast);
              setIsSubmitting(true);
              try {
                await deleteResponse(selectedUnifiedRequest.id);
                await updateCustomRequestStatus(selectedUnifiedRequest.id, 'PENDING');
                setUnifiedRequests(prev => prev.map(r => r.id === selectedUnifiedRequest.id ? { ...r, status: 'PENDING', offer: null } : r));
                toast.success(t('admin.requests.modal.offer_deleted'));
                setSelectedUnifiedRequest(null);
                setOfferHTML('');
              } catch (error: any) {
                console.error("Failed to delete response", error);
                toast.error(error.message || t('admin.requests.modal.errors.delete_failed'));
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="flex-1"
          >
            {t('common.confirm')}
          </Button>
        </div>
      </div>,
      { autoClose: false, closeButton: false }
    );
  };

  const handleRefuseRequest = async (id: string) => {
    const confirmToast = toast(
      <div className="flex flex-col gap-3">
        <p className="font-bold">{t('admin.requests.modal.confirm_refusal')}</p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toast.dismiss(confirmToast)}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={async () => {
              toast.dismiss(confirmToast);
              try {
                await updateCustomRequestStatus(id, 'REJECTED');
                setUnifiedRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r));
                toast.info(t('admin.requests.modal.refusal_confirmed'));
                setSelectedUnifiedRequest(null);
              } catch (error: any) {
                console.error("Failed to refuse request", error);
                toast.error(error.message || t('admin.requests.modal.errors.refusal_failed'));
              }
            }}
            className="flex-1"
          >
            {t('common.confirm')}
          </Button>
        </div>
      </div>,
      { autoClose: false, closeButton: false }
    );
  };

  const StatusBadge = ({ status }: { status: string | null }) => {
    if (!status) status = 'PENDING';
    const config: Record<string, { bg: string, text: string, icon: any }> = {
      PENDING: { bg: 'bg-amber-50 text-amber-700 ring-amber-600/20', text: t('admin.requests.status.pending'), icon: Clock },
      CONFIRMED: { bg: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', text: t('admin.requests.status.confirmed'), icon: Check },
      PAID: { bg: 'bg-blue-50 text-blue-700 ring-blue-600/20', text: t('admin.requests.status.paid'), icon: CreditCard },
      PROCESSED: { bg: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', text: t('admin.requests.status.processed'), icon: TrendingUp },
      REJECTED: { bg: 'bg-red-50 text-red-700 ring-red-600/10', text: t('admin.requests.status.rejected'), icon: X },
      CANCELLED: { bg: 'bg-slate-50 text-slate-600 ring-slate-500/10', text: t('admin.requests.status.cancelled'), icon: X }
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
    if (!info) return <div className="p-4 text-slate-400 italic">Données manquantes pour cette demande</div>;

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
            <SectionTitle title={t('admin.requests.details.destination')} icon={MapPin} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-slate-900")}>{info.destination}</p>
            <p className={cn("font-bold capitalize", full ? "text-sm text-slate-400" : "text-xs text-slate-500")}>{info.type} • {info.duree} {t('common.days')}</p>
          </div>
          <div className={cn("bg-slate-50 p-5 rounded-2xl border border-slate-100", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.dates_accommodation')} icon={Calendar} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-slate-900")}>{info.date_debut}</p>
            <p className={cn("font-bold", full ? "text-sm text-slate-400" : "text-xs text-slate-500")}>{info.hebergement}</p>
          </div>
          <div className={cn("bg-slate-50 p-5 rounded-2xl border border-slate-100", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.options')} icon={Settings2} />
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
            <SectionTitle title={t('admin.requests.details.parcours')} icon={MapPin} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-indigo-900")}>{info.duree} {t('common.days')} d'Omra</p>
            <p className={cn("font-bold", full ? "text-sm text-slate-400" : "text-xs text-indigo-600")}>{t('admin.requests.details.calendar')}: {info.date_debut}</p>
          </div>
          <div className={cn("bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.hotels')} icon={BedDouble} />
            <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-indigo-700")}>{t('dashboard.requests.details.hebergement_makka')}: <span className={cn("font-black", full ? "text-indigo-200" : "text-slate-700")}>{info.hebergement_makka}</span></p>
            <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-indigo-700")}>{t('dashboard.requests.details.hebergement_madina')}: <span className={cn("font-black", full ? "text-indigo-200" : "text-slate-700")}>{info.hebergement_madina}</span></p>
          </div>
          <div className={cn("bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.preferences')} icon={Settings2} />
            <p className={cn("font-black", full ? "text-base text-white" : "text-xs text-indigo-700")}>{info.options?.transport} • {info.options?.restauration}</p>
          </div>
        </div>
      );
    }

    if (category === 'hotel') {
      return (
        <div className={cn("grid gap-4", full ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1")}>
          <div className={cn("bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.hotel')} icon={MapPin} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-emerald-900")}>{info.wilaya}</p>
            <p className={cn("font-bold", full ? "text-sm text-slate-400" : "text-xs text-emerald-600")}>{info.lieu_exact}</p>
            <p className={cn("font-black uppercase mt-2 tracking-tighter", full ? "text-xs text-emerald-400" : "text-[10px] text-emerald-700")}>{info.nbre_etoile} {t('dashboard.requests.details.stars')}</p>
          </div>
          <div className={cn("bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.stay')} icon={Calendar} />
            <div className="flex items-center gap-3">
              <div><p className={cn("font-black uppercase", full ? "text-xs text-slate-500" : "text-[10px] text-slate-400")}>{t('dashboard.requests.details.start')}</p><p className={cn("font-black", full ? "text-xl text-white" : "text-sm")}>{info.date_debut}</p></div>
              <ArrowRight className={cn("text-slate-300", full ? "w-5 h-5" : "w-3 h-3")} />
              <div><p className={cn("font-black uppercase", full ? "text-xs text-slate-500" : "text-[10px] text-slate-400")}>Au</p><p className={cn("font-black", full ? "text-xl text-white" : "text-sm")}>{info.date_fin}</p></div>
            </div>
          </div>
          <div className={cn("bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.travelers')} icon={User} />
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
            <SectionTitle title={t('admin.requests.details.trajet')} icon={Plane} />
            <div className="flex items-center gap-3">
              <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-sky-900")}>{info.ville_depart}</p>
              <ArrowRight className={cn("text-sky-300", full ? "w-5 h-5" : "w-3 h-3")} />
              <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-sky-900")}>{info.ville_arrivee}</p>
            </div>
            <p className={cn("font-black uppercase mt-2", full ? "text-xs text-sky-400" : "text-[10px] text-sky-700")}>{info.type_vol?.replace('_', ' ')}</p>
          </div>
          <div className={cn("bg-sky-50/50 p-5 rounded-2xl border border-sky-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.calendar')} icon={Calendar} />
            <div className="space-y-1">
              <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-slate-700")}>{t('dashboard.requests.details.start')}: <span className={cn("font-black", full ? "text-sky-200" : "text-slate-500")}>{info.date_depart}</span></p>
              {info.date_retour && <p className={cn("font-bold", full ? "text-base text-white" : "text-xs text-slate-700")}>Retour: <span className={cn("font-black", full ? "text-sky-200" : "text-slate-500")}>{info.date_retour}</span></p>}
            </div>
          </div>
          <div className={cn("bg-sky-50/50 p-5 rounded-2xl border border-sky-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.precisions')} icon={Settings2} />
            <p className={cn("font-black uppercase", full ? "text-xs text-sky-400" : "text-[10px] text-sky-700")}>{info.categorie}</p>
            <p className={cn("font-bold mt-2 tracking-tighter", full ? "text-sm text-slate-400" : "text-[10px] text-slate-500")}>
              {info.passengers?.adult} {t('dashboard.edit_modal.adults')} • {info.passengers?.child} {t('dashboard.edit_modal.children')}
            </p>
          </div>
        </div>
      );
    }

    if (category === 'transport') {
      return (
        <div className={cn("grid gap-4", full ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1")}>
          <div className={cn("bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.transport')} icon={Car} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-blue-900 uppercase")}>{info.aeroport}</p>
            <ArrowRight className={cn("text-blue-300 my-1", full ? "w-5 h-5" : "w-3 h-3")} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-blue-900 uppercase")}>{info.hotel}</p>
          </div>
          <div className={cn("bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.calendar')} icon={Calendar} />
            <p className={cn("font-black tracking-tight", full ? "text-2xl text-white" : "text-base text-slate-900")}>{info.date_depart}</p>
            <p className={cn("font-bold capitalize mt-1", full ? "text-sm text-slate-400" : "text-xs text-slate-500")}>{t('admin.requests.details.luggage')}: {info.bagages}</p>
          </div>
          <div className={cn("bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50", full && "bg-white/5 border-white/10 p-6")}>
            <SectionTitle title={t('admin.requests.details.passengers')} icon={Users} />
            <p className={cn("font-black tracking-tight", full ? "text-4xl text-white" : "text-2xl text-blue-900")}>{info.nbre_person}</p>
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
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">{t('admin.requests.title')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('admin.requests.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.requests.total_requests')}</p>
              <p className="text-xl font-black italic">{bookings.length + unifiedRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-[2rem] w-fit border border-slate-200">
        {[
          { id: 'BOOKINGS', label: 'Réservations', icon: FileText, color: 'text-slate-900 bg-white shadow-xl' },
          { id: 'CUSTOM', label: 'Voyage à la Carte', icon: Clock, color: 'text-slate-900 bg-white shadow-xl' },
          { id: 'SERVICES', label: 'Vols & Hôtels', icon: Plane, color: 'text-slate-900 bg-white shadow-xl' },
          { id: 'TRANSPORT', label: 'Transport', icon: Car, color: 'text-slate-900 bg-white shadow-xl' }
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
          <p className="text-slate-400 font-bold mt-4 animate-pulse">{t('common.loading')}</p>
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
                      placeholder={t('admin.requests.table.filter_placeholder')}
                      value={clientNameSearch}
                      onChange={(e) => setClientNameSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/20 bg-white font-bold text-sm text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.client')}</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.voyage')}</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.date')}</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-400">{t('admin.requests.table.no_requests')}</td></tr>
                      ) : bookings.filter(bk => {
                        if (!clientNameSearch) return true;
                        const fullName = `${bk.nom || ''} ${bk.prenom || ''}`.toLowerCase();
                        return fullName.includes(clientNameSearch.toLowerCase());
                      }).map((bk) => (
                        <tr
                          key={bk.id}
                          className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                          onClick={() => {
                            setSelectedBooking(bk);
                            setActualPrice(bk.prix_vrai_paye?.toString() || bk.total_price?.toString() || bk.prix_calculer?.toString() || bk.base_price?.toString() || '');
                          }}
                        >
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
                          <td className="p-6 font-bold text-slate-700 text-base">
                            {bk.title || 'Voyage #' + bk.trip_id}
                          </td>
                          <td className="p-6 font-medium text-slate-500 text-sm">
                            {bk.created_at ? new Date(bk.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="p-6"><StatusBadge status={bk.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CUSTOM & SERVICES TABS (Unified Table View) */}
            {(activeTab === 'CUSTOM' || activeTab === 'SERVICES' || activeTab === 'TRANSPORT') && (
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('admin.requests.table.search_placeholder')}
                      value={clientNameSearch}
                      onChange={(e) => setClientNameSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-primary/20 bg-white font-bold text-sm text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.client')}</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.type_category')}</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.date')}</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">{t('admin.requests.table.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {unifiedRequests
                        .filter(r => {
                          if (activeTab === 'CUSTOM') return r.category === 'voyage' || r.category === 'omra';
                          if (activeTab === 'TRANSPORT') return r.category === 'transport';
                          return r.category === 'vol' || r.category === 'hotel';
                        })
                        .filter(r => {
                          if (!clientNameSearch) return true;
                          const fullName = `${r.nom || ''} ${r.prenom || ''}`.toLowerCase();
                          const search = clientNameSearch.toLowerCase();
                          const userIdMatch = r.user_id ? r.user_id.toLowerCase().includes(search) : false;
                          return fullName.includes(search) || userIdMatch;
                        })
                        .length === 0 ? (
                        <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-400">{t('admin.requests.table.no_requests')}</td></tr>
                      ) : unifiedRequests
                        .filter(r =>
                          activeTab === 'CUSTOM'
                            ? (r.category === 'voyage' || r.category === 'omra')
                            : activeTab === 'TRANSPORT'
                              ? r.category === 'transport'
                              : (r.category === 'vol' || r.category === 'hotel')
                        )
                        .filter(r => {
                          if (!clientNameSearch) return true;
                          const fullName = `${r.nom || ''} ${r.prenom || ''}`.toLowerCase();
                          const search = clientNameSearch.toLowerCase();
                          const userIdMatch = r.user_id ? r.user_id.toLowerCase().includes(search) : false;
                          return fullName.includes(search) || userIdMatch;
                        })
                        .map((req) => (
                          <tr
                            key={req.id}
                            className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                            onClick={() => {
                              setSelectedUnifiedRequest(req);
                              setOfferHTML(req.offer || '');
                            }}
                          >
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-lg",
                                  req.category === 'omra' ? "bg-indigo-600 text-white" :
                                    req.category === 'hotel' ? "bg-emerald-600 text-white" :
                                      req.category === 'vol' ? "bg-sky-600 text-white" :
                                        req.category === 'transport' ? "bg-blue-600 text-white" : "bg-slate-900 text-white"
                                )}>
                                  {req.nom?.charAt(0) || req.category.charAt(0).toUpperCase()}
                                  {req.prenom?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-900 text-base tracking-tight">
                                    {req.nom && req.prenom ? `${req.nom} ${req.prenom}` : `Utilisateur #${req.user_id?.slice(0, 8)}`}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
                                    {req.email || req.category}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <div className="space-y-1">
                                <p className="font-bold text-slate-700 text-base leading-tight">
                                  {req.info ? (
                                    <>
                                      {req.category === 'voyage' && req.info.destination}
                                      {req.category === 'omra' && "Projet Omra"}
                                      {req.category === 'hotel' && req.info.wilaya}
                                      {req.category === 'vol' && `${req.info.ville_depart} ➝ ${req.info.ville_arrivee}`}
                                      {req.category === 'transport' && `${req.info.aeroport} ➝ ${req.info.hotel}`}
                                    </>
                                  ) : (
                                    <span className="text-red-400 italic">Info manquante</span>
                                  )}
                                </p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{req.category}</p>
                              </div>
                            </td>
                            <td className="p-6 font-medium text-slate-500 text-sm">
                              {req.created_at ? new Date(req.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-6"><StatusBadge status={req.status} /></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <Dialog open={!!selectedUnifiedRequest} onOpenChange={(open) => !open && setSelectedUnifiedRequest(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl bg-[#F8FAFC]">
          {selectedUnifiedRequest && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Premium Header - Same style as booking */}
              <div className="bg-slate-900 border-b border-white/5 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm ring-1 ring-white/20">
                      {t('admin.requests.modal.dossier')} #{selectedUnifiedRequest.id.slice(0, 8)}
                    </span>
                    <StatusBadge status={selectedUnifiedRequest.status} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase mr-12">
                    {t('admin.requests.modal.treatment')}
                  </h2>
                </div>

                <div className="mt-8">
                  <RequestDetails req={selectedUnifiedRequest} full={true} />
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {selectedUnifiedRequest.status === 'REJECTED' ? (
                  <div className="py-20 text-center bg-red-50/50 rounded-[3rem] border border-red-100 border-dashed">
                    <X className="w-12 h-12 text-red-200 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-red-900 uppercase tracking-tighter">{t('admin.requests.modal.rejected_title')}</h3>
                    <p className="text-red-600/70 font-bold text-sm mt-2">{t('admin.requests.modal.rejected_desc')}</p>
                  </div>
                ) : selectedUnifiedRequest.status === 'CANCELLED' ? (
                  <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border border-slate-200 border-dashed">
                    <X className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">{t('admin.requests.modal.cancelled_title')}</h3>
                    <p className="text-slate-500/70 font-bold text-sm mt-2">{t('admin.requests.modal.cancelled_desc')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                        {t('admin.requests.modal.offer_title')}
                      </h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('admin.requests.modal.interface_label')}</p>
                    </div>

                    <div className="relative group">
                      <Textarea
                        className="min-h-[250px] p-6 rounded-[2rem] border-2 border-slate-100 focus:border-primary/50 focus:ring-primary/5 transition-all font-medium text-slate-700 leading-relaxed bg-white"
                        placeholder={t('admin.requests.modal.textarea_placeholder')}
                        value={offerHTML}
                        onChange={(e) => setOfferHTML(e.target.value)}
                      />
                      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-100 transition-opacity">
                        <FileText className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-[10px] text-slate-400 italic">
                      <Check className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{t('admin.requests.modal.offer_hint')}</span>
                    </div>
                  </div>
                )}

                {/* Actions Area */}
                <div className="flex flex-col md:flex-row gap-4 pt-8 border-t border-slate-100">
                  {selectedUnifiedRequest.status !== 'REJECTED' &&
                    selectedUnifiedRequest.status !== 'CANCELLED' && (
                      <div className="flex flex-col md:flex-row gap-4 w-full">
                        {selectedUnifiedRequest.status !== 'PROCESSED' && (
                          <Button
                            variant="outline"
                            className="h-16 px-8 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-2xl font-black italic gap-2 transition-all"
                            onClick={() => handleRefuseRequest(selectedUnifiedRequest.id)}
                            disabled={isSubmitting}
                          >
                            <X className="w-5 h-5" /> {t('admin.requests.modal.reject_dossier')}
                          </Button>
                        )}

                        {selectedUnifiedRequest.status === 'PROCESSED' && (
                          <Button
                            variant="outline"
                            className="h-16 px-8 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-2xl font-black italic gap-2 transition-all"
                            onClick={handleDeleteResponse}
                            disabled={isSubmitting}
                          >
                            <X className="w-5 h-5" /> {t('admin.requests.modal.delete_offer')}
                          </Button>
                        )}

                        <Button
                          className="flex-1 h-16 px-12 bg-slate-900 hover:bg-primary text-white shadow-xl shadow-slate-900/10 rounded-2xl font-black italic gap-3 transition-all"
                          onClick={handleSendOffer}
                          disabled={isSubmitting || !offerHTML}
                        >
                          {isSubmitting ? (
                            <div className="h-6 w-6 border-4 border-white/30 border-t-white animate-spin rounded-full" />
                          ) : (
                            <>
                              <Check className="w-6 h-6" />
                              {selectedUnifiedRequest.status === 'PROCESSED'
                                ? t('admin.requests.modal.update_offer')
                                : t('admin.requests.modal.send_offer')}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Booking Detail Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-[#F8FAFC]">
          {selectedBooking && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Premium Header */}
              <div className="bg-slate-900 border-b border-white/5 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm ring-1 ring-white/20">
                        RÉSERVATION #{selectedBooking.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={selectedBooking.status} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter mt-4">
                      {selectedBooking.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-slate-400 font-medium">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="uppercase tracking-wide text-xs font-bold">{selectedBooking.destination_country || 'Destination Inconnue'}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className="uppercase tracking-wide text-xs font-bold">{selectedBooking.type}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 shrink-0">
                    <Link
                      to={`/admin/voyages/${selectedBooking.trip_id}`}
                      target="_blank"
                      className="group flex items-center justify-center gap-2 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span className="text-xs font-black uppercase tracking-widest">Voir le Voyage</span>
                      <ExternalLink className="w-4 h-4 text-primary group-hover:rotate-45 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* User Card */}
                  <div className="md:col-span-2 p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100%] -translate-y-8 translate-x-8 group-hover:bg-primary/5 transition-colors" />

                    <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-slate-200 shrink-0">
                      {selectedBooking.nom?.charAt(0)}{selectedBooking.prenom?.charAt(0)}
                    </div>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Information Client</p>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight">{selectedBooking.nom} {selectedBooking.prenom}</h3>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center"><User className="w-3 h-3" /></div>
                          {selectedBooking.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                          <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center"><Calendar className="w-3 h-3" /></div>
                          Réservé le {selectedBooking.created_at ? new Date(selectedBooking.created_at).toLocaleDateString() : '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <User className="w-6 h-6" />
                    </div>
                    <p className="text-3xl font-black text-slate-900">
                      {selectedBooking.passengers_adult + selectedBooking.passengers_child + selectedBooking.passengers_baby}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Voyageurs Total</p>
                  </div>
                </div>

                {/* Detailed Breakdown Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Passengers Detail */}
                  <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-slate-50 rounded-xl"><User className="w-4 h-4 text-slate-400" /></div>
                      <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">Détail des Passagers</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-600 text-xs uppercase tracking-wide">Adultes</span>
                        <span className="font-black text-lg text-slate-900">{selectedBooking.passengers_adult}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-600 text-xs uppercase tracking-wide">Enfants</span>
                        <span className="font-black text-lg text-slate-900">{selectedBooking.passengers_child}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-600 text-xs uppercase tracking-wide">Bébés</span>
                        <span className="font-black text-lg text-slate-900">{selectedBooking.passengers_baby}</span>
                      </div>
                    </div>
                  </div>

                  {/* Room Options (Omra) */}
                  <div className="p-6 bg-white rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-slate-50 rounded-xl"><BedDouble className="w-4 h-4 text-slate-400" /></div>
                      <h4 className="font-black text-slate-900 uppercase tracking-wide text-sm">Options d'Hébergement</h4>
                    </div>
                    {selectedBooking.options ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                          <span className="font-bold text-indigo-900 text-xs uppercase tracking-wide">Chambres Doubles</span>
                          <span className="font-black text-lg text-indigo-600">{selectedBooking.options["champre-2"] || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                          <span className="font-bold text-indigo-900 text-xs uppercase tracking-wide">Chambres Triples</span>
                          <span className="font-black text-lg text-indigo-600">{selectedBooking.options["champre-3"] || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                          <span className="font-bold text-indigo-900 text-xs uppercase tracking-wide">Chambres Quadruples</span>
                          <span className="font-black text-lg text-indigo-600">{selectedBooking.options["champre-4"] || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 font-bold italic">Aucune option d'hébergement spécifique pour ce voyage.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financials */}
                <div className="p-1 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl shadow-slate-200">
                  <div className="bg-slate-900 rounded-[2.3rem] p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                      <div>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em] mb-2">Montant Total Calculé</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-white tracking-tight">
                            {Number(selectedBooking.prix_calculer || selectedBooking.total_price || 0).toLocaleString()}
                          </span>
                          <span className="text-base font-bold text-slate-500">DZD</span>
                        </div>
                      </div>

                      {selectedBooking.prix_vrai_paye && Number(selectedBooking.prix_vrai_paye) !== Number(selectedBooking.prix_calculer) && (
                        <div className="px-6 py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
                          <p className="text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Montant Réel Payé</p>
                          <p className="text-2xl font-black text-emerald-400">
                            {Number(selectedBooking.prix_vrai_paye).toLocaleString()} <span className="text-sm">DZD</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Secure Actions Footer */}
                {selectedBooking.status !== 'PAID' && selectedBooking.status !== 'CANCELLED' && (
                  <div className="pt-8 mt-4 border-t border-slate-200">
                    {selectedBooking.status === 'PENDING' && (
                      <div className="space-y-6">
                        {selectedBooking.type !== 'religieuse' && (
                          <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 space-y-3">
                            <div className="flex items-center gap-2">
                              <Settings2 className="w-4 h-4 text-primary" />
                              <label className="text-xs font-black uppercase tracking-widest text-slate-900">Ajuster le prix final</label>
                            </div>
                            <div className="relative">
                              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">DZD</div>
                              <input
                                type="number"
                                value={actualPrice}
                                onChange={(e) => setActualPrice(e.target.value)}
                                className="w-full h-16 pl-16 pr-6 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-900 focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Modifier le prix..."
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold px-2 italic">
                              * Ce prix sera affiché au client comme montant à payer après confirmation.
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            onClick={() => handleUpdateBooking(selectedBooking.id, 'CANCELLED')}
                            variant="outline"
                            className="h-16 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700 font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                          >
                            REFUSER
                          </Button>
                          <Button
                            onClick={() => handleUpdateBooking(selectedBooking.id, 'CONFIRMED', { prix_calculer: actualPrice || selectedBooking.prix_calculer || selectedBooking.total_price })}
                            className="h-16 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all uppercase tracking-widest text-xs"
                          >
                            ACCEPTER LA DEMANDE
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedBooking.status === 'CONFIRMED' && (
                      <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-slate-900" />
                            <label className="text-xs font-black uppercase tracking-widest text-slate-900">Validation du Paiement</label>
                          </div>
                          <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">DZD</div>
                            <input
                              type="number"
                              value={actualPrice}
                              onChange={(e) => setActualPrice(e.target.value)}
                              className="w-full h-16 pl-16 pr-6 bg-white border-2 border-slate-200 rounded-2xl font-black text-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                              placeholder="Saisir le montant final encaissé..."
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 font-bold px-2 italic">
                            * Laissez vide pour utiliser le montant calculé par défaut.
                          </p>
                        </div>
                        <Button
                          onClick={() => handleUpdateBooking(selectedBooking.id, 'PAID', { prix_vrai_paye: actualPrice })}
                          className="w-full h-16 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-slate-900/40 hover:-translate-y-1 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3"
                        >
                          <Check className="w-5 h-5" /> CONFIRMER LE PAIEMENT
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequestsPage;
