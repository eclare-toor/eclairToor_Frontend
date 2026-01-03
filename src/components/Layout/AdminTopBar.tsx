import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, User, LogOut } from 'lucide-react';
import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '../../api';
import type { AppNotification } from '../../Types';
import { useAuth } from '../../Context/AuthContext';
import { cn } from '../../lib/utils';
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
                getNotifications(),
                getUnreadNotificationsCount()
            ]);

            let processedNotifs = Array.isArray(notifs) ? [...notifs] : [];
            const hasDates = processedNotifs.some(n => n.created_at);

            if (hasDates) {
                processedNotifs.sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                });
            } else {
                processedNotifs.reverse();
            }

            setNotifications(processedNotifs);
            setUnreadCount(count || 0);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotificationsData();
            const interval = setInterval(fetchNotificationsData, 30000);
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

    const handleNotificationClick = async (notif: AppNotification) => {
        if (!notif.is_read) {
            await markNotificationAsRead(notif.id);
            fetchNotificationsData();
        }
    };

    return (
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
            <h1 className="font-bold text-slate-800">Panneau d'administration</h1>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-black z-50">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border-slate-200">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <DropdownMenuLabel className="p-0 text-sm font-bold text-slate-800">Notifications Admin</DropdownMenuLabel>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/10 gap-1"
                                    onClick={handleMarkAllAsRead}
                                >
                                    <CheckCheck className="w-3 h-3" /> Tout marquer
                                </Button>
                            )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-300">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs">Aucune notification</p>
                                </div>
                            ) : (
                                <div className="py-1">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "group px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors relative flex gap-3",
                                                !notif.is_read && "bg-primary/5"
                                            )}
                                            onClick={() => handleNotificationClick(notif)}
                                        >
                                            <div className={cn(
                                                "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                                                notif.type.includes('request') ? "bg-amber-100 text-amber-600" :
                                                    notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                                                        "bg-slate-100 text-slate-600"
                                            )}>
                                                <Bell className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="text-xs font-bold text-slate-800 truncate pr-4">{notif.title}</p>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                                <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                                                    {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Admin'}
                                                </p>
                                            </div>
                                            {!notif.is_read && (
                                                <button
                                                    title="Marquer comme lu"
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white border border-slate-100 shadow-sm rounded-md transition-all text-slate-400 hover:text-primary z-10"
                                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            {!notif.is_read && (
                                                <div className="absolute right-2 top-4 w-1.5 h-1.5 bg-primary rounded-full group-hover:opacity-0 transition-opacity" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t border-slate-100 bg-slate-50/30 text-center">
                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Administration Eclair Travel</p>
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
