import { useEffect, useState } from 'react';
import { getUserBookings, updateBooking, updateBookingStatus, getUserRequests, getRequestDetails, updateRequest, getHotelsByType } from '../../api';
import type { BookingItem, UnifiedRequest } from '../../Types';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Button } from '../../components/ui/button';
import { MapPin, FileText, User, Plane, LogOut, Edit2, History, BedDouble, Calendar, Eye, ShieldCheck, XCircle, Plus, Minus, ArrowRight, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select as UISelect,
  SelectContent as UISelectContent,
  SelectItem as UISelectItem,
  SelectTrigger as UISelectTrigger,
  SelectValue as UISelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../Context/AuthContext';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

const DashboardUser = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const location = useLocation();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [requests, setRequests] = useState<UnifiedRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'bookings' | 'requests'>(
    (tab === 'reservations' || location.pathname.includes('reservations')) ? 'bookings' :
      (tab === 'demandes' || location.pathname.includes('demandes')) ? 'requests' : 'bookings'
  );

  const [editingBooking, setEditingBooking] = useState<BookingItem | null>(null);
  const [editingRequest, setEditingRequest] = useState<UnifiedRequest | null>(null);
  const [editRequestInfo, setEditRequestInfo] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    passengers_adult: 0,
    passengers_child: 0,
    passengers_baby: 0,
    options: {
      "champre-2": 0,
      "champre-3": 0,
      "champre-4": 0
    }
  });
  const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
  const [viewingResponse, setViewingResponse] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [makkaHotels, setMakkaHotels] = useState<any[]>([]);
  const [madinaHotels, setMadinaHotels] = useState<any[]>([]);
  const [allHotels, setAllHotels] = useState<any[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);

  useEffect(() => {
    if (tab === 'reservations') setActiveTab('bookings');
    else if (tab === 'demandes') setActiveTab('requests');
  }, [tab]);

  const handleTabChange = (newTab: 'bookings' | 'requests') => {
    setActiveTab(newTab);
    navigate(`/mon-compte/${newTab === 'bookings' ? 'reservations' : 'demandes'}`);
  };

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
        setError(err.message || t('dashboard.errors.load_failed'));
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
      passengers_baby: booking.passengers_baby,
      options: {
        "champre-2": booking.options?.["champre-2"] || 0,
        "champre-3": booking.options?.["champre-3"] || 0,
        "champre-4": booking.options?.["champre-4"] || 0
      }
    });
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;

    try {
      // For non-religious trips, we don't send options
      const payload = {
        passengers_adult: editFormData.passengers_adult,
        passengers_child: editFormData.passengers_child,
        passengers_baby: editFormData.passengers_baby,
        ...(editingBooking.type === 'religieuse' ? { options: editFormData.options } : {})
      };

      await updateBooking(editingBooking.id, payload);

      setBookings(bookings.map(b =>
        b.id === editingBooking.id
          ? { ...b, ...payload }
          : b
      ));

      setEditingBooking(null);
      toast.success(t('dashboard.bookings.edit_modal.success'));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('dashboard.bookings.edit_modal.error'));
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    toast(
      ({ closeToast }) => (
        <div className="p-2">
          <p className="mb-4 font-bold text-slate-900">{t('common.confirm_action', { defaultValue: 'Êtes-vous sûr de vouloir effectuer cette action ?' })}</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="font-black uppercase tracking-widest text-[10px]"
              onClick={closeToast}
            >
              {t('common.cancel', { defaultValue: 'Annuler' })}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200"
              onClick={async () => {
                try {
                  await updateBookingStatus(bookingId, 'CANCELLED');
                  setBookings(bookings.map(b =>
                    b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
                  ));
                  toast.success(t('dashboard.bookings.cancel_success', { defaultValue: 'Réservation annulée avec succès' }));
                } catch (error: any) {
                  console.error(error);
                  toast.error(error.message || t('dashboard.bookings.cancel_error', { defaultValue: 'Erreur lors de l\'annulation' }));
                }
                closeToast();
              }}
            >
              {t('dashboard.bookings.cancel', { defaultValue: 'Confirmer' })}
            </Button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleViewDetails = async (requestId: string) => {
    try {
      setFetchingDetails(true);
      const details = await getRequestDetails(requestId);
      setSelectedRequest(details);
      setViewingResponse(true); // Reusing viewingResponse for unified details
    } catch (error) {
      console.error(error);
      toast.error(t('dashboard.errors.request_fetch_failed', { defaultValue: 'Erreur lors de la récupération des détails' }));
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    toast(
      ({ closeToast }) => (
        <div className="p-2">
          <p className="mb-4 font-bold text-slate-900">{t('common.confirm_action', { defaultValue: 'Êtes-vous sûr de vouloir annuler cette demande ?' })}</p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="font-black uppercase tracking-widest text-[10px]"
              onClick={closeToast}
            >
              {t('common.cancel', { defaultValue: 'Annuler' })}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-200"
              onClick={async () => {
                try {
                  await updateRequest(requestId, { status: 'CANCELLED' });
                  setRequests(requests.map(r =>
                    r.id === requestId ? { ...r, status: 'CANCELLED' as any } : r
                  ));
                  toast.success(t('dashboard.requests.cancel_success', { defaultValue: 'Demande annulée avec succès' }));
                } catch (error: any) {
                  console.error(error);
                  toast.error(error.message || t('dashboard.requests.cancel_error', { defaultValue: 'Erreur lors de l\'annulation' }));
                }
                closeToast();
              }}
            >
              {t('common.confirm', { defaultValue: 'Confirmer' })}
            </Button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleEditRequest = async (req: UnifiedRequest) => {
    setEditingRequest(req);
    setEditRequestInfo({ ...req.info });

    // Fetch hotels if category is omra or voyage
    if (req.category === 'omra' || req.category === 'voyage') {
      try {
        setLoadingHotels(true);
        if (req.category === 'omra') {
          const [makka, madina] = await Promise.all([
            getHotelsByType('makka'),
            getHotelsByType('madina')
          ]);
          setMakkaHotels(makka);
          setMadinaHotels(madina);
        } else {
          // For general voyage, maybe fetch all types or just some
          const [makka, madina, alger] = await Promise.all([
            getHotelsByType('makka'),
            getHotelsByType('madina'),
            getHotelsByType('voyage') // assuming 'voyage' is a type for other hotels
          ]);
          setAllHotels([...makka, ...madina, ...alger]);
        }
      } catch (error) {
        console.error("Failed to load hotels", error);
        toast.error(t('dashboard.errors.hotels_load_failed', { defaultValue: 'Impossible de charger les hôtels' }));
      } finally {
        setLoadingHotels(false);
      }
    }
  };

  const handleUpdateRequest = async () => {
    if (!editingRequest) return;
    try {
      await updateRequest(editingRequest.id, { info: editRequestInfo });
      setRequests(requests.map(r =>
        r.id === editingRequest.id ? { ...r, info: editRequestInfo } : r
      ));
      setEditingRequest(null);
      toast.success(t('dashboard.requests.edit_modal.success', { defaultValue: 'Demande mise à jour avec succès' }));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || t('dashboard.requests.edit_modal.error', { defaultValue: 'Erreur lors de la mise à jour' }));
    }
  };

  const handleDownloadTicket = (booking: BookingItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error(t('dashboard.errors.ticket_popup_blocked'));
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
          
          .status-PAID { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
          .status-CONFIRMED { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
          .status-PENDING { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
          .status-CANCELLED, .status-REJECTED { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
          
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
            <div class="ticket-type">${t('dashboard.ticket.title')}</div>
        </div>
        
        <h1 class="trip-title">Billet - ${booking.title || t('dashboard.ticket.unspecified')}</h1>
        <div class="ref">RÉF: #${booking.id.slice(0, 8).toUpperCase()}</div>

        <div class="grid">
            <div>
                <div class="label">${t('dashboard.ticket.destination')}</div>
                <div class="value">${booking.destination_country || booking.title || t('dashboard.ticket.unspecified')}</div>
            </div>
            <div>
                <div class="label">${t('dashboard.ticket.date')}</div>
                <div class="value">${new Date(booking.created_at || Date.now()).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <div>
                <div class="label">${t('dashboard.ticket.passengers')}</div>
                <div class="value">
                    ${booking.passengers_adult} ${t('reservation.passengers.adults')}
                    ${booking.passengers_child > 0 ? `, ${booking.passengers_child} ${t('reservation.passengers.children')}` : ''}
                    ${booking.passengers_baby > 0 ? `, ${booking.passengers_baby} ${t('reservation.passengers.babies')}` : ''}
                </div>
            </div>
            <div>
                <div class="label">${t('dashboard.ticket.type')}</div>
                <div class="value" style="text-transform: capitalize;">${booking.type || t('dashboard.ticket.unspecified')}</div>
            </div>
        </div>

        <div class="status-box">
            <div>
                <div class="label">${t('dashboard.ticket.status')}</div>
                <div class="status-badge status-${booking.status}">
                    <span>●</span> ${getStatusLabel(booking.status)}
                </div>
            </div>
            <div style="text-align: right;">
                <div class="label">${t('dashboard.ticket.total', { defaultValue: 'Prix à payer' })}</div>
                <div class="price-large">${Number(booking.prix_calculer || booking.total_price || booking.base_price || 0).toLocaleString()} DZD</div>
            </div>
        </div>

        <div class="footer">
            <p>${t('dashboard.ticket.footer_1')}</p>
            <p>${t('dashboard.ticket.footer_2')}</p>
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
      case 'CONFIRMED': return t('dashboard.bookings.status.confirmed');
      case 'PENDING': return t('dashboard.bookings.status.pending');
      case 'CANCELLED': return t('dashboard.bookings.status.cancelled');
      case 'REJECTED': return t('dashboard.bookings.status.rejected');
      case 'PAID': return t('dashboard.bookings.status.paid');
      case 'PROCESSED': return t('dashboard.bookings.status.processed');
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
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('dashboard.bookings.empty_title')}</h3>
          <p className="text-slate-500 mb-6">{t('dashboard.bookings.empty_desc')}</p>
          <Link to="/voyages">
            <Button>{t('dashboard.bookings.empty_button')}</Button>
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
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.bookings.passengers')}</p>
                  <p className="font-medium text-slate-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-primary/50" />
                    {booking.passengers_adult + booking.passengers_child + booking.passengers_baby}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.bookings.total_price', { defaultValue: 'Prix à payer' })}</p>
                  <p className="font-medium text-slate-700">
                    {Number(booking.prix_calculer || booking.total_price || booking.base_price || 0).toLocaleString()} DZD
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.bookings.reservation_date')}</p>
                  <p className="font-medium text-slate-700">
                    {booking.created_at ? new Date(booking.created_at).toLocaleDateString(i18n.language) : 'N/A'}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.bookings.reference')}</p>
                  <p className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block">
                    {booking.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {booking.status === 'PAID' && (
                  <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" onClick={() => handleDownloadTicket(booking)}>
                    <FileText className="w-4 h-4" /> {t('dashboard.bookings.download_ticket')}
                  </Button>
                )}
                {booking.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    {/* Modify Button */}
                    <Dialog open={editingBooking?.id === booking.id} onOpenChange={(open) => !open && setEditingBooking(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEditClick(booking)}>
                          <Edit2 className="w-4 h-4" /> {t('dashboard.bookings.edit_modal.title')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{t('dashboard.bookings.edit_modal.title')}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <h4 className="font-bold text-sm text-slate-400 border-b pb-2 uppercase tracking-widest">{t('reservation.sections.passenger_count')}</h4>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="adults" className="text-right">{t('dashboard.bookings.edit_modal.adults')}</Label>
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
                            <Label htmlFor="children" className="text-right">{t('dashboard.bookings.edit_modal.children')}</Label>
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
                            <Label htmlFor="babies" className="text-right">{t('dashboard.bookings.edit_modal.babies')}</Label>
                            <Input
                              id="babies"
                              type="number"
                              min="0"
                              className="col-span-3"
                              value={editFormData.passengers_baby}
                              onChange={(e) => setEditFormData({ ...editFormData, passengers_baby: parseInt(e.target.value) || 0 })}
                            />
                          </div>

                          {/* Omra Room Modification */}
                          {editingBooking?.type === 'religieuse' && (
                            <>
                              <h4 className="font-bold text-sm text-slate-400 border-b pb-2 mt-4 uppercase tracking-widest">{t('reservation.omra.room_selection')}</h4>
                              <div className="space-y-4">
                                {[2, 3, 4].map((n) => (
                                  <div key={n} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
                                    <Label className="font-bold text-slate-700">{t(`reservation.omra.${n === 2 ? 'double' : n === 3 ? 'triple' : 'quadruple'}_room`)}</Label>
                                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border shadow-sm">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setEditFormData({
                                          ...editFormData,
                                          options: {
                                            ...editFormData.options,
                                            [`champre-${n}`]: Math.max(0, (editFormData.options?.[`champre-${n}` as keyof typeof editFormData.options] || 0) - 1)
                                          }
                                        })}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="font-bold w-4 text-center">{editFormData.options?.[`champre-${n}` as keyof typeof editFormData.options] || 0}</span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() => setEditFormData({
                                          ...editFormData,
                                          options: {
                                            ...editFormData.options,
                                            [`champre-${n}`]: (editFormData.options?.[`champre-${n}` as keyof typeof editFormData.options] || 0) + 1
                                          }
                                        })}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="submit" onClick={handleUpdateBooking}>{t('dashboard.bookings.edit_modal.save')}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Cancel Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <XCircle className="w-4 h-4" /> {t('dashboard.bookings.cancel', { defaultValue: 'Annuler' })}
                    </Button>
                  </div>
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
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('dashboard.requests.empty_title')}</h3>
          <p className="text-slate-500 mb-6">{t('dashboard.requests.empty_desc')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/voyages/CustomTripPage"><Button size="sm">{t('trips.categories.national')}</Button></Link>
            <Link to="/voyages/CustomOmraTripPage"><Button size="sm">{t('trips.categories.omra')}</Button></Link>
            <Link to="/request-hotel"><Button size="sm">{t('nav.hotels')}</Button></Link>
            <Link to="/request-flight"><Button size="sm">{t('nav.flights')}</Button></Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6">
            <div className={`h-2 w-full md:w-2 md:h-auto rounded-full shrink-0 ${getStatusColor(req.status || 'PENDING').split(' ')[0]}`} />

            <div className="flex-1 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-heading font-bold text-slate-900 group flex items-center gap-2">
                    {t(`dashboard.requests.category_labels.${req.category}`)}
                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500 mt-1">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs">
                      {req.category === 'voyage' && <MapPin className="w-3.5 h-3.5 text-primary" />}
                      {req.category === 'omra' && <History className="w-3.5 h-3.5 text-primary" />}
                      {req.category === 'hotel' && <BedDouble className="w-3.5 h-3.5 text-primary" />}
                      {req.category === 'vol' && <Plane className="w-3.5 h-3.5 text-primary" />}
                      {req.category === 'voyage' && req.info.destination}
                      {req.category === 'omra' && "Pèlerinage"}
                      {req.category === 'hotel' && req.info.wilaya}
                      {req.category === 'vol' && `${req.info.ville_depart} ➝ ${req.info.ville_arrivee}`}
                    </span>
                    <span className="uppercase text-[10px] font-bold tracking-widest text-slate-400 border border-slate-200 px-2 py-0.5 rounded">
                      ID: {req.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide w-fit", getStatusColor(req.status || 'PENDING'))}>
                  {getStatusLabel(req.status || 'PENDING')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 border-t border-b border-slate-100">
                {req.category === 'voyage' && (
                  <>
                    <div><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.destination')}</p><p className="font-medium text-slate-700">{req.info.destination}</p></div>
                    <div><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.duration')}</p><p className="font-medium text-slate-700">{req.info.duree} {t('common.days')}</p></div>
                    <div className="col-span-2"><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.type')}</p><p className="font-medium text-slate-700 capitalize">{req.info.type || '-'}</p></div>
                  </>
                )}
                {req.category === 'omra' && (
                  <>
                    <div><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.duration')}</p><p className="font-medium text-slate-700">{req.info.duree} {t('common.days')}</p></div>
                    <div className="col-span-3"><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.hotels')}</p><p className="font-medium text-slate-700 text-xs truncate">{req.info.hebergement_makka} / {req.info.hebergement_madina}</p></div>
                  </>
                )}
                {req.category === 'hotel' && (
                  <>
                    <div><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.wilaya')}</p><p className="font-medium text-slate-700">{req.info.wilaya}</p></div>
                    <div className="col-span-3"><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.dates')}</p><p className="font-medium text-slate-700 text-xs">{req.info.date_debut} - {req.info.date_fin}</p></div>
                  </>
                )}
                {req.category === 'vol' && (
                  <>
                    <div className="col-span-2"><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.route')}</p><p className="font-medium text-slate-700">{req.info.ville_depart} ➝ {req.info.ville_arrivee}</p></div>
                    <div className="col-span-2"><p className="text-xs text-slate-400 uppercase font-semibold mb-1">{t('dashboard.requests.details.flight_type')}</p><p className="font-medium text-slate-700 capitalize">{req.info.type_vol?.replace('_', ' ') || '-'}</p></div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  size="sm"
                  className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                  onClick={() => handleViewDetails(req.id)}
                  disabled={fetchingDetails}
                >
                  {fetchingDetails ? <LoadingSpinner className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {t('dashboard.requests.view_details', { defaultValue: 'Détails' })}
                </Button>

                {(req.status === 'PENDING' || !req.status) && (
                  <>
                    {/* Modification Button */}
                    <Dialog open={editingRequest?.id === req.id} onOpenChange={(open) => !open && setEditingRequest(null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleEditRequest(req)}>
                          <Edit2 className="w-4 h-4" /> {t('dashboard.requests.modify', { defaultValue: 'Modifier' })}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
                        <div className="bg-slate-900 p-8 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                          <div className="relative z-10">
                            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase flex items-center gap-2">
                              <Edit2 className="w-5 h-5 text-primary" />
                              {t('dashboard.requests.edit_modal.title', { defaultValue: 'Modifier la demande' })}
                            </h2>
                            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest italic">
                              #{req.id.slice(0, 8)} - {t(`dashboard.requests.category_labels.${req.category}`)}
                            </p>
                          </div>
                        </div>

                        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-6">
                          {loadingHotels ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-4">
                              <LoadingSpinner />
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Chargement des hôtels...</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {editRequestInfo && Object.keys(editRequestInfo).map((key) => {
                                const value = editRequestInfo[key];

                                // Specialized rendering for specific fields
                                if (key === 'hebergement_makka' || key === 'hebergement_madina' || (key === 'hebergement' && req.category === 'voyage')) {
                                  let hotelsToUse = key === 'hebergement_makka' ? makkaHotels : (key === 'hebergement_madina' ? madinaHotels : allHotels);

                                  return (
                                    <div key={key} className="space-y-2 col-span-2 md:col-span-1">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                                        {t(`dashboard.requests.details.${key}`, { defaultValue: key.replace('_', ' ') })}
                                      </Label>
                                      <UISelect
                                        value={value}
                                        onValueChange={(val) => setEditRequestInfo({ ...editRequestInfo, [key]: val })}
                                      >
                                        <UISelectTrigger className="h-12 rounded-2xl border-slate-100 shadow-sm focus:ring-primary focus:border-primary bg-white font-bold text-slate-700">
                                          <UISelectValue placeholder={t('common.select_hotel', { defaultValue: 'Choisir un hôtel' })} />
                                        </UISelectTrigger>
                                        <UISelectContent className="rounded-2xl border-slate-100 shadow-2xl p-2">
                                          {hotelsToUse.length > 0 ? (
                                            hotelsToUse.map((h: any) => (
                                              <UISelectItem key={h.id || h.name} value={h.name} className="rounded-xl focus:bg-primary/5 focus:text-primary transition-colors py-3">
                                                <div className="flex items-center gap-2">
                                                  <div className="flex items-center gap-0.5 text-amber-400 text-[10px]">
                                                    {h.stars} <Star className="w-2.5 h-2.5 fill-current" />
                                                  </div>
                                                  <span className="font-bold">{h.name}</span>
                                                </div>
                                              </UISelectItem>
                                            ))
                                          ) : (
                                            <div className="p-4 text-center text-slate-400 italic text-xs">
                                              {t('dashboard.requests.no_hotels', { defaultValue: 'Aucun hôtel trouvé' })}
                                            </div>
                                          )}
                                        </UISelectContent>
                                      </UISelect>
                                    </div>
                                  );
                                }

                                if (key === 'options' && typeof value === 'object' && value !== null) {
                                  return Object.keys(value).map(subKey => (
                                    <div key={subKey} className="space-y-2 col-span-2 md:col-span-1">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                                        {t(`dashboard.requests.details.${subKey}`, { defaultValue: subKey.replace('_', ' ') })}
                                      </Label>
                                      <Input
                                        className="h-12 rounded-2xl border-slate-100 shadow-sm focus:ring-primary focus:border-primary bg-white font-bold text-slate-700"
                                        value={value[subKey]}
                                        onChange={(e) => setEditRequestInfo({
                                          ...editRequestInfo,
                                          [key]: { ...editRequestInfo[key], [subKey]: e.target.value }
                                        })}
                                      />
                                    </div>
                                  ));
                                }

                                if (key === 'passengers' && typeof value === 'object' && value !== null) {
                                  return (
                                    <div key={key} className="col-span-2 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-center mb-2">
                                        {t('dashboard.requests.details.passengers')}
                                      </Label>
                                      <div className="grid grid-cols-3 gap-4">
                                        {Object.keys(value).map(pKey => (
                                          <div key={pKey} className="space-y-2">
                                            <Label className="text-[9px] font-black uppercase text-slate-400 text-center block">{pKey}</Label>
                                            <Input
                                              type="number"
                                              className="h-10 rounded-xl text-center font-bold"
                                              value={value[pKey]}
                                              onChange={(e) => setEditRequestInfo({
                                                ...editRequestInfo,
                                                [key]: { ...value, [pKey]: parseInt(e.target.value) || 0 }
                                              })}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={key} className="space-y-2 col-span-2 md:col-span-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                                      {t(`dashboard.requests.details.${key}`, { defaultValue: key.replace('_', ' ') })}
                                    </Label>
                                    <Input
                                      className="h-12 rounded-2xl border-slate-100 shadow-sm focus:ring-primary focus:border-primary bg-white font-bold text-slate-700"
                                      type={key.includes('date') ? 'date' : (typeof value === 'number' ? 'number' : 'text')}
                                      value={value}
                                      onChange={(e) => setEditRequestInfo({ ...editRequestInfo, [key]: e.target.value })}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setEditingRequest(null)}
                            className="px-6 py-3 rounded-2xl font-bold text-slate-500 hover:text-slate-700 transition-colors"
                          >
                            {t('common.cancel', { defaultValue: 'Annuler' })}
                          </button>
                          <Button
                            type="submit"
                            className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic shadow-lg shadow-primary/20 transition-all active:scale-95"
                            onClick={handleUpdateRequest}
                            disabled={loadingHotels}
                          >
                            {t('common.save', { defaultValue: 'Enregistrer' })}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Cancel Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleCancelRequest(req.id)}
                    >
                      <XCircle className="w-4 h-4" /> {t('common.cancel', { defaultValue: 'Annuler' })}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
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
                <ShieldCheck className="w-3 h-3" /> {t('dashboard.sidebar.verified')}
              </div>
            </div>

            <nav className="bg-white/80 backdrop-blur-xl p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/60 space-y-2">
              <button
                onClick={() => handleTabChange('bookings')}
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
                <span>{t('dashboard.sidebar.bookings')}</span>
                {activeTab === 'bookings' && <div className="absolute right-4 w-2 h-2 bg-white rounded-full"></div>}
              </button>

              <button
                onClick={() => handleTabChange('requests')}
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
                <span>{t('dashboard.sidebar.requests')}</span>
                {activeTab === 'requests' && <div className="absolute right-4 w-2 h-2 bg-white rounded-full"></div>}
              </button>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" /> {t('dashboard.sidebar.logout')}
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 font-heading">
                {activeTab === 'bookings' && t('dashboard.tabs.bookings_title')}
                {activeTab === 'requests' && t('dashboard.tabs.requests_title')}
              </h1>
              <p className="text-slate-500 mt-2">
                {activeTab === 'bookings' && t('dashboard.tabs.bookings_desc')}
                {activeTab === 'requests' && t('dashboard.tabs.requests_desc')}
              </p>
            </header>

            <div>
              {activeTab === 'bookings' && renderBookings()}
              {activeTab === 'requests' && renderRequests()}
            </div>
          </main>
        </div>
      </div>

      <Dialog open={viewingResponse} onOpenChange={setViewingResponse}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl bg-[#F8FAFC]">
          {selectedRequest && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Premium Header - Same style as admin but for user */}
              <div className="bg-slate-900 border-b border-white/5 p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm ring-1 ring-white/20">
                        OFFRE POUR #{selectedRequest.id.slice(0, 8)}
                      </span>
                      <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase mt-1">
                        Proposition d'Eclair Travel
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Request Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-slate-400 rounded-full" />
                      {t('dashboard.requests.modal.request_details', { defaultValue: 'DÉTAILS DE LA DEMANDE' })}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    {selectedRequest.info && Object.entries(selectedRequest.info).map(([key, value]) => {
                      if (key === 'options' && typeof value === 'object' && value !== null) {
                        return Object.entries(value).map(([optKey, optVal]) => (
                          <div key={optKey}>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{optKey.replace('_', ' ')}</p>
                            <p className="text-sm font-bold text-slate-700">{String(optVal)}</p>
                          </div>
                        ));
                      }
                      if (key === 'passengers' && typeof value === 'object' && value !== null) {
                        const passengers = value as { adult?: number; child?: number; baby?: number };
                        return (
                          <div key={key}>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Passagers</p>
                            <p className="text-sm font-bold text-slate-700">
                              {passengers.adult || 0} Adulte(s), {passengers.child || 0} Enfant(s), {passengers.baby || 0} Bébé(s)
                            </p>
                          </div>
                        );
                      }
                      return (
                        <div key={key}>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{key.replace('_', ' ')}</p>
                          <p className="text-sm font-bold text-slate-700">{String(value)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Offer Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-primary rounded-full" />
                      {t('dashboard.requests.modal.agency_response', { defaultValue: "RÉPONSE DE L'AGENCE" })}
                    </h3>
                  </div>

                  <div className="p-8 bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm leading-relaxed text-slate-700 font-medium list-inside">
                    <div
                      className="prose prose-slate max-w-none prose-strong:text-slate-900 prose-strong:font-black prose-p:text-slate-600 prose-p:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedRequest.offer || t('dashboard.requests.modal.no_response', { defaultValue: 'Pas encore de réponse de l\'admin' }) }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRequest.response_created_at && (
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Date de réponse</p>
                        <p className="text-sm font-black text-slate-900">
                          {new Date(selectedRequest.response_created_at).toLocaleDateString(i18n.language, {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <History className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Date de demande</p>
                      <p className="text-sm font-black text-slate-900">
                        {selectedRequest.created_at && new Date(selectedRequest.created_at).toLocaleDateString(i18n.language, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <Link to="/contact" className="h-full">
                    <Button variant="outline" className="w-full h-full rounded-2xl border-2 font-black italic tracking-tight gap-2 hover:bg-slate-50 transition-all">
                      <User className="w-5 h-5" /> CONTACTER L'AGENCE
                    </Button>
                  </Link>
                </div>

                <div className="pt-4">
                  <Button
                    className="w-full h-16 bg-slate-900 hover:bg-primary text-white shadow-xl shadow-slate-900/10 rounded-2xl font-black italic tracking-widest transition-all"
                    onClick={() => setViewingResponse(false)}
                  >
                    FERMER LE DOSSIER
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

export default DashboardUser;