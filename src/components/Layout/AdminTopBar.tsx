import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, User, LogOut, ShieldCheck, Calendar, Zap, Trash2, ArrowRight } from '../../components/icons';
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '../../api';
import type { AppNotification } from '../../Types';
import { useAuth } from '../../Context/AuthContext';
import { cn } from '../../lib/utils';
import { toast } from 'react-toastify';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

const AdminTopBar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotificationsData = async () => {
        if (isAuthenticated) {
            const [notifs, count] = await Promise.all([
                getNotifications({ limit: 10 }),
                getUnreadNotificationsCount()
            ]);

            let processedNotifs = Array.isArray(notifs) ? [...notifs] : [];
            setNotifications(processedNotifs);
            setUnreadCount(count || 0);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotificationsData();
            const interval = setInterval(fetchNotificationsData, 900000); // 15 minutes
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markNotificationAsRead(id);
        fetchNotificationsData();
    };

    const handleMarkAllAsRead = async () => {
        await markAllNotificationsAsRead();
        fetchNotificationsData();
    };

    const handleDeleteNotification = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await deleteNotification(id);
            toast.success("Notification supprimée");
            fetchNotificationsData();
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleNotificationClick = async (notif: AppNotification) => {
        if (!notif.is_read) {
            await markNotificationAsRead(notif.id);
            fetchNotificationsData();
        }
    };

    return (
        <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-white/50 flex items-center justify-between px-8 sticky top-0 z-40">
            <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Tableau de Bord</h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Gérez vos opérations en temps réel</p>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative h-11 w-11 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white/50 rounded-full transition-all duration-300 group">
                            <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 min-w-[20px] h-[20px] px-1 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black z-50 shadow-sm">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[400px] p-0 overflow-hidden rounded-[2rem] border-slate-200/50 shadow-2xl backdrop-blur-3xl bg-white/95">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white/50">
                            <div>
                                <DropdownMenuLabel className="p-0 text-lg font-black text-slate-900">Notifications Admin</DropdownMenuLabel>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Alertes système & Réservations</p>
                            </div>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-3 text-[11px] font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-full border border-primary/20 gap-1.5"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <CheckCheck className="w-3.5 h-3.5" /> Tout marquer
                                </Button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center text-slate-400">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-bold">Aucune notification</p>
                                    <p className="text-[10px] uppercase tracking-tighter mt-1 opacity-60">Revenez plus tard</p>
                                </div>
                            ) : (
                                <div className="py-2">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "group px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors relative flex gap-4",
                                                !notif.is_read && "bg-primary/5"
                                            )}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110",
                                                notif.type.includes('request') ? "bg-amber-100 text-amber-600" :
                                                    notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                                                        "bg-indigo-100 text-indigo-600"
                                            )}>
                                                {notif.type.includes('request') ? <Zap className="w-5 h-5" /> :
                                                    notif.type.includes('booking') ? <Calendar className="w-5 h-5" /> :
                                                        <ShieldCheck className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-[13px] font-black text-slate-900 truncate">{notif.title}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 whitespace-nowrap">
                                                        {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Aujourd\'hui'}
                                                    </p>
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 font-medium leading-relaxed">{notif.message}</p>
                                            </div>

                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                {!notif.is_read && (
                                                    <button
                                                        title="Marquer comme lu"
                                                        className="p-1.5 bg-white border border-slate-100 shadow-sm rounded-md text-slate-400 hover:text-primary transition-all"
                                                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button
                                                    title="Supprimer"
                                                    className="p-1.5 bg-white border border-slate-100 shadow-sm rounded-md text-slate-400 hover:text-red-500 transition-all"
                                                    onClick={(e) => handleDeleteNotification(notif.id, e)}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {!notif.is_read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                                            )}
                                            {!notif.is_read && (
                                                <div className="absolute right-4 top-4 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white shadow-sm group-hover:opacity-0 transition-opacity" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => navigate('/admin/notifications')}
                                className="w-full flex items-center justify-center gap-2 text-xs font-black text-primary hover:gap-3 transition-all"
                            >
                                Voir toutes les notifications <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <button
                    onClick={() => navigate('/admin/profile')}
                    className="p-2 text-slate-400 hover:bg-slate-50 hover:text-primary rounded-full transition-all group"
                    title="Mon Profil Admin"
                >
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>

                <div className="flex items-center gap-3 border-l pl-4 ml-1 border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-white shadow-sm">
                        {user?.nom?.charAt(0)}{user?.prenom?.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-right">
                        <p className="text-sm font-bold text-slate-900 leading-none capitalize">{user?.nom} {user?.prenom}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Super Administrateur</p>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-all group lg:ml-2"
                    title="Déconnexion"
                >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>
        </header>
    );
};

export default AdminTopBar;
