import { useEffect, useState } from 'react';
import { getUserBookings, updateBooking, getUserRequests, getRequestDetails } from '../../api';
import type { BookingItem, UnifiedRequest } from '../../Types';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { MapPin, FileText, User, Plane, LogOut, Edit2, History, BedDouble, Calendar, CheckCircle2, Clock, Eye, ShieldCheck } from 'lucide-react';
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
import logo from '../../assets/logo.png';

const DashboardUser = () => {
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bookings' | 'requests'>('bookings');
  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    passengers_adult: 0,
    passengers_child: 0,
    passengers_baby: 0
  });
  const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
  const [viewingResponse, setViewingResponse] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);

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

  const handleViewResponse = async (requestId: string) => {
    try {
      setFetchingDetails(true);
      const details = await getRequestDetails(requestId);
      setSelectedRequest(details);
      setViewingResponse(true);
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de la récupération de la réponse.");
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleDownloadTicket = (booking: BookingItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Impossible d'ouvrir le billet. Veuillez autoriser les pop-ups.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Billet - ${booking.title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { margin: 0; size: auto; }
          @media print { body { padding: 40px; margin: 20px auto; } }
          
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; }
          .logo-section { display: flex; align-items: center; gap: 15px; }
          .logo-img { height: 60px; width: auto; object-fit: contain; }
          .brand { font-size: 24px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
          .brand span { color: #2563eb; }
          .ticket-type { background: #f1f5f9; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; border: 1px solid #e2e8f0; }
          
          .trip-title { font-size: 32px; font-weight: 800; margin-bottom: 10px; color: #0f172a; line-height: 1.2; }
          .ref { color: #64748b; font-size: 14px; font-weight: 500; margin-bottom: 40px; font-family: monospace; background: #f8fafc; display: inline-block; padding: 4px 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
          
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 40px; }
          .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 8px; }
          .value { font-size: 18px; font-weight: 600; color: #334155; }
          
          .status-box { background: #f8fafc; padding: 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; }
          .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 99px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
          .status-confirmed { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          
          .price-large { font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
          
          .footer { margin-top: 60px; padding-top: 30px; border-top: 1px dashed #cbd5e1; text-align: center; color: #94a3b8; font-size: 12px; }
          .footer p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="header">
            <div class="logo-section">
                <img src="${window.location.origin}${logo}" class="logo-img" alt="Logo" onerror="this.style.display='none'"/>
                <div class="brand">ECLAIR<span>TRAVEL</span></div>
            </div>
            <div class="ticket-type">BILLET ÉLECTRONIQUE</div>
        </div>
        
        <h1 class="trip-title">Billet - ${booking.title || 'Voyage'}</h1>
        <div class="ref">RÉF: #${booking.id.slice(0, 8).toUpperCase()}</div>

        <div class="grid">
            <div>
                <div class="label">Destination</div>
                <div class="value">${booking.destination_country || booking.title || 'Non spécifié'}</div>
            </div>
            <div>
                <div class="label">Date de Réservation</div>
                <div class="value">${new Date(booking.created_at || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div>
                <div class="label">Passagers</div>
                <div class="value">
                    ${booking.passengers_adult} Adulte${booking.passengers_adult > 1 ? 's' : ''}
                    ${booking.passengers_child > 0 ? `, ${booking.passengers_child} Enfant${booking.passengers_child > 1 ? 's' : ''}` : ''}
                    ${booking.passengers_baby > 0 ? `, ${booking.passengers_baby} Bébé${booking.passengers_baby > 1 ? 's' : ''}` : ''}
                </div>
            </div>
            <div>
                <div class="label">Type de Voyage</div>
                <div class="value" style="text-transform: capitalize;">${booking.type || 'Standard'}</div>
            </div>
        </div>

        <div class="status-box">
            <div>
                <div class="label">Statut de la réservation</div>
                <div class="status-badge status-confirmed">
                    <span>●</span> CONFIRMÉE
                </div>
            </div>
            <div style="text-align: right;">
                <div class="label">Prix Total</div>
                <div class="price-large">${(booking.total_price || booking.base_price || 0).toLocaleString()} DZD</div>
            </div>
        </div>

        <div class="footer">
            <p>Eclair Travel - Votre partenaire de confiance.</p>
            <p>Merci de présenter ce document lors de votre départ.</p>
        </div>
        
        <script>
            window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const stripHtml = (html: string | null | undefined) => {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, '');
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
      <div className="grid grid-cols-1 gap-6 ">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
            <div className={`h-2 w-full md:w-2 md:h-auto rounded-full shrink-0 ${getStatusColor(booking.status).split(' ')[0]}`} />

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-slate-900">{booking.title || 'Voyage'}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500 mt-1">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      {booking.destination_country || booking.title}
                    </span>
                    <span className="uppercase text-[10px] font-bold tracking-widest text-slate-400 border border-slate-200 px-2 py-0.5 rounded">
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
                  <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" onClick={() => handleDownloadTicket(booking)}>
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
                    <div className="space-y-2">
                      <div className="p-3 bg-white/60 rounded-xl border border-white/80">
                        <p className="text-xs text-slate-500 mb-1">Dernière mise à jour</p>
                        <p className="text-sm font-bold text-green-600 flex items-center justify-end gap-1.5 text-right">
                          Offre Prête <CheckCircle2 className="w-4 h-4" />
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full md:w-auto gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        onClick={() => handleViewResponse(req.id)}
                        disabled={fetchingDetails}
                      >
                        {fetchingDetails ? <LoadingSpinner className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        Voir l'offre
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-sm md:justify-end">
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
    <div className="min-h-screen bg-transparent pt-52  pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Sidebar Navigation */}
          <aside className="w-full md:w-72 shrink-0 space-y-6">
            <div className="bg-gradient-to-br from-white to-slate-50 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/60 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent"></div>
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-primary text-3xl font-heading font-bold shadow-lg shadow-blue-900/10 border-4 border-white">
                {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
              </div>
              <h2 className="font-heading font-bold text-xl text-slate-900">{user?.nom} {user?.prenom}</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">{user?.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3" /> Compte Vérifié
              </div>
            </div>

            <nav className="bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/60 space-y-2">
              <button
                onClick={() => setActiveTab('bookings')}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 text-left relative overflow-hidden",
                  activeTab === 'bookings'
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn("p-2 rounded-lg transition-colors", activeTab === 'bookings' ? "bg-white/20" : "bg-slate-100")}>
                  <FileText className="w-5 h-5" />
                </div>
                <span>Mes Réservations</span>
                {activeTab === 'bookings' && <div className="absolute right-4 w-2 h-2 bg-white rounded-full"></div>}
              </button>

              <button
                onClick={() => setActiveTab('requests')}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all duration-300 text-left relative overflow-hidden",
                  activeTab === 'requests'
                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn("p-2 rounded-lg transition-colors", activeTab === 'requests' ? "bg-white/20" : "bg-slate-100")}>
                  <Plane className="w-5 h-5" />
                </div>
                <span>Mes Demandes</span>
                {activeTab === 'requests' && <div className="absolute right-4 w-2 h-2 bg-white rounded-full"></div>}
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
              </h1>
              <p className="text-slate-500 mt-2">
                {activeTab === 'bookings' && 'Retrouvez ici toutes vos réservations de voyages.'}
                {activeTab === 'requests' && 'Suivez l\'état de vos demandes de devis sur mesure.'}
              </p>
            </header>

            <div>
              {activeTab === 'bookings' && renderBookings()}
              {activeTab === 'requests' && renderRequests()}
            </div>
          </main>
        </div>
      </div>

      {/* Response Modal */}
      <Dialog open={viewingResponse} onOpenChange={setViewingResponse}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-indigo-600 p-8 text-white relative">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black italic tracking-tighter">OFFRE D'ECLAIR TRAVEL</h2>
              <p className="text-indigo-100 text-sm mt-1">Nous avons le plaisir de vous proposer cette offre personnalisée</p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          </div>

          <div className="p-8 bg-white">
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">VOTRE OFFRE</h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedRequest?.offer ? stripHtml(selectedRequest.offer) : "Détails de l'offre non disponibles."}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 border border-indigo-100/50">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Date de réponse</p>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedRequest?.response_created_at ? new Date(selectedRequest.response_created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'Récemment'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" onClick={() => setViewingResponse(false)}>
                  Fermer
                </Button>
                <Link to="/contact" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardUser;