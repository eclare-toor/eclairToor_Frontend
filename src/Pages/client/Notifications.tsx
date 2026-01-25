import { useEffect, useState } from 'react';
import { Bell, Trash2, Check, ShieldCheck, Calendar, Zap, ArrowLeft, RefreshCw } from '../../components/icons';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../../api';
import type { AppNotification } from '../../Types';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import BackgroundAura from '../../components/Shared/BackgroundAura';

const Notifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAllNotifications = async () => {
    setLoading(true);
    try {
      // Fetch with a large limit to see "all"
      const data = await getNotifications({ limit: 100 });
      setNotifications(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, []);

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
    <div className="min-h-screen bg-transparent pt-52 md:pt-60 pb-20 px-4 md:px-8 relative">
      <BackgroundAura />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-bold uppercase tracking-wider">Retour</span>
            </button>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
              Toutes les <span className="text-primary underline decoration-primary/20">Notifications</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Suivez l'historique complet de votre activité</p>
          </div>
          <Button
            variant="outline"
            onClick={fetchAllNotifications}
            disabled={loading}
            className="rounded-2xl border-slate-200 bg-white shadow-sm hover:shadow-md transition-all gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Actualiser
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement de votre historique...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-20 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200">
              <Bell className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune notification</h2>
            <p className="text-slate-500 max-w-sm mx-auto">Votre historique de notifications est vide pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {notifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "bg-white rounded-3xl border border-slate-200 p-6 flex gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative",
                    !notif.is_read && "ring-1 ring-primary/20 bg-primary/[0.01]"
                  )}
                >
                  {!notif.is_read && (
                    <div className="absolute left-0 top-6 bottom-6 w-1.5 bg-primary rounded-r-full" />
                  )}

                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                    notif.type.includes('payment') ? "bg-emerald-100 text-emerald-600" :
                      notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                        "bg-indigo-100 text-indigo-600"
                  )}>
                    {notif.type.includes('payment') ? <ShieldCheck className="w-8 h-8" /> :
                      notif.type.includes('booking') ? <Calendar className="w-8 h-8" /> :
                        <Zap className="w-8 h-8" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{notif.title}</h3>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                        {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Récemment'}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium leading-relaxed">{notif.message}</p>

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-50">
                      {!notif.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="text-primary font-bold hover:bg-primary/10 gap-2 px-4 rounded-xl"
                        >
                          <Check className="w-4 h-4" />
                          Marquer comme lu
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notif.id)}
                        className="text-slate-400 font-bold hover:text-red-500 hover:bg-red-50 gap-2 px-4 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;