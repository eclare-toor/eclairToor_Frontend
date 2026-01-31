import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTripBookings } from '../../api';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import {
    ArrowLeft,
    Users,
    Clock,
    CheckCircle2,
    CreditCard,
    XCircle,
    TrendingUp,
    Calendar,
    User,
    Baby,
    Smile
} from '../../components/icons';
import LoadingSpinner from '../../components/Shared/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminTripBookingsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!id) return;
            try {
                const result = await getTripBookings(id);
                setData(result);
            } catch (error: any) {
                toast.error(error.message || "Erreur lors du chargement des réservations");
                navigate('/admin/voyages');
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [id, navigate]);

    if (loading) return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
    if (!data) return null;

    const { trip, stats, bookings } = data;

    const StatCard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500", color)}>
                    <Icon className="w-6 h-6" />
                </div>
                <TrendingUp className="w-4 h-4 text-slate-200" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        </div>
    );

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { label: string, color: string, icon: any }> = {
            PENDING: { label: 'En attente', color: 'bg-amber-50 text-amber-700 ring-amber-600/20', icon: Clock },
            CONFIRMED: { label: 'Confirmée', color: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', icon: CheckCircle2 },
            PAID: { label: 'Payée', color: 'bg-blue-50 text-blue-700 ring-blue-600/20', icon: CreditCard },
            CANCELLED: { label: 'Annulée', color: 'bg-slate-50 text-slate-600 ring-slate-500/10', icon: XCircle },
            REJECTED: { label: 'Refusée', color: 'bg-red-50 text-red-700 ring-red-600/10', icon: XCircle }
        };
        return configs[status] || configs.PENDING;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate('/admin/voyages')}
                        className="group text-slate-500 hover:text-primary font-bold gap-2 -ml-2"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Retour aux voyages
                    </Button>
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase 0.2em] italic">
                                Rapport de Réservations
                            </span>
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400 text-xs font-bold font-mono">#{id?.slice(0, 8)}</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none italic uppercase">
                            {trip.title}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex flex-col items-end">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue Total</p>
                        <p className="text-xl font-black text-primary tracking-tighter">
                            {Number(stats.revenue).toLocaleString('fr-DZ')} <span className="text-xs">DZD</span>
                        </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard title="Total" value={stats.total} icon={Users} color="bg-slate-100 text-slate-600" />
                <StatCard title="En attente" value={stats.pending} icon={Clock} color="bg-amber-100 text-amber-600" />
                <StatCard title="Confirmées" value={stats.confirmed} icon={CheckCircle2} color="bg-emerald-100 text-emerald-600" />
                <StatCard title="Payées" value={stats.paid} icon={CreditCard} color="bg-blue-100 text-blue-600" />
                <StatCard title="Annulées" value={stats.cancelled} icon={XCircle} color="bg-slate-100 text-slate-400" />
                <StatCard title="Taux Rempl." value={`${Math.round((Number(stats.paid) + Number(stats.confirmed)) / Math.max(Number(stats.total), 1) * 100)}%`} icon={TrendingUp} color="bg-indigo-100 text-indigo-600" />
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Liste des Clients</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{bookings.length} Réservation(s) enregistrée(s)</p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Passagers</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">A Payer / Payé</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.map((booking: any) => {
                                const status = getStatusConfig(booking.status);
                                const StatusIcon = status.icon;

                                return (
                                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 border-2 border-white shadow-sm">
                                                    {booking.prenom?.[0]}{booking.nom?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 capitalize">{booking.prenom} {booking.nom}</p>
                                                    <p className="text-xs text-slate-400 font-medium">{booking.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col items-center">
                                                    <User className="w-4 h-4 text-slate-400 mb-1" />
                                                    <span className="text-[11px] font-black text-slate-900">{booking.passengers_adult}</span>
                                                </div>
                                                {booking.passengers_child > 0 && (
                                                    <div className="flex flex-col items-center">
                                                        <Smile className="w-4 h-4 text-indigo-400 mb-1" />
                                                        <span className="text-[11px] font-black text-indigo-600">{booking.passengers_child}</span>
                                                    </div>
                                                )}
                                                {booking.passengers_baby > 0 && (
                                                    <div className="flex flex-col items-center">
                                                        <Baby className="w-4 h-4 text-emerald-400 mb-1" />
                                                        <span className="text-[11px] font-black text-emerald-600">{booking.passengers_baby}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ring-1 ring-inset shadow-sm", status.color)}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-4 h-4 text-slate-300" />
                                                <span className="text-xs font-bold">
                                                    {new Date(booking.created_at).toLocaleDateString('fr-FR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-black text-slate-900">
                                                    {Number(booking.prix_calculer).toLocaleString('fr-DZ')} <span className="text-[10px] font-bold text-slate-400">DZD</span>
                                                </p>
                                                {booking.status === 'PAID' && (
                                                    <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                        <CreditCard className="w-3 h-3" /> Payé: {Number(booking.prix_vrai_paye).toLocaleString('fr-DZ')}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {bookings.length === 0 && (
                        <div className="py-20 text-center">
                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Aucune réservation pour ce voyage</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminTripBookingsPage;
