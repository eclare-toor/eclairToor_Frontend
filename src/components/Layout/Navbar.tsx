import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Bell, LogIn, Plane, Hotel, Map, Phone, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '../ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';
import { useAuth } from '../../Context/AuthContext';

import { getNotifications, getUnreadNotificationsCount, markNotificationAsRead, markAllNotificationsAsRead } from '../../api';
import type { AppNotification } from '../../Types';
import { Check, CheckCheck } from 'lucide-react';
import algeriaFlag from '../../assets/algeria.webp';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotificationsData = async () => {
        if (isAuthenticated) {
            const [notifs, count] = await Promise.all([
                getNotifications(),
                getUnreadNotificationsCount()
            ]);

            // Senior logic: Always ensure the latest notifications are at the top.
            // If the API provides them oldest first, reverse them. 
            // If we have dates, use them. If not, just reverse the array structure.
            let processedNotifs = Array.isArray(notifs) ? [...notifs] : [];

            // Check if we have valid dates for sorting
            const hasDates = processedNotifs.some(n => n.created_at);

            if (hasDates) {
                processedNotifs.sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                });
            } else {
                // If no dates, the last one in the response is likely the newest, so reverse
                processedNotifs.reverse();
            }

            setNotifications(processedNotifs);
            setUnreadCount(count || 0);
        }
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotificationsData();
            // Polling for new notifications every 30 seconds
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

    const handleLogout = () => {
        logout();
    };

    const navLinks = [
        { name: 'Voyages', path: '/voyages', icon: Map },
        { name: 'Hôtels', path: '/request-hotel', icon: Hotel },
        { name: 'Vols', path: '/request-flight', icon: Plane },
        { name: 'Contact', path: '/contact', icon: Phone },
    ];

    return (
        <header
            className={cn(
                'fixed left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4 md:px-8',
                isScrolled
                    ? 'top-4'
                    : 'top-6'
            )}
        >
            <div className={cn(
                "container mx-auto transition-all duration-500",
                isScrolled
                    ? "bg-white/90 backdrop-blur-2xl shadow-2xl shadow-primary/5 rounded-[2.5rem] py-3 px-8 border border-white/20"
                    : "bg-white/40 backdrop-blur-xl rounded-[3rem] py-5 px-10 border border-white/30 shadow-xl shadow-black/5"
            )}>
                <div className="flex items-center justify-between">
                    {/* Logo Section - Bigger & Better */}
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="relative flex items-center">
                            <motion.div
                                whileHover={{ scale: 1.05, rotate: 5 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative z-10"
                            >
                                <img
                                    src={logo}
                                    alt="Eclair Travel Logo"
                                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl object-cover shadow-lg border-2 border-white/20 group-hover:border-primary/50 transition-colors"
                                />
                            </motion.div>
                            {/* Algerian Flag Badge */}
                            <div className="absolute -right-2 -bottom-1 w-6 h-6 rounded-full border-2 border-white shadow-md overflow-hidden z-20">
                                <img src={algeriaFlag} alt="Algérie" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 -z-0"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-black text-xl md:text-2xl tracking-tighter transition-colors leading-none",
                                "text-slate-900"
                            )}>
                                ECLAIR<span className="text-primary italic">TRAVEL</span>
                            </span>
                            <span className={cn(
                                "text-[9px] font-black uppercase tracking-[0.3em] mt-1 opacity-70",
                                "text-slate-500"
                            )}>
                                Fierté Algérienne
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Centered & Premium */}
                    <nav className="hidden lg:flex items-center justify-center flex-1 mx-12">
                        <div className={cn(
                            "flex items-center gap-1 p-1 rounded-full transition-all duration-500",
                            "bg-white/40 backdrop-blur-md border border-white/20"
                        )}>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "relative px-6 py-3 text-[17px] font-black transition-all duration-300 rounded-full flex items-center gap-2 group",
                                        location.pathname === link.path
                                            ? "text-primary bg-white shadow-xl shadow-primary/5"
                                            : "text-slate-900 hover:text-primary hover:bg-white/20"
                                    )}
                                >
                                    <link.icon className={cn(
                                        "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                        location.pathname === link.path ? "text-primary" : "opacity-70 group-hover:opacity-100"
                                    )} />
                                    <span>{link.name}</span>
                                    {location.pathname === link.path && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-sm"
                                            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </nav>

                    {/* Right Section (Auth/Profile) */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className={cn(
                                            "relative overflow-visible",
                                            "text-slate-900 hover:bg-white/20"
                                        )}>
                                            <Bell className="w-5 h-5" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black z-[60] shadow-sm">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-2xl border-slate-200">
                                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                            <DropdownMenuLabel className="p-0 text-sm font-bold">Notifications</DropdownMenuLabel>
                                            {unreadCount > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/10 gap-1"
                                                    onClick={handleMarkAllAsRead}
                                                >
                                                    <CheckCheck className="w-3 h-3" /> Tout marquer comme lu
                                                </Button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-slate-400">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                                    <p className="text-xs">Aucune notification</p>
                                                </div>
                                            ) : (
                                                <div className="py-2">
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
                                                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                                notif.type.includes('payment') ? "bg-green-100 text-green-600" :
                                                                    notif.type.includes('booking') ? "bg-blue-100 text-blue-600" :
                                                                        "bg-primary/10 text-primary"
                                                            )}>
                                                                <Bell className="w-4 h-4" />
                                                            </div>
                                                            <div className="flex-1 min-w-0 pr-4">
                                                                <p className="text-xs font-bold text-slate-900 truncate pr-4">{notif.title}</p>
                                                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                                                <p className="text-[9px] text-slate-400 mt-1">
                                                                    {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Aujourd\'hui'}
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
                                                                <div className="absolute right-2 top-4 w-2 h-2 bg-primary rounded-full group-hover:opacity-0 transition-opacity" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 border-t border-slate-100 bg-slate-50/30 text-center">
                                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Fin des notifications</p>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className={cn(
                                            "rounded-full border-2 border-transparent hover:border-primary transition-all",
                                            "text-slate-900 hover:bg-white/20"
                                        )}>
                                            <User className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-2xl border-slate-200">
                                        <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/mon-compte')} className="rounded-xl mx-1 my-1">
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Tableau de bord</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl mx-1 my-1">
                                            <User className="mr-2 h-4 w-4" />
                                            <span>Profil</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-xl mx-1 my-1">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Se déconnecter</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Link to="/connexion">
                                <Button
                                    variant={isScrolled ? "default" : "secondary"}
                                    className="font-semibold"
                                >
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Connexion
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="md:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className={location.pathname === '/' && !isScrolled ? "text-white" : "text-foreground"}>
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                                <SheetHeader>
                                    <SheetTitle className="text-left font-heading text-2xl font-bold text-primary">
                                        ECLAIR TRAVEL
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 mt-8">
                                    <nav className="flex flex-col gap-4">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.path}
                                                to={link.path}
                                                className="flex items-center gap-4 text-lg font-medium text-foreground/80 hover:text-primary transition-colors p-2 rounded-md hover:bg-accent"
                                            >
                                                <link.icon className="w-5 h-5" />
                                                {link.name}
                                            </Link>
                                        ))}
                                    </nav>
                                    <div className="border-t pt-6">
                                        {isAuthenticated ? (
                                            <div className="flex flex-col gap-3">
                                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard')}>
                                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                                    Tableau de bord
                                                </Button>
                                                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/profile')}>
                                                    <User className="w-4 h-4 mr-2" />
                                                    Mon Profil
                                                </Button>
                                                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout}>
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Se déconnecter
                                                </Button>
                                            </div>
                                        ) : (
                                            <Link to="/login">
                                                <Button className="w-full">
                                                    <LogIn className="w-4 h-4 mr-2" />
                                                    Connexion
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header >
    );
};

export default Navbar;
