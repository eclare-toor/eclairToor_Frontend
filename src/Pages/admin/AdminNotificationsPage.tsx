import { useEffect, useState } from 'react';
import { Bell, Trash2, Check, ShieldCheck, Calendar, Zap, RefreshCw, Filter } from '../../components/icons';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../../api';
import type { AppNotification } from '../../Types';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const AdminNotificationsPage = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadOnly, setUnreadOnly] = useState(false);

    const fetchAllNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications({
                limit: 100,
                unread_only: unreadOnly
            });
            setNotifications(data || []);
        } catch (error) {
            toast.error("Erreur lors du chargement des notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllNotifications();
    }, [unreadOnly]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteNotification(id);
            setNotifications(notifications.filter(n => n.id !== id));
            toast.success("Notification supprimée");
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                        Gestion des <span className="text-primary">Notifications</span>
                    </h2>
                    <p className="text-slate-500 font-medium mt-1">Gérez les alertes système et les notifications admin</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant={unreadOnly ? "default" : "outline"}
                        onClick={() => setUnreadOnly(!unreadOnly)}
                        className="rounded-xl gap-2 transition-all"
                    >
                        <Filter className="w-4 h-4" />
                        {unreadOnly ? "Voir toutes" : "Non lues"}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={fetchAllNotifications}
                        disabled={loading}
                        className="rounded-xl gap-2"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        Actualiser
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronisation...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-20 text-center">
                    <Bell className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Tout est à jour</h3>
                    <p className="text-slate-500">Aucune notification à afficher pour le moment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {notifications.map((notif, idx) => (
                            <motion.div
                                key={notif.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.03 }}
                                className={cn(
                                    "bg-white rounded-2xl border border-slate-100 p-5 flex gap-5 hover:border-primary/20 hover:shadow-md transition-all group relative",
                                    !notif.is_read && "bg-primary/[0.02] border-primary/10"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                    notif.type.includes('request') ? "bg-amber-100 text-amber-600" :
                                        notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                                            "bg-indigo-100 text-indigo-600"
                                )}>
                                    {notif.type.includes('request') ? <Zap className="w-6 h-6" /> :
                                        notif.type.includes('booking') ? <Calendar className="w-6 h-6" /> :
                                            <ShieldCheck className="w-6 h-6" />}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-4 mb-1">
                                        <h4 className="text-lg font-bold text-slate-800 truncate">{notif.title}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                            {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Maintenant'}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 md:line-clamp-none">
                                        {notif.message}
                                    </p>

                                    <div className="flex items-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notif.is_read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAsRead(notif.id)}
                                                className="h-8 text-primary font-bold hover:bg-primary/10 rounded-lg text-xs"
                                            >
                                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                                Marquer comme lu
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(notif.id)}
                                            className="h-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>

                                {!notif.is_read && (
                                    <div className="absolute right-4 top-4 w-2 h-2 bg-primary rounded-full shadow-sm shadow-primary/50" />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminNotificationsPage;
