import React, { useEffect, useState } from 'react';
import type { BookingItem } from '../../Types';
import { getAllBookings, updateBookingStatus, getAllRequests, updateCustomRequestStatus, submitRequestResponse } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Clock, FileText, Plane, Check, CreditCard, X, Settings2 } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';

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
    // Optimistic update
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

  const handleUpdateCustomRequest = async (id: string, status: 'PROCESSED' | 'REJECTED') => {
    // Optimistic update
    setUnifiedRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    try {
      await updateCustomRequestStatus(id, status);
    } catch (error) {
      console.error("Failed to update custom request", error);
      fetchData();
    }
  };

  const handleSendOffer = async () => {
    if (!selectedUnifiedRequest || !offerHTML) return;
    setIsSubmitting(true);
    try {
      await submitRequestResponse(selectedUnifiedRequest.id, offerHTML);
      await updateCustomRequestStatus(selectedUnifiedRequest.id, 'PROCESSED');

      // Optimistic update
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
    const config: Record<string, string> = {
      PENDING: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
      CONFIRMED: 'bg-green-50 text-green-700 ring-green-600/20',
      PAID: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      PROCESSED: 'bg-green-50 text-green-700 ring-green-600/20',
      REJECTED: 'bg-red-50 text-red-700 ring-red-600/10',
      CANCELLED: 'bg-slate-50 text-slate-600 ring-slate-500/10'
    };

    const style = config[status] || config.PENDING;

    return (
      <span className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold ring-1 ring-inset ${style}`}>
        {status}
      </span>
    );
  };

  const RequestDetails = ({ req }: { req: any }) => {
    const { category, info } = req;

    if (category === 'voyage') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3 p-3 bg-slate-50 rounded-lg">
          <div><p className="text-slate-500 text-xs">Destination</p><p className="font-semibold text-slate-800">{info.destination}</p></div>
          <div><p className="text-slate-500 text-xs">Durée</p><p className="font-semibold text-slate-800">{info.duree} Jours</p></div>
          <div><p className="text-slate-500 text-xs">Début</p><p className="font-semibold text-slate-800">{info.date_debut}</p></div>
          <div><p className="text-slate-500 text-xs">Hébergement</p><p className="font-semibold text-slate-800">{info.hebergement}</p></div>
          <div className="col-span-full"><p className="text-slate-500 text-xs">Options</p><p className="text-slate-700">{info.options?.transport} • {info.options?.restauration}</p></div>
        </div>
      );
    }

    if (category === 'omra') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm mt-3 p-3 bg-indigo-50/50 rounded-lg">
          <div><p className="text-indigo-600 text-[10px] uppercase font-bold">Durée</p><p className="font-semibold">{info.duree} Jours</p></div>
          <div><p className="text-indigo-600 text-[10px] uppercase font-bold">Début</p><p className="font-semibold">{info.date_debut}</p></div>
          <div><p className="text-indigo-600 text-[10px] uppercase font-bold">Hotels</p><p className="text-xs">Makkah: {info.hebergement_makka}<br />Madina: {info.hebergement_madina}</p></div>
          <div className="col-span-full border-t border-indigo-100 pt-2 font-medium text-indigo-700">{info.options?.transport} • {info.options?.restauration}</div>
        </div>
      );
    }

    if (category === 'hotel') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3 p-3 bg-emerald-50/50 rounded-lg">
          <div><p className="text-emerald-700 text-xs">Wilaya</p><p className="font-semibold">{info.wilaya}</p></div>
          <div><p className="text-emerald-700 text-xs">Lieu</p><p className="font-semibold">{info.lieu_exact}</p></div>
          <div><p className="text-emerald-700 text-xs">Dates</p><p className="text-[11px] leading-tight">Du {info.date_debut}<br />Au {info.date_fin}</p></div>
          <div><p className="text-emerald-700 text-xs">Passagers</p><p className="text-xs">{info.passengers?.adult} Ad, {info.passengers?.child} Enf, {info.passengers?.baby} Bb</p></div>
          <div className="col-span-full text-emerald-600 text-xs font-bold">Préf: {info.nbre_etoile} étoiles</div>
        </div>
      );
    }

    if (category === 'vol') {
      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-3 p-3 bg-sky-50/50 rounded-lg">
          <div><p className="text-sky-700 text-xs">Trajet</p><p className="font-semibold">{info.ville_depart} ➝ {info.ville_arrivee}</p></div>
          <div><p className="text-sky-700 text-xs">Type</p><p className="font-semibold capitalize">{info.type_vol?.replace('_', ' ')}</p></div>
          <div><p className="text-sky-700 text-xs">Dates</p><p className="text-[11px] leading-tight">Dep: {info.date_depart}{info.date_retour ? <><br />Ret: {info.date_retour}</> : ''}</p></div>
          <div><p className="text-sky-700 text-xs">Passagers</p><p className="text-xs">{info.passengers?.adult} Ad, {info.passengers?.child} Enf, {info.passengers?.baby} Bb</p></div>
          <div className="col-span-full border-t border-sky-100 pt-2 text-sky-600 font-bold uppercase text-[10px]">{info.categorie}</div>
        </div>
      );
    }

    return null;
  };

  const RequestActions = ({ req }: { req: any }) => {
    if (req.status && req.status !== 'PENDING') return <span className="text-xs text-slate-400 font-medium italic">Traitée</span>;
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-slate-200 hover:bg-slate-50 gap-1.5"
          onClick={() => {
            setSelectedUnifiedRequest(req);
            setOfferHTML('');
          }}
        >
          <Settings2 className="w-3.5 h-3.5" /> Gérer
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Gestion des Demandes</h2>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => setActiveTab('BOOKINGS')}
          className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2", activeTab === 'BOOKINGS' ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50")}
        >
          <FileText className="w-4 h-4" /> Réservations
        </button>
        <button
          onClick={() => setActiveTab('CUSTOM')}
          className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2", activeTab === 'CUSTOM' ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50")}
        >
          <Clock className="w-4 h-4" /> Sur Mesure
        </button>
        <button
          onClick={() => setActiveTab('SERVICES')}
          className={cn("px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2", activeTab === 'SERVICES' ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50")}
        >
          <Plane className="w-4 h-4" /> Vols & Hôtels
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm min-h-[400px]">

          {/* BOOKINGS TAB */}
          {activeTab === 'BOOKINGS' && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-semibold text-slate-600">Client</th>
                  <th className="p-4 font-semibold text-slate-600">Voyage</th>
                  <th className="p-4 font-semibold text-slate-600">Passagers</th>
                  <th className="p-4 font-semibold text-slate-600">Prix (Base)</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{bk.nom} {bk.prenom}</span>
                        <span className="text-xs text-slate-500">{bk.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{bk.title || 'Voyage #' + bk.trip_id}</span>
                        <span className="text-xs text-slate-500 capitalize">{bk.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {bk.passengers_adult} Adulte(s)
                      {bk.passengers_child > 0 && `, ${bk.passengers_child} Enfant(s)`}
                      {bk.passengers_baby > 0 && `, ${bk.passengers_baby} Bebe(s)`}
                    </td>
                    <td className="p-4 font-medium text-primary">{bk.base_price ? `${bk.base_price} DA` : '-'}</td>
                    <td className="p-4"><StatusBadge status={bk.status} /></td>
                    <td className="p-4 text-sm text-slate-500">{bk.created_at ? new Date(bk.created_at).toLocaleDateString() : '-'}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {bk.status !== 'CONFIRMED' && bk.status !== 'PAID' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleUpdateBooking(bk.id, 'CONFIRMED')}
                            title="Confirmer"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}

                        {bk.status !== 'PAID' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleUpdateBooking(bk.id, 'PAID')}
                            title="Marquer comme payé"
                          >
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}

                        {bk.status !== 'CANCELLED' && bk.status !== 'REJECTED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleUpdateBooking(bk.id, 'CANCELLED')}
                            title="Refuser / Annuler"
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
          )}

          {/* CUSTOM REQUESTS TAB */}
          {activeTab === 'CUSTOM' && (
            <div className="divide-y divide-slate-100">
              {unifiedRequests.filter(r => r.category === 'voyage' || r.category === 'omra').length === 0 ? (
                <div className="p-12 text-center text-slate-400">Aucune demande sur mesure trouvée.</div>
              ) : unifiedRequests.filter(r => r.category === 'voyage' || r.category === 'omra').map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${req.category === 'omra' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {req.category}
                        </span>
                        <StatusBadge status={req.status} />
                        <span className="text-[10px] text-slate-400">ID: {req.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900">Demande de Client #{req.user_id?.slice(0, 5)}</h3>
                    </div>
                    <RequestActions req={req} />
                  </div>
                  <RequestDetails req={req} />
                </div>
              ))}
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'SERVICES' && (
            <div className="divide-y divide-slate-100">
              {unifiedRequests.filter(r => r.category === 'vol' || r.category === 'hotel').length === 0 ? (
                <div className="p-12 text-center text-slate-400">Aucune demande de vol ou d'hôtel trouvée.</div>
              ) : unifiedRequests.filter(r => r.category === 'vol' || r.category === 'hotel').map((req) => (
                <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${req.category === 'hotel' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'}`}>
                          {req.category}
                        </span>
                        <StatusBadge status={req.status} />
                        <span className="text-[10px] text-slate-400">ID: {req.id.slice(0, 8)}</span>
                      </div>
                      <h3 className="font-bold text-slate-900">Demande {req.category === 'hotel' ? 'Hôtel' : 'Vol'}</h3>
                    </div>
                    <RequestActions req={req} />
                  </div>
                  <RequestDetails req={req} />
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Unified Request Management Modal */}
      <Dialog open={!!selectedUnifiedRequest} onOpenChange={(open) => !open && setSelectedUnifiedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Gérer la demande #{selectedUnifiedRequest?.id.slice(0, 8)}
              <StatusBadge status={selectedUnifiedRequest?.status} />
            </DialogTitle>
          </DialogHeader>

          {selectedUnifiedRequest && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Détails de la demande</h4>
                <RequestDetails req={selectedUnifiedRequest} />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700">Votre Proposition (HTML/Texte)</label>
                <Textarea
                  className="min-h-[150px] font-mono text-sm border-slate-200 focus:border-primary focus:ring-primary/10"
                  placeholder="<h1>Offre spéciale</h1><p>Prix: 800€</p>..."
                  value={offerHTML}
                  onChange={(e) => setOfferHTML(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 italic">L'utilisateur recevra cette proposition dans son tableau de bord.</p>
              </div>

              <div className="flex gap-3 justify-end border-t pt-4">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleRefuseRequest(selectedUnifiedRequest.id)}
                >
                  <X className="w-4 h-4 mr-2" /> Refuser la demande
                </Button>
                <Button
                  className="bg-slate-900 hover:bg-slate-800 px-8"
                  onClick={handleSendOffer}
                  disabled={isSubmitting || !offerHTML}
                >
                  {isSubmitting ? <div className="h-4 w-4 border-2 border-white animate-spin rounded-full border-t-transparent" /> : <><Check className="w-4 h-4 mr-2" /> Envoyer l'offre</>}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRequestsPage;