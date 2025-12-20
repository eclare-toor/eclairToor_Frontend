import React, { useEffect, useState } from 'react';
import type { Booking, CustomRequest } from '../../Types';
import { getAllBookings, updateBookingStatus, getCustomRequests, updateCustomRequestStatus, getServiceRequests } from '../../api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { CheckCircle, XCircle, Clock, FileText, Plane, BedDouble } from 'lucide-react';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';

type TabType = 'BOOKINGS' | 'CUSTOM' | 'SERVICES';

const AdminRequestsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('BOOKINGS');

  // Data States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [serviceRequests, setServiceRequests] = useState<{ hotels: any[], flights: any[] }>({ hotels: [], flights: [] });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminDescription, setAdminDescription] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [bk, cr, sr] = await Promise.all([
      getAllBookings(),
      getCustomRequests(),
      getServiceRequests()
    ]);
    setBookings(bk);
    setCustomRequests(cr);
    setServiceRequests(sr);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateBooking = async (status: 'CONFIRMED' | 'REJECTED') => {
    if (!selectedBooking) return;
    await updateBookingStatus(selectedBooking.id, status, adminDescription);
    setSelectedBooking(null);
    setAdminDescription('');
    fetchData();
  };

  const handleUpdateCustomRequest = async (id: string, status: 'PROCESSED' | 'REJECTED') => {
    await updateCustomRequestStatus(id, status);
    fetchData();
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONFIRMED: 'bg-green-100 text-green-700',
      PROCESSED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-slate-100 text-slate-500'
    };
    // @ts-ignore
    const currentStyle = styles[status] || styles.PENDING;

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${currentStyle}`}>
        {status}
      </span>
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
                  <th className="p-4 font-semibold text-slate-600">ID</th>
                  <th className="p-4 font-semibold text-slate-600">Voyage</th>
                  <th className="p-4 font-semibold text-slate-600">Prix Total</th>
                  <th className="p-4 font-semibold text-slate-600">Status</th>
                  <th className="p-4 font-semibold text-slate-600">Date</th>
                  <th className="p-4 font-semibold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((bk) => (
                  <tr key={bk.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-xs">{bk.id}</td>
                    <td className="p-4 font-bold text-slate-800">{bk.trip_id}</td>
                    <td className="p-4 font-medium text-primary">{bk.total_price.toLocaleString()} DA</td>
                    <td className="p-4"><StatusBadge status={bk.status} /></td>
                    <td className="p-4 text-sm text-slate-500">{new Date(bk.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => { setSelectedBooking(bk); setAdminDescription(bk.description || ''); }}>
                        Gérer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* CUSTOM REQUESTS TAB */}
          {activeTab === 'CUSTOM' && (
            <div className="divide-y divide-slate-100">
              {customRequests.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row justify-between gap-4 hover:bg-slate-50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-slate-900">{req.full_name}</h3>
                      <StatusBadge status={req.status} />
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{req.type}</span>
                    </div>
                    <p className="text-sm text-slate-600">
                      <span className="font-bold">Destination:</span> {req.destination} •
                      <span className="font-bold ml-2">Budget:</span> {req.budget} DA
                    </p>
                    <p className="text-sm text-slate-500 italic">"{req.notes}"</p>
                  </div>
                  <div className="flex items-start gap-2">
                    {req.status === 'PENDING' && (
                      <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateCustomRequest(req.id, 'PROCESSED')}>
                          Accepter
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateCustomRequest(req.id, 'REJECTED')}>
                          Refuser
                        </Button>
                      </>
                    )}
                    {req.status !== 'PENDING' && (
                      <span className="text-sm text-slate-400 font-medium italic">Traitée</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'SERVICES' && (
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BedDouble className="w-5 h-5" /> Demandes d'Hôtels ({serviceRequests.hotels.length})
                </h3>
                <div className="space-y-4">
                  {serviceRequests.hotels.map((h, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="font-bold">{h.wilaya} <span className="text-slate-400 font-normal">({h.stars_preference} étoiles)</span></p>
                      <p className="text-xs text-slate-500 mt-1">Du {h.check_in_date} au {h.check_out_date}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Plane className="w-5 h-5" /> Demandes de Vols ({serviceRequests.flights.length})
                </h3>
                <div className="space-y-4">
                  {serviceRequests.flights.map((f, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                      <p className="font-bold">{f.departure_city} ➝ {f.arrival_city}</p>
                      <p className="text-xs text-slate-500 mt-1">Départ: {f.departure_date} • {f.flight_class}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Booking Management Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer la réservation {selectedBooking?.id}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="space-y-1 bg-slate-50 p-4 rounded-lg">
                <p className="text-sm"><strong>Voyage:</strong> {selectedBooking.trip_id}</p>
                <p className="text-sm"><strong>Prix:</strong> {selectedBooking.total_price.toLocaleString()} DA</p>
                <p className="text-sm"><strong>Passagers:</strong> {selectedBooking.passengers_adult} Adultes</p>
              </div>

              <div className="space-y-2">
                <Label>Message / Instructions pour le client</Label>
                <Textarea
                  value={adminDescription}
                  onChange={(e) => setAdminDescription(e.target.value)}
                  placeholder="Ex: Dossier validé, veuillez procéder au paiement..."
                  className="h-24"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleUpdateBooking('CONFIRMED')}>
                  <CheckCircle className="w-4 h-4 mr-2" /> Valider
                </Button>
                <Button className="flex-1" variant="destructive" onClick={() => handleUpdateBooking('REJECTED')}>
                  <XCircle className="w-4 h-4 mr-2" /> Refuser
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